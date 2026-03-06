import { useState } from "react";
import { X, Heart, ShoppingBag, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { Product } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface QuickViewProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const QuickView = ({ product, open, onClose }: QuickViewProps) => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return null;

  const name = lang === "en" && product.name_en ? product.name_en : product.name;
  const desc = lang === "en" && product.description_en ? product.description_en : product.description;
  const wishlisted = isWishlisted(product.id);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  const handleAdd = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error(lang === "ru" ? "Выберите размер" : "Please select a size");
      return;
    }
    addItem.mutate(
      { product_id: product.id, size: selectedSize || undefined, color: selectedColor || undefined, quantity },
      {
        onSuccess: () => {
          toast.success(lang === "ru" ? "Добавлено в корзину" : "Added to cart");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 border-border/40 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images */}
          <div className="relative bg-secondary/20">
            <div className="aspect-[3/4]">
              <img
                src={product.images[activeImg] || "/placeholder.svg"}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "w-14 h-14 border-2 overflow-hidden transition-all duration-300",
                      i === activeImg ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 md:p-10 flex flex-col">
            <div className="flex-1">
              <p className="overline text-primary mb-3">{product.category}</p>
              <h2 className="font-display text-2xl md:text-3xl font-light mb-4">{name}</h2>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-2xl">
                  {product.price.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through font-body">
                    {product.compare_at_price!.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground font-light leading-relaxed mb-8">{desc}</p>

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
                          "min-w-[44px] h-10 px-3 border text-xs uppercase tracking-wider font-body transition-all duration-300",
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
                          "px-4 h-9 border text-xs font-body transition-all duration-300",
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

              {/* Quantity */}
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-body font-medium">
                  {lang === "ru" ? "Количество" : "Quantity"}
                </p>
                <div className="inline-flex items-center border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                    <Minus size={14} strokeWidth={1.5} />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-body border-x border-border">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={product.inventory === 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-body font-medium hover:bg-primary transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={14} strokeWidth={1.5} />
                {product.inventory === 0
                  ? (lang === "ru" ? "Нет в наличии" : "Out of Stock")
                  : (lang === "ru" ? "В корзину" : "Add to Cart")}
              </button>
              <button
                onClick={() => toggleWishlist.mutate(product.id)}
                className={cn(
                  "w-14 h-14 flex items-center justify-center border transition-all duration-300",
                  wishlisted ? "border-primary text-primary" : "border-border hover:border-foreground"
                )}
              >
                <Heart size={16} strokeWidth={1.5} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Stock info */}
            {product.inventory > 0 && product.inventory <= 5 && (
              <p className="text-xs text-muted-foreground mt-3 font-body">
                {lang === "ru" ? `Осталось ${product.inventory} шт.` : `Only ${product.inventory} left`}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickView;
