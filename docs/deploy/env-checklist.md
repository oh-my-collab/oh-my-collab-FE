# Environment Checklist

## Required Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-only)

## Validation Steps
1. Confirm all three variables exist in local `.env.local`.
2. Confirm all three variables exist in Vercel environment settings.
3. Run `npm --prefix apps/web run test`.
4. Run `npm --prefix apps/web run build`.

## Common Errors
- `UNAUTHORIZED`: Supabase 세션이 없거나 만료됨.
- `FORBIDDEN`: user does not belong to the target workspace.
- `INTERNAL_ERROR`: malformed payload or missing environment variable.
