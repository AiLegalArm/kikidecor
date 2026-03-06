import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import ProductCard from "@/components/shop/ProductCard";
import QuickView from "@/components/shop/QuickView";
import { useProduct, useProducts, Product } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { Heart, ShoppingBag, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const { data: product, isLoading } = useProduct(id || "");
  const { data: relatedProducts = [] } = useProducts(product?.category);
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 px-6 md:px-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-[3/4] bg-secondary/50" />
            <div className="space-y-4 pt-8">
              <div className="h-4 bg-secondary/50 w-1/4" />
              <div className="h-8 bg-secondary/50 w-3/4" />
              <div className="h-6 bg-secondary/50 w-1/3" />
              <div className="h-20 bg-secondary/50 w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 px-6 text-center">
        <h1 className="font-display text-3xl font-light mb-4">
          {lang === "ru" ? "Товар не найден" : "Product not found"}
        </h1>
        <Link to="/shop" className="text-primary hover:underline font-body text-sm">
          {lang === "ru" ? "Вернуться в каталог" : "Back to catalog"}
        </Link>
      </div>
    );
  }

  const name = lang === "en" && product.name_en ? product.name_en : product.name;
  const desc = lang === "en" && product.description_en ? product.description_en : product.description;
  const wishlisted = isWishlisted(product.id);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const related = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error(lang === "ru" ? "Выберите размер" : "Please select a size");
      return;
    }
    addItem.mutate(
      { product_id: product.id, size: selectedSize || undefined, color: selectedColor || undefined, quantity },
      { onSuccess: () => toast.success(lang === "ru" ? "Добавлено в корзину" : "Added to cart") }
    );
  };

  return (
    <>
      <title>{name} — KiKi Showroom</title>

      <section className="pt-28 pb-20 md:pt-36 md:pb-28 px-6 md:px-10">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <Link to="/shop" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-body mb-8">
            <ArrowLeft size={14} strokeWidth={1.5} />
            {lang === "ru" ? "Каталог" : "Catalog"}
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Images */}
            <div>
              <div className="aspect-[3/4] bg-secondary/20 overflow-hidden mb-4">
                <img src={product.images[activeImg] || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        "aspect-square overflow-hidden border-2 transition-all duration-300",
                        i === activeImg ? "border-primary" : "border-transparent opacity-50 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:pt-4">
              <ScrollReveal>
                <p className="overline text-primary mb-3">{product.category}</p>
                <h1 className="font-display text-3xl md:text-4xl font-light mb-4">{name}</h1>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-display text-2xl md:text-3xl">
                    {product.price.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-muted-foreground line-through font-body">
                      {product.compare_at_price!.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
                    </span>
                  )}
                </div>

                <div className="h-px bg-border mb-6" />

                <p className="text-sm text-muted-foreground font-light leading-[2] mb-8">{desc}</p>

                {/* Sizes */}
                {product.sizes.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-body font-medium">
                      {lang === "ru" ? "Размер" : "Size"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-[48px] h-11 px-4 border text-xs uppercase tracking-wider font-body transition-all duration-300",
                            selectedSize === size
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-foreground"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-body font-medium">
                      {lang === "ru" ? "Цвет" : "Color"}{selectedColor && `: ${selectedColor}`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "px-4 h-10 border text-xs font-body transition-all duration-300",
                            selectedColor === color
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-foreground"
                          )}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity + Add */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center border border-border">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-secondary transition-colors">
                      <Minus size={14} strokeWidth={1.5} />
                    </button>
                    <span className="w-14 h-11 flex items-center justify-center text-sm font-body border-x border-border">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-secondary transition-colors">
                      <Plus size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={product.inventory === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-body font-medium hover:bg-primary transition-colors duration-500 disabled:opacity-40"
                  >
                    <ShoppingBag size={14} strokeWidth={1.5} />
                    {product.inventory === 0
                      ? (lang === "ru" ? "Нет в наличии" : "Out of Stock")
                      : (lang === "ru" ? "В корзину" : "Add to Cart")}
                  </button>
                  <button
                    onClick={() => toggleWishlist.mutate(product.id)}
                    className={cn(
                      "w-14 h-14 flex items-center justify-center border transition-all duration-300 shrink-0",
                      wishlisted ? "border-primary text-primary" : "border-border hover:border-foreground"
                    )}
                  >
                    <Heart size={16} strokeWidth={1.5} fill={wishlisted ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                  {[
                    { icon: Truck, label: lang === "ru" ? "Доставка" : "Delivery" },
                    { icon: Shield, label: lang === "ru" ? "Гарантия" : "Guarantee" },
                    { icon: RotateCcw, label: lang === "ru" ? "Возврат" : "Returns" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="text-center">
                      <Icon size={18} strokeWidth={1.2} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-body">{label}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="px-6 md:px-10 pb-24 md:pb-32 border-t border-border pt-16">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-light text-center mb-12">
                {lang === "ru" ? "Вам может понравиться" : "You May Also Like"}
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <Link key={p.id} to={`/shop/${p.id}`}>
                  <ProductCard product={p} onQuickView={setQuickViewProduct} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <QuickView product={quickViewProduct} open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
};

export default ProductPage;
