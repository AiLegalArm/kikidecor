import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Instagram, Heart, ShoppingBag, CalendarDays,
  ExternalLink, ArrowRight, ImageIcon, Plus,
} from "lucide-react";
import { type ShoppablePost, imgSrc } from "./ShoppableCard";

interface Product {
  id: string;
  name: string;
  name_en: string | null;
  price: number;
  images: string[] | null;
  category: string | null;
}

const SERVICE_ITEMS = [
  { title: { ru: "Декор фасадов", en: "Facade Decoration" }, price: { ru: "от 15 000 ₽", en: "from ₽15,000" } },
  { title: { ru: "Свадебный декор", en: "Wedding Decoration" }, price: { ru: "от 30 000 ₽", en: "from ₽30,000" } },
  { title: { ru: "Оформление праздников", en: "Celebration Decoration" }, price: { ru: "от 10 000 ₽", en: "from ₽10,000" } },
  { title: { ru: "Фотозоны", en: "Photo Zones" }, price: { ru: "от 12 000 ₽", en: "from ₽12,000" } },
  { title: { ru: "Декор входных групп", en: "Entrance Decoration" }, price: { ru: "от 8 000 ₽", en: "from ₽8,000" } },
  { title: { ru: "Корпоративные мероприятия", en: "Corporate Events" }, price: { ru: "от 25 000 ₽", en: "from ₽25,000" } },
];

interface Props {
  post: ShoppablePost | null;
  onClose: () => void;
  productMap: Map<string, Product>;
  onTrackClick: (postId: string, clickType: string, targetType?: string, targetId?: string) => void;
}

const ShoppableModal = ({ post, onClose, productMap, onTrackClick }: Props) => {
  const { lang } = useLanguage();
  const { addItem } = useCart();

  if (!post) return null;

  const linkedProducts = (post.linked_product_ids || [])
    .map(id => productMap.get(id))
    .filter(Boolean) as Product[];

  const linkedService =
    post.linked_service_index != null &&
    post.linked_service_index >= 0 &&
    post.linked_service_index < SERVICE_ITEMS.length
      ? SERVICE_ITEMS[post.linked_service_index]
      : null;

  const handleAddToCart = (product: Product) => {
    addItem.mutate({ product_id: product.id });
    onTrackClick(post.id, "add_to_cart", "product", product.id);
    toast({
      title: lang === "ru" ? "Добавлено в корзину" : "Added to cart",
      description: lang === "en" && product.name_en ? product.name_en : product.name,
    });
  };

  return (
    <Dialog open={!!post} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-border/50 rounded-none max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col md:flex-row">
          {/* Media */}
          <div className="md:w-3/5 aspect-square md:aspect-auto bg-muted relative flex-shrink-0">
            {post.media_type === "VIDEO" ? (
              <video src={post.media_url} controls autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <img src={imgSrc(post)} alt="" className="w-full h-full object-cover" />
            )}
          </div>

          {/* Details */}
          <div className="md:w-2/5 p-5 md:p-6 flex flex-col">
            {/* Account */}
            <div className="flex items-center gap-2 mb-3">
              <Instagram size={14} strokeWidth={1.5} className="text-primary" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                @{post.account === "decor" ? "ki_ki_decor" : "ki_ki_showroom"}
              </span>
            </div>

            {/* Caption */}
            {post.caption && (
              <p className="text-xs font-light text-foreground/80 leading-relaxed line-clamp-5 mb-5">
                {post.caption}
              </p>
            )}

            {/* Linked products — Shop This Outfit */}
            {post.link_type === "product" && linkedProducts.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium mb-3 flex items-center gap-1.5">
                  <ShoppingBag size={12} /> {lang === "ru" ? "Купить образ" : "Shop This Outfit"}
                </p>
                <div className="space-y-2">
                  {linkedProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-2.5 border border-border/50 hover:border-primary/40 transition-colors group/item">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt="" className="w-14 h-14 object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/shop/${product.id}`}
                          onClick={() => onTrackClick(post.id, "product_click", "product", product.id)}
                          className="text-xs font-medium truncate block hover:text-primary transition-colors"
                        >
                          {lang === "en" && product.name_en ? product.name_en : product.name}
                        </Link>
                        <p className="text-xs text-primary mt-0.5">{product.price.toLocaleString()} ₽</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 h-8 px-2 text-[9px] uppercase tracking-wider border-primary/30 hover:bg-primary hover:text-primary-foreground"
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked service — Book This Decor */}
            {post.link_type === "service" && linkedService && (
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium mb-3 flex items-center gap-1.5">
                  <CalendarDays size={12} /> {lang === "ru" ? "Заказать декор" : "Book This Decor"}
                </p>
                <div className="border border-border/50 p-3 mb-3">
                  <p className="text-sm font-medium">{linkedService.title[lang]}</p>
                  <p className="text-xs text-primary mt-1">{linkedService.price[lang]}</p>
                </div>
                <Link
                  to="/booking"
                  onClick={() => onTrackClick(post.id, "booking_click", "service", String(post.linked_service_index))}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-colors w-full justify-center"
                >
                  {lang === "ru" ? "Записаться на консультацию" : "Book Consultation"} <ArrowRight size={12} />
                </Link>
              </div>
            )}

            {/* Linked portfolio */}
            {post.link_type === "portfolio" && (
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium mb-3 flex items-center gap-1.5">
                  <ImageIcon size={12} /> {lang === "ru" ? "Проект" : "Project"}
                </p>
                <Link
                  to="/portfolio"
                  onClick={() => onTrackClick(post.id, "portfolio_click", "portfolio", String(post.linked_portfolio_index))}
                  className="inline-flex items-center gap-2 px-5 py-3 border border-foreground/15 text-foreground text-[10px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors w-full justify-center"
                >
                  {lang === "ru" ? "Смотреть портфолио" : "View Portfolio"} <ArrowRight size={12} />
                </Link>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
              {post.like_count != null && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Heart size={12} strokeWidth={1.5} className="text-primary" />
                  {post.like_count}
                </span>
              )}
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Instagram <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShoppableModal;
