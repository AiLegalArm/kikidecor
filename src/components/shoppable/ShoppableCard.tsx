import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { ShoppingBag, CalendarDays, Image as ImageIcon, Play, Star } from "lucide-react";

export interface ShoppablePost {
  id: string;
  instagram_id: string;
  media_type: string;
  media_url: string;
  cached_image_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  permalink: string;
  like_count: number | null;
  timestamp: string;
  account: string;
  link_type: string | null;
  linked_product_ids: string[] | null;
  linked_service_index: number | null;
  linked_portfolio_index: number | null;
  is_featured: boolean;
}

const CTA_MAP = {
  product: { icon: ShoppingBag, ru: "Купить образ", en: "Shop This Outfit" },
  service: { icon: CalendarDays, ru: "Заказать декор", en: "Book This Decor" },
  portfolio: { icon: ImageIcon, ru: "Смотреть проект", en: "View Products Used" },
} as const;

interface Props {
  post: ShoppablePost;
  onClick: (post: ShoppablePost) => void;
  variant?: "standard" | "tall" | "wide";
}

export const imgSrc = (post: ShoppablePost) =>
  post.cached_image_url || post.thumbnail_url || post.media_url;

const ShoppableCard = ({ post, onClick, variant = "standard" }: Props) => {
  const { lang } = useLanguage();
  const cta = post.link_type ? CTA_MAP[post.link_type as keyof typeof CTA_MAP] : null;
  const caption = post.caption?.slice(0, 80);

  return (
    <button
      onClick={() => onClick(post)}
      className={cn(
        "group relative w-full overflow-hidden bg-muted cursor-pointer text-left block",
        variant === "tall" && "row-span-2",
        variant === "wide" && "col-span-2",
      )}
    >
      {/* Image */}
      <div className={cn(
        "w-full overflow-hidden",
        variant === "tall" ? "aspect-[3/5]" : variant === "wide" ? "aspect-[2/1]" : "aspect-[3/4]"
      )}>
        <img
          src={imgSrc(post)}
          alt={caption || ""}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Top badges */}
      <div className="absolute top-3 left-3 flex gap-1.5">
        {post.is_featured && (
          <span className="bg-primary/90 text-primary-foreground text-[8px] uppercase tracking-wider px-2 py-1 backdrop-blur-sm flex items-center gap-1">
            <Star size={8} fill="currentColor" /> Featured
          </span>
        )}
        {post.media_type === "VIDEO" && (
          <span className="bg-black/50 text-white backdrop-blur-sm p-1.5 rounded-sm">
            <Play size={10} fill="white" />
          </span>
        )}
      </div>

      {/* Account badge */}
      <div className="absolute top-3 right-3">
        <span className={cn(
          "text-[8px] uppercase tracking-[0.2em] px-2 py-1 backdrop-blur-sm",
          post.account === "decor"
            ? "bg-primary/80 text-primary-foreground"
            : "bg-foreground/80 text-background"
        )}>
          {post.account === "decor" ? "Decor" : "Showroom"}
        </span>
      </div>

      {/* Bottom content — always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-0 transition-all duration-500">
        {/* Caption preview — visible on hover */}
        {caption && (
          <p className="text-[10px] sm:text-xs text-white/80 font-light leading-relaxed line-clamp-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {caption}…
          </p>
        )}

        {/* CTA button */}
        {cta && (
          <span className={cn(
            "inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-medium transition-all duration-500",
            "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
            "bg-white/95 text-foreground px-3 py-2 backdrop-blur-sm"
          )}>
            <cta.icon size={12} /> {cta[lang]}
          </span>
        )}
      </div>
    </button>
  );
};

export default ShoppableCard;
