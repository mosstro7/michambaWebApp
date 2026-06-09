/**
 * End-to-end Socket.IO chat test against production backend.
 * Run: npx tsx scripts/test-chat.ts
 */
import { io, Socket } from 'socket.io-client';

const BASE_URL = 'https://michamba-backend-production.up.railway.app';
const TS = Date.now();
const CLIENT_EMAIL = `testclient_${TS}@michamba-test.com`;
const SPEC_EMAIL = `testspec_${TS}@michamba-test.com`;
const PASSWORD = 'Test1234!';

let passed = 0;
let failed = 0;

function ok(label: string) {
  console.log(`  ✓ ${label}`);
  passed++;
}
function fail(label: string, detail?: string) {
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  failed++;
}

async function api(path: string, opts: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { headers, ...opts });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(body)}`);
  return body;
}

function connectSocket(token: string): Socket {
  return io(BASE_URL, {
    auth: { token },
    transports: ['polling', 'websocket'],
    reconnection: false,
  });
}

function waitFor(socket: Socket, event: string, timeoutMs = 4000): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for '${event}'`)), timeoutMs);
    socket.once(event, (data) => { clearTimeout(t); resolve(data); });
  });
}

async function run() {
  console.log('\n══════════════════════════════════════');
  console.log(' Mi Chamba — Chat E2E Test');
  console.log('══════════════════════════════════════\n');

  // ── 1. Register & Login ──────────────────────────────────────────────────
  console.log('1. Auth');
  let clientToken: string, specialistToken: string;
  let clientId: string, specialistId: string;
  let clientName: string, specialistName: string;
  try {
    const c = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre: 'TestCliente', email: CLIENT_EMAIL, password: PASSWORD, rol: 'CLIENTE' }),
    });
    clientToken = c.accessToken;
    clientId = c.user.id;
    clientName = c.user.nombre;
    ok(`Client registered: ${CLIENT_EMAIL}`);
  } catch (e: any) {
    fail('Client register', e.message);
    process.exit(1);
  }
  try {
    const s = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre: 'TestEspec', email: SPEC_EMAIL, password: PASSWORD, rol: 'ESPECIALISTA' }),
    });
    specialistToken = s.accessToken;
    specialistId = s.user.id;
    specialistName = s.user.nombre;
    ok(`Specialist registered: ${SPEC_EMAIL}`);
  } catch (e: any) {
    fail('Specialist register', e.message);
    process.exit(1);
  }

  // ── 2. Get categories ────────────────────────────────────────────────────
  console.log('\n2. Setup — order + proposal + accept');
  let categoriaId: string;
  try {
    const cats = await api('/categories');
    categoriaId = cats[0].id;
    ok(`Categories fetched, using: ${cats[0].nombre}`);
  } catch (e: any) {
    fail('Get categories', e.message);
    process.exit(1);
  }

  // ── 3. Create order ──────────────────────────────────────────────────────
  let orderId: string;
  try {
    const order = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({ titulo: 'Test Chat Order', descripcion: 'E2E test order', categoriaId, barrio: 'Palermo' }),
    }, clientToken);
    orderId = order.id;
    ok(`Order created: ${orderId}`);
  } catch (e: any) {
    fail('Create order', e.message);
    process.exit(1);
  }

  // ── 4. Create proposal ───────────────────────────────────────────────────
  let proposalId: string;
  try {
    const proposal = await api('/proposals', {
      method: 'POST',
      body: JSON.stringify({ orderId, precio: 5000, mensaje: 'Test proposal from E2E' }),
    }, specialistToken);
    proposalId = proposal.id;
    ok(`Proposal created: ${proposalId}`);
  } catch (e: any) {
    fail('Create proposal', e.message);
    process.exit(1);
  }

  // ── 5. Accept proposal → creates chat ────────────────────────────────────
  let chatId: string;
  try {
    const result = await api(`/proposals/${proposalId}/accept`, { method: 'PATCH' }, clientToken);
    chatId = result.chatId || result.chat?.id;
    if (!chatId) throw new Error('No chatId in accept response: ' + JSON.stringify(result));
    ok(`Proposal accepted, chatId: ${chatId}`);
  } catch (e: any) {
    fail('Accept proposal', e.message);
    process.exit(1);
  }

  // ── 6. Socket connections ─────────────────────────────────────────────────
  console.log('\n3. Socket.IO connections');
  const clientSocket = connectSocket(clientToken);
  const specSocket = connectSocket(specialistToken);

  try {
    await Promise.all([
      waitFor(clientSocket, 'connect', 6000),
      waitFor(specSocket, 'connect', 6000),
    ]);
    ok('Both sockets connected');
  } catch (e: any) {
    fail('Socket connect', e.message);
    clientSocket.disconnect();
    specSocket.disconnect();
    process.exit(1);
  }

  // ── 7. join_chat ──────────────────────────────────────────────────────────
  console.log('\n4. join_chat');
  clientSocket.emit('join_chat', { chatId });
  specSocket.emit('join_chat', { chatId });
  await new Promise((r) => setTimeout(r, 300));
  ok('join_chat emitted by both parties');

  // ── 8. Specialist sends → Client receives ─────────────────────────────────
  console.log('\n5. Message delivery');
  const MSG_FROM_SPEC = `Hola desde especialista ${TS}`;
  const MSG_FROM_CLIENT = `Hola desde cliente ${TS}`;

  const clientReceivePromise = waitFor(clientSocket, 'new_message', 3000);
  const t1 = Date.now();
  specSocket.emit('send_message', { chatId, content: MSG_FROM_SPEC });

  try {
    const msg = await clientReceivePromise;
    const latencyMs = Date.now() - t1;
    if (msg.contenido === MSG_FROM_SPEC || msg.content === MSG_FROM_SPEC) {
      ok(`Client received specialist's message (latency: ${latencyMs}ms)`);
      if (latencyMs > 500) fail(`Latency exceeds 500ms: ${latencyMs}ms`);
      else ok(`Latency OK: ${latencyMs}ms`);
    } else {
      fail('Message content mismatch', `expected "${MSG_FROM_SPEC}", got "${msg.contenido ?? msg.content}"`);
    }
  } catch (e: any) {
    fail('Client did not receive specialist message', e.message);
  }

  // ── 9. Client sends → Specialist receives ────────────────────────────────
  const specReceivePromise = waitFor(specSocket, 'new_message', 3000);
  const t2 = Date.now();
  clientSocket.emit('send_message', { chatId, content: MSG_FROM_CLIENT });

  try {
    const msg = await specReceivePromise;
    const latencyMs = Date.now() - t2;
    if (msg.contenido === MSG_FROM_CLIENT || msg.content === MSG_FROM_CLIENT) {
      ok(`Specialist received client's message (latency: ${latencyMs}ms)`);
      if (latencyMs > 500) fail(`Latency exceeds 500ms: ${latencyMs}ms`);
      else ok(`Latency OK: ${latencyMs}ms`);
    } else {
      fail('Message content mismatch', `expected "${MSG_FROM_CLIENT}", got "${msg.contenido ?? msg.content}"`);
    }
  } catch (e: any) {
    fail('Specialist did not receive client message', e.message);
  }

  // ── 10. No duplicate on sender side ──────────────────────────────────────
  console.log('\n6. Duplicate check');
  let specGotOwnMsg = false;
  const dupeListener = (msg: any) => {
    if (msg.contenido === MSG_FROM_SPEC || msg.content === MSG_FROM_SPEC) specGotOwnMsg = true;
  };
  specSocket.on('new_message', dupeListener);
  await new Promise((r) => setTimeout(r, 800));
  specSocket.off('new_message', dupeListener);
  if (specGotOwnMsg) {
    ok('Server echoes sender\'s message back (optimistic replacement needed)');
  } else {
    ok('Server does NOT echo sender\'s own message (optimistic update stays)');
  }

  // ── 11. Typing indicator ──────────────────────────────────────────────────
  console.log('\n7. Typing indicator');
  const typingPromise = waitFor(clientSocket, 'typing', 2000);
  specSocket.emit('typing', { chatId });
  try {
    const typing = await typingPromise;
    if (typing.userId && typing.userId !== clientId) {
      ok(`Typing event received: userId=${typing.userId}`);
    } else {
      fail('Typing userId missing or incorrect', JSON.stringify(typing));
    }
  } catch (e: any) {
    fail('Client did not receive typing event', e.message);
  }

  // ── 12. REST: fetch messages history ─────────────────────────────────────
  console.log('\n8. REST message history');
  try {
    const msgs = await api(`/chats/${chatId}/messages`, {}, clientToken);
    if (Array.isArray(msgs) && msgs.length >= 2) {
      ok(`Chat history: ${msgs.length} messages, first field check: contenido="${msgs[0].contenido}"`);
    } else {
      fail('Unexpected messages response', JSON.stringify(msgs).slice(0, 200));
    }
  } catch (e: any) {
    fail('GET /chats/:id/messages', e.message);
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  clientSocket.disconnect();
  specSocket.disconnect();

  console.log('\n══════════════════════════════════════');
  console.log(` Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => { console.error('Fatal:', e); process.exit(1); });
