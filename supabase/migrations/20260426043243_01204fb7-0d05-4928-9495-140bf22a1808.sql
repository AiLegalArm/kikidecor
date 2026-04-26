
-- Packages table for editable pricing tiers
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  subtitle TEXT,
  subtitle_en TEXT,
  description TEXT,
  description_en TEXT,
  price_from INTEGER NOT NULL DEFAULT 0,
  price_to INTEGER,
  currency TEXT NOT NULL DEFAULT 'RUB',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  features_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cta_label TEXT,
  cta_label_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
  ON public.packages FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all packages"
  ON public.packages FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage packages"
  ON public.packages FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed initial three tiers
INSERT INTO public.packages (slug, name, name_en, subtitle, subtitle_en, price_from, price_to, features, features_en, is_featured, sort_order) VALUES
('basic', 'Базовый', 'Basic', 'Минимальный набор', 'Essential set', 15000, 50000,
  '["Шары и базовая флористика","Простой задник","Монтаж до 2 часов"]'::jsonb,
  '["Balloons and basic florals","Simple backdrop","Setup up to 2 hours"]'::jsonb,
  false, 1),
('standard', 'Стандарт', 'Standard', 'Сбалансированный пакет', 'Balanced package', 50000, 150000,
  '["Авторская флористика","Тематический декор","Фотозона","Монтаж и демонтаж","Координация на месте"]'::jsonb,
  '["Author florals","Themed decor","Photo zone","Setup and breakdown","On-site coordination"]'::jsonb,
  true, 2),
('premium', 'Премиум', 'Premium', 'Полный авторский проект', 'Full author project', 150000, NULL,
  '["Концепция и эскизы","Премиальная флористика","Сложные конструкции","Световое оформление","Полное сопровождение"]'::jsonb,
  '["Concept and sketches","Premium florals","Complex installations","Light design","Full support"]'::jsonb,
  false, 3);
