import { useState } from "react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import ProductCard from "@/components/shop/ProductCard";
import QuickView from "@/components/shop/QuickView";
import { useProducts, Product } from "@/hooks/useProducts";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const categories = [
  { value: "all", ru: "Все", en: "All" },
  { value: "dresses", ru: "Платья", en: "Dresses" },
  { value: "tops", ru: "Топы", en: "Tops" },
  { value: "bottoms", ru: "Низ", en: "Bottoms" },
  { value: "outerwear", ru: "Верхняя одежда", en: "Outerwear" },
  { value: "knitwear", ru: "Трикотаж", en: "Knitwear" },
  { value: "accessories", ru: "Аксессуары", en: "Accessories" },
];

const ShopCatalog = () => {
  const { lang } = useLanguage();
  const [category, setCategory] = useState("all");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { data: products = [], isLoading } = useProducts(category);

  return (
    <>
      <title>KiKi Showroom — {lang === "ru" ? "Каталог" : "Catalog"}</title>

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6 md:px-10">
        <div className="container mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <p className="overline text-primary mb-4">KiKi Showroom</p>
            <h1 className="font-display text-5xl md:text-7xl font-light mb-6">
              {lang === "ru" ? "Каталог" : "Catalog"}
            </h1>
            <p className="text-muted-foreground font-light max-w-lg mx-auto leading-relaxed">
              {lang === "ru"
                ? "Курированная коллекция одежды и аксессуаров для женщин, ценящих элегантность"
                : "A curated collection of clothing and accessories for women who value elegance"}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 md:px-10 pb-8">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] font-body font-medium transition-all duration-500 border",
                  category === cat.value
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {cat[lang]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-6 md:px-10 pb-24 md:pb-32">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary/50 mb-4" />
                  <div className="h-4 bg-secondary/50 w-3/4 mb-2" />
                  <div className="h-3 bg-secondary/50 w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-light">
                {lang === "ru" ? "Товары не найдены" : "No products found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 50}>
                  <ProductCard product={product} onQuickView={setQuickViewProduct} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <QuickView
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
};

export default ShopCatalog;
