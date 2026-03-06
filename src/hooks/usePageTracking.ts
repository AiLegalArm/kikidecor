import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionId } from "@/hooks/useSessionId";

export function usePageTracking() {
  const location = useLocation();
  const sessionId = useSessionId();
  const lastPath = useRef("");

  useEffect(() => {
    const path = location.pathname;
    // Avoid duplicate tracking on same path
    if (path === lastPath.current) return;
    lastPath.current = path;

    // Don't track admin pages
    if (path.startsWith("/admin")) return;

    supabase.from("page_views").insert({
      session_id: sessionId,
      path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent || null,
    }).then(() => {});
  }, [location.pathname, sessionId]);
}
