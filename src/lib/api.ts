import { useAuthStore } from '@/store/authStore';
import type { Order, User, Proposal, ProposalWithOrder, Chat, MessageWithSender } from '@/types';

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

export async function register(nombre: string, email: string, password: string, rol: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password, rol }),
  });
  return handleResponse<{ accessToken: string; user: User }>(res);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{ accessToken: string; user: User }>(res);
  useAuthStore.getState().setAuth(data.user, data.accessToken);
  return data;
}

export async function getMyOrders() {
  const res = await fetch(`${BASE_URL}/orders/mine`, { headers: authHeaders() });
  return handleResponse<Order[]>(res);
}

export async function getOrders(filtros?: { categoriaId?: string; estado?: string }) {
  const params = new URLSearchParams();
  if (filtros?.categoriaId) params.set('categoriaId', filtros.categoriaId);
  if (filtros?.estado) params.set('estado', filtros.estado);
  const query = params.toString() ? `?${params}` : '';
  const res = await fetch(`${BASE_URL}/orders${query}`, { headers: authHeaders() });
  return handleResponse<Order[]>(res);
}

export async function createOrder(
  titulo: string,
  descripcion: string,
  categoriaId: string,
  barrio: string,
) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ titulo, descripcion, categoriaId, barrio }),
  });
  return handleResponse<Order>(res);
}

export async function getUsuarios() {
  const res = await fetch(`${BASE_URL}/admin/usuarios`, { headers: authHeaders() });
  return handleResponse<{ id: string; nombre: string; email: string; rol: string; createdAt: string }[]>(res);
}

export async function deleteUsuario(id: string) {
  const res = await fetch(`${BASE_URL}/admin/usuarios/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<{ message: string }>(res);
}

export async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  return handleResponse<{ id: string; nombre: string }[]>(res);
}

export async function acceptProposal(id: string) {
  const res = await fetch(`${BASE_URL}/proposals/${id}/accept`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse<{ id: string; estado: string; pedidoId?: string }>(res);
}

export async function updateProposal(id: string, precio: number, mensaje: string) {
  const res = await fetch(`${BASE_URL}/proposals/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ precio, mensaje }),
  });
  return handleResponse<Proposal>(res);
}

export async function updateProposalStatus(id: string, estado: string) {
  const res = await fetch(`${BASE_URL}/proposals/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ estado }),
  });
  return handleResponse<Proposal>(res);
}

export async function getProposalsByOrder(orderId: string) {
  const res = await fetch(`${BASE_URL}/proposals?orderId=${orderId}`, { headers: authHeaders() });
  return handleResponse<Proposal[]>(res);
}

export async function createReport(chatId: string, motivo: string) {
  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ chatId, motivo }),
  });
  return handleResponse<{ id: string }>(res);
}

export async function getChatByOrder(orderId: string) {
  const res = await fetch(`${BASE_URL}/chats/order/${orderId}`, { headers: authHeaders() });
  return handleResponse<Chat[]>(res);
}

export async function getChats() {
  const res = await fetch(`${BASE_URL}/chats`, { headers: authHeaders() });
  return handleResponse<Chat[]>(res);
}

export async function getChat(chatId: string) {
  const res = await fetch(`${BASE_URL}/chats/${chatId}`, { headers: authHeaders() });
  return handleResponse<Chat>(res);
}

export async function createChat(pedidoId: string, especialistaId: string) {
  const res = await fetch(`${BASE_URL}/chats`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pedidoId, especialistaId }),
  });
  return handleResponse<Chat>(res);
}

export async function getChatMessages(chatId: string) {
  const res = await fetch(`${BASE_URL}/chats/${chatId}/messages`, { headers: authHeaders() });
  return handleResponse<MessageWithSender[]>(res);
}

export async function createProposal(orderId: string, precio: number, mensaje: string) {
  const res = await fetch(`${BASE_URL}/proposals`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ orderId, precio, mensaje }),
  });
  return handleResponse<{ id: string }>(res);
}

export async function getOrder(id: string) {
  const res = await fetch(`${BASE_URL}/orders/${id}`, { headers: authHeaders() });
  return handleResponse<Order & { propuestas?: Proposal[] }>(res);
}

export async function getMyProposals() {
  const res = await fetch(`${BASE_URL}/proposals/mine`, { headers: authHeaders() });
  return handleResponse<ProposalWithOrder[]>(res);
}

export async function cancelOrder(orderId: string, motivo: string) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ motivo }),
  });
  return handleResponse<Order>(res);
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
  const res = await fetch(`${BASE_URL}/reports`, { headers: authHeaders() });
  return handleResponse<Report[]>(res);
}

export async function toggleReportRevisado(id: string) {
  const res = await fetch(`${BASE_URL}/reports/${id}/revisado`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse<Report>(res);
}
