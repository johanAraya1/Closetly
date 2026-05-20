# Closetly Architecture & Design

## 1. Visión General
Closetly es un MVP mobile-first que combina un closet virtual personal, generación de outfits e interacción social. El frontend es un cliente React Native con Expo y Expo Router, mientras que el backend es Supabase serverless con RLS y Edge Functions para IA.

## 2. Arquitectura
- Monolito modular mobile-first.
- Frontend UI-only: navegación, requests, renderizado.
- Backend serverless en Supabase: autenticación, storage, realtime, funciones Edge y PostgreSQL.
- Separación de capas:
  - UI (React Native)
  - Servicios (Supabase, OpenAI, remove.bg)
  - Dominio y seguridad (RLS + políticas)
  - Persistencia (PostgreSQL + Storage)

## 3. Stack Tecnológico
Frontend:
- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind
- TanStack Query
- Zustand
- Axios

Backend:
- Supabase Auth
- PostgreSQL
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions
- RLS

Observabilidad:
- Sentry
- PostHog
- Supabase Logs

IA:
- OpenAI API
- remove.bg (proxy backend)

## 4. Estructura Proyecto
```
closetly/
  app/
    _layout.tsx
    index.tsx
    auth/login.tsx
    auth/register.tsx
    closet/index.tsx
    outfits/index.tsx
    explore/index.tsx
    chat/index.tsx
    settings.tsx
  assets/
  src/
    components/ui/
    features/
    services/
    store/
    hooks/
    lib/
    types/
    constants/
    utils/
  supabase/
    schema.sql
    policies.md
    edge-functions/
      ia-proxy/index.ts
      remove-bg-proxy/index.ts
  package.json
  tsconfig.json
  app.json
  README.md
```

## 5. PostgreSQL Schema
El esquema implementa tablas estrictas para:
- users
- garments
- outfits
- outfit_garments
- chats
- chat_participants
- messages
- reports

Todos los campos recomendados en el requerimiento están incluidos, con índices para búsquedas y filtrados.

## 6. Supabase Backend
- `schema.sql` crea tablas y habilita RLS.
- `policies.md` define políticas de acceso por tabla.
- Edge Functions expone proxies backend para OpenAI y remove.bg.
- Supabase Storage guarda imágenes con rutas organizadas y thumbnails.

## 7. Seguridad
- RLS obligatorio en todas las tablas.
- Validación backend-first: la única fuente de verdad es Supabase.
- API keys nunca expuestas al cliente.
- Proxy backend para IA.
- Sanitización de inputs con Zod en frontend y se debe complementar con validación en funciones.
- Protección de rutas mediante `auth.uid()` en políticas.
- Bloqueo y reportes administrados en backend.

## 8. Escalabilidad
- Índices estratégicos: usuario, visibilidad, categorías, estilo, vectores de embedding.
- Paginación obligatoria en feeds.
- Realtime solo donde es necesario: chats y notificaciones.
- Queries optimizadas por RLS y filtros.
- Thumbnails y compresión para minimizar ancho de banda.

## 9. UX/UI
- Estilo minimalista, fashion tech, visual-first.
- Paleta definida para modo claro y oscuro.
- Layout limpio con cards suaves y botones redondeados.
- Navegación fluida con Expo Router.
- Skeleton loaders y estados de carga.
- Onboarding elegante en futuras iteraciones.
- Accesibilidad básica: contraste, etiquetas, tamaños táctiles.

## 10. Formularios/Auth
- Registro: email, password, username único.
- Login: email, password.
- Perfil: foto, username, bio, idioma, privacidad, estilo.
- Validaciones: sanitización, longitud, formato y username único.

## 11. Funcionalidades
- Closet virtual: subir, editar, eliminar prendas.
- Outfits: creación, guardado y colecciones.
- Explore social: contenido público filtrado por categoría y estilo.
- Chat privado con bloqueo y reportes.
- IA en backend para metadatos y recomendaciones.

## 12. IA
- Clasificación automática de prendas.
- Detección de color, categoría, temporada, estilo y tags.
- Recomendaciones de outfits.
- IA ejecutada en backend mediante Edge Functions.
- Costos controlados con peticiones únicas y sólo metadatos.

## 13. Chat y Social
- Chat privado con participantes.
- Reglas RLS para acceso solo a participantes.
- Social feed optimizado con filtros y búsqueda.
- Privacidad de perfiles públicos/privados.
- Reportes y bloqueo básico.

## 14. Observabilidad
- Frontend: Sentry para errores, PostHog para funnels.
- Backend: logs de Supabase + Edge Functions.
- Eventos estructurados con userId, action, status, metadata, timestamp.
- RequestId único recomendado para trazabilidad completa.

## 15. Monetización
Modelo freemium:
- Gratis: closet básico, outfits manuales, social básico.
- Premium: IA avanzada, outfits automáticos, planificación semanal, recomendaciones inteligentes, analytics personal.

## 16. Roadmap MVP
Fase 1:
- Auth
- Perfiles
- Upload prendas

Fase 2:
- Outfits
- IA básica

Fase 3:
- Explore social

Fase 4:
- Chat
- Premium

## 17. Riesgos
- Abuso de storage y costo de imágenes.
- Costos de IA si no se limita.
- Feeds complejos si no se paginan.
- Spam y chats no moderados.
- Realtime excesivo.
- Crecimiento rápido sin optimización.

## 18. Buenas Prácticas
- Evitar sobreingeniería.
- Minimizar requests y storage.
- Backend como source of truth.
- Usar componentes reutilizables.
- Optimizar imágenes antes del upload.

## 19. Ejemplos Código
- `src/app/auth/login.tsx` y `src/app/auth/register.tsx`
- `src/services/supabase.ts`
- `supabase/edge-functions/ia-proxy/index.ts`
- `supabase/schema.sql`

## 20. Políticas RLS
Ver `supabase/policies.md` para políticas de acceso por tabla y recomendaciones.

## 21. Recomendaciones Finales
- Desplegar en Supabase gratuito para MVP.
- Mantener IA en proxies y limitar requests.
- Usar thumbnails y WebP en Storage.
- Iterar rápido sobre UX y datos de usuarios.
- Hacer auditoría de RLS antes del lanzamiento.
