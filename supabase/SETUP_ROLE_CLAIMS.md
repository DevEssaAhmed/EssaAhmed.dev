# Supabase Admin Access & Role Setup

This document explains the authentication and access model for the portfolio admin area and protected Supabase tables (such as `public.travel_highlights`).

---

## 1. Access Model

In this personal portfolio project, **any authenticated user** provisioned in your Supabase project has full access to the `/admin` dashboard, editor tools, and admin API routes (such as `/api/articles/import`).

- **Client-side route protection (`ProtectedRoute.tsx`)**:
  Requires an active authenticated Supabase session (`user !== null`). Unauthenticated visitors are presented with the login form.
- **Context (`AuthContext.tsx`)**:
  `isAdmin` is evaluated as `Boolean(user)`.
- **API routes (`/api/articles/import`)**:
  Verify the incoming Bearer token with `supabase.auth.getUser(token)`. Any valid session from a user in your Supabase Auth project is authorized.
- **Database RLS Policies**:
  RLS policies on content tables allow access to `authenticated` users, aligning permissions with the authenticated user session.

You do **not** need to configure custom `raw_app_meta_data.role = "admin"` claims for standard admin operations. Simply add an admin user account in Supabase.

---

## 2. Adding an Admin User

To grant someone access to the admin area:

### Via Supabase Dashboard UI (Recommended)
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** > **Users**.
3. Click **Add User** -> **Create User**.
4. Enter the user's email address and a strong password (or send an invite).
5. Ensure **Auto Confirm User** is checked if you want immediate access without email verification.
6. Once created, this user can immediately sign in at `/admin/login` and manage all portfolio content.

### Via Supabase Admin API (Service Role)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

await supabaseAdmin.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'your-secure-password',
  email_confirm: true,
});
```

---

## 3. (Optional) Custom Role Claims

If you ever wish to re-introduce role-based distinctions (e.g. separating read-only editors from full admins):

Always store authorization claims in **`app_metadata`** (which is server-managed and tamper-proof in JWTs), never in client-editable `user_metadata`.

```sql
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE id = '<USER_UUID>';
```
