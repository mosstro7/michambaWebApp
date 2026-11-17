import { useAuthStore } from '@/store/authStore';
import type { Order, User, Proposal, ProposalWithOrder, Chat, MessageWithSender, NotificationPage } from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL as string;

function authHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const error = new Error(body.message || `Error ${res.status}`) as Error & { status: number };
    error.status = res.status;
    throw error;
  }
  return res.json();
}

// Promesa del refresh en curso, compartida por todas las requests que caen en
// 401 a la vez: así se hace un único POST /auth/refresh. Con refresh tokens
// rotativos, dos refresh en paralelo con el mismo token harían fallar al segundo.
let refreshPromise: Promise<void> | null = null;

// Exportada para que el socket del chat use la misma promesa deduplicada.
export function refreshTokens(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        const error = new Error('Sesión expirada') as Error & { status: number };
        error.status = 401;
        throw error;
      }
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await handleResponse<{ accessToken: string; refreshToken: string }>(res);
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

let redirectingToLogin = false;

// Logout + redirección a /login sin lanzar: la usa también el socket del chat.
export function endSession(): void {
  useAuthStore.getState().logout();
  if (!redirectingToLogin) {
    redirectingToLogin = true;
    window.location.replace('/login');
  }
}

function expireSession(): never {
  endSession();
  const error = new Error('Sesión expirada') as Error & { status: number };
  error.status = 401;
  throw error;
}

async function apiFetch<T>(path: string, init: RequestInit = {}, opts: { auth?: boolean } = {}): Promise<T> {
  const auth = opts.auth !== false;
  const send = () =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: auth ? authHeaders() : init.body ? { 'Content-Type': 'application/json' } : undefined,
    });

  const sentToken = auth ? useAuthStore.getState().token : null;
  const res = await send();
  // Sin token enviado (visitante) un 401 es un error común, no una sesión vencida.
  if (res.status !== 401 || !sentToken) return handleResponse<T>(res);

  // Si otra request ya renovó el token mientras esta estaba en vuelo,
  // se reintenta directo con el nuevo, sin un segundo refresh.
  if (useAuthStore.getState().token === sentToken) {
    try {
      await refreshTokens();
    } catch (err: any) {
      if (err?.status === 401) expireSession();
      throw err;
    }
  }

  // Un único reintento: si vuelve a dar 401 no se intenta otro refresh.
  const retry = await send();
  if (retry.status === 401) expireSession();
  return handleResponse<T>(retry);
}

export async function register(nombre: string, email: string, password: string, rol: string) {
  return apiFetch<{ accessToken: string; refreshToken: string; user: User }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify({ nombre, email, password, rol }) },
    { auth: false },
  );
}

export async function login(email: string, password: string) {
  const data = await apiFetch<{ accessToken: string; refreshToken: string; user: User }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
    { auth: false },
  );
  useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
  return data;
}

export async function getMyOrders() {
  return apiFetch<Order[]>('/orders/mine');
}

export async function getOrders(filtros?: { categoriaId?: string; estado?: string }) {
  const params = new URLSearchParams();
  if (filtros?.categoriaId) params.set('categoriaId', filtros.categoriaId);
  if (filtros?.estado) params.set('estado', filtros.estado);
  const query = params.toString() ? `?${params}` : '';
  return apiFetch<Order[]>(`/orders${query}`);
}

export async function createOrder(
  titulo: string,
  descripcion: string,
  categoriaId: string,
  barrio: string,
) {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify({ titulo, descripcion, categoriaId, barrio }),
  });
}

export async function getUsuarios() {
  return apiFetch<{ id: string; nombre: string; email: string; rol: string; createdAt: string }[]>('/admin/usuarios');
}

export async function deleteUsuario(id: string) {
  return apiFetch<{ message: string }>(`/admin/usuarios/${id}`, { method: 'DELETE' });
}

export async function getCategories() {
  return apiFetch<{ id: string; nombre: string }[]>('/categories', {}, { auth: false });
}

export async function acceptProposal(id: string) {
  return apiFetch<{ id: string; estado: string; pedidoId?: string }>(`/proposals/${id}/accept`, { method: 'PATCH' });
}

