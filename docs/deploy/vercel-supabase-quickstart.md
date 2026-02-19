# Vercel + Supabase Quickstart

## 1. Fork and import
1. Fork this repository.
2. In Vercel, choose `Add New -> Project`.
3. Import your fork and set root directory to `apps/web`.

## 2. Configure environment variables
Set these in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3. Create Supabase schema
1. Open Supabase SQL editor.
2. Run `apps/web/supabase/migrations/20260219_001_init.sql`.
3. Run `apps/web/supabase/migrations/20260219_002_insights.sql`.

## 4. Deploy
1. Trigger deployment from Vercel dashboard.
2. Verify `/api/health` returns `{ "status": "ok" }`.

## 5. Initialize workspace
Send a `POST /api/workspaces` request with:
```json
{ "name": "My Capstone Team" }
```
The API now uses Supabase Auth session cookies.  
Sign in first, then call the endpoint from the same browser session.
