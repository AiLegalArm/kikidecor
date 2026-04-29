
-- Update trigger to use new admin email
CREATE OR REPLACE FUNCTION public.handle_new_user_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF lower(NEW.email) = 'kristina01144@rambler.ru' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_admin_role ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin_role();

-- Create the new admin user
DO $$
DECLARE
  new_user_id uuid;
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE lower(email) = 'kristina01144@rambler.ru';

  IF existing_id IS NULL THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
      'Kristina01144@rambler.ru',
      crypt('Kristina01144', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', 'Kristina01144@rambler.ru', 'email_verified', true), 'email', new_user_id::text, now(), now(), now());
  ELSE
    new_user_id := existing_id;
    UPDATE auth.users
      SET encrypted_password = crypt('Kristina01144', gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = new_user_id;
  END IF;

  -- Grant admin role to new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Remove all other admin roles
  DELETE FROM public.user_roles WHERE role = 'admin' AND user_id <> new_user_id;

  -- Delete the old admin auth users entirely
  DELETE FROM auth.users WHERE lower(email) IN ('34820vw@bk.ru', 'kikidecor777@proton.me');
END $$;
