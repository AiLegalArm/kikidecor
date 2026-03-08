

## Plan: Create admin user account

**Credentials:** admin@kikidecor.ru / KiKi2024!Admin

### Steps

1. **Enable auto-confirm** via `cloud--configure_auth` so the user is immediately active without email verification

2. **Create edge function `create-admin`** — a one-time utility that uses the Supabase Admin API (`supabase.auth.admin.createUser`) to create the user with:
   - email: admin@kikidecor.ru
   - password: KiKi2024!Admin
   - email_confirm: true

3. **Add to `supabase/config.toml`:**
   ```toml
   [functions.create-admin]
   verify_jwt = false
   ```

4. **Deploy and invoke** the edge function to create the user

5. **Disable auto-confirm** after user is created (restore normal behavior)

6. **Delete the edge function** after use (it's a one-time setup tool)

### Security Note
The edge function will use SUPABASE_SERVICE_ROLE_KEY (already configured) to create the user via admin API. The function will be removed after the account is created.

