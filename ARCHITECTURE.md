# Closetly Architecture

## 1. Vision General

Closetly es un closet virtual inteligente con capa social de moda y recomendaciones IA. El MVP prioriza costo cero o casi cero: Expo para iteracion rapida, Supabase para backend administrado, Postgres como fuente de verdad, Storage con WebP y thumbnails, y Edge Functions para toda logica sensible.

## 2. Arquitectura

Usa monolito modular mobile-first con feature-first architecture y clean architecture parcial. La app vive en `src/features/*`; cada feature contiene `screens`, `components`, `hooks`, `services`, `validations`, `types`, analytics y manejo de errores.

El cliente solo presenta estado, manda comandos y cachea. Supabase valida permisos con RLS, constraints, triggers y Edge Functions.

## 3. Decisiones Tecnicas

Supabase se elige porque combina Auth, Postgres, Storage, Edge Functions, Realtime y logs en una sola plataforma con buen free tier. Se evitan microservicios porque agregarian deploys, tracing, costos y latencia antes de tener volumen real.

Realtime se limita a chats y notificaciones criticas. Feeds, likes masivos y explore usan query cache, paginacion e invalidacion selectiva.

## 4. Stack

- Frontend: React Native, Expo SDK 51, TypeScript, Expo Router, Zustand, TanStack Query, Axios, React Hook Form, Zod, NativeWind.
- Backend: Supabase, PostgreSQL, Auth, Storage, Realtime, Edge Functions.
- IA: OpenAI Responses API con Structured Outputs; remove.bg como proveedor reemplazable.
- Observabilidad: Sentry, PostHog, Supabase Logs.
- Deploy: EAS Build y OTA Updates.

## 5. Estructura Proyecto

```text
src/
  app/
  components/
  features/
  services/
  hooks/
  store/
  lib/
  constants/
  theme/
  i18n/
  types/
  utils/
supabase/
  schema.sql
  policies.md
  edge-functions/
```

## 6. Base de Datos

Postgres modela usuarios, prendas, outfits, colecciones, chat, mensajes, reportes, notificaciones, favoritos, follows y eventos. Todas las tablas sensibles tienen RLS, `created_at`, `updated_at` cuando aplica, soft delete con `deleted_at`, constraints y indices parciales.

## 7. SQL Schema

El schema completo esta en `supabase/schema.sql`. Incluye extensiones `pgcrypto`, `citext`, `pg_trgm` y `vector`; enums para visibilidad, premium, IA, reportes y notificaciones; triggers de `updated_at`; vistas de feed; buckets de storage; y funciones helper.

## 8. Indices SQL

Los indices principales son:

- `garments_user_active_idx` para closet privado.
- `garments_public_feed_idx` para explore sin realtime.
- `garments_user_file_hash_active_idx` para evitar duplicados.
- GIN en `ai_tags` y `dominant_palette`.
- IVFFLAT opcional en `embedding_vector`.
- `messages_chat_created_idx` para chat paginado.
- `notifications_user_unread_idx` para bandeja eficiente.

## 9. RLS Policies

RLS cubre todas las tablas. El propietario puede gestionar su contenido. Los demas solo ven contenido publico permitido, sin usuarios privados/bloqueados. Chat y mensajes requieren participacion. Reports son append-only para usuarios. Analytics y auditoria son service-role only para lectura.

## 10. Backend

El backend es Postgres + Edge Functions. Postgres guarda verdad, permisos, counters, auditoria y limites. Edge Functions ejecutan IA, validan JWT, aplican rate limits, firman imagenes privadas y escriben resultados.

## 11. Edge Functions

- `analyze-garment`: analiza categoria, color, temporada, material, estilo, tags, patron y confianza.
- `remove-bg-proxy`: usa remove.bg si esta configurado y guarda el asset procesado.
- `generate-outfit`: premium only, genera outfits con prendas existentes.
- `cleanup-orphan-assets`: job con secreto para limpiar Storage sin referencias.

## 12. Seguridad

No hay service role en el cliente. Secrets viven en Supabase. Auth usa JWT validado en Edge. Inputs pasan por Zod en cliente y constraints SQL/backend. Storage separa originales privados de thumbnails publicos. Reportes, blocks, rate limits y limites de MIME/tamano reducen abuso.

## 13. Observabilidad

Sentry captura crashes y excepciones. PostHog captura funnels. Supabase Logs recibe logs JSON de Edge Functions. `analytics_events` guarda eventos criticos auditables sin reemplazar PostHog.

## 14. Logs y Tracing

Cada request a Edge Functions lleva `x-request-id`. Axios genera requestId, Sentry agrega breadcrumbs y Edge Functions loguean JSON con `requestId`, `userId`, funcion, status y error. Esto permite correlacionar mobile -> edge -> database.

## 15. UX/UI

