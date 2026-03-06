import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { ArrowRight, ShoppingBag } from "lucide-react";

interface LookbookLook {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  season: string;
  image_url: string;
  product_ids: string[];
  sort_order: number;
}

interface LookProduct {
  id: string;
  name: string;
  name_en: string | null;
  price: number;
  images: string[];
  category: string;
}

const Lookbook = () => {
  const { lang } = useLanguage();
  const [activeLook, setActiveLook] = useState<string | null>(null);

  const { data: looks = [], isLoading } = useQuery({
    queryKey: ["lookbook"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lookbook_looks")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      return (data || []) as LookbookLook[];
    },
  });

  // Fetch all products referenced by looks
  const allProductIds = [...new Set(looks.flatMap((l) => l.product_ids))];
  const { data: products = [] } = useQuery({
    queryKey: ["lookbook-products", allProductIds],
    queryFn: async () => {
      if (allProductIds.length === 0) return [];
      const { data } = await supabase
        .from("products")
        .select("id, name, name_en, price, images, category")
        .in("id", allProductIds);
      return (data || []) as LookProduct[];
    },
    enabled: allProductIds.length > 0,
  });

  const getProductsForLook = (ids: string[]) =>
    ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as LookProduct[];

  // Editorial layout patterns — alternating between different grid compositions
  const layoutPatterns = [
    "full",        // full-width cinematic
    "split-left",  // image left, text right
    "split-right", // text left, image right
    "full",
    "split-right",
    "split-left",
  ];

  return (
    <>
      <title>Lookbook SS25 — KiKi Showroom</title>

      {/* Hero — editorial cover */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          {looks[0] && (
            <img
              src={looks[0].image_url}
              alt=""
              className="w-full h-full object-cover animate-hero-zoom-in"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/10 to-foreground/70" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end">
          <div className="container mx-auto px-6 md:px-10 pb-16 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              <p className="overline text-primary/70 mb-4">KiKi Showroom</p>
              <h1 className="font-display text-6xl md:text-[8rem] font-light text-background leading-[0.95] mb-4">
                Look<span className="italic">book</span>
              </h1>
              <p className="font-display text-2xl md:text-4xl font-light text-background/60 italic">
                Spring / Summer 2025
              </p>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <span className="text-[9px] uppercase tracking-[0.4em] text-background/40 font-body">
              {lang === "ru" ? "Листайте" : "Scroll"}
            </span>
            <div className="w-px h-10 bg-background/20 relative overflow-hidden">
              <div className="w-full h-1/2 bg-primary/50 animate-scroll-pulse" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lookbook Looks — editorial spreads */}
      {isLoading ? (
        <div className="py-32 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary/50 w-48 mx-auto" />
            <div className="h-4 bg-secondary/50 w-64 mx-auto" />
          </div>
        </div>
      ) : (
        looks.map((look, index) => {
          const layout = layoutPatterns[index % layoutPatterns.length];
          const lookProducts = getProductsForLook(look.product_ids);
          const title = lang === "en" && look.title_en ? look.title_en : look.title;
          const desc = lang === "en" && look.description_en ? look.description_en : look.description;
          const isActive = activeLook === look.id;

          if (layout === "full") {
            return (
              <section key={look.id} className="relative">
                {/* Full-width editorial image */}
                <div
                  className="relative h-[85vh] overflow-hidden cursor-pointer group"
                  onClick={() => setActiveLook(isActive ? null : look.id)}
                >
                  <img
                    src={look.image_url}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

                  {/* Overlay content */}
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-16">
                    <ScrollReveal>
                      <div className="max-w-2xl">
                        <p className="overline text-primary/80 mb-3">
                          {lang === "ru" ? "Образ" : "Look"} {String(index + 1).padStart(2, "0")} — {look.season}
                        </p>
                        <h2 className="font-display text-4xl md:text-6xl font-light text-background mb-4 leading-tight">
                          {title}
                        </h2>
                        <p className="text-background/60 font-light text-sm md:text-base max-w-lg leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>

                {/* Products panel */}
                <motion.div
                  initial={false}
                  animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden bg-secondary/20"
                >
                  <div className="container mx-auto px-6 md:px-10 py-12 md:py-16">
                    <p className="overline text-muted-foreground mb-8">
                      {lang === "ru" ? "В этом образе" : "Shop This Look"}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      {lookProducts.map((p) => (
                        <ProductMiniCard key={p.id} product={p} lang={lang} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </section>
            );
          }

          // Split layout
          const isLeft = layout === "split-left";
          return (
            <section key={look.id} className="min-h-[80vh]">
              <div className={cn("grid grid-cols-1 lg:grid-cols-2", isLeft ? "" : "")}>
                {/* Image */}
                <div
                  className={cn(
                    "relative h-[60vh] lg:h-[85vh] overflow-hidden group cursor-pointer",
                    !isLeft && "lg:order-2"
                  )}
                  onClick={() => setActiveLook(isActive ? null : look.id)}
                >
                  <img
                    src={look.image_url}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent lg:bg-none" />

                  {/* Mobile text overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-6 lg:hidden">
                    <p className="overline text-primary/80 mb-2">
                      {lang === "ru" ? "Образ" : "Look"} {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="font-display text-3xl font-light text-background">{title}</h2>
                  </div>
                </div>

                {/* Text + Products */}
                <div
                  className={cn(
                    "flex items-center px-6 md:px-10 lg:px-16 xl:px-20 py-16 lg:py-0",
                    !isLeft && "lg:order-1"
                  )}
                >
                  <ScrollReveal delay={200}>
                    <div className="max-w-md">
                      <p className="overline text-primary mb-4">
                        {lang === "ru" ? "Образ" : "Look"} {String(index + 1).padStart(2, "0")} — {look.season}
                      </p>
                      <h2 className="font-display text-3xl md:text-5xl font-light mb-6 leading-tight hidden lg:block">
                        {title}
                      </h2>
                      <p className="text-muted-foreground font-light text-sm leading-[2] mb-10">
                        {desc}
                      </p>

                      {/* Product list */}
                      <div className="space-y-4 mb-10">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-body font-medium">
                          {lang === "ru" ? "В этом образе" : "Shop This Look"}
                        </p>
                        {lookProducts.map((p) => (
                          <Link
                            key={p.id}
                            to={`/shop/${p.id}`}
                            className="flex items-center gap-4 group/item py-2 border-b border-border/30 last:border-0 hover:border-primary/30 transition-colors"
                          >
                            <div className="w-12 h-14 bg-secondary/30 overflow-hidden shrink-0">
                              <img
                                src={p.images[0]}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-light truncate group-hover/item:text-primary transition-colors">
                                {lang === "en" && p.name_en ? p.name_en : p.name}
                              </h4>
                              <p className="text-xs text-muted-foreground font-body">
                                {p.price.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
                              </p>
                            </div>
                            <ArrowRight
                              size={14}
                              strokeWidth={1.5}
                              className="text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all shrink-0"
                            />
                          </Link>
                        ))}
                      </div>

                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-body font-medium hover:bg-primary transition-colors duration-500"
                      >
                        <ShoppingBag size={14} strokeWidth={1.5} />
                        {lang === "ru" ? "Весь каталог" : "View Full Catalog"}
                      </Link>
                    </div>
                  </ScrollReveal>
                </div>
              </div>

              {/* Products panel for mobile on split layouts */}
              <motion.div
                initial={false}
                animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden bg-secondary/20 lg:hidden"
              >
                <div className="px-6 py-10">
                  <p className="overline text-muted-foreground mb-6">
                    {lang === "ru" ? "В этом образе" : "Shop This Look"}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {lookProducts.map((p) => (
                      <ProductMiniCard key={p.id} product={p} lang={lang} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>
          );
        })
      )}

      {/* CTA */}
      <section className="bg-foreground text-background">
        <div className="container mx-auto px-6 md:px-10 py-24 md:py-32 text-center">
          <ScrollReveal>
            <p className="overline text-primary/60 mb-4">{lang === "ru" ? "Коллекция SS25" : "SS25 Collection"}</p>
            <h2 className="font-display text-4xl md:text-6xl font-light mb-6">
              {lang === "ru" ? "Откройте всю коллекцию" : "Discover the Full Collection"}
            </h2>
            <p className="text-background/40 font-light max-w-md mx-auto mb-10 leading-relaxed">
              {lang === "ru"
                ? "Каждый предмет из лукбука доступен в нашем каталоге и шоуруме."
                : "Every piece from the lookbook is available in our catalog and showroom."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-10 py-4 bg-background text-foreground text-[10px] uppercase tracking-[0.25em] font-body font-medium hover:bg-primary hover:text-background transition-all duration-500"
              >
                <ShoppingBag size={14} strokeWidth={1.5} />
                {lang === "ru" ? "Каталог" : "Shop Now"}
              </Link>
              <Link
                to="/showroom"
                className="inline-flex items-center gap-3 px-10 py-4 border border-background/20 text-background text-[10px] uppercase tracking-[0.25em] font-body font-medium hover:bg-background/10 transition-all duration-500"
              >
                {lang === "ru" ? "Посетить шоурум" : "Visit Showroom"}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

/* Mini product card for inline lookbook */
const ProductMiniCard = ({ product, lang }: { product: LookProduct; lang: string }) => (
  <Link to={`/shop/${product.id}`} className="group">
    <div className="aspect-[3/4] overflow-hidden bg-secondary/30 mb-3">
      <img
        src={product.images[0]}
        alt={lang === "en" && product.name_en ? product.name_en : product.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    <h4 className="font-display text-sm font-light mb-1 group-hover:text-primary transition-colors line-clamp-1">
      {lang === "en" && product.name_en ? product.name_en : product.name}
    </h4>
    <p className="text-xs text-muted-foreground font-body">
      {product.price.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
    </p>
  </Link>
);

export default Lookbook;
