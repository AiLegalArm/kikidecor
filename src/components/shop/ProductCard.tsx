import { useState } from "react";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { Product } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { lang } = useLanguage();
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [imgIdx, setImgIdx] = useState(0);
  const wishlisted = isWishlisted(product.id);

  const name = lang === "en" && product.name_en ? product.name_en : product.name;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discount = hasDiscount ? Math.round((1 - product.price / product.compare_at_price!) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem.mutate(
      { product_id: product.id, size: product.sizes[0], color: product.colors[0] },
      { onSuccess: () => toast.success(lang === "ru" ? "Добавлено в корзину" : "Added to cart") }
    );
  };

  return (
    <div className="group relative">
      {/* Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-secondary/30 cursor-pointer"
        onMouseEnter={() => product.images.length > 1 && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images[imgIdx] || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-[9px] uppercase tracking-[0.15em] font-body font-medium">
              -{discount}%
            </span>
          )}
          {product.inventory <= 3 && product.inventory > 0 && (
            <span className="px-2 py-1 bg-foreground text-background text-[9px] uppercase tracking-[0.15em] font-body font-medium">
              {lang === "ru" ? "Мало" : "Low Stock"}
            </span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-foreground/90 backdrop-blur-sm text-background text-[9px] uppercase tracking-[0.2em] font-body font-medium hover:bg-primary transition-colors duration-300"
          >
            <ShoppingBag size={13} strokeWidth={1.5} />
            {lang === "ru" ? "В корзину" : "Add to Cart"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="w-11 h-11 flex items-center justify-center bg-foreground/90 backdrop-blur-sm text-background hover:bg-primary transition-colors duration-300"
          >
            <Eye size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist.mutate(product.id); }}
        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-background/80 backdrop-blur-sm text-foreground hover:text-primary transition-colors duration-300"
      >
        <Heart size={15} strokeWidth={1.5} fill={wishlisted ? "currentColor" : "none"} className={wishlisted ? "text-primary" : ""} />
      </button>

      {/* Info */}
      <div className="pt-4 pb-2">
        <h3 className="font-display text-base font-light mb-1 line-clamp-1">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-body font-medium">
            {product.price.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
          </span>
          {hasDiscount && (
            <span className="text-xs font-body text-muted-foreground line-through">
              {product.compare_at_price!.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
            </span>
          )}
        </div>
        {/* Color dots */}
        {product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {product.colors.map((color) => (
              <span
                key={color}
                title={color}
                className="w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: color.toLowerCase().replace(/\s/g, "") }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