La UI es minimalista, premium y mobile-first. Paleta light: `#F8F8F8`, `#FFFFFF`, `#8B5CF6`, `#D6D3D1`, `#1F1F1F`. Paleta dark preparada: `#121212`, `#1E1E1E`, `#A78BFA`, `#F5F5F5`.

## 16. Navegacion

Expo Router define rutas: auth, closet, outfits, explore, chat y settings. La navegacion principal usa un tab bar simple para velocidad y claridad.

## 17. Auth

Supabase Auth maneja login/register. Un trigger crea `public.users` al registrar. El store de Zustand mantiene sesion y perfil; no decide permisos reales.

## 18. Closet

El closet lista prendas del usuario con TanStack Query. Upload usa Image Picker, compresion a WebP, thumbnail local, hash SHA-256 y subida a buckets separados. La prenda se inserta privada y luego se dispara IA.

## 19. IA

La IA corre solo en Edge Functions. Para reducir costo:

- `detail: "low"` en vision para analisis de prenda.
- Structured Outputs para evitar reintentos por JSON invalido.
- Rate limits por usuario.
- Cache por `ai_status`, `file_hash`, `similarity_hash`.
- Embeddings desactivados por defecto.
- Modelos configurables con `CLOSETLY_VISION_MODEL` y `CLOSETLY_TEXT_MODEL`.

## 20. Explore Social

Explore consume `public_garments_feed`, una vista estrecha sin originales privados ni metadata pesada. Usa paginacion por cursor y cache; no usa realtime.

## 21. Chat

Chat usa Realtime solo en `messages` y solo por `chat_id`. Las politicas validan participantes. Inserciones actualizan preview y crean notificaciones criticas.

## 22. Monetizacion

Free: closet basico, outfits manuales, social basico. Premium: outfits IA, recomendaciones semanales, analytics de uso y sugerencias inteligentes. La validacion premium ocurre en `generate-outfit`.

## 23. Escalabilidad

El MVP escala primero con mejores queries: vistas estrechas, indices parciales, paginacion, cache y storage optimizado. Cuando el feed crezca, se puede agregar tabla materializada `feed_items` sin cambiar el cliente.

## 24. Optimizacion

Imagenes: max 1080px, WebP, thumbnails, cache local con `expo-image`, buckets por tipo, limpieza de huerfanos. SQL: selects estrechos, limites, indices parciales, no joins costosos en mobile. IA: procesamiento diferido, rate limits y caching.

## 25. CI/CD

GitHub Actions ejecuta install, lint, typecheck y tests. EAS preview queda manual via `workflow_dispatch`. Secrets se inyectan desde GitHub, no se commitean.

## 26. OTA Updates

EAS Update usa branches `development`, `preview` y `production`. `runtimeVersion` sigue `appVersion`, evitando mandar OTA incompatible con nativos.

## 27. Testing

Hay tests unitarios para Zod validations e integracion basica de cache keys. La siguiente capa debe cubrir hooks con mocks de Supabase, servicios de Edge y E2E smoke con Maestro o Detox.

## 28. Riesgos

- Costos IA si no se respetan rate limits.
- Storage si se guardan originales grandes o duplicados.
- Feed lento si se agregan joins sociales sin materializar.
- Moderacion insuficiente si reports no tienen workflow admin.
- remove.bg puede ser caro; debe tener alternativa open-source/self-host cuando haya volumen.

## 29. Roadmap MVP

1. Conectar Supabase real, aplicar schema y buckets.
2. Validar auth y upload en dispositivo.
3. Deploy `analyze-garment` y confirmar metadata.
4. Crear editor de metadata.
5. Agregar detalle de prenda y cambio de visibilidad.
6. Crear flujo de chat desde prenda publica.
7. Agregar premium flags y compras.
8. Implementar recomendaciones semanales.
9. Montar panel admin para reports/moderacion.

## 30. Ejemplos Codigo

Subir prenda:

```ts
const asset = await prepareGarmentImage(uri);
const uploaded = await uploadGarmentAssets(user.id, asset.fileHash, asset.originalUri, asset.thumbnailUri);
const garment = await createGarment({
  image_url: uploaded.originalPath,
  thumbnail_url: uploaded.thumbnailPublicUrl,
  storage_path: uploaded.originalPath,
  thumbnail_path: uploaded.thumbnailPath,
  file_hash: asset.fileHash
});
```

Llamar IA:

```ts
await api.post("analyze-garment", { garment_id: garment.id });
```

RLS conceptual:

```sql
create policy garments_select_visible on public.garments
for select using (
  deleted_at is null
  and (user_id = auth.uid() or (visibility <> 'private' and public.can_view_user(user_id)))
);
```

## 31. Recomendaciones Finales

Mantener el monolito modular hasta que el producto pruebe traccion. No mover a microservicios antes de tener limites medibles. Optimizar primero imagenes, queries y frecuencia IA. Usar Edge Functions como frontera anti-abuso. Mantener proveedores intercambiables: Storage paths propios, prompts versionados, modelos por env vars y schema SQL portable.