export async function updateProposal(id: string, precio: number, mensaje: string) {
  return apiFetch<Proposal>(`/proposals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ precio, mensaje }),
  });
}

export async function updateProposalStatus(id: string, estado: string) {
  return apiFetch<Proposal>(`/proposals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}

export async function getProposalsByOrder(orderId: string) {
  return apiFetch<Proposal[]>(`/proposals?orderId=${orderId}`);
}

export async function createReport(chatId: string, motivo: string) {
  return apiFetch<{ id: string }>('/reports', {
    method: 'POST',
    body: JSON.stringify({ chatId, motivo }),
  });
}

export async function getChatByOrder(orderId: string) {
  return apiFetch<Chat[]>(`/chats/order/${orderId}`);
}

export async function getChats() {
  return apiFetch<Chat[]>('/chats');
}

export async function getChat(chatId: string) {
  return apiFetch<Chat>(`/chats/${chatId}`);
}

export async function createChat(pedidoId: string, especialistaId: string) {
  return apiFetch<Chat>('/chats', {
    method: 'POST',
    body: JSON.stringify({ pedidoId, especialistaId }),
  });
}

export async function getChatMessages(chatId: string) {
  return apiFetch<MessageWithSender[]>(`/chats/${chatId}/messages`);
}

export async function createProposal(orderId: string, precio: number, mensaje: string) {
  return apiFetch<{ id: string }>('/proposals', {
    method: 'POST',
    body: JSON.stringify({ orderId, precio, mensaje }),
  });
}

export async function getOrder(id: string) {
  return apiFetch<Order & { propuestas?: Proposal[] }>(`/orders/${id}`);
}

export async function getMyProposals() {
  return apiFetch<ProposalWithOrder[]>('/proposals/mine');
}

export async function cancelOrder(orderId: string, motivo: string) {
  return apiFetch<Order>(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ motivo }),
  });
}

export interface ReportUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export interface Report {
  id: string;
  motivo: string;
  revisado: boolean;
  creadoEn: string;
  reportante: ReportUser;
  reportado: ReportUser;
  chat: { id: string };
  pedido: { id: string; titulo: string };
}

export async function getReports() {
  return apiFetch<Report[]>('/reports');
}

export async function toggleReportRevisado(id: string) {
  return apiFetch<Report>(`/reports/${id}/revisado`, { method: 'PATCH' });
}

export interface Calificacion {
  puntuacion: number;
  comentario: string;
  creadoEn: string;
  cliente: { nombre: string; apellido: string };
}

export interface Me {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  barrio: string;
  rol: string;
  verificado: boolean;
  descripcion?: string;
  especialidad?: string;
  experiencia?: string;
}

export interface PerfilEspecialista {
  id: string;
  nombre: string;
  apellido: string;
  descripcion?: string;
  especialidad?: string;
  experiencia?: string;
  totalTrabajosFinalizados: number;
  promedioPuntuacion: number | null;
  calificaciones: Calificacion[];
}

export async function finalizarPedido(id: string, puntuacion: number, comentario: string) {
  return apiFetch<{ id: string; puntuacion: number; comentario: string }>(`/orders/${id}/finalizar`, {
    method: 'PATCH',
    body: JSON.stringify({ puntuacion, comentario }),
  });
}

export async function getPerfilEspecialista(id: string) {
  return apiFetch<PerfilEspecialista>(`/especialistas/${id}/perfil`, {}, { auth: false });
}

// Notificaciones: ordenadas de la más nueva a la más vieja. Para la página
// siguiente se pasa el nextCursor de la anterior (null cuando no hay más).
export async function getNotifications(cursor?: string, limit = 20) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return apiFetch<NotificationPage>(`/notifications?${params}`);
}

export async function getUnreadCount() {
  return apiFetch<{ count: number }>('/notifications/unread-count');
}

// La respuesta de los PATCH no se usa: el store ya aplicó el cambio.
export async function markNotificationRead(id: string) {
  return apiFetch<unknown>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return apiFetch<unknown>('/notifications/read-all', { method: 'PATCH' });
}

export async function getMe() {
  return apiFetch<Me>('/usuarios/me');
}

export async function updateMe(body: {
  telefono?: string;
  barrio?: string;
  descripcion?: string;
  especialidad?: string;
  experiencia?: string;
}) {
  return apiFetch<Omit<Me, 'telefono'>>('/usuarios/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
