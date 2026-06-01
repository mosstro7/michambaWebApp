/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  CLIENTE = 'CLIENTE',
  ESPECIALISTA = 'ESPECIALISTA',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  ABIERTO = 'ABIERTO',
  EN_PROGRESO = 'EN_PROGRESO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO'
}

export enum ProposalStatus {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA'
}

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  barrio: string;
  rol: Role;
  verificado: boolean;
  avatar?: string;
}

export interface Category {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
}

export interface Order {
  id: string;
  clienteId: string;
  categoriaId: string;
  titulo: string;
  descripcion: string;
  barrio: string;
  estado: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  pedidoId: string;
  especialistaId: string;
  descripcion: string;
  precioOferta: number;
  estado: ProposalStatus;
  createdAt: string;
  especialista?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface OrderWithSpecialist extends Order {
  propuestaAceptada?: {
    especialista?: { id: string; nombre: string; apellido: string };
  };
}

export interface ProposalWithOrder extends Proposal {
  pedido?: {
    id: string;
    titulo: string;
    barrio: string;
    cliente?: { id: string; nombre: string; apellido: string };
  };
}

export interface Message {
  id: string;
  chatId: string;
  remitenteId: string;
  contenido: string;
  leido: boolean;
  createdAt: string;
}

export interface MessageWithSender extends Message {
  remitente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface Chat {
  id: string;
  pedidoId: string;
  createdAt: string;
}
