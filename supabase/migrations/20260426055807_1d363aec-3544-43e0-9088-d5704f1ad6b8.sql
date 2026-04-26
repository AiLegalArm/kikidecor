
CREATE TABLE IF NOT EXISTS public.ai_provider_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'lovable' CHECK (provider IN ('lovable','openai','gemini','anthropic')),
  model_reasoning TEXT,
  model_fast TEXT,
  model_vision TEXT,
  model_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.ai_provider_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ai provider settings"
  ON public.ai_provider_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert ai provider settings"
  ON public.ai_provider_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ai provider settings"
  ON public.ai_provider_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ai provider settings"
  ON public.ai_provider_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Single active row enforcement
CREATE OR REPLACE FUNCTION public.ai_provider_settings_single_active()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_active THEN
    UPDATE public.ai_provider_settings
      SET is_active = false
      WHERE id <> NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ai_provider_single_active ON public.ai_provider_settings;
CREATE TRIGGER trg_ai_provider_single_active
  BEFORE INSERT OR UPDATE ON public.ai_provider_settings
  FOR EACH ROW EXECUTE FUNCTION public.ai_provider_settings_single_active();

CREATE TRIGGER trg_ai_provider_updated_at
  BEFORE UPDATE ON public.ai_provider_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default Lovable Gateway config
INSERT INTO public.ai_provider_settings (provider, model_reasoning, model_fast, model_vision, model_image, is_active)
VALUES ('lovable', 'google/gemini-3.1-pro-preview', 'google/gemini-3-flash-preview', 'google/gemini-2.5-flash', 'google/gemini-3.1-flash-image-preview', true)
ON CONFLICT DO NOTHING;
