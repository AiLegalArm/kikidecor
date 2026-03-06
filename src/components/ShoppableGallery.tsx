import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionId } from "@/hooks/useSessionId";
import { useLanguage } from "@/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "@/components/ScrollReveal";
import ShoppableCard, { type ShoppablePost } from "@/components/shoppable/ShoppableCard";
import ShoppableModal from "@/components/shoppable/ShoppableModal";
import { cn } from "@/lib/utils";
import { Instagram } from "lucide-react";

interface Product {
  id: string;
  name: string;
  name_en: string | null;
  price: number;
  images: string[] | null;
  category: string | null;
}

interface Props {
  /** Filter by account */
  account?: "all" | "decor" | "showroom";
  /** Max posts to show */
  limit?: number;
  /** Show header/hero section */
  showHeader?: boolean;
  /** Show account filter tabs */
  showTabs?: boolean;
  /** CSS class */
  className?: string;
}

/** Masonry pattern: repeating 6-card editorial layout */
const MASONRY_VARIANTS: Array<"standard" | "tall" | "wide"> = [
  "tall", "standard", "standard", "wide", "standard", "tall",
];

const ShoppableGallery = ({
  account: defaultAccount = "all",
  limit,
  showHeader = true,
  showTabs = true,
  className,
}: Props) => {
  const { lang } = useLanguage();
  const sessionId = useSessionId();
  const [searchParams] = useSearchParams();
  const [selectedPost, setSelectedPost] = useState<ShoppablePost | null>(null);
  const [accountTab, setAccountTab] = useState<"all" | "decor" | "showroom">(defaultAccount);

  const isFromInstagram = searchParams.get("utm_source") === "instagram";

  const { data: posts, isLoading } = useQuery({
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

  const productMap = useMemo(
    () => new Map((allProducts || []).map(p => [p.id, p])),
    [allProducts]
  );

  const displayPosts = useMemo(() => {
    const filtered = (posts || []).filter(p => accountTab === "all" || p.account === accountTab);
    const combined = featuredPosts?.length
      ? [...featuredPosts, ...filtered.filter(p => !p.is_featured)]
      : filtered;
    const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
    return limit ? unique.slice(0, limit) : unique;
  }, [posts, featuredPosts, accountTab, limit]);

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

  return (
    <div className={cn("min-h-0", className)}>
      {/* Hero */}
      {showHeader && (
        <section className="pt-28 md:pt-36 pb-10 md:pb-14 px-5 md:px-10">
          <div className="container mx-auto max-w-3xl text-center">
            <ScrollReveal>
              <div className="flex items-center justify-center gap-3 mb-5">
                <Instagram size={18} strokeWidth={1.5} className="text-primary" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium">Social Commerce</p>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-light mb-5 leading-[1.05]">
                {lang === "ru" ? "Вдохновение" : "Inspiration"}{" "}
                <span className="italic">{lang === "ru" ? "в действии" : "in Action"}</span>
              </h1>
              <div className="gold-divider" />
              <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed">
                {lang === "ru"
                  ? "Наши лучшие работы из Instagram — с возможностью заказать декор или купить образ прямо сейчас"
                  : "Our best work from Instagram — shop the look or book decor right now"}
              </p>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Welcome banner */}
      {isFromInstagram && (
        <section className="px-5 md:px-10 pb-6">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-sm font-light text-foreground">
                {lang === "ru"
                  ? "👋 Добро пожаловать из Instagram! Нажмите на фото, чтобы узнать больше"
                  : "👋 Welcome from Instagram! Tap any photo to learn more"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Account tabs */}
      {showTabs && (
        <section className="px-5 md:px-10 pb-8">
          <div className="container mx-auto flex flex-wrap justify-center gap-2">
            {(["all", "decor", "showroom"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setAccountTab(tab)}
                className={cn(
                  "px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] font-body font-medium transition-all duration-500 border",
                  accountTab === tab
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {tab === "all" ? (lang === "ru" ? "Все" : "All") : tab === "decor" ? "KiKi Decor" : "KiKi Showroom"}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Masonry Grid */}
      <section className="px-5 md:px-10 pb-16 md:pb-24">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : displayPosts.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
              {displayPosts.map((post, i) => (
                <ScrollReveal key={post.id} delay={Math.min(i * 40, 300)}>
                  <div className="break-inside-avoid">
                    <ShoppableCard
                      post={post}
                      onClick={openPost}
                      variant={MASONRY_VARIANTS[i % MASONRY_VARIANTS.length]}
                    />
                  </div>
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

      {/* Modal */}
      <ShoppableModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        productMap={productMap}
        onTrackClick={trackClick}
      />
    </div>
  );
};

export default ShoppableGallery;
