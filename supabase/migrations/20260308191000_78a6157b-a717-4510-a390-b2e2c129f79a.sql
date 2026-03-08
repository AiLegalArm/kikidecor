
-- ============================================================
-- SECURITY FIX: Replace all overly permissive RLS policies
-- ============================================================

-- 1. Fix match_products function search_path
CREATE OR REPLACE FUNCTION public.match_products(query_embedding extensions.vector, match_threshold double precision DEFAULT 0.5, match_count integer DEFAULT 10)
 RETURNS TABLE(product_id uuid, similarity double precision)
 LANGUAGE plpgsql
 STABLE
 SECURITY INVOKER
 SET search_path = public
AS $function$
begin
  return query
  select
    pe.product_id,
    (1 - (pe.embedding <=> query_embedding))::float as similarity
  from public.product_embeddings pe
  where pe.embedding is not null
    and 1 - (pe.embedding <=> query_embedding) > match_threshold
  order by pe.embedding <=> query_embedding
  limit match_count;
end;
$function$;

-- ============================================================
-- ADMIN-ONLY TABLES (require authenticated user)
-- ============================================================

-- customer_profiles: DROP open policy, add auth-only
DROP POLICY IF EXISTS "Allow all access to customer_profiles" ON public.customer_profiles;
CREATE POLICY "Authenticated users can manage customer_profiles"
  ON public.customer_profiles FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- event_leads: DROP open policy, add split policies
DROP POLICY IF EXISTS "Allow all access to event_leads" ON public.event_leads;
CREATE POLICY "Anyone can submit event leads"
  ON public.event_leads FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Authenticated users can manage event_leads"
  ON public.event_leads FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- communication_log: DROP open policy, add auth-only
DROP POLICY IF EXISTS "Allow all access to communication_log" ON public.communication_log;
CREATE POLICY "Authenticated users can manage communication_log"
  ON public.communication_log FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- products: DROP open write policy, add auth-only write
DROP POLICY IF EXISTS "Allow all modifications on products" ON public.products;
CREATE POLICY "Authenticated users can manage products"
  ON public.products FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- instagram_posts: DROP open write policies, add auth-only
DROP POLICY IF EXISTS "Allow inserts on instagram_posts" ON public.instagram_posts;
DROP POLICY IF EXISTS "Allow all updates on instagram_posts" ON public.instagram_posts;
DROP POLICY IF EXISTS "Allow deletes on instagram_posts" ON public.instagram_posts;
CREATE POLICY "Authenticated users can manage instagram_posts"
  ON public.instagram_posts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- lookbook_looks: DROP open policy, add auth-only write
DROP POLICY IF EXISTS "Allow all modifications on lookbook_looks" ON public.lookbook_looks;
CREATE POLICY "Authenticated users can manage lookbook_looks"
  ON public.lookbook_looks FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- blocked_dates: DROP open policy, add auth-only
DROP POLICY IF EXISTS "Allow all modifications on blocked_dates" ON public.blocked_dates;
CREATE POLICY "Authenticated users can manage blocked_dates"
  ON public.blocked_dates FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- product_embeddings: DROP open policy, add auth-only
DROP POLICY IF EXISTS "Service can manage product embeddings" ON public.product_embeddings;
CREATE POLICY "Authenticated users can manage product_embeddings"
  ON public.product_embeddings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- brand_leads: Fix SELECT to auth-only, keep public INSERT
DROP POLICY IF EXISTS "Anyone can view brand leads" ON public.brand_leads;
CREATE POLICY "Authenticated users can view brand_leads"
  ON public.brand_leads FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- ANALYTICS TABLES: restrict SELECT to authenticated
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view ai interactions" ON public.ai_interactions;
CREATE POLICY "Authenticated users can view ai_interactions"
  ON public.ai_interactions FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can view page views" ON public.page_views;
CREATE POLICY "Authenticated users can view page_views"
  ON public.page_views FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can view instagram clicks" ON public.instagram_clicks;
CREATE POLICY "Authenticated users can view instagram_clicks"
  ON public.instagram_clicks FOR SELECT TO authenticated
  USING (true);
