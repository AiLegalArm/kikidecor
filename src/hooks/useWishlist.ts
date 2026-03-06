import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionId } from "./useSessionId";

export function useWishlist() {
  const sessionId = useSessionId();
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["wishlist", sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("wishlist_items")
        .select("*, product:products(*)")
        .eq("session_id", sessionId);
      return data || [];
    },
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      const exists = items.find((i: any) => i.product_id === productId);
      if (exists) {
        await supabase.from("wishlist_items").delete().eq("id", exists.id);
      } else {
        await supabase.from("wishlist_items").insert({
          session_id: sessionId,
          product_id: productId,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist", sessionId] }),
  });

  const isWishlisted = (productId: string) => items.some((i: any) => i.product_id === productId);

  return { items, isLoading, toggleWishlist, isWishlisted };
}
