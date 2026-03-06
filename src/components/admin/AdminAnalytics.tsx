import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Users, ShoppingBag, Calendar, DollarSign } from "lucide-react";

const AdminAnalytics = () => {
  const { data: leadStats, isLoading: loadingLeads } = useQuery({
    queryKey: ["admin-lead-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_leads").select("status, created_at");
      if (error) throw error;
      const total = data.length;
      const byStatus: Record<string, number> = {};
      const byMonth: Record<string, number> = {};
      data.forEach((l) => {
        byStatus[l.status] = (byStatus[l.status] || 0) + 1;
        const month = l.created_at.slice(0, 7);
        byMonth[month] = (byMonth[month] || 0) + 1;
      });
      return { total, byStatus, byMonth };
    },
  });

  const { data: productStats, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-product-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, price, inventory, is_published");
      if (error) throw error;
      const total = data.length;
      const published = data.filter((p) => p.is_published).length;
      const totalInventory = data.reduce((acc, p) => acc + (p.inventory || 0), 0);
      const avgPrice = data.length ? data.reduce((acc, p) => acc + Number(p.price), 0) / data.length : 0;
      return { total, published, totalInventory, avgPrice };
    },
  });

  const { data: brandLeadCount } = useQuery({
    queryKey: ["admin-brand-lead-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("brand_leads").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: igCount } = useQuery({
    queryKey: ["admin-ig-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("instagram_posts").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const isLoading = loadingLeads || loadingProducts;

  if (isLoading) {
    return <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>;
  }

  const statCards = [
    { label: "Заявки на события", value: leadStats?.total || 0, icon: Calendar, color: "text-blue-600" },
    { label: "Лиды (бренд)", value: brandLeadCount || 0, icon: Users, color: "text-purple-600" },
    { label: "Товаров", value: productStats?.total || 0, icon: ShoppingBag, color: "text-emerald-600" },
    { label: "Товаров на складе", value: productStats?.totalInventory || 0, icon: TrendingUp, color: "text-amber-600" },
    { label: "Средняя цена", value: `${Math.round(productStats?.avgPrice || 0).toLocaleString()} ₽`, icon: DollarSign, color: "text-green-600" },
    { label: "Instagram постов", value: igCount || 0, icon: TrendingUp, color: "text-pink-600" },
  ];

  const statusLabels: Record<string, string> = {
    new: "Новая", contacted: "Связались", consultation: "Консультация",
    proposal: "КП отправлено", booked: "Забронировано", order: "Заказ",
    completed: "Завершено", lost: "Потеряно",
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-light mb-6">Аналитика</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-background border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className={card.color} />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{card.label}</span>
            </div>
            <p className="font-display text-2xl font-light">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline funnel */}
      <div className="bg-background border border-border p-6 mb-6">
        <h3 className="text-sm font-medium mb-4">Воронка лидов</h3>
        <div className="space-y-2">
          {Object.entries(leadStats?.byStatus || {}).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
            const max = leadStats?.total || 1;
            const pct = Math.round((count / max) * 100);
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 shrink-0">{statusLabels[status] || status}</span>
                <div className="flex-1 h-6 bg-muted/50 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-primary/20" style={{ width: `${pct}%` }} />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium">{count} ({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly trend */}
      <div className="bg-background border border-border p-6">
        <h3 className="text-sm font-medium mb-4">Заявки по месяцам</h3>
        <div className="space-y-1">
          {Object.entries(leadStats?.byMonth || {}).sort().slice(-6).map(([month, count]) => {
            const max = Math.max(...Object.values(leadStats?.byMonth || {}));
            const pct = Math.round((count / (max || 1)) * 100);
            return (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{month}</span>
                <div className="flex-1 h-5 bg-muted/50 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-primary/30" style={{ width: `${pct}%` }} />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px]">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
