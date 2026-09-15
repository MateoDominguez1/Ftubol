# Football Performance Dashboard

App personal de seguimiento de rendimiento para fútbol + gimnasio: fatiga, recuperación, fuerza, composición corporal, nutrición y prevención de lesiones, todo cruzado en un solo dashboard. Fútbol y recuperación siempre tienen prioridad sobre el gimnasio.

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript
- **Tailwind CSS v4** — tema oscuro, mobile-first
- **Prisma 7** + PostgreSQL, vía `@prisma/adapter-pg`
- **Supabase Storage** — solo para las fotos de progreso (no se usa Supabase Auth)
- **Recharts** para los gráficos
- **Vitest** para el motor de cálculo (`src/lib/calculations/*`)

Todos los cálculos (semáforo de fatiga, recovery score, performance score, 1RM, volumen, motor de reglas) viven en `src/lib/calculations/` como funciones puras y testeadas, independientes de la UI y de la base de datos.

## Desarrollo local

Requiere Node 20+.

```bash
npm install
npx prisma dev --detach   # levanta una Postgres local embebida
npx prisma migrate dev    # crea las tablas
npm run db:seed           # carga tu perfil, la biblioteca de ejercicios y la Fase 1
npm run dev
```

Abrí http://localhost:3000 — el PIN de acceso por defecto está en `.env` (`APP_PIN`).

```bash
npm run test        # corre los tests del motor de cálculo
npm run build        # build de producción (incluye chequeo de tipos)
npm run db:studio    # explorar la base de datos con Prisma Studio
```

## Deploy (Vercel + Supabase/Neon)

1. **Base de datos**: creá un proyecto en [Supabase](https://supabase.com) o [Neon](https://neon.tech) (plan gratuito).
   - Supabase: copiá la connection string con pooling (puerto `6543`, `?pgbouncer=true`) para `DATABASE_URL`, y la conexión directa (puerto `5432`) para `DIRECT_URL`.
2. **Fotos de progreso** (opcional): en Supabase, creá un bucket de Storage (por ejemplo `progress-photos`) y copiá `SUPABASE_URL` y una `SUPABASE_SERVICE_ROLE_KEY` (Settings → API).
3. Copiá `.env.example` a `.env` y completá las variables (ver ese archivo para el detalle de cada una).
4. Corré las migraciones contra la base de producción: `npx prisma migrate deploy` y `npm run db:seed`.
5. Deployá el repo en [Vercel](https://vercel.com/new), cargando las mismas variables de entorno del `.env` en el proyecto de Vercel.

No hace falta ningún servicio pago: Vercel, Supabase/Neon y Prisma tienen planes gratuitos suficientes para uso personal.

## Estructura

```
prisma/schema.prisma        modelo de datos (una sola base para todos los módulos)
prisma/seed.ts               perfil inicial + biblioteca de ejercicios + Fase 1
src/lib/calculations/        motor de cálculo puro (fatiga, recovery, performance, fuerza, volumen, reglas...)
src/lib/data/                agregación de datos para dashboard, calendario, revisión semanal
src/lib/actions/             Server Actions (mutaciones)
src/app/(app)/                páginas de la app (protegidas por PIN)
src/app/login/                pantalla de acceso con PIN
src/components/ui/            primitivas de UI (botón, card, select, etc.)
src/components/dashboard/     componentes específicos del dashboard (score ring, gráficos, stat tiles)
src/components/shell/         navegación (sidebar, bottom nav, botón de registro rápido)
```

## Principio de datos

Ningún cálculo inventa valores: si no hay datos suficientes, la UI lo dice explícitamente ("Sin datos" / "No hay suficientes datos para determinar una tendencia") en vez de mostrar un número fabricado.
