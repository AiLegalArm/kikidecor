
CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(blocked_date)
);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Public can read blocked dates (needed for booking calendar)
CREATE POLICY "Anyone can view blocked dates"
  ON public.blocked_dates FOR SELECT
  USING (true);

-- Allow all for admin operations (no auth yet, open for now)
CREATE POLICY "Allow all modifications on blocked_dates"
  ON public.blocked_dates FOR ALL
  USING (true)
  WITH CHECK (true);
