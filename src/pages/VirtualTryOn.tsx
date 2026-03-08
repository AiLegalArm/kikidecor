import { useState, useRef } from "react";
import { Camera, Loader2, Sparkles, X, ShoppingBag, Shirt } from "lucide-react";
import AIResultCTA from "@/components/AIResultCTA";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackAIInteraction } from "@/hooks/useAITracking";

const VirtualTryOn = () => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const { data: products } = useProducts();
  const isRu = lang === "ru";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const product = products?.find(p => p.id === selectedProduct);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(isRu ? "Загрузите изображение" : "Please upload an image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(isRu ? "Макс 10 МБ" : "Max 10 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setUserPhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleGenerate = async () => {
    if (!userPhoto || !product || loading) return;
    const productImage = product.images?.[0];
    if (!productImage) {
      toast.error(isRu ? "У товара нет изображения" : "Product has no image");
      return;
    }

    setLoading(true);
    setResultUrl(null);

    try {
      const blob = await fetch(userPhoto).then(r => r.blob());
      const fileName = `tryon-user-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("venue-photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("venue-photos").getPublicUrl(fileName);

      const { data, error } = await supabase.functions.invoke("virtual-tryon", {
        body: {
          userPhotoUrl: urlData.publicUrl,
          productImageUrl: productImage,
          productName: isRu ? product.name : (product.name_en || product.name),
          lang,
        },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      setResultUrl(data?.resultUrl || null);
      if (!data?.resultUrl) toast.error(isRu ? "Не удалось сгенерировать." : "Generation failed.");
      else {
        trackAIInteraction({
          type: "virtual_tryon",
          inputData: { productName: isRu ? product.name : (product.name_en || product.name) },
          outputData: { resultUrl: data.resultUrl },
          selectedProductIds: [product.id],
          photoUrl: urlData.publicUrl,
        });
      }
    } catch (e: any) {
      console.error(e);
      toast.error(isRu ? "Ошибка. Попробуйте ещё раз." : "Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setUserPhoto(null);
    setSelectedProduct(null);
    setResultUrl(null);
  };

  const canGenerate = userPhoto && selectedProduct && !loading;

  return (
    <>
      <title>{isRu ? "Виртуальная примерка — KiKi" : "Virtual Try-On — KiKi"}</title>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-10 sm:pb-14 px-5 sm:px-6 text-center bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary mx-auto mb-4" strokeWidth={1} />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light mb-4">
            {isRu ? "Виртуальная примерка" : "Virtual Try-On"}
          </h1>
          <p className="text-muted-foreground font-light text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
            {isRu
              ? "Загрузите своё фото и выберите товар — ИИ покажет, как вещь будет смотреться на вас"
              : "Upload your photo and select a product — AI will show how it looks on you"}
          </p>
        </motion.div>
      </section>

      <section className="py-10 sm:py-16 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">

          <AnimatePresence mode="wait">
            {resultUrl ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                  <div>
                    <p className="overline text-muted-foreground mb-3 text-center">{isRu ? "Оригинал" : "Original"}</p>
                    <div className="aspect-[3/4] border border-border/40 overflow-hidden">
                      <img src={userPhoto!} alt="Original" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <p className="overline text-primary mb-3 text-center">{isRu ? "Примерка" : "Try-On Preview"}</p>
                    <div className="aspect-[3/4] border border-primary/30 overflow-hidden relative">
                      <img src={resultUrl} alt="Try-on result" className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 text-primary-foreground text-[8px] uppercase tracking-wider">
                        AI {isRu ? "превью" : "preview"}
                      </div>
                    </div>
                  </div>
                </div>

                {product && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-md mx-auto border border-border/50 p-5 flex items-center gap-4"
                  >
                    <div className="w-16 h-20 bg-secondary/40 overflow-hidden shrink-0">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{isRu ? product.name : (product.name_en || product.name)}</p>
                      <p className="font-display text-primary text-lg">{product.price.toLocaleString()} ₽</p>
                    </div>
                    <Button
                      onClick={() => {
                        addItem.mutate({ product_id: product.id });
                        toast.success(isRu ? "Добавлено в корзину!" : "Added to cart!");
                      }}
                      size="sm"
                      className="rounded-none gap-1.5 text-[9px] uppercase tracking-wider h-9 shrink-0"
                    >
                      <ShoppingBag size={12} />
                      {isRu ? "Купить" : "Buy"}
                    </Button>
                  </motion.div>
                )}

                {/* AI-to-CRM conversion CTA */}
                <div className="max-w-md mx-auto mt-6">
                  <AIResultCTA
                    toolName={isRu ? "Виртуальная примерка" : "Virtual Try-On"}
                    resultSummary={`${isRu ? "Примерка" : "Try-on"}: ${isRu ? product?.name : (product?.name_en || product?.name)} — ${product?.price?.toLocaleString()} ₽`}
                    productIds={product ? [product.id] : []}
                  />
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setResultUrl(null)}
                    className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    {isRu ? "Другой товар" : "Try another product"}
                  </button>
                  <span className="text-border">•</span>
                  <button
                    onClick={reset}
                    className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    {isRu ? "Новое фото" : "New photo"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* User photo */}
                  <div>
                    <p className="overline text-primary mb-3">{isRu ? "1. Ваше фото" : "1. Your photo"}</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    {!userPhoto ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="aspect-[3/4] border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors cursor-pointer flex flex-col items-center justify-center group"
                      >
                        <Camera className="w-10 h-10 text-muted-foreground/30 group-hover:text-primary/50 transition-colors mb-3" strokeWidth={1} />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {isRu ? "Загрузить фото" : "Upload photo"}
                        </p>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] border border-border/40 overflow-hidden relative">
                        <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover" />
                        <button
                          onClick={() => { setUserPhoto(null); setResultUrl(null); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Product selector */}
                  <div>
                    <p className="overline text-primary mb-3">{isRu ? "2. Выберите товар" : "2. Select product"}</p>
                    {product ? (
                      <div className="aspect-[3/4] border border-border/40 overflow-hidden relative group">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/40">
                            <Shirt className="w-10 h-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-4 pt-10">
                          <p className="text-xs font-medium truncate">{isRu ? product.name : (product.name_en || product.name)}</p>
                          <p className="text-sm font-display text-primary">{product.price.toLocaleString()} ₽</p>
                        </div>
                        <button
                          onClick={() => { setSelectedProduct(null); setShowProductPicker(true); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setShowProductPicker(!showProductPicker)}
                        className="aspect-[3/4] border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors cursor-pointer flex flex-col items-center justify-center group"
                      >
                        <Shirt className="w-10 h-10 text-muted-foreground/30 group-hover:text-primary/50 transition-colors mb-3" strokeWidth={1} />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {isRu ? "Выбрать товар" : "Select product"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product picker grid */}
                <AnimatePresence>
                  {showProductPicker && !selectedProduct && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="max-w-3xl mx-auto">
                        <p className="text-xs text-muted-foreground mb-4">{isRu ? "Выберите товар из каталога:" : "Choose a product from catalog:"}</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 max-h-[400px] overflow-y-auto">
                          {(products || []).filter(p => p.images?.length).map(p => (
                            <button
                              key={p.id}
                              onClick={() => { setSelectedProduct(p.id); setShowProductPicker(false); }}
                              className="group text-left"
                            >
                              <div className="aspect-[3/4] bg-secondary/40 overflow-hidden border border-border/30 group-hover:border-primary/50 transition-colors">
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                              <p className="text-[10px] mt-1 truncate font-medium">{isRu ? p.name : (p.name_en || p.name)}</p>
                              <p className="text-[10px] text-muted-foreground">{p.price.toLocaleString()} ₽</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Generate button */}
                <div className="max-w-3xl mx-auto">
                  <motion.button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 sm:py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.3em] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all duration-500 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isRu ? "Генерирую превью..." : "Generating preview..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        {isRu ? "Примерить" : "Try it on"}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </>
  );
};

export default VirtualTryOn;
