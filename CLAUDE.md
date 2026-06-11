# Mi Chamba — Contexto del Proyecto

## Qué es esto

Mi Chamba es un marketplace de servicios que conecta clientes con especialistas (plomeros, electricistas, tutores, etc.) en Buenos Aires, Argentina. Es el proyecto final de "Diseño y Planificación de Sistemas" (Seminario Final).

**Roles:** Cliente, Especialista, Administrador  
**Modelo de negocio:** Freemium

---

## Stack tecnológico

| Capa | Tecnología | Deploy |
|------|-----------|--------|
| Backend | NestJS + TypeScript | Railway |
| Base de datos | PostgreSQL + Prisma ORM | Railway (US East) |
| Frontend | React + Vite + Tailwind + Zustand (PWA) | Vercel |
| Real-time | Socket.IO (implementado) | — |
| Auth | JWT (access 15min + refresh 7d) + bcrypt | — |
| Storage | Cloudinary / S3 (pendiente) | — |

---

## Repositorios

- **Backend:** `github.com/mosstro7/michamba-backend`
- **Frontend:** `github.com/mosstro7/michambaWebApp`
- **Docs:** `titowanobacoa.github.io/michamba-docs`

> ⚠️ El repo `michambaMobileApp` es un prototipo viejo. No usarlo.

---

## Estructura del backend

```
src/
  auth/
  admin/
  orders/
  proposals/
  categories/
  chat/
  notifications/
  prisma/
```

**Swagger** disponible en `/api/docs`  
**Backend en producción:** `michamba-backend-production.up.railway.app`  
**Frontend en producción:** `michamba-web-app.vercel.app`  
**Admin seed:** `admin@michamba.com` / `Admin1234!`

---

## Schema de base de datos (11 modelos Prisma)

```
Usuario, PerfilEspecialista, Categoria, EspecialistaCategoria,
Pedido, Propuesta, Chat, Mensaje, Resena, Notificacion, Reclamo
```

---

## Reglas de negocio clave

- Al aceptar una propuesta: propuesta → ACEPTADA, pedido → EN_PROGRESO, otras propuestas → RECHAZADA (transacción atómica)
- Solo CLIENTE puede crear pedidos
- La cuenta admin se crea por seed, no por registro público
- Solo una reseña por pedido por usuario

---

## Estado actual del MVP (todo deployado y funcional)

### ✅ Backend completado
- AuthModule (register, login, refresh, guards)
- AdminModule (panel, gestión de usuarios)
- OrdersModule (CRUD, filtros por categoría y barrio)
- CategoriesModule (público)
- ProposalsModule (crear, aceptar con lógica atómica, `GET /proposals/mine`)
- Prisma seed: admin + 8 categorías

### ✅ Frontend completado
- Register, Login, Dashboard por rol
- NewOrder (multi-step con categorías reales)
- OrderDetail (propuestas + aceptar)
- Panel Admin
- Feed especialista con filtro de ubicación y scroll de categorías
- PWA configurada (manifest, theme_color #0F766E, standalone)
- Navbar persistente por rol, avatares con iniciales hash-coloreadas
- Chat en tiempo real (Socket.IO): mensajes optimistas, soporte para múltiples chats por pedido, flujo de contacto/propuesta reorganizado

### 🔄 Pendiente
1. Perfil completo de especialista (especialidades, foto, adjuntos verificación)
2. Refresh token automático en frontend
3. Migración de Vercel a Cloudflare Pages
4. Notificaciones en tiempo real

---

## Variables de entorno

**Backend (.env):**
```env
DATABASE_URL=postgresql://...@yamabiko.proxy.rlwy.net:5432/railway
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PORT=3001
```

**Frontend (.env):**
```env
VITE_API_URL=https://michamba-backend-production.up.railway.app
```

---

## Comandos útiles

```bash
# Desarrollo
npm run start:dev          # backend
npm run dev                # frontend (puerto 3000)

# Prisma
npx prisma migrate dev --name nombre
npx prisma db push
npx prisma studio
npx prisma db seed
```

---

## Convenciones

- TypeScript estricto
- DTOs con `class-validator` y `class-transformer`
- `PrismaService` disponible globalmente desde `src/prisma/prisma.service`
- Endpoints protegidos: `@UseGuards(JwtAuthGuard)` + `@Roles(...)` con `RolesGuard`
- No modificar schema de Prisma sin crear la migración correspondiente
- Nunca hardcodear secrets

---

## Comando especial: "dar estado del proyecto"

Cuando el usuario escriba exactamente **"dar estado del proyecto"**:

1. Analizá el estado actual revisando los archivos clave del proyecto
2. Generá UNA SOLA LÍNEA de texto plano (sin markdown, sin saltos de línea) con:
   - Qué está implementado y funcionando
   - Qué se trabajó en esta sesión
   - Qué queda pendiente como próximo paso
3. Guardá esa línea en `C:\Users\Nieves\Desktop\DaVinci\MiChamba\estado.txt` (sobreescribir si existe)
4. Confirmá al usuario que el estado fue guardado

**Formato:**
`[módulos completados]. Última sesión: [qué se hizo hoy]. Pendiente: [próximo paso concreto].`

**Ejemplo:**
`Auth, pedidos, propuestas, categorias, panel admin, feed especialistas deployados. Última sesión: implementado chat Socket.IO backend + frontend básico. Pendiente: notificaciones en tiempo real y perfil completo de especialista.`
