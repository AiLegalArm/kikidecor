import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Heart, ExternalLink, Play, Film } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "@/components/ScrollReveal";

interface InstaPost {
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
}

const InstagramPage = () => {
  const [selected, setSelected] = useState<InstaPost | null>(null);
  const [selectedReel, setSelectedReel] = useState<InstaPost | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["instagram-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_posts")
        .select("id, instagram_id, media_type, media_url, cached_image_url, thumbnail_url, caption, permalink, like_count, timestamp")
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return data as InstaPost[];
    },
  });

  const imagePosts = posts?.filter((p) => p.media_type !== "VIDEO") || [];
  const reelPosts = posts?.filter((p) => p.media_type === "VIDEO") || [];

  const imgSrc = (post: InstaPost) => post.cached_image_url || post.media_url;
  const thumbSrc = (post: InstaPost) => post.thumbnail_url || post.media_url;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 md:py-32 text-center">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Instagram size={28} strokeWidth={1.5} className="text-primary" />
              <span className="overline text-muted-foreground">@ki_ki_decor</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-light text-foreground mb-4">
              Instagram
            </h1>
            <p className="text-muted-foreground font-light max-w-lg mx-auto">
              Наши последние работы и вдохновение — прямо из Instagram
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="container mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-sm" />
            ))}
          </div>
        ) : imagePosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {imagePosts.map((post, i) => (
              <ScrollReveal key={post.id} delay={Math.min(i * 0.05, 0.4)}>
                <button
                  onClick={() => setSelected(post)}
                  className="group relative aspect-square w-full overflow-hidden rounded-sm bg-muted cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <img
                    src={imgSrc(post)}
                    alt={post.caption?.slice(0, 80) || "Instagram post"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-500 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {post.like_count != null && (
                        <span className="flex items-center gap-1.5 text-sm font-light">
                          <Heart size={16} strokeWidth={1.5} fill="currentColor" />
                          {post.like_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Instagram size={48} strokeWidth={1} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-light">Посты скоро появятся</p>
          </div>
        )}
      </section>

      {/* Reels Section */}
      <section className="container mx-auto px-6 pb-28">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-10">
            <Film size={22} strokeWidth={1.5} className="text-primary" />
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
              Reels
            </h2>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[9/16] rounded-md" />
            ))}
          </div>
        ) : reelPosts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {reelPosts.map((reel, i) => (
              <ScrollReveal key={reel.id} delay={Math.min(i * 0.06, 0.4)}>
                <button
                  onClick={() => setSelectedReel(reel)}
                  className="group relative aspect-[9/16] w-full overflow-hidden rounded-md bg-muted cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <img
                    src={thumbSrc(reel)}
                    alt={reel.caption?.slice(0, 80) || "Instagram reel"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-background/50 transition-colors duration-500">
                      <Play size={20} strokeWidth={1.5} className="text-background ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  {/* Bottom gradient + likes */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    {reel.like_count != null && (
                      <span className="flex items-center gap-1 text-xs font-light text-background">
                        <Heart size={12} strokeWidth={1.5} fill="currentColor" />
                        {reel.like_count}
                      </span>
                    )}
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Film size={40} strokeWidth={1} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-light">Reels скоро появятся</p>
          </div>
        )}
      </section>

      {/* Image Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border/50">
          {selected && (
            <div className="flex flex-col md:flex-row">
              <div className="md:w-3/5 aspect-square md:aspect-auto bg-muted">
                <img
                  src={imgSrc(selected)}
                  alt={selected.caption?.slice(0, 80) || "Instagram post"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Instagram size={16} strokeWidth={1.5} className="text-primary" />
                    <span className="overline text-muted-foreground">@ki_ki_decor</span>
                  </div>
                  {selected.caption && (
                    <p className="text-sm font-light text-foreground/80 leading-relaxed line-clamp-[12]">
                      {selected.caption}
                    </p>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                  {selected.like_count != null && (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Heart size={14} strokeWidth={1.5} className="text-primary" />
                      {selected.like_count}
                    </span>
                  )}
                  <a
                    href={selected.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Открыть в Instagram
                    <ExternalLink size={14} strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reel Video Modal */}
      <Dialog open={!!selectedReel} onOpenChange={() => setSelectedReel(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-foreground border-none rounded-xl">
          {selectedReel && (
            <div className="flex flex-col">
              <div className="relative aspect-[9/16] bg-foreground">
                <video
                  src={selectedReel.media_url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 bg-card">
                {selectedReel.caption && (
                  <p className="text-xs font-light text-foreground/70 leading-relaxed line-clamp-3 mb-3">
                    {selectedReel.caption}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  {selectedReel.like_count != null && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Heart size={12} strokeWidth={1.5} className="text-primary" />
                      {selectedReel.like_count}
                    </span>
                  )}
                  <a
                    href={selectedReel.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Открыть в Instagram
                    <ExternalLink size={12} strokeWidth={1.5} />
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

export default InstagramPage;
