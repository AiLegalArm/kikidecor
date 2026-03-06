import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Upload, Loader2, Sparkles, User, Palette, Shirt, ShoppingBag, Plus, X, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { trackAIInteraction } from "@/hooks/useAITracking";

type Analysis = {
  body_type: string;
  height_estimate?: string;
  silhouette?: string;
  current_style: string;
  dominant_colors: string[];
  current_clothing: string;
  style_notes: string;
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

const StylePhotoAnalyzer = () => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const isRu = lang === "ru";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [hasResult, setHasResult] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(isRu ? "Пожалуйста, загрузите изображение" : "Please upload an image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(isRu ? "Файл слишком большой (макс 10 МБ)" : "File too large (max 10 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!preview || loading) return;
    setLoading(true);
    setAnalysis(null);
    setOutfits([]);
    setHasResult(false);

    try {
      // Upload to storage
      const blob = await fetch(preview).then(r => r.blob());
      const fileName = `style-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("venue-photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("venue-photos")
        .getPublicUrl(fileName);

      const { data, error } = await supabase.functions.invoke("analyze-style-photo", {
        body: { photoUrl: urlData.publicUrl, lang },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      setAnalysis(data?.analysis || null);
      setOutfits(data?.outfits || []);
      setHasResult(true);
    } catch (e: any) {
      console.error(e);
      toast.error(isRu ? "Ошибка анализа. Попробуйте ещё раз." : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = (outfit: Outfit) => {
    outfit.products.forEach(p => addItem.mutate({ product_id: p.id }));
    toast.success(isRu ? "Весь образ добавлен в корзину!" : "Full outfit added to cart!");
  };

  const handleAddOne = (id: string, name: string) => {
    addItem.mutate({ product_id: id });
    toast.success(`${name} — ${isRu ? "в корзине" : "added"}`);
  };

  const clearPhoto = () => {
    setPreview(null);
    setAnalysis(null);
    setOutfits([]);
    setHasResult(false);
  };

  const analysisCards = analysis ? [
    { icon: User, label: isRu ? "Тип фигуры" : "Body type", value: analysis.body_type },
    { icon: Eye, label: isRu ? "Текущий стиль" : "Current style", value: analysis.current_style },
    { icon: Shirt, label: isRu ? "Одежда на фото" : "Current clothing", value: analysis.current_clothing },
    { icon: Palette, label: isRu ? "Доминирующие цвета" : "Dominant colors", value: analysis.dominant_colors.join(", ") },
  ] : [];

  return (
    <div className="space-y-10">
      {/* Upload zone */}
      <div className="max-w-xl mx-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors cursor-pointer p-10 sm:p-16 text-center group"
          >
            <Camera className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary/60 mx-auto mb-4 transition-colors" strokeWidth={1} />
            <p className="text-xs sm:text-sm text-muted-foreground font-light">
              {isRu ? "Загрузите своё фото для анализа стиля" : "Upload your photo for style analysis"}
            </p>
            <p className="text-[10px] text-muted-foreground/50 mt-2 uppercase tracking-wider">
              {isRu ? "Нажмите или перетащите • JPG, PNG • до 10 МБ" : "Click or drag • JPG, PNG • up to 10 MB"}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="aspect-[3/4] max-h-[500px] overflow-hidden border border-border/40 mx-auto w-fit">
              <img src={preview} alt="Your photo" className="h-full w-full object-cover" />
            </div>
            <button
              onClick={clearPhoto}
              className="absolute top-3 right-3 w-8 h-8 bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {preview && !hasResult && (
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-6 py-3.5 sm:py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.3em] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all duration-500 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRu ? "Анализирую..." : "Analyzing..."}</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {isRu ? "Анализировать и подобрать" : "Analyze & recommend"}
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Analysis results */}
      <AnimatePresence>
        {hasResult && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Analysis cards */}
            <div>
              <p className="overline text-primary mb-4 text-center">{isRu ? "Результаты анализа" : "Analysis results"}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
                {analysisCards.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border border-border/50 p-4 sm:p-5"
                  >
                    <card.icon className="w-4 h-4 text-primary mb-2" strokeWidth={1.5} />
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">{card.label}</p>
                    <p className="text-xs sm:text-sm font-light leading-relaxed">{card.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Style notes */}
              {analysis.style_notes && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-2xl mx-auto mt-6 border border-primary/20 bg-primary/5 p-5 sm:p-6"
                >
                  <p className="overline text-primary mb-2">{isRu ? "Рекомендации стилиста" : "Stylist notes"}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">{analysis.style_notes}</p>
                </motion.div>
              )}
            </div>

            {/* Outfit recommendations */}
            {outfits.length > 0 && (
              <div className="max-w-5xl mx-auto">
                <p className="overline text-primary mb-6 text-center">{isRu ? "Подобранные образы" : "Recommended outfits"}</p>
                <div className="space-y-10 sm:space-y-14">
                  {outfits.map((outfit, i) => {
                    const totalPrice = outfit.total_price || outfit.products.reduce((s, p) => s + p.price, 0);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.2 }}
                        className="border border-border/60 p-5 sm:p-8 md:p-10"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                          <div className="flex items-start gap-3">
                            <Shirt className="w-5 h-5 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-display text-lg sm:text-xl font-light">{outfit.title}</h3>
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
                            <span className="font-display text-lg text-primary">{totalPrice.toLocaleString()} ₽</span>
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

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
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
                              <button
                                onClick={() => handleAddOne(product.id, isRu ? product.name : (product.name_en || product.name))}
                                className="absolute top-2 right-2 w-7 h-7 bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground hover:border-primary"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {outfit.styling_tips && (
                          <div className="border-t border-border/40 pt-4">
                            <p className="overline text-primary mb-1.5">{isRu ? "Советы стилиста" : "Styling tips"}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">{outfit.styling_tips}</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Try again */}
            <div className="text-center">
              <button
                onClick={clearPhoto}
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                {isRu ? "Загрузить другое фото" : "Upload another photo"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StylePhotoAnalyzer;
