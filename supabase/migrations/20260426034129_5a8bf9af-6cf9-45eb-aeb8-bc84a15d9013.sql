-- ============================================================
-- PART 1: REMOVE SHOWROOM / SHOP TABLES
-- ============================================================
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.product_embeddings CASCADE;
DROP TABLE IF EXISTS public.lookbook_looks CASCADE;
DROP TABLE IF EXISTS public.brand_leads CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP FUNCTION IF EXISTS public.match_products(extensions.vector, double precision, integer) CASCADE;

-- ============================================================
-- PART 2: ROLES SYSTEM (security-critical, separate table)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PART 3: SHARED TIMESTAMP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- PART 4: CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_en text,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- PART 5: WORKS (portfolio core)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.work_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  title_en text,
  description text,
  description_en text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  cover_image_url text NOT NULL,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  event_date date,
  materials text[] NOT NULL DEFAULT '{}'::text[],
  price_range text,
  status public.work_status NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  view_count int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_works_status ON public.works(status);
CREATE INDEX idx_works_category ON public.works(category_id);
CREATE INDEX idx_works_featured ON public.works(featured) WHERE featured = true;
CREATE INDEX idx_works_tags ON public.works USING GIN(tags);

CREATE POLICY "Anyone can view published works"
  ON public.works FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins can view all works"
  ON public.works FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage works"
  ON public.works FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_works_updated_at
  BEFORE UPDATE ON public.works
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- PART 6: TELEGRAM ADMINS (chat_id -> user_id binding)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.telegram_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id bigint UNIQUE,
  username text,
  link_code text UNIQUE,
  link_code_expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT false,
  notifications_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  linked_at timestamptz
);
ALTER TABLE public.telegram_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage telegram admins"
  ON public.telegram_admins FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PART 7: GENERATOR RUNS (AI generation history)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.gen_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.generator_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generator_type text NOT NULL,
  source text NOT NULL DEFAULT 'web',
  initiated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  telegram_chat_id bigint,
  prompt text,
  input_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.gen_status NOT NULL DEFAULT 'queued',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.generator_runs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_gen_runs_status ON public.generator_runs(status);
CREATE INDEX idx_gen_runs_created ON public.generator_runs(created_at DESC);

CREATE POLICY "Admins can manage generator runs"
  ON public.generator_runs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PART 8: ADMIN ACTIONS (audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'web',
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_admin_actions_user ON public.admin_actions(user_id);
CREATE INDEX idx_admin_actions_created ON public.admin_actions(created_at DESC);

CREATE POLICY "Admins can view audit log"
  ON public.admin_actions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit entries"
  ON public.admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PART 9: STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('work-covers', 'work-covers', true),
  ('work-gallery', 'work-gallery', true),
  ('generator-output', 'generator-output', false)
ON CONFLICT (id) DO NOTHING;

-- Public read for portfolio media
CREATE POLICY "Public can view work covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'work-covers');

CREATE POLICY "Public can view work gallery"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'work-gallery');

CREATE POLICY "Admins can upload work covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'work-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update work covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'work-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete work covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'work-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload work gallery"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'work-gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update work gallery"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'work-gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete work gallery"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'work-gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage generator output"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'generator-output' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'generator-output' AND public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PART 10: SEED DEFAULT CATEGORIES
-- ============================================================
INSERT INTO public.categories (slug, name, name_en, sort_order) VALUES
  ('weddings', 'Свадьбы', 'Weddings', 1),
  ('private-events', 'Частные мероприятия', 'Private Events', 2),
  ('corporate', 'Корпоративные', 'Corporate', 3),
  ('floral', 'Флористика', 'Floral Design', 4),
  ('installations', 'Инсталляции', 'Installations', 5)
ON CONFLICT (slug) DO NOTHING;