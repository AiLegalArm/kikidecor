import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingBag, Phone as PhoneIcon, MessageSquare, Mail } from "lucide-react";

type Order = {
  id: string;
  session_id: string;
  product_id: string;
  quantity: number;
  color: string | null;
  size: string | null;
  created_at: string;
  product?: { name: string; price: number; images: string[] | null };
};

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, product:products(name, price, images)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Order[];
    },
  });

  // Group by session
  const sessions = orders.reduce((acc, item) => {
    if (!acc[item.session_id]) acc[item.session_id] = [];
    acc[item.session_id].push(item);
    return acc;
  }, {} as Record<string, Order[]>);

  return (
    <div>
      <h2 className="font-display text-2xl font-light mb-6">Заказы (корзины)</h2>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>
      ) : Object.keys(sessions).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag size={40} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
          <p>Заказов пока нет</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(sessions).map(([sessionId, items]) => {
            const total = items.reduce((sum, i) => sum + (Number(i.product?.price || 0) * i.quantity), 0);
            const date = new Date(items[0].created_at).toLocaleDateString("ru-RU");
            return (
              <div key={sessionId} className="bg-background border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Сессия</span>
                    <p className="text-xs font-mono text-muted-foreground">{sessionId.slice(0, 12)}...</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{date}</span>
                    <p className="font-display text-lg font-light">{total.toLocaleString()} ₽</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-1.5 border-t border-border/40">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="w-8 h-8 object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-muted" />
                      )}
                      <span className="text-sm flex-1">{item.product?.name || "—"}</span>
                      <span className="text-xs text-muted-foreground">{item.size || ""} {item.color || ""}</span>
                      <span className="text-xs">×{item.quantity}</span>
                      <span className="text-sm font-medium">{(Number(item.product?.price || 0) * item.quantity).toLocaleString()} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
