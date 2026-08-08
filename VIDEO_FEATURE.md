# Isoko Live & Video Library — Implementation Notes

Summary of what was added and how to run it locally.

## Files Created
- `supabase/migrations/20260808_create_videos_and_live_streams.sql`
- `supabase/migrations/20260808_add_rpcs_increment.sql`
- `supabase/migrations/20260808_convert_live_to_video.sql`
- `supabase/migrations/20260808_update_rls_policies.sql`
- `src/components/videos/LiveIndicator.tsx`
- `src/components/videos/LatestVideos.tsx`
- `src/components/videos/VideoCard.tsx`
- `src/components/videos/Comments.tsx`
- `src/components/admin/LiveControl.tsx`
- `src/components/admin/VideoManager.tsx`
- `src/pages/Videos.tsx`
- `src/pages/Video.tsx`
- `src/lib/videos.ts`

## Files Modified
- `src/integrations/supabase/types.ts`
- `src/components/HeroSection.tsx`
- `src/pages/Index.tsx`
- `src/App.tsx`
- `src/pages/Video.tsx`
- `src/pages/Videos.tsx`
- `src/pages/Admin.tsx`

## Database (migrations)
- Creates tables: `videos`, `live_streams`, `comments`, `likes`.
- Adds RPCs: `increment_video_view`, `increment_live_view`, `recount_video_comments`, `recount_live_comments`.
- Adds `convert_live_to_video(p_live uuid)` RPC to atomically end a live, create a `videos` record and attach comments.
- Adds/updates RLS policies to use `is_admin()` where appropriate.

Review the SQL files before applying to your production database.

## Environment variables
- `VITE_SUPABASE_URL` (required)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (required)
- `SUPABASE_SERVICE_ROLE_KEY` (only for applying migrations / server tasks; keep secret)

## Routes added
- `/videos` — list, search, filter, pagination
- `/videos/:id` — detail page with player placeholder, likes, share, comments

## Local run & migration commands
1. Install dependencies
```
npm install
```
2. Start dev server
```
npm run dev
```
3. Apply DB migrations (example using Supabase CLI — set service key first)
```
# PowerShell example
$env:SUPABASE_URL = "<YOUR_SUPABASE_URL>"
$env:SUPABASE_SERVICE_ROLE_KEY = "<YOUR_SERVICE_ROLE_KEY>"
supabase db push --file supabase/migrations/20260808_create_videos_and_live_streams.sql
supabase db push --file supabase/migrations/20260808_add_rpcs_increment.sql
supabase db push --file supabase/migrations/20260808_convert_live_to_video.sql
supabase db push --file supabase/migrations/20260808_update_rls_policies.sql
```

Or use `psql` to apply the SQL files.

## Acceptance test checklist
1. Admin creates a livestream (e.g. "Isoko Entertainment Live").
2. Admin starts it → homepage shows pulsing `LIVE NOW • [Title]`.
3. Users open live page and post comments; other viewers see comments in realtime.
4. Admin ends live → `convert_live_to_video` runs → video appears in `/videos`.
5. All live comments are preserved and visible on the recorded video.

## Limitations and next steps
- Video playback provider not integrated (player placeholder). Choose YouTube/Mux/Supabase Storage for playback.
- Automated recording ingestion requires provider webhooks (not implemented).
- Viewer metrics are simple counters; for concurrent viewer analytics consider provider metrics or a dedicated analytics service.
- Add tests/CI and run `npm run build` and `tsc` to validate types locally.

If you'd like, I can now integrate playback (YouTube or Mux), add CI/tests, or help apply migrations to your Supabase project.
