import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, Proposal, Message, OrderStatus, ProposalStatus } from '../types';

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

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      orders: [
        {
          id: 'demo-1',
          clienteId: '2',
          categoriaId: '1',
          descripcion: 'Limpieza profunda de departamento de 3 ambientes luego de mudanza. Incluye vidrios y balcón.',
          barrio: 'Palermo',
          estado: OrderStatus.ABIERTO,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'demo-2',
          clienteId: '2',
          categoriaId: '3',
          descripcion: 'Reparación de termotanque que pierde agua por la base. Urgente.',
          barrio: 'Belgrano',
          estado: OrderStatus.ABIERTO,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        }
      ],
      proposals: [
        {
          id: 'prop-1',
          pedidoId: 'demo-1',
          especialistaId: 'spec-1',
          descripcion: 'Hola! Tengo equipo propio y productos biodegradables. Puedo ir mañana mismo.',
          precioOferta: 24000,
          estado: ProposalStatus.PENDIENTE,
          createdAt: new Date().toISOString(),
        }
      ],
      messages: [],
      
      setOrders: (orders) => set({ orders }),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (id, data) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, ...data } : o)
      })),
      
      setProposals: (proposals) => set({ proposals }),
      addProposal: (proposal) => set((state) => ({ proposals: [proposal, ...state.proposals] })),
      updateProposal: (id, data) => set((state) => ({
        proposals: state.proposals.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    }),
    {
      name: 'app-storage',
    }
  )
);
