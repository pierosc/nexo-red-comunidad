# Nexo

Nexo es una red privada de comunidad construida con React, Clerk y Supabase. Cada persona puede iniciar sesión, completar su perfil, indicar su promoción, registrar quién la enroló y explorar las conexiones de los demás miembros.

## Incluye

- Autenticación con Clerk mediante modal de inicio de sesión.
- Directorio con búsqueda y filtros por promoción.
- Perfiles con foto por URL, biografía, profesión, ciudad, país y fecha de nacimiento.
- Relación visual entre la persona que te enroló y las personas enroladas por ti.
- Edición del perfil propio con datos persistidos en Supabase.
- Políticas RLS para que todos los miembros autenticados puedan leer perfiles y cada usuario solo pueda modificar el suyo.
- Modo demostración automático cuando aún no existen credenciales locales.

## Configuración

1. Crea un proyecto en Clerk y otro en Supabase.
2. En Clerk, usa **Connect with Supabase** para habilitar la integración de autenticación de terceros.
3. En Supabase, agrega Clerk en **Authentication → Third-Party Auth**.
4. Ejecuta `supabase/migrations/202608080001_create_profiles.sql` en el SQL Editor de Supabase.
5. Copia `.env.example` como `.env.local` y reemplaza los tres valores.
6. Ejecuta `npm install` y luego `npm run dev`.

## Variables

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://....supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

No coloques claves secretas o `service_role` en variables `VITE_`: estos valores llegan al navegador. La seguridad de las escrituras depende de Clerk, los JWT y las políticas RLS incluidas en la migración.

## Comandos

- `npm run dev`: inicia el proyecto localmente.
- `npm run build`: genera la versión de producción.
- `npm test`: compila y verifica la salida principal.
- `npm run lint`: revisa el código.
