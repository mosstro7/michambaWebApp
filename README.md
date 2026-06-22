# Mi Chamba — Web App

Sitio de servicios que conecta clientes con especialistas (plomeros, electricistas, profesores, etc.) en Buenos Aires, Argentina. Proyecto final de la materia Seminario Final de la carrera Analista de Sistemas — Escuela Da Vinci.

**App en producción:** https://michamba-web-app.vercel.app/
**Documentación técnica completa:** https://titowanobacoa.github.io/michamba-docs/

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Zustand (manejo de estado)
- Socket.IO Client (chat en tiempo real)
- PWA instalable (`vite-plugin-pwa`)

## Funcionalidades principales

- Publicación de pedidos por parte de clientes, con categoría, descripción y ubicación
- Envío de propuestas por parte de especialistas, con historial de versiones
- Aceptar / rechazar / retirar / reactivar propuestas, con reglas de negocio por estado
- Chat en tiempo real por pedido y especialista
- Reporte de conversaciones con notificación al administrador
- Roles: Cliente, Especialista, Administrador

## Repositorio relacionado

- Backend (NestJS + Prisma + PostgreSQL): https://github.com/mosstro7/michamba-backend

## Correr el proyecto en local

Requisitos: Node.js

```bash
npm install
```

Crear un archivo `.env.local` en la raíz con la URL del backend:

```
VITE_API_URL=http://localhost:3001
```

Levantar el entorno de desarrollo:

```bash
npm run dev
```

La app queda disponible en `http://localhost:3000`.
