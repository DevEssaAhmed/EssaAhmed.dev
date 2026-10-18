# Supabase Admin Role Claims Setup

This document explains how to grant trusted administrator claims for the portfolio admin area and protected Supabase tables (such as `public.travel_highlights`).

---

## 1. Security Model: `app_metadata` vs `user_metadata`

- **`app_metadata` (Server-Trusted)**:
  Contains claims managed exclusively by the authentication server / administrator. Users cannot modify their own `app_metadata` via client SDK calls (`supabase.auth.updateUser()`). It is reflected in the JWT claims under `auth.jwt()->'app_metadata'` and is safe for authorization decisions.
- **`user_metadata` (Client-Editable - DO NOT USE FOR AUTHZ)**:
  Contains user profile data that can be updated by the authenticated user from the client at any time. Basing authorization or RLS on `user_metadata` is insecure.

Both the database RLS policies (`public.is_portfolio_admin()`) and client route protection (`ProtectedRoute.tsx`) check `app_metadata.role === 'admin'`. The import API verifies the same claim against the authenticated Supabase user on the server.

---

## 2. Assigning the Admin Role

Set the role claim through a trusted administrative channel:

### Option A: Via Supabase SQL Editor
Run the following statement targeting your administrator user:

```sql
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE id = '<USER_UUID>';
```
*(Replace `<USER_UUID>` with the UUID of the user found in the Supabase Auth table).*

### Option B: Via Supabase Dashboard UI
1. Navigate to **Authentication** > **Users** in the Supabase Dashboard.
2. Locate the admin user and open **User Details**.
3. Under **App Metadata**, add or edit the JSON:
   ```json
   {
     "role": "admin"
   }
   ```
4. Save changes.

### Option C: Via Supabase Admin API (Service Role)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

await supabaseAdmin.auth.admin.updateUserById('<USER_UUID>', {
  app_metadata: { role: 'admin' }
});
```

---

## 3. Verifying the Setup

1. Have the user sign out and sign back in to refresh their JWT session token.
2. Check `user.app_metadata?.role` in the browser console or application context (`useAuth()`).
3. Verify that non-admin authenticated accounts viewing `/admin` receive the clear **Access Denied** screen, while admin users can access the dashboard and manage travel highlights without RLS errors.
