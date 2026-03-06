
CREATE TABLE public.event_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE,
  location TEXT,
  guests INTEGER,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to event_leads" ON public.event_leads FOR ALL USING (true) WITH CHECK (true);
