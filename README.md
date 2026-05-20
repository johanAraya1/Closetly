# Closetly

Closetly es un MVP móvil-first creado con Expo + React Native + Supabase. Está diseñado para ser una plataforma social de closet virtual, outfits y networking de moda, con IA en backend y observabilidad integrada.

## Estructura

- `src/` - código fuente de frontend
- `src/app/` - pantallas y rutas Expo Router
- `src/components/` - componentes UI reutilizables
- `src/features/` - domain features: auth, closet, outfits, explore, chat, settings
- `src/services/` - API, Supabase, IA y analytics
- `src/store/` - estado global, persistencia ligera
- `supabase/` - esquema SQL, políticas y edge functions

## Instalación

1. Instalar dependencias:
   `npm install`
2. Copiar `.env.example` a `.env` y configurar variables.
3. Ejecutar en modo desarrollo:
   `npm run start`

## Notas de arquitectura

- Frontend UI-only: la lógica de negocio crítica, permisos y RLS se manejan en Supabase y Edge Functions.
- RLS obligatorio en todas las tablas.
- IA y eliminación de fondo se ejecutan a través de funciones proxy en el backend.
- Observabilidad con Sentry, PostHog y logs de Supabase.

## Roadmap MVP

1. Autenticación / perfiles / upload prendas
2. Outfits / IA básica
3. Explore social / búsquedas
4. Chat / premium
