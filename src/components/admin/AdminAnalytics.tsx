import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Loader2, TrendingUp, TrendingDown, Users, ShoppingBag, Calendar,
  Eye, BarChart3, ArrowUpRight, Target, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "7d" | "30d" | "90d" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 дней",
  "30d": "30 дней",
  "90d": "90 дней",
  all: "Всё время",
};

const PAGE_LABELS: Record<string, string> = {
  "/": "Главная",
  "/decor": "Декор",
  "/services": "Услуги",
  "/showroom": "Showroom",
  "/portfolio": "Портфолио",
  "/booking": "Бронирование",
  "/showroom-booking": "Запись в Showroom",
  "/shop": "Магазин",
  "/lookbook": "Lookbook",
  "/about": "О нас",
  "/contact": "Контакты",
  "/packages": "Пакеты",
  "/calculator": "Калькулятор",
  "/stylist": "AI Стилист",
  "/instagram": "Instagram",
};

const AdminAnalytics = () => {
  const [period, setPeriod] = useState<Period>("30d");

  const periodStart = period === "all"
    ? null
    : startOfDay(subDays(new Date(), period === "7d" ? 7 : period === "30d" ? 30 : 90)).toISOString();

  // Previous period for comparison
  const prevStart = period === "all"
    ? null
    : startOfDay(subDays(new Date(), (period === "7d" ? 7 : period === "30d" ? 30 : 90) * 2)).toISOString();

  // ── Page Views ──
  const { data: viewsData, isLoading: loadingViews } = useQuery({
    queryKey: ["analytics-views", period],
    queryFn: async () => {
      let query = supabase.from("page_views").select("session_id, path, created_at");
      if (periodStart) query = query.gte("created_at", periodStart);
      const { data, error } = await query;
      if (error) throw error;

      // Previous period
      let prevQuery = supabase.from("page_views").select("session_id", { count: "exact", head: false });
      if (prevStart && periodStart) {
        prevQuery = prevQuery.gte("created_at", prevStart).lt("created_at", periodStart);
      }
      const { data: prevData } = await prevQuery;

      const views = data || [];
      const uniqueSessions = new Set(views.map((v) => v.session_id)).size;
      const prevSessions = new Set((prevData || []).map((v: any) => v.session_id)).size;

      // By path
      const byPath: Record<string, { views: number; sessions: Set<string> }> = {};
      views.forEach((v) => {
        if (!byPath[v.path]) byPath[v.path] = { views: 0, sessions: new Set() };
        byPath[v.path].views++;
        byPath[v.path].sessions.add(v.session_id);
      });

      const topPages = Object.entries(byPath)
        .map(([path, d]) => ({ path, views: d.views, visitors: d.sessions.size }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // By day
      const byDay: Record<string, number> = {};
      views.forEach((v) => {
        const day = v.created_at.slice(0, 10);
        byDay[day] = (byDay[day] || 0) + 1;
      });

      return {
        totalViews: views.length,
        uniqueVisitors: uniqueSessions,
        prevVisitors: prevSessions,
        topPages,
        byDay,
      };
    },
  });

  // ── Leads ──
  const { data: leadData, isLoading: loadingLeads } = useQuery({
    queryKey: ["analytics-leads", period],
    queryFn: async () => {
      let query = supabase.from("event_leads").select("id, status, booking_type, created_at");
      if (periodStart) query = query.gte("created_at", periodStart);
      const { data, error } = await query;
      if (error) throw error;

      const leads = data || [];
      const total = leads.length;
      const decor = leads.filter((l) => l.booking_type === "decor").length;
      const showroom = leads.filter((l) => l.booking_type === "showroom").length;
      const booked = leads.filter((l) => ["booked", "order", "completed"].includes(l.status)).length;
      const lost = leads.filter((l) => l.status === "lost").length;

      // Previous period
      let prevQuery = supabase.from("event_leads").select("id", { count: "exact", head: true });
      if (prevStart && periodStart) {
        prevQuery = prevQuery.gte("created_at", prevStart).lt("created_at", periodStart);
      }
      const { count: prevCount } = await prevQuery;

      const byStatus: Record<string, number> = {};
      leads.forEach((l) => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });

      return { total, decor, showroom, booked, lost, prevTotal: prevCount || 0, byStatus };
    },
  });

  // ── Orders (cart items) ──
  const { data: orderData, isLoading: loadingOrders } = useQuery({
    queryKey: ["analytics-orders", period],
    queryFn: async () => {
      let query = supabase.from("cart_items").select("id, session_id, quantity, product_id, created_at");
      if (periodStart) query = query.gte("created_at", periodStart);
      const { data, error } = await query;
      if (error) throw error;

      const items = data || [];
      const uniqueOrders = new Set(items.map((i) => i.session_id)).size;
      const totalItems = items.reduce((s, i) => s + i.quantity, 0);

      return { uniqueOrders, totalItems };
    },
  });

  // ── Brand Leads ──
  const { data: brandLeadCount } = useQuery({
    queryKey: ["analytics-brand-leads", period],
    queryFn: async () => {
      let query = supabase.from("brand_leads").select("*", { count: "exact", head: true });
      if (periodStart) query = query.gte("created_at", periodStart);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  const isLoading = loadingViews || loadingLeads || loadingOrders;

  if (isLoading) {
    return <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>;
  }

  // Conversion rate: booked / total leads
  const conversionRate = leadData && leadData.total > 0
    ? Math.round((leadData.booked / leadData.total) * 100)
    : 0;

  // Growth calc
  const calcGrowth = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  };

  const visitorGrowth = calcGrowth(viewsData?.uniqueVisitors || 0, viewsData?.prevVisitors || 0);
  const leadGrowth = calcGrowth(leadData?.total || 0, leadData?.prevTotal || 0);

  const statusLabels: Record<string, string> = {
    new: "Новая", contacted: "Связались", consultation: "Консультация",
    proposal: "КП отправлено", booked: "Забронировано", order: "Заказ",
    completed: "Завершено", lost: "Потеряно",
  };

  const statusOrder = ["new", "contacted", "consultation", "proposal", "booked", "order", "completed", "lost"];

  // Spark chart data
  const dayEntries = Object.entries(viewsData?.byDay || {}).sort().slice(-14);
  const maxDay = Math.max(...dayEntries.map(([, v]) => v), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-light">Аналитика</h2>
        <div className="flex items-center gap-0 border border-border">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
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
            label: "Посетители",
            value: viewsData?.uniqueVisitors || 0,
            icon: Eye,
            growth: visitorGrowth,
            sub: `${viewsData?.totalViews || 0} просмотров`,
          },
          {
            label: "Лиды",
            value: (leadData?.total || 0) + (brandLeadCount || 0),
            icon: Users,
            growth: leadGrowth,
            sub: `${leadData?.decor || 0} декор · ${leadData?.showroom || 0} showroom`,
          },
          {
            label: "Бронирования",
            value: leadData?.booked || 0,
            icon: Calendar,
            growth: null,
            sub: `${leadData?.lost || 0} потеряно`,
          },
          {
            label: "Заказы",
            value: orderData?.uniqueOrders || 0,
            icon: ShoppingBag,
            growth: null,
            sub: `${orderData?.totalItems || 0} товаров`,
          },
        ].map((card) => (
          <div key={card.label} className="bg-background border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{card.label}</span>
              <card.icon size={16} className="text-muted-foreground/40" />
            </div>
            <p className="font-display text-3xl font-light mb-1">{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
            <div className="flex items-center gap-2">
              {card.growth !== null && (
                <span className={cn(
                  "flex items-center gap-0.5 text-[11px] font-medium",
                  card.growth >= 0 ? "text-emerald-600" : "text-red-500"
                )}>
                  {card.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {card.growth >= 0 ? "+" : ""}{card.growth}%
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Conversion Rate + Spark Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Conversion */}
        <div className="bg-background border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-primary" />
            <h3 className="text-sm font-medium">Конверсия лидов</h3>
          </div>
          <div className="flex items-end gap-4">
            <p className="font-display text-5xl font-light text-primary">{conversionRate}%</p>
            <div className="pb-2 text-xs text-muted-foreground">
              <p>{leadData?.booked || 0} забронировано</p>
              <p>из {leadData?.total || 0} заявок</p>
            </div>
          </div>
          {/* Mini funnel */}
          <div className="mt-4 space-y-1.5">
            {statusOrder.filter((s) => (leadData?.byStatus || {})[s]).map((status) => {
              const count = leadData?.byStatus[status] || 0;
              const pct = leadData?.total ? Math.round((count / leadData.total) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-24 shrink-0">{statusLabels[status]}</span>
                  <div className="flex-1 h-4 bg-muted/40 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary/20 transition-all" style={{ width: `${pct}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 text-[9px] font-medium">{count}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Spark Chart */}
        <div className="bg-background border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-primary" />
            <h3 className="text-sm font-medium">Трафик по дням</h3>
          </div>
          {dayEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {dayEntries.map(([day, count]) => {
                const h = Math.max((count / maxDay) * 100, 4);
                const d = new Date(day);
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                    <div
                      className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[8px] text-muted-foreground/60">{format(d, "dd", { locale: ru })}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Top Pages ── */}
      <div className="bg-background border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-primary" />
          <h3 className="text-sm font-medium">Популярные страницы</h3>
        </div>
        <div className="space-y-1">
          {(viewsData?.topPages || []).map((page, i) => {
            const maxViews = viewsData?.topPages[0]?.views || 1;
            const pct = Math.round((page.views / maxViews) * 100);
            return (
              <div key={page.path} className="flex items-center gap-3 group">
                <span className="text-[10px] text-muted-foreground/60 w-4 text-right">{i + 1}</span>
                <span className="text-xs w-36 shrink-0 truncate">{PAGE_LABELS[page.path] || page.path}</span>
                <div className="flex-1 h-5 bg-muted/30 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-primary/15 transition-all" style={{ width: `${pct}%` }} />
                  <span className="absolute inset-0 flex items-center px-2 text-[9px] font-medium">
                    {page.views} просмотров · {page.visitors} посетителей
                  </span>
                </div>
              </div>
            );
          })}
          {(!viewsData?.topPages || viewsData.topPages.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-6">Нет данных о посещениях</p>
          )}
        </div>
      </div>

      {/* ── Booking breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background border border-border p-6">
          <h3 className="text-sm font-medium mb-3">Декор бронирования</h3>
          <p className="font-display text-3xl font-light text-primary mb-1">{leadData?.decor || 0}</p>
          <p className="text-xs text-muted-foreground">заявок за период</p>
        </div>
        <div className="bg-background border border-border p-6">
          <h3 className="text-sm font-medium mb-3">Showroom записи</h3>
          <p className="font-display text-3xl font-light text-primary mb-1">{leadData?.showroom || 0}</p>
          <p className="text-xs text-muted-foreground">записей за период</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
