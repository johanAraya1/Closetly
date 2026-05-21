# Closetly RLS and Security Policies

This project keeps sensitive decisions in Supabase, not in React Native.

## Main Rules

- `users`: users can read themselves or public profiles. Private, blocked, or deleted users are hidden.
- `garments`: owners can read/write their garments. Other users can read only non-private garments from public, non-blocked users.
- `outfits`: owners can manage their outfits. Public outfits are readable.
- `collections`: owners manage collections. Non-private collections are readable.
- `chats/messages`: only chat participants can read or write. Realtime should subscribe only to `messages` and critical `notifications`.
- `reports`: authenticated users can insert. Only service role/admin tooling can read.
- `analytics_events`: app can insert user-owned critical events. Reads are service-role only.
- `ai_processing_jobs` and `rate_limits`: service role writes jobs; user can only see their AI jobs.
- `storage.objects`: originals are private per user folder, thumbnails are public, processed images are public and written by service role.

## Cost Controls

- Feeds use `public_garments_feed`, a narrow view with no large image/original fields.
- Feed pagination uses cursor-like `created_at` queries and the `garments_public_feed_idx` partial index.
- Realtime is limited to `messages` and `notifications`.
- Duplicate garment uploads are blocked by `(user_id, file_hash)` partial unique index.
- AI calls are rate-limited by `check_rate_limit(scope, limit, window_seconds)`.
- AI jobs cache status and raw output to avoid repeated model calls.

## Abuse Controls

- Blocks are checked by helper functions before public reads and follows.
- Reports are append-only for users.
- Message text length is capped in the database.
- Storage buckets enforce MIME type and file-size limits.
- Edge Functions must validate JWTs and never trust client-side premium flags.

## Operational Notes

- Service-role code belongs only in Edge Functions, CI migrations, and admin jobs.
- Never ship `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, or `REMOVEBG_API_KEY` to the mobile app.
- Prefer soft delete (`deleted_at`) for user content so audit, moderation, and recovery remain possible.
