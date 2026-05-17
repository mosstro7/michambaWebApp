import { create } from 'zustand';
import { Order, Proposal, Message } from '../types';

interface AppState {
  orders: Order[];
  proposals: Proposal[];
  messages: Message[];

  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;

  setProposals: (proposals: Proposal[]) => void;
  addProposal: (proposal: Proposal) => void;
  updateProposal: (id: string, data: Partial<Proposal>) => void;

  addMessage: (message: Message) => void;
}

export const useAppStore = create<AppState>((set) => ({
  orders: [],
  proposals: [],
  messages: [],

  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (id, data) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
    })),

  setProposals: (proposals) => set({ proposals }),
  addProposal: (proposal) =>
    set((state) => ({ proposals: [proposal, ...state.proposals] })),
  updateProposal: (id, data) =>
    set((state) => ({
      proposals: state.proposals.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));
