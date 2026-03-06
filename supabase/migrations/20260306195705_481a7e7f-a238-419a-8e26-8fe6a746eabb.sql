
-- Customer profiles table
CREATE TABLE public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferences jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT '{}'::text[],
  notes text,
  source text DEFAULT 'manual',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to customer_profiles" ON public.customer_profiles FOR ALL USING (true) WITH CHECK (true);

-- Communication log
CREATE TABLE public.communication_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'note',
  summary text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to communication_log" ON public.communication_log FOR ALL USING (true) WITH CHECK (true);

-- Link event_leads to customer profiles (optional)
ALTER TABLE public.event_leads ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE SET NULL;
