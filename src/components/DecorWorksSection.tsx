import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";

type Work = {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  cover_image_url: string;
  gallery: string[];
  video_url: string | null;
  tags: string[];
};

const DecorWorksSection = () => {
  const { lang } = useLanguage();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mediaIdx, setMediaIdx] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("works")
        .select("id, slug, title, title_en, description, description_en, cover_image_url, gallery, video_url, tags")
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (data) {
        setWorks(
          data.map((w: any) => ({
            ...w,
            gallery: Array.isArray(w.gallery) ? w.gallery : [],
          })) as Work[]
        );
      }
      setLoading(false);
    })();
  }, []);

  const titleOf = (w: Work) => (lang === "en" && w.title_en ? w.title_en : w.title);
  const descOf = (w: Work) =>
    (lang === "en" && w.description_en ? w.description_en : w.description) || "";

  const current = openIdx !== null ? works[openIdx] : null;
  const currentMedia = useMemo(() => {
    if (!current) return [] as { type: "image" | "video"; url: string }[];
    const list: { type: "image" | "video"; url: string }[] = [];
    if (current.video_url) list.push({ type: "video", url: current.video_url });
    list.push({ type: "image", url: current.cover_image_url });
    for (const g of current.gallery || []) list.push({ type: "image", url: g });
    return list;
  }, [current]);

  useEffect(() => {
    if (openIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
      if (e.key === "ArrowRight" && openIdx < works.length - 1) {
        setOpenIdx(openIdx + 1);
        setMediaIdx(0);
      }
      if (e.key === "ArrowLeft" && openIdx > 0) {
        setOpenIdx(openIdx - 1);
        setMediaIdx(0);
      }
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [openIdx, works.length]);

  if (loading) {
    return (
      <section className="px-6 md:px-10 py-20">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      </section>
    );
  }

  if (works.length === 0) return null;

  // Editorial masonry: cycle through tile sizes for asymmetry
  const sizeClass = (i: number) => {
    const cycle = i % 6;
    if (cycle === 0) return "md:col-span-8 md:row-span-2 aspect-[16/10]";
    if (cycle === 1) return "md:col-span-4 aspect-[3/4]";
    if (cycle === 2) return "md:col-span-4 aspect-[3/4]";
    if (cycle === 3) return "md:col-span-6 aspect-[5/4]";
    if (cycle === 4) return "md:col-span-6 aspect-[5/4]";
    return "md:col-span-12 aspect-[21/9]";
  };

  return (
    <section className="px-6 md:px-10 pb-24 md:pb-36 border-t border-border/50 pt-24 md:pt-32">
      <div className="container mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12 md:mb-16 border-b border-border/60 pb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-semibold mb-3">
                {lang === "ru" ? "Реализованные проекты" : "Realised projects"}
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-light leading-[1]">
                {lang === "ru" ? "Наши работы" : "Our work"}
              </h2>
            </div>
            <p className="hidden md:block font-display text-6xl font-light text-border">
              {String(works.length).padStart(2, "0")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-auto">
          {works.map((w, i) => (
            <ScrollReveal key={w.id} delay={(i % 3) * 80}>
              <button
                onClick={() => {
                  setOpenIdx(i);
                  setMediaIdx(0);
                }}
                className={cn(
                  "relative w-full overflow-hidden group bg-muted block",
                  sizeClass(i)
                )}
              >
                <img
                  src={w.cover_image_url}
                  alt={titleOf(w)}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                {w.video_url && (
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur rounded-full p-2 shadow-md">
                    <Play size={14} className="text-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-left">
                  <h3 className="font-display text-xl md:text-2xl font-light text-background tracking-tight leading-tight">
                    {titleOf(w)}
                  </h3>
                  {descOf(w) && (
                    <p className="text-xs md:text-sm text-background/70 font-light mt-1 line-clamp-1">
                      {descOf(w)}
                    </p>
                  )}
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {current && openIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpenIdx(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 backdrop-blur-md px-4 sm:px-6"
          >
            <button
              onClick={() => setOpenIdx(null)}
              className="absolute top-4 right-4 md:top-10 md:right-10 text-background/40 hover:text-background z-10"
              aria-label="Close"
            >
              <X size={24} strokeWidth={1} />
            </button>
            {openIdx > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx(openIdx - 1);
                  setMediaIdx(0);
                }}
                className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background z-10"
                aria-label="Previous"
              >
                <ChevronLeft size={28} strokeWidth={1} />
              </button>
            )}
            {openIdx < works.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx(openIdx + 1);
                  setMediaIdx(0);
                }}
                className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background z-10"
                aria-label="Next"
              >
                <ChevronRight size={28} strokeWidth={1} />
              </button>
            )}

            <div className="flex flex-col items-center max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
              <motion.div
                key={`${openIdx}-${mediaIdx}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-h-[60vh] sm:max-h-[72vh] flex items-center justify-center"
              >
                {currentMedia[mediaIdx]?.type === "video" ? (
                  <video
                    src={currentMedia[mediaIdx].url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[60vh] sm:max-h-[72vh] object-contain bg-black"
                  />
                ) : (
                  <img
                    src={currentMedia[mediaIdx]?.url}
                    alt={titleOf(current)}
                    className="max-w-full max-h-[60vh] sm:max-h-[72vh] object-contain"
                  />
                )}
              </motion.div>

              {currentMedia.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-4">
                  {currentMedia.map((m, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setMediaIdx(i); }}
                      className={cn(
                        "shrink-0 w-16 h-16 overflow-hidden rounded transition-opacity relative bg-black",
                        mediaIdx === i ? "opacity-100 ring-2 ring-primary" : "opacity-40 hover:opacity-70"
                      )}
                    >
                      {m.type === "video" ? (
                        <>
                          <video src={m.url} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={14} className="text-background drop-shadow" />
                          </div>
                        </>
                      ) : (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-center mt-4 sm:mt-6 px-4"
              >
                <p className="font-display text-lg sm:text-xl md:text-3xl text-background font-light tracking-tight mb-1.5">
                  {titleOf(current)}
                </p>
                {descOf(current) && (
                  <p className="text-[11px] sm:text-xs text-background/50 font-light max-w-md mx-auto">
                    {descOf(current)}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-8 h-px bg-background/15" />
                  <p className="text-[10px] text-background/30 tracking-[0.2em]">
                    {openIdx + 1} / {works.length}
                  </p>
                  <div className="w-8 h-px bg-background/15" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DecorWorksSection;