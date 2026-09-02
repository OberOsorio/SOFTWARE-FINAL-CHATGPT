# Campaña Ganadora AI

Suite electoral integral importada y adaptada desde el repositorio público `oberconcejo/SOFTWARE-ALEJANDRO-DORIA`. Incluye landing comercial, autenticación, selector de módulos, gestión administrativa, estratégica y territorial, operación Día D, presupuesto, encuestas, jurados, testigos y panel privado de propietario global.

## Tecnología

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4 y Motion
- Express para API y ejecución local
- Supabase (Auth, PostgreSQL y RLS)
- Clerk opcional
- Gemini opcional para funciones de IA
- Preparado para Vercel mediante `api/index.ts`

## Abrir localmente

Requiere Node.js 20 o superior.

```powershell
npm install
Copy-Item .env.example .env
npm run build
npm run dev
```

Abra `http://localhost:3000`.

Rutas principales:

- `/`: landing pública
- `/modulos`: selector de módulos (requiere sesión de campaña)
- `/dashboard`: centro de comando (requiere sesión)
- `/global-admin`: terminal privada del propietario global

La navegación interna también conserva rutas hash para compatibilidad con el sistema original.

## Configurar Supabase

1. Cree un proyecto en Supabase.
2. Abra **SQL Editor**.
3. Ejecute `supabase_schema.sql`. Este archivo ya contiene tablas, índices y políticas RLS del sistema actual.
4. No ejecute además los archivos históricos de `supabase/migrations/` ni `supabase_policies.sql` sobre una instalación nueva, porque pertenecen a modelos anteriores.
5. En **Authentication → Providers**, habilite Email.
6. Cree el usuario propietario desde **Authentication → Users**.
7. Complete `.env` con la URL y la clave pública. La clave de servicio es exclusivamente del servidor:

```env
VITE_SUPABASE_URL=https://SU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=SU_CLAVE_PUBLICA
SUPABASE_SERVICE_ROLE_KEY=SU_CLAVE_PRIVADA_DEL_SERVIDOR
# Alternativa moderna recomendada por Supabase:
SUPABASE_SECRET_KEY=sb_secret_SU_CLAVE_PRIVADA_DEL_SERVIDOR
CRON_SECRET=UNA_CADENA_ALEATORIA_LARGA_PARA_LA_LIMPIEZA_DE_DEMOS
```

Configure solo una de las dos claves privadas de Supabase. No coloque `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `GEMINI_API_KEY` ni otras claves privadas en variables que empiecen por `VITE_`.

## Servicios opcionales

- Clerk: `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- PostgreSQL/Vercel Postgres: `POSTGRES_URL`, `DATABASE_URL`
- Gemini: `GEMINI_API_KEY`
- Consulta de puesto de votación: `VOTING_API_BASE_URL`, `VOTING_API_ENDPOINT`, `VOTING_API_KEY`, `VOTING_API_TIMEOUT`

El archivo `.env.example` no contiene credenciales reales.

## Desplegar en Vercel

1. Suba el proyecto a GitHub.
2. En Vercel seleccione **Add New → Project** e importe el repositorio.
3. Use Build Command `npm run build`, Output Directory `dist` e Install Command `npm install`.
4. Agregue en **Settings → Environment Variables** las mismas variables de `.env` para Production, Preview y Development.
5. Despliegue.
6. En Supabase configure **Authentication → URL Configuration** con:
   - Site URL: `https://SU-DOMINIO.vercel.app`
   - Redirect URL: `https://SU-DOMINIO.vercel.app/**`
   - Desarrollo: `http://localhost:3000/**`
7. Verifique `/`, `/global-admin` y `/api/instantdb-config` después del despliegue.

`vercel.json` envía `/api/*` a la función Express y entrega las demás rutas desde la SPA.

## Validación

```powershell
npm run lint
npm run build
```

Vite puede mostrar una advertencia por el tamaño del paquete principal; no bloquea el despliegue.

## Seguridad

- `/global-admin` está separado de la navegación pública y protegido por sesión/token.
- Mantenga RLS habilitado en todas las tablas con datos electorales.
- Cambie cualquier contraseña de demostración antes de producción.
- Active MFA, límites de solicitudes, auditoría y rotación de secretos.
- Revise el tratamiento de datos conforme a la Ley 1581 de 2012 y las obligaciones aplicables del CNE.
