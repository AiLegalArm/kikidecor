import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionId } from "@/hooks/useSessionId";
import { useLanguage } from "@/i18n/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import {
  Instagram, Heart, ShoppingBag, CalendarDays, ExternalLink,
  ArrowRight, Play, Image as ImageIcon, X,
} from "lucide-react";

interface ShoppablePost {
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

const ShoppableGallery = () => {
  const { lang } = useLanguage();
  const sessionId = useSessionId();
  const [searchParams] = useSearchParams();
  const [selectedPost, setSelectedPost] = useState<ShoppablePost | null>(null);
  const [accountTab, setAccountTab] = useState<"all" | "decor" | "showroom">("all");

  // Track UTM source
  const utmSource = searchParams.get("utm_source");
  const isFromInstagram = utmSource === "instagram";

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["shoppable-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_posts")
        .select("*")
        .not("link_type", "is", null)
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ShoppablePost[];
    },
  });

  const { data: featuredPosts } = useQuery({
    queryKey: ["featured-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_posts")
        .select("*")
        .eq("is_featured", true)
        .order("timestamp", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data || []) as unknown as ShoppablePost[];
    },
  });

  const { data: allProducts } = useQuery({
    queryKey: ["all-products-for-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, name_en, price, images, category")
        .eq("is_published", true);
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  const productMap = new Map((allProducts || []).map(p => [p.id, p]));

  const trackClick = async (postId: string, clickType: string, targetType?: string, targetId?: string) => {
    try {
      await supabase.from("instagram_clicks").insert({
        instagram_post_id: postId,
        session_id: sessionId,
        click_type: clickType,
        target_type: targetType || null,
        target_id: targetId || null,
      });
    } catch { /* silent */ }
  };

  const openPost = (post: ShoppablePost) => {
    setSelectedPost(post);
    trackClick(post.id, "view");
  };

  const imgSrc = (post: ShoppablePost) => post.cached_image_url || post.thumbnail_url || post.media_url;

  const filteredPosts = (posts || []).filter(p =>
    accountTab === "all" || p.account === accountTab
  );

  const displayPosts = featuredPosts?.length ? [...(featuredPosts || []), ...filteredPosts.filter(p => !p.is_featured)] : filteredPosts;
  const uniquePosts = Array.from(new Map(displayPosts.map(p => [p.id, p])).values());

  const getLinkedProducts = (post: ShoppablePost): Product[] => {
    if (!post.linked_product_ids?.length) return [];
    return post.linked_product_ids.map(id => productMap.get(id)).filter(Boolean) as Product[];
  };

  const getLinkedService = (post: ShoppablePost) => {
    if (post.linked_service_index == null || post.linked_service_index < 0 || post.linked_service_index >= SERVICE_ITEMS.length) return null;
    return SERVICE_ITEMS[post.linked_service_index];
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-12 md:pb-16 px-6 md:px-10">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-5">
              <Instagram size={20} strokeWidth={1.5} className="text-primary" />
              <p className="overline text-primary">Social Commerce</p>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-light mb-5 leading-[1.05]">
              {lang === "ru" ? "Вдохновение" : "Inspiration"} <span className="italic">{lang === "ru" ? "в действии" : "in Action"}</span>
            </h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed">
              {lang === "ru"
                ? "Наши лучшие работы из Instagram — с возможностью заказать декор или купить образ прямо сейчас"
                : "Our best work from Instagram — with the option to book decor or shop the look right now"}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Welcome banner for Instagram visitors */}
      {isFromInstagram && (
        <section className="px-6 md:px-10 pb-8">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-primary/10 border border-primary/20 p-5 text-center">
              <p className="text-sm font-light text-foreground">
                {lang === "ru"
                  ? "👋 Добро пожаловать из Instagram! Нажмите на любое фото, чтобы узнать больше или заказать"
                  : "👋 Welcome from Instagram! Click any photo to learn more or order"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Account tabs */}
      <section className="px-6 md:px-10 pb-8">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {(["all", "decor", "showroom"] as const).map(tab => (
              <button key={tab} onClick={() => setAccountTab(tab)}
                className={cn(
                  "px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] font-body font-medium transition-all duration-500 border",
                  accountTab === tab
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}>
                {tab === "all" ? (lang === "ru" ? "Все" : "All") : tab === "decor" ? "KiKi Decor" : "KiKi Showroom"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-10 pb-24 md:pb-36">
        <div className="container mx-auto">
          {postsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : uniquePosts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {uniquePosts.map((post, i) => (
                <ScrollReveal key={post.id} delay={Math.min(i * 50, 400)}>
                  <button onClick={() => openPost(post)}
                    className="group relative aspect-square w-full overflow-hidden bg-muted cursor-pointer text-left">
                    <img src={imgSrc(post)} alt={post.caption?.slice(0, 60) || ""} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* CTA */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      {post.link_type === "product" && (
                        <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider text-white font-medium">
                          <ShoppingBag size={12} /> {lang === "ru" ? "Купить образ" : "Shop the Look"}
                        </span>
                      )}
                      {post.link_type === "service" && (
                        <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider text-white font-medium">
                          <CalendarDays size={12} /> {lang === "ru" ? "Заказать декор" : "Book this Decor"}
                        </span>
                      )}
                      {post.link_type === "portfolio" && (
                        <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider text-white font-medium">
                          <ImageIcon size={12} /> {lang === "ru" ? "Смотреть проект" : "View Project"}
                        </span>
                      )}
                    </div>

                    {/* Top badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {post.is_featured && (
                        <span className="bg-yellow-500/90 text-white text-[7px] uppercase tracking-wider px-1.5 py-0.5 backdrop-blur-sm">★</span>
                      )}
                      {post.media_type === "VIDEO" && (
                        <span className="bg-black/50 text-white backdrop-blur-sm p-1"><Play size={10} fill="white" /></span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={cn("text-[7px] uppercase tracking-wider px-1.5 py-0.5 backdrop-blur-sm",
                        post.account === "decor" ? "bg-primary/80 text-white" : "bg-foreground/80 text-background"
                      )}>
                        {post.account === "decor" ? "Decor" : "Showroom"}
                      </span>
                    </div>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Instagram size={48} strokeWidth={1} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-light">
                {lang === "ru" ? "Контент скоро появится" : "Content coming soon"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border/50 rounded-none">
          {selectedPost && (
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-3/5 aspect-square md:aspect-auto bg-muted relative">
                {selectedPost.media_type === "VIDEO" ? (
                  <video src={selectedPost.media_url} controls autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={imgSrc(selectedPost)} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Details */}
              <div className="md:w-2/5 p-5 md:p-6 flex flex-col">
                {/* Account */}
                <div className="flex items-center gap-2 mb-3">
                  <Instagram size={14} strokeWidth={1.5} className="text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    @{selectedPost.account === "decor" ? "ki_ki_decor" : "ki_ki_showroom"}
                  </span>
                </div>

                {/* Caption */}
                {selectedPost.caption && (
                  <p className="text-xs font-light text-foreground/80 leading-relaxed line-clamp-4 mb-4">
                    {selectedPost.caption}
                  </p>
                )}

                {/* Linked products */}
                {selectedPost.link_type === "product" && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-3 flex items-center gap-1.5">
                      <ShoppingBag size={12} /> {lang === "ru" ? "Купить образ" : "Shop the Look"}
                    </p>
                    <div className="space-y-2">
                      {getLinkedProducts(selectedPost).map(product => (
                        <Link key={product.id} to={`/shop/${product.id}`}
                          onClick={() => trackClick(selectedPost.id, "product_click", "product", product.id)}
                          className="flex items-center gap-3 p-2 border border-border/50 hover:border-primary/40 transition-colors group/item">
                          {product.images?.[0] && <img src={product.images[0]} alt="" className="w-12 h-12 object-cover shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{lang === "en" && product.name_en ? product.name_en : product.name}</p>
                            <p className="text-xs text-primary">{product.price.toLocaleString()} ₽</p>
                          </div>
                          <ArrowRight size={12} className="text-muted-foreground group-hover/item:text-primary transition-colors shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked service */}
                {selectedPost.link_type === "service" && (() => {
                  const svc = getLinkedService(selectedPost);
                  return svc ? (
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-3 flex items-center gap-1.5">
                        <CalendarDays size={12} /> {lang === "ru" ? "Заказать декор" : "Book this Decor"}
                      </p>
                      <div className="border border-border/50 p-3 mb-3">
                        <p className="text-sm font-medium">{svc.title[lang]}</p>
                        <p className="text-xs text-primary mt-1">{svc.price[lang]}</p>
                      </div>
                      <Link to="/booking"
                        onClick={() => trackClick(selectedPost.id, "booking_click", "service", String(selectedPost.linked_service_index))}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-[10px] uppercase tracking-wider hover:bg-primary transition-colors w-full justify-center">
                        {lang === "ru" ? "Забронировать" : "Book Now"} <ArrowRight size={12} />
                      </Link>
                    </div>
                  ) : null;
                })()}

                {/* Linked portfolio */}
                {selectedPost.link_type === "portfolio" && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-3 flex items-center gap-1.5">
                      <ImageIcon size={12} /> {lang === "ru" ? "Проект" : "Project"}
                    </p>
                    <Link to="/portfolio"
                      onClick={() => trackClick(selectedPost.id, "portfolio_click", "portfolio", String(selectedPost.linked_portfolio_index))}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-foreground/15 text-foreground text-[10px] uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors w-full justify-center">
                      {lang === "ru" ? "Смотреть портфолио" : "View Portfolio"} <ArrowRight size={12} />
                    </Link>
                  </div>
                )}

                {/* Bottom actions */}
                <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
                  {selectedPost.like_count != null && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Heart size={12} strokeWidth={1.5} className="text-primary" />
                      {selectedPost.like_count}
                    </span>
                  )}
                  <a href={selectedPost.permalink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                    Instagram <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppableGallery;
