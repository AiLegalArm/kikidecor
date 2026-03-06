import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Loader2, Shirt, ShoppingBag, Plus, Heart, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StylePhotoAnalyzer from "@/components/StylePhotoAnalyzer";

const occasions = {
  ru: ["Свидание", "Деловая встреча", "Свадьба", "Вечеринка", "На каждый день", "Путешествие"],
  en: ["Date night", "Business meeting", "Wedding", "Party", "Everyday", "Travel"],
};
const styles = {
  ru: ["Элегантный", "Минималистичный", "Романтичный", "Бохо", "Классический", "Авангард"],
  en: ["Elegant", "Minimalist", "Romantic", "Boho", "Classic", "Avant-garde"],
};
const colorPalettes = {
  ru: ["Нейтральные", "Пастельные", "Тёмные", "Яркие", "Монохром", "Земляные"],
  en: ["Neutrals", "Pastels", "Dark tones", "Bold & bright", "Monochrome", "Earth tones"],
};
const budgetRanges = {
  ru: ["до 5 000 ₽", "5 000–15 000 ₽", "15 000–30 000 ₽", "30 000+ ₽"],
  en: ["Under ₽5,000", "₽5,000–15,000", "₽15,000–30,000", "₽30,000+"],
};

type Outfit = {
  title: string;
  description: string;
  styling_tips: string;
  total_price?: number;
  mood?: string;
  products: {
    id: string;
    name: string;
    name_en: string | null;
    price: number;
    images: string[] | null;
    category: string | null;
  }[];
};

const AIStylist = () => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const isRu = lang === "ru";

  const [occasion, setOccasion] = useState("");
  const [style, setStyle] = useState("");
  const [colors, setColors] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [hasResult, setHasResult] = useState(false);

  const canSubmit = occasion && style && colors && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setOutfits([]);
    setHasResult(false);

    try {
      const { data, error } = await supabase.functions.invoke("ai-stylist", {
        body: { occasion, style, colors, budget, lang },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      setOutfits(data?.outfits || []);
      setHasResult(true);
    } catch (e: any) {
      console.error(e);
      toast.error(isRu ? "Ошибка. Попробуйте ещё раз." : "Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = (outfit: Outfit) => {
    outfit.products.forEach(p => {
      addItem.mutate({ product_id: p.id });
    });
    toast.success(isRu ? "Весь образ добавлен в корзину!" : "Full outfit added to cart!");
  };

  const handleAddOne = (productId: string, productName: string) => {
    addItem.mutate({ product_id: productId });
    toast.success(`${productName} — ${isRu ? "в корзине" : "added"}`);
  };

  const ChipSelector = ({ label, options, value, onChange }: {
    label: string; options: string[]; value: string; onChange: (v: string) => void;
  }) => (
    <div className="mb-6 sm:mb-8">
      <p className="overline text-primary mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs tracking-wider uppercase border transition-all duration-300",
              value === opt
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <title>{isRu ? "AI Стилист — KiKi" : "AI Stylist — KiKi"}</title>

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
            {isRu ? "AI Стилист" : "AI Stylist"}
          </h1>
          <p className="text-muted-foreground font-light text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            {isRu
              ? "Расскажите о событии — и наш AI подберёт идеальный образ из коллекции KiKi Showroom"
              : "Tell us about your event — our AI will curate the perfect look from KiKi Showroom"}
          </p>
        </motion.div>
      </section>

      {/* Input */}
      <section className="py-10 sm:py-16 px-5 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <ChipSelector label={isRu ? "Повод" : "Occasion"} options={isRu ? occasions.ru : occasions.en} value={occasion} onChange={setOccasion} />
          <ChipSelector label={isRu ? "Стиль" : "Style"} options={isRu ? styles.ru : styles.en} value={style} onChange={setStyle} />
          <ChipSelector label={isRu ? "Цветовая гамма" : "Color palette"} options={isRu ? colorPalettes.ru : colorPalettes.en} value={colors} onChange={setColors} />
          <ChipSelector label={isRu ? "Бюджет" : "Budget"} options={isRu ? budgetRanges.ru : budgetRanges.en} value={budget} onChange={setBudget} />

          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-4 py-3.5 sm:py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.3em] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all duration-500 flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Sparkles size={14} /> {isRu ? "Подобрать образ" : "Find my look"}</>
            )}
          </motion.button>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {hasResult && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pb-20 sm:pb-24 px-5 sm:px-6"
          >
            <div className="max-w-5xl mx-auto">
              {outfits.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {isRu ? "Не удалось подобрать образ. Попробуйте другие параметры." : "No outfits found. Try different preferences."}
                </p>
              ) : (
                <div className="space-y-12 sm:space-y-16">
                  {outfits.map((outfit, i) => {
                    const totalPrice = outfit.total_price || outfit.products.reduce((s, p) => s + p.price, 0);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="border border-border/60 p-5 sm:p-8 md:p-12"
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
                          <div className="flex items-start gap-3">
                            <Shirt className="w-5 h-5 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-display text-xl sm:text-2xl font-light">{outfit.title}</h3>
                                {outfit.mood && (
                                  <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                                    {outfit.mood}
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground text-xs sm:text-sm mt-1 font-light">{outfit.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-display text-lg sm:text-xl text-primary">{totalPrice.toLocaleString()} ₽</span>
                            <Button
                              onClick={() => handleAddAll(outfit)}
                              size="sm"
                              className="rounded-none gap-1.5 text-[9px] uppercase tracking-wider h-9"
                            >
                              <ShoppingBag size={12} />
                              {isRu ? "Весь образ" : "Full outfit"}
                            </Button>
                          </div>
                        </div>

                        {/* Products grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                          {outfit.products.map(product => (
                            <div key={product.id} className="group relative">
                              <Link to={`/shop/${product.id}`} className="block">
                                <div className="aspect-[3/4] bg-secondary/40 overflow-hidden mb-2">
                                  {product.images?.[0] ? (
                                    <img
                                      src={product.images[0]}
                                      alt={isRu ? product.name : (product.name_en || product.name)}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Shirt className="w-8 h-8 text-muted-foreground/30" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs font-medium truncate">{isRu ? product.name : (product.name_en || product.name)}</p>
                                <p className="text-[11px] text-muted-foreground">{product.price.toLocaleString()} ₽</p>
                              </Link>
                              {/* Add to cart button */}
                              <button
                                onClick={() => handleAddOne(product.id, isRu ? product.name : (product.name_en || product.name))}
                                className="absolute top-2 right-2 w-7 h-7 bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground hover:border-primary"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Styling tips */}
                        {outfit.styling_tips && (
                          <div className="border-t border-border/40 pt-5 sm:pt-6">
                            <p className="overline text-primary mb-2">{isRu ? "Советы стилиста" : "Styling tips"}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">{outfit.styling_tips}</p>
                          </div>
                        )}
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

export default AIStylist;
