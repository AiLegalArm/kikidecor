import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Loader2, Shirt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";

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

type Outfit = {
  title: string;
  description: string;
  styling_tips: string;
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
  const isRu = lang === "ru";

  const [occasion, setOccasion] = useState("");
  const [style, setStyle] = useState("");
  const [colors, setColors] = useState("");
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
        body: { occasion, style, colors, lang },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setOutfits(data?.outfits || []);
      setHasResult(true);
    } catch (e: any) {
      console.error(e);
      toast.error(isRu ? "Ошибка. Попробуйте ещё раз." : "Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ChipSelector = ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="mb-8">
      <p className="overline text-primary mb-4">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-5 py-2.5 text-xs tracking-wider uppercase border transition-all duration-300 ${
              value === opt
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
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
      <section className="pt-32 pb-16 px-6 text-center bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" strokeWidth={1} />
          <h1 className="font-display text-4xl md:text-5xl font-light mb-4">
            {isRu ? "AI Стилист" : "AI Stylist"}
          </h1>
          <p className="text-muted-foreground font-light text-sm leading-relaxed max-w-md mx-auto">
            {isRu
              ? "Расскажите о событии — и наш AI подберёт идеальный образ из коллекции KiKi."
              : "Tell us about your event — and our AI will curate the perfect look from the KiKi collection."}
          </p>
        </motion.div>
      </section>

      {/* Input */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <ChipSelector
            label={isRu ? "Повод" : "Occasion"}
            options={isRu ? occasions.ru : occasions.en}
            value={occasion}
            onChange={setOccasion}
          />
          <ChipSelector
            label={isRu ? "Стиль" : "Style"}
            options={isRu ? styles.ru : styles.en}
            value={style}
            onChange={setStyle}
          />
          <ChipSelector
            label={isRu ? "Цветовая гамма" : "Color palette"}
            options={isRu ? colorPalettes.ru : colorPalettes.en}
            value={colors}
            onChange={setColors}
          />

          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-4 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.3em] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all duration-500 flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles size={14} />
                {isRu ? "Подобрать образ" : "Find my look"}
              </>
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
            className="pb-24 px-6"
          >
            <div className="max-w-5xl mx-auto">
              {outfits.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {isRu ? "Не удалось подобрать образ. Попробуйте другие параметры." : "No outfits found. Try different preferences."}
                </p>
              ) : (
                <div className="space-y-16">
                  {outfits.map((outfit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="border border-border/60 p-8 md:p-12"
                    >
                      <div className="flex items-start gap-3 mb-6">
                        <Shirt className="w-5 h-5 text-primary mt-0.5" strokeWidth={1.5} />
                        <div>
                          <h3 className="font-display text-2xl font-light">{outfit.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1 font-light">{outfit.description}</p>
                        </div>
                      </div>

                      {/* Products grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {outfit.products.map((product) => (
                          <Link
                            key={product.id}
                            to={`/shop/${product.id}`}
                            className="group block"
                          >
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
                            <p className="text-xs font-medium truncate">
                              {isRu ? product.name : (product.name_en || product.name)}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {product.price.toLocaleString()} ₽
                            </p>
                          </Link>
                        ))}
                      </div>

                      {/* Styling tips */}
                      {outfit.styling_tips && (
                        <div className="border-t border-border/40 pt-6">
                          <p className="overline text-primary mb-2">
                            {isRu ? "Советы стилиста" : "Styling tips"}
                          </p>
                          <p className="text-sm text-muted-foreground font-light leading-relaxed">
                            {outfit.styling_tips}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
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
