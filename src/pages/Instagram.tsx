import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Heart, ExternalLink } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "@/components/ScrollReveal";

interface InstaPost {
  id: string;
  instagram_id: string;
  media_url: string;
  cached_image_url: string | null;
  caption: string | null;
  permalink: string;
  like_count: number | null;
  timestamp: string;
}

const InstagramPage = () => {
  const [selected, setSelected] = useState<InstaPost | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["instagram-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_posts")
        .select("id, instagram_id, media_url, cached_image_url, caption, permalink, like_count, timestamp")
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return data as InstaPost[];
    },
  });

  const imgSrc = (post: InstaPost) => post.cached_image_url || post.media_url;

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

      {/* Grid */}
      <section className="container mx-auto px-6 pb-28">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-sm" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {posts.map((post, i) => (
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
                  {/* Hover overlay */}
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

      {/* Modal */}
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
    </div>
  );
};

export default InstagramPage;
