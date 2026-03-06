
CREATE TABLE public.brand_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  interest TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert brand leads"
  ON public.brand_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view brand leads"
  ON public.brand_leads
  FOR SELECT
  TO authenticated
  USING (true);
