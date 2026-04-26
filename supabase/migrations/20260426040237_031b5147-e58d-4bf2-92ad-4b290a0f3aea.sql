CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_new_lead_telegram()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  webhook_url text := 'https://niaxchwajovdlnralysa.supabase.co/functions/v1/notify-new-lead';
BEGIN
  PERFORM extensions.http_post(
    url := webhook_url,
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'lead_id', NEW.id,
      'name', NEW.name,
      'phone', NEW.phone,
      'email', NEW.email,
      'event_type', NEW.event_type,
      'event_date', NEW.event_date,
      'location', NEW.location,
      'guests', NEW.guests,
      'message', NEW.message,
      'booking_type', NEW.booking_type
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block the insert if HTTP call fails
  RAISE WARNING 'notify_new_lead_telegram failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_lead ON public.event_leads;
CREATE TRIGGER trg_notify_new_lead
  AFTER INSERT ON public.event_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_lead_telegram();