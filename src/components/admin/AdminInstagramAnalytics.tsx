import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Loader2, Instagram, Eye, ShoppingBag, CalendarDays,
  TrendingUp, MousePointerClick, Star, ArrowUpRight, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "7d" | "30d" | "90d" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 дней",
  "30d": "30 дней",
  "90d": "90 дней",
  all: "Всё время",
};

interface ClickRow {
  id: string;
  instagram_post_id: string;
  session_id: string;
  click_type: string;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
}

interface PostRow {
  id: string;
  caption: string | null;
  cached_image_url: string | null;
  thumbnail_url: string | null;
  media_url: string;
  account: string;
  link_type: string | null;
  permalink: string;
  like_count: number | null;
}

const AdminInstagramAnalytics = () => {
  const [period, setPeriod] = useState<Period>("30d");

  const periodStart = period === "all"
    ? null
    : startOfDay(subDays(new Date(), period === "7d" ? 7 : period === "30d" ? 30 : 90)).toISOString();

  // ── All clicks ──
  const { data: clicks, isLoading: loadingClicks } = useQuery({
    queryKey: ["ig-analytics-clicks", period],
    queryFn: async () => {
      let q = supabase.from("instagram_clicks").select("*");
      if (periodStart) q = q.gte("created_at", periodStart);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as ClickRow[];
    },
  });

  // ── All linked posts ──
  const { data: posts } = useQuery({
    queryKey: ["ig-analytics-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_posts")
        .select("id, caption, cached_image_url, thumbnail_url, media_url, account, link_type, permalink, like_count");
      if (error) throw error;
      return (data || []) as PostRow[];
    },
  });

  // ── Instagram traffic from page_views ──
  const { data: igTraffic } = useQuery({
    queryKey: ["ig-analytics-traffic", period],
    queryFn: async () => {
      let q = supabase.from("page_views").select("id, session_id, referrer, created_at");
      if (periodStart) q = q.gte("created_at", periodStart);
      const { data, error } = await q;
      if (error) throw error;
      const views = data || [];
      const fromIg = views.filter(
        (v: any) => v.referrer?.includes("instagram") || v.referrer?.includes("utm_source=instagram")
      );
      const igSessions = new Set(fromIg.map((v: any) => v.session_id));

      // By day
      const byDay: Record<string, number> = {};
      fromIg.forEach((v: any) => {
        const day = v.created_at.slice(0, 10);
        byDay[day] = (byDay[day] || 0) + 1;
      });

      return {
        totalViews: fromIg.length,
        uniqueSessions: igSessions.size,
        byDay,
      };
    },
  });

  // ── Decor inquiries from Instagram sessions ──
  const { data: igLeads } = useQuery({
    queryKey: ["ig-analytics-leads", period],
    queryFn: async () => {
      // Get sessions that clicked on instagram posts
      let q = supabase.from("instagram_clicks").select("session_id");
      if (periodStart) q = q.gte("created_at", periodStart);
      const { data: clickData } = await q;
      const igSessions = new Set((clickData || []).map((c: any) => c.session_id));

      // Count event_leads in period
      let lq = supabase.from("event_leads").select("id, booking_type, created_at");
      if (periodStart) lq = lq.gte("created_at", periodStart);
      const { data: leads } = await lq;

      return {
        totalLeads: (leads || []).length,
        decorLeads: (leads || []).filter((l: any) => l.booking_type === "decor").length,
        igSessionCount: igSessions.size,
      };
    },
  });

  // ── Computed metrics ──
  const analytics = useMemo(() => {
    if (!clicks || !posts) return null;

    const postMap = new Map(posts.map(p => [p.id, p]));

    // Total metrics
    const totalViews = clicks.filter(c => c.click_type === "view").length;
    const productClicks = clicks.filter(c => c.click_type === "product_click").length;
    const addToCartClicks = clicks.filter(c => c.click_type === "add_to_cart").length;
    const bookingClicks = clicks.filter(c => c.click_type === "booking_click").length;
    const portfolioClicks = clicks.filter(c => c.click_type === "portfolio_click").length;
    const uniqueSessions = new Set(clicks.map(c => c.session_id)).size;

    // Per-post aggregation
    const postStats: Record<string, {
      views: number;
      productClicks: number;
      addToCart: number;
      bookings: number;
      totalClicks: number;
      sessions: Set<string>;
    }> = {};

    clicks.forEach(c => {
      if (!postStats[c.instagram_post_id]) {
        postStats[c.instagram_post_id] = {
          views: 0, productClicks: 0, addToCart: 0, bookings: 0, totalClicks: 0, sessions: new Set(),
        };
      }
      const ps = postStats[c.instagram_post_id];
      ps.sessions.add(c.session_id);
      ps.totalClicks++;
      if (c.click_type === "view") ps.views++;
      if (c.click_type === "product_click") ps.productClicks++;
      if (c.click_type === "add_to_cart") ps.addToCart++;
      if (c.click_type === "booking_click") ps.bookings++;
    });

    // Top converting posts (by non-view actions)
    const topPosts = Object.entries(postStats)
      .map(([postId, stats]) => {
        const post = postMap.get(postId);
        const conversions = stats.productClicks + stats.addToCart + stats.bookings;
        const convRate = stats.views > 0 ? Math.round((conversions / stats.views) * 100) : 0;
        return {
          postId,
          post,
          views: stats.views,
          conversions,
          convRate,
          addToCart: stats.addToCart,
          bookings: stats.bookings,
          productClicks: stats.productClicks,
          uniqueVisitors: stats.sessions.size,
        };
      })
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 10);

    // Clicks by day
    const byDay: Record<string, { views: number; conversions: number }> = {};
    clicks.forEach(c => {
      const day = c.created_at.slice(0, 10);
      if (!byDay[day]) byDay[day] = { views: 0, conversions: 0 };
      if (c.click_type === "view") byDay[day].views++;
      else byDay[day].conversions++;
    });

    const overallConvRate = totalViews > 0
      ? Math.round(((productClicks + addToCartClicks + bookingClicks) / totalViews) * 100)
      : 0;

    return {
      totalViews,
      productClicks,
      addToCartClicks,
      bookingClicks,
      portfolioClicks,
      uniqueSessions,
      overallConvRate,
      topPosts,
      byDay,
    };
  }, [clicks, posts]);

  if (loadingClicks) {
    return <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>;
  }

  const dayEntries = Object.entries(analytics?.byDay || {}).sort().slice(-14);
  const maxDayViews = Math.max(...dayEntries.map(([, v]) => v.views + v.conversions), 1);

  const imgSrc = (p: PostRow) => p.cached_image_url || p.thumbnail_url || p.media_url;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Instagram size={20} className="text-primary" />
          <h2 className="font-display text-2xl font-light">Instagram Аналитика</h2>
        </div>
        <div className="flex items-center gap-0 border border-border">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors",
                period === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Трафик из Instagram",
            value: igTraffic?.uniqueSessions || 0,
            icon: Instagram,
            sub: `${igTraffic?.totalViews || 0} просмотров`,
          },
          {
            label: "Просмотры постов",
            value: analytics?.totalViews || 0,
            icon: Eye,
            sub: `${analytics?.uniqueSessions || 0} уникальных`,
          },
          {
            label: "Клики по товарам",
            value: (analytics?.productClicks || 0) + (analytics?.addToCartClicks || 0),
            icon: ShoppingBag,
            sub: `${analytics?.addToCartClicks || 0} в корзину`,
          },
          {
            label: "Запросы на декор",
            value: analytics?.bookingClicks || 0,
            icon: CalendarDays,
            sub: `${igLeads?.decorLeads || 0} заявок`,
          },
        ].map(card => (
          <div key={card.label} className="bg-background border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{card.label}</span>
              <card.icon size={16} className="text-muted-foreground/40" />
            </div>
            <p className="font-display text-3xl font-light mb-1">{card.value.toLocaleString()}</p>
            <span className="text-[11px] text-muted-foreground">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Conversion Rate + Daily Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Conversion rate */}
        <div className="bg-background border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-primary" />
            <h3 className="text-sm font-medium">Конверсия по постам</h3>
          </div>
          <div className="flex items-end gap-4">
            <p className="font-display text-5xl font-light text-primary">{analytics?.overallConvRate || 0}%</p>
            <div className="pb-2 text-xs text-muted-foreground">
              <p>{(analytics?.productClicks || 0) + (analytics?.addToCartClicks || 0) + (analytics?.bookingClicks || 0)} действий</p>
              <p>из {analytics?.totalViews || 0} просмотров</p>
            </div>
          </div>
          {/* Action breakdown */}
          <div className="mt-5 space-y-2">
            {[
              { label: "Клики по товарам", value: analytics?.productClicks || 0, icon: MousePointerClick },
              { label: "Добавления в корзину", value: analytics?.addToCartClicks || 0, icon: ShoppingBag },
              { label: "Запросы на бронирование", value: analytics?.bookingClicks || 0, icon: CalendarDays },
              { label: "Просмотры портфолио", value: analytics?.portfolioClicks || 0, icon: Eye },
            ].map(row => {
              const total = analytics?.totalViews || 1;
              const pct = Math.round((row.value / total) * 100);
              return (
                <div key={row.label} className="flex items-center gap-2">
                  <row.icon size={12} className="text-primary/60 shrink-0" />
                  <span className="text-[10px] text-muted-foreground w-40 shrink-0">{row.label}</span>
                  <div className="flex-1 h-4 bg-muted/40 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary/20 transition-all" style={{ width: `${pct}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 text-[9px] font-medium">{row.value}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily chart */}
        <div className="bg-background border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" />
            <h3 className="text-sm font-medium">Активность по дням</h3>
          </div>
          {dayEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
          ) : (
            <div className="flex items-end gap-1 h-36">
              {dayEntries.map(([day, data]) => {
                const total = data.views + data.conversions;
                const h = Math.max((total / maxDayViews) * 100, 4);
                const convH = total > 0 ? (data.conversions / total) * h : 0;
                const d = new Date(day);
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.views}+{data.conversions}
                    </span>
                    <div className="w-full relative" style={{ height: `${h}%` }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/15 rounded-t-sm" style={{ height: "100%" }} />
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/50 rounded-t-sm" style={{ height: `${convH}%` }} />
                    </div>
                    <span className="text-[8px] text-muted-foreground/60">{format(d, "dd", { locale: ru })}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 justify-center">
            <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <span className="w-3 h-2 bg-primary/15 inline-block" /> Просмотры
            </span>
            <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <span className="w-3 h-2 bg-primary/50 inline-block" /> Конверсии
            </span>
          </div>
        </div>
      </div>

      {/* ── Top Converting Posts ── */}
      <div className="bg-background border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-primary" />
          <h3 className="text-sm font-medium">Топ конвертирующие посты</h3>
        </div>

        {(!analytics?.topPosts || analytics.topPosts.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8">Нет данных о кликах</p>
        ) : (
          <div className="space-y-2">
            {analytics.topPosts.map((item, i) => (
              <div key={item.postId} className="flex items-center gap-3 p-2 border border-border/50 hover:border-primary/30 transition-colors">
                <span className="text-[10px] text-muted-foreground/60 w-5 text-right shrink-0">{i + 1}</span>

                {/* Thumbnail */}
                {item.post && (
                  <img
                    src={imgSrc(item.post)}
                    alt=""
                    className="w-12 h-12 object-cover shrink-0"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">
                    {item.post?.caption?.slice(0, 60) || "Без подписи"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn(
                      "text-[8px] uppercase tracking-wider px-1.5 py-0.5",
                      item.post?.account === "decor" ? "bg-primary/10 text-primary" : "bg-foreground/10 text-foreground"
                    )}>
                      {item.post?.account === "decor" ? "Decor" : "Showroom"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{item.uniqueVisitors} 👁</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-xs font-medium">{item.views}</p>
                    <p className="text-[8px] text-muted-foreground uppercase">Просмотры</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{item.conversions}</p>
                    <p className="text-[8px] text-muted-foreground uppercase">Действия</p>
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "text-xs font-medium",
                      item.convRate >= 20 ? "text-emerald-600" : item.convRate >= 10 ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.convRate}%
                    </p>
                    <p className="text-[8px] text-muted-foreground uppercase">CR</p>
                  </div>
                </div>

                {/* Link */}
                {item.post && (
                  <a
                    href={item.post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInstagramAnalytics;
