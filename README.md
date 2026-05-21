# Closetly

Closetly is an Expo + Supabase MVP for a smart virtual closet, fashion social layer, and low-cost AI recommendation system.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start Expo:

```bash
npm start
```

4. Apply Supabase schema:

```bash
supabase db push
```

5. Deploy Edge Functions:

```bash
supabase functions deploy analyze-garment
supabase functions deploy remove-bg-proxy
supabase functions deploy generate-outfit
supabase functions deploy cleanup-orphan-assets
```

## Main Paths

- Mobile app: `src/app`
- Feature modules: `src/features`
- Shared services: `src/services`
- Supabase schema and RLS: `supabase/schema.sql`
- Edge Functions: `supabase/edge-functions`
- Architecture spec: `ARCHITECTURE.md`

## MVP Cost Posture

- Public feeds are not realtime.
- Original images are private and compressed to WebP before upload.
- Thumbnails are public, cached, and small.
- AI calls run only through Edge Functions with rate limits and cached job state.
- Embeddings are disabled by default through `CLOSETLY_EMBEDDINGS_ENABLED=false`.
