
-- customer_profiles: admin-only management
DROP POLICY IF EXISTS "Authenticated users can manage customer_profiles" ON public.customer_profiles;
CREATE POLICY "Admins can manage customer_profiles"
  ON public.customer_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- event_leads: keep public INSERT, restrict management to admins
DROP POLICY IF EXISTS "Authenticated users can manage event_leads" ON public.event_leads;
CREATE POLICY "Admins can manage event_leads"
  ON public.event_leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- communication_log: admin-only
DROP POLICY IF EXISTS "Authenticated users can manage communication_log" ON public.communication_log;
CREATE POLICY "Admins can manage communication_log"
  ON public.communication_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_interactions: keep public insert, restrict reads to admins
DROP POLICY IF EXISTS "Authenticated users can view ai_interactions" ON public.ai_interactions;
CREATE POLICY "Admins can view ai_interactions"
  ON public.ai_interactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- page_views: keep public insert, restrict reads to admins
DROP POLICY IF EXISTS "Authenticated users can view page_views" ON public.page_views;
CREATE POLICY "Admins can view page_views"
  ON public.page_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- instagram_clicks: keep public insert, restrict reads to admins
DROP POLICY IF EXISTS "Authenticated users can view instagram_clicks" ON public.instagram_clicks;
CREATE POLICY "Admins can view instagram_clicks"
  ON public.instagram_clicks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- instagram_posts: keep public SELECT (used by storefront), restrict management
DROP POLICY IF EXISTS "Authenticated users can manage instagram_posts" ON public.instagram_posts;
CREATE POLICY "Admins can manage instagram_posts"
  ON public.instagram_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- blocked_dates: keep public SELECT, restrict modifications to admins
DROP POLICY IF EXISTS "Authenticated users can manage blocked_dates" ON public.blocked_dates;
CREATE POLICY "Admins can manage blocked_dates"
  ON public.blocked_dates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
