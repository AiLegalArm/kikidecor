import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionId } from "./useSessionId";

export interface CartItem {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  quantity: number;
  product?: {
    id: string;
    name: string;
    name_en: string | null;
    price: number;
    images: string[];
  };
}

export function useCart() {
  const sessionId = useSessionId();
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("cart_items")
        .select("*, product:products(id, name, name_en, price, images)")
        .eq("session_id", sessionId);
      return (data || []) as unknown as CartItem[];
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: { product_id: string; size?: string; color?: string; quantity?: number }) => {
      // Check if same product+size+color exists
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("session_id", sessionId)
        .eq("product_id", item.product_id)
        .eq("size", item.size || "")
        .eq("color", item.color || "")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + (item.quantity || 1) })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({
          session_id: sessionId,
          product_id: item.product_id,
          size: item.size || null,
          color: item.color || null,
          quantity: item.quantity || 1,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        await supabase.from("cart_items").delete().eq("id", id);
      } else {
        await supabase.from("cart_items").update({ quantity }).eq("id", id);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("cart_items").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      await supabase.from("cart_items").delete().eq("session_id", sessionId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, isLoading, total, count, addItem, updateQuantity, removeItem, clearCart };
}
