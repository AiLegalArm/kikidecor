import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Camera, Upload, Loader2, Sparkles, X, Plus, Shirt, Eye, Palette, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { trackAIInteraction } from "@/hooks/useAITracking";

type Detected = {
  clothing_type: string;
  color: string;
  texture?: string;
  silhouette: string;
  style: string;
  details?: string;
};

type SimilarItem = {
  product_id: string;
  similarity_score: number;
  match_reason: string;
  product: {
    id: string;
    name: string;
    name_en: string | null;
    price: number;
    images: string[] | null;
    category: string | null;
    compare_at_price: number | null;
  };
};

const FindSimilar = () => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const isRu = lang === "ru";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState<Detected | null>(null);
  const [items, setItems] = useState<SimilarItem[]>([]);
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

  const handleSearch = async () => {
    if (!preview || loading) return;
    setLoading(true);
    setDetected(null);
    setItems([]);
    setHasResult(false);

    try {
      const blob = await fetch(preview).then(r => r.blob());
      const fileName = `similar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("venue-photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("venue-photos").getPublicUrl(fileName);

      const { data, error } = await supabase.functions.invoke("find-similar", {
        body: { photoUrl: urlData.publicUrl, lang },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      setDetected(data?.detected || null);
      setItems(data?.similar_items || []);
      setHasResult(true);

      const productIds = (data?.similar_items || []).map((i: any) => i.product?.id).filter(Boolean);
      trackAIInteraction({
        type: "find_similar",
        inputData: { detected: data?.detected },
        outputData: { matchCount: data?.similar_items?.length || 0 },
        selectedProductIds: productIds,
        photoUrl: urlData.publicUrl,
      });
    } catch (e: any) {
      console.error(e);
      toast.error(isRu ? "Ошибка поиска. Попробуйте ещё раз." : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    setDetected(null);
    setItems([]);
    setHasResult(false);
  };

  const handleAddOne = (id: string, name: string) => {
    addItem.mutate({ product_id: id });
    toast.success(`${name} — ${isRu ? "в корзине" : "added"}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-muted-foreground bg-secondary/50 border-border/50";
  };

  return (
    <>
      <title>{isRu ? "Поиск похожих — KiKi" : "Find Similar — KiKi"}</title>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-5 sm:px-6 text-center bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Search className="w-7 h-7 sm:w-8 sm:h-8 text-primary mx-auto mb-4" strokeWidth={1} />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light mb-4">
            {isRu ? "Поиск похожих" : "Find Similar"}
          </h1>
          <p className="text-muted-foreground font-light text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
            {isRu
              ? "Загрузите фото любой одежды — AI найдёт похожие вещи из коллекции KiKi Showroom"
              : "Upload a photo of any clothing — AI will find similar items from KiKi Showroom collection"}
          </p>
        </motion.div>
      </section>

      {/* Upload */}
      <section className="py-10 sm:py-16 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className={cn("grid gap-8", hasResult ? "lg:grid-cols-[280px_1fr]" : "max-w-xl mx-auto")}>
            {/* Left: photo */}
            <div>
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
                  className="border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors cursor-pointer p-10 sm:p-14 text-center group"
                >
                  <Camera className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary/60 mx-auto mb-4 transition-colors" strokeWidth={1} />
                  <p className="text-xs sm:text-sm text-muted-foreground font-light">
                    {isRu ? "Загрузите фото одежды" : "Upload a clothing photo"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-2 uppercase tracking-wider">
                    {isRu ? "JPG, PNG • до 10 МБ" : "JPG, PNG • up to 10 MB"}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="aspect-[3/4] overflow-hidden border border-border/40">
                    <img src={preview} alt="Uploaded" className="h-full w-full object-cover" />
                  </div>
                  <button
                    onClick={clearPhoto}
                    className="absolute top-2 right-2 w-7 h-7 bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {preview && !hasResult && (
                <motion.button
                  onClick={handleSearch}
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-4 py-3.5 bg-foreground text-background text-[10px] uppercase tracking-[0.3em] font-medium disabled:opacity-30 hover:bg-primary hover:text-primary-foreground transition-all duration-500 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {isRu ? "Ищу..." : "Searching..."}</>
                  ) : (
                    <><Search size={14} /> {isRu ? "Найти похожее" : "Find similar"}</>
                  )}
                </motion.button>
              )}

              {/* Detected info */}
              <AnimatePresence>
                {detected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 border border-border/50 p-4 space-y-2"
                  >
                    <p className="overline text-primary text-[9px]">{isRu ? "Обнаружено" : "Detected"}</p>
                    <div className="space-y-1.5 text-xs text-muted-foreground font-light">
                      <p><span className="text-foreground font-medium">{isRu ? "Тип:" : "Type:"}</span> {detected.clothing_type}</p>
                      <p><span className="text-foreground font-medium">{isRu ? "Цвет:" : "Color:"}</span> {detected.color}</p>
                      <p><span className="text-foreground font-medium">{isRu ? "Силуэт:" : "Silhouette:"}</span> {detected.silhouette}</p>
                      <p><span className="text-foreground font-medium">{isRu ? "Стиль:" : "Style:"}</span> {detected.style}</p>
                      {detected.texture && <p><span className="text-foreground font-medium">{isRu ? "Фактура:" : "Texture:"}</span> {detected.texture}</p>}
                      {detected.details && <p><span className="text-foreground font-medium">{isRu ? "Детали:" : "Details:"}</span> {detected.details}</p>}
                    </div>
                    <button
                      onClick={clearPhoto}
                      className="text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 mt-2"
                    >
                      {isRu ? "Новый поиск" : "New search"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: results */}
            <AnimatePresence>
              {hasResult && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground text-sm">
                        {isRu ? "Похожих товаров не найдено." : "No similar items found."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="overline text-primary mb-4">
                        {isRu ? `Найдено ${items.length} похожих` : `${items.length} similar items found`}
                      </p>
                      <div className="space-y-3">
                        {items.map((item, i) => (
                          <motion.div
                            key={item.product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="border border-border/50 flex items-stretch group hover:border-primary/30 transition-colors"
                          >
                            <Link to={`/shop/${item.product.id}`} className="flex items-center gap-4 flex-1 min-w-0 p-3 sm:p-4">
                              <div className="w-20 h-24 sm:w-24 sm:h-28 bg-secondary/40 overflow-hidden shrink-0">
                                {item.product.images?.[0] ? (
                                  <img
                                    src={item.product.images[0]}
                                    alt={isRu ? item.product.name : (item.product.name_en || item.product.name)}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Shirt className="w-6 h-6 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 border rounded-sm", getScoreColor(item.similarity_score))}>
                                    {item.similarity_score}%
                                  </span>
                                  {item.product.category && (
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{item.product.category}</span>
                                  )}
                                </div>
                                <p className="text-sm font-medium truncate">
                                  {isRu ? item.product.name : (item.product.name_en || item.product.name)}
                                </p>
                                <p className="text-xs text-muted-foreground font-light mt-0.5 line-clamp-2">{item.match_reason}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-sm font-display text-primary">{item.product.price.toLocaleString()} ₽</span>
                                  {item.product.compare_at_price && item.product.compare_at_price > item.product.price && (
                                    <span className="text-[11px] text-muted-foreground line-through">{item.product.compare_at_price.toLocaleString()} ₽</span>
                                  )}
                                </div>
                              </div>
                            </Link>
                            <button
                              onClick={() => handleAddOne(item.product.id, isRu ? item.product.name : (item.product.name_en || item.product.name))}
                              className="px-4 border-l border-border/30 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                              title={isRu ? "В корзину" : "Add to cart"}
                            >
                              <Plus size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
};

export default FindSimilar;
