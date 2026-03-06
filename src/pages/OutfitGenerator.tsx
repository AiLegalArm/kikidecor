import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Loader2, Shirt, ShoppingBag, Plus, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { trackAIInteraction } from "@/hooks/useAITracking";

const slotLabels: Record<string, { ru: string; en: string }> = {
  top: { ru: "Верх", en: "Top" },
  bottom: { ru: "Низ", en: "Bottom" },
  dress: { ru: "Платье", en: "Dress" },
  shoes: { ru: "Обувь", en: "Shoes" },
  accessories: { ru: "Аксессуары", en: "Accessories" },
};

type OutfitItem = {
  slot: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    name_en: string | null;
    price: number;
    images: string[] | null;
    category: string | null;
  };
};

type Outfit = {
  title: string;
  occasion: string;
  mood?: string;
  description: string;
  items: OutfitItem[];
  styling_tips: string;
};

const OutfitGenerator = () => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const isRu = lang === "ru";

  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    setOutfits([]);
    setGenerated(false);

    try {
      const { data, error } = await supabase.functions.invoke("generate-outfits", {
        body: { lang, count: 4 },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      setOutfits(data?.outfits || []);
      setGenerated(true);
    } catch (e: any) {
      console.error(e);
      toast.error(isRu ? "Ошибка генерации. Попробуйте ещё раз." : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = (outfit: Outfit) => {
    outfit.items.forEach(i => addItem.mutate({ product_id: i.product.id }));
    toast.success(isRu ? "Весь образ добавлен в корзину!" : "Full outfit added to cart!");
  };

  const handleAddOne = (id: string, name: string) => {
    addItem.mutate({ product_id: id });
    toast.success(`${name} — ${isRu ? "в корзине" : "added"}`);
  };

  return (
    <>
      <title>{isRu ? "Генератор образов — KiKi" : "Outfit Generator — KiKi"}</title>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-5 sm:px-6 text-center bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary mx-auto mb-4" strokeWidth={1} />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light mb-4">
            {isRu ? "Генератор образов" : "Outfit Generator"}
          </h1>
          <p className="text-muted-foreground font-light text-xs sm:text-sm leading-relaxed max-w-lg mx-auto mb-8">
            {isRu
              ? "AI автоматически создаёт стильные комбинации из каталога KiKi — верх, низ, обувь и аксессуары в идеальном сочетании"
              : "AI automatically builds stylish combinations from the KiKi catalog — tops, bottoms, shoes & accessories in perfect harmony"}
          </p>
          <motion.button
            onClick={generate}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-foreground text-background text-[10px] uppercase tracking-[0.3em] font-medium disabled:opacity-30 hover:bg-primary hover:text-primary-foreground transition-all duration-500"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : generated ? (
              <><RefreshCw size={13} /> {isRu ? "Новые образы" : "Regenerate"}</>
            ) : (
              <><Sparkles size={13} /> {isRu ? "Сгенерировать образы" : "Generate outfits"}</>
            )}
          </motion.button>
        </motion.div>
      </section>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {isRu ? "AI подбирает идеальные сочетания..." : "AI is building perfect combinations..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {generated && !loading && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="py-10 sm:py-16 pb-20 sm:pb-28 px-5 sm:px-6"
          >
            <div className="max-w-6xl mx-auto">
              {outfits.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {isRu ? "Недостаточно товаров для создания образов." : "Not enough products to build outfits."}
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {outfits.map((outfit, i) => {
                    const total = outfit.items.reduce((s, item) => s + item.product.price, 0);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="border border-border/50 flex flex-col"
                      >
                        {/* Header */}
                        <div className="p-5 sm:p-6 border-b border-border/30">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-display text-lg sm:text-xl font-light">{outfit.title}</h3>
                                {outfit.mood && (
                                  <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                                    {outfit.mood}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{outfit.occasion}</p>
                            </div>
                            <span className="font-display text-lg text-primary shrink-0">{total.toLocaleString()} ₽</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-light leading-relaxed">{outfit.description}</p>
                        </div>

                        {/* Items by slot */}
                        <div className="p-5 sm:p-6 flex-1">
                          <div className="space-y-3">
                            {outfit.items.map((item, j) => (
                              <div key={j} className="flex items-center gap-3 group">
                                <Link to={`/shop/${item.product.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-secondary/40 overflow-hidden shrink-0">
                                    {item.product.images?.[0] ? (
                                      <img
                                        src={item.product.images[0]}
                                        alt={isRu ? item.product.name : (item.product.name_en || item.product.name)}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Shirt className="w-5 h-5 text-muted-foreground/30" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[9px] uppercase tracking-wider text-primary/70 mb-0.5">
                                      {slotLabels[item.slot]?.[isRu ? "ru" : "en"] || item.slot}
                                    </p>
                                    <p className="text-xs font-medium truncate">
                                      {isRu ? item.product.name : (item.product.name_en || item.product.name)}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">{item.product.price.toLocaleString()} ₽</p>
                                  </div>
                                </Link>
                                <button
                                  onClick={() => handleAddOne(item.product.id, isRu ? item.product.name : (item.product.name_en || item.product.name))}
                                  className="w-7 h-7 border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground hover:border-primary shrink-0"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 sm:p-6 border-t border-border/30 space-y-3">
                          {outfit.styling_tips && (
                            <p className="text-[11px] text-muted-foreground font-light leading-relaxed italic">
                              "{outfit.styling_tips}"
                            </p>
                          )}
                          <Button
                            onClick={() => handleAddAll(outfit)}
                            className="w-full rounded-none gap-2 text-[9px] uppercase tracking-wider h-10"
                          >
                            <ShoppingBag size={13} />
                            {isRu ? "Добавить весь образ" : "Add full outfit"}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default OutfitGenerator;
