import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ScrollReveal";

type Work = {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  cover_image_url: string;
  gallery: string[];
  tags: string[];
  materials: string[];
  event_date: string | null;
  price_range: string | null;
  category_id: string | null;
  category?: { name: string; name_en: string | null } | null;
};

const WorkDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const [work, setWork] = useState<Work | null>(null);
  const [related, setRelated] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("works")
        .select("id, slug, title, title_en, description, description_en, cover_image_url, gallery, tags, materials, event_date, price_range, category_id, category:categories(name, name_en)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const w = { ...data, gallery: Array.isArray((data as any).gallery) ? (data as any).gallery : [] } as Work;
        setWork(w);
        if (w.category_id) {
          const { data: rel } = await supabase
            .from("works")
            .select("id, slug, title, title_en, description, description_en, cover_image_url, gallery, tags, materials, event_date, price_range, category_id, category:categories(name, name_en)")
            .eq("status", "published")
            .eq("category_id", w.category_id)
            .neq("id", w.id)
            .order("featured", { ascending: false })
            .limit(3);
          if (!cancelled && rel) setRelated(rel.map((r: any) => ({ ...r, gallery: Array.isArray(r.gallery) ? r.gallery : [] })));
        }
      }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const title = work ? (lang === "en" && work.title_en ? work.title_en : work.title) : "";
  const desc = work ? ((lang === "en" && work.description_en ? work.description_en : work.description) || "") : "";
  const category = work?.category ? (lang === "en" && work.category.name_en ? work.category.name_en : work.category.name) : "";
  const images = work ? [work.cover_image_url, ...(work.gallery || [])] : [];

  const navLightbox = useCallback((dir: 1 | -1) => {
    setLightbox((cur) => {
      if (cur === null) return cur;
      const next = cur + dir;
      if (next < 0 || next >= images.length) return cur;
      return next;
    });
  }, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") navLightbox(1);
      if (e.key === "ArrowLeft") navLightbox(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox, navLightbox]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-3xl md:text-4xl font-light text-foreground mb-4">
          {lang === "ru" ? "Работа не найдена" : "Work not found"}
        </p>
        <Link to="/portfolio" className="inline-flex items-center gap-2 mt-6 text-[11px] uppercase tracking-[0.3em] text-foreground/70 hover:text-primary transition-colors border-b border-foreground/20 hover:border-primary pb-1">
          <ArrowLeft size={14} /> {lang === "ru" ? "Все работы" : "All works"}
        </Link>
      </div>
    );
  }

  const eventDateFmt = work.event_date ? new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-GB", { year: "numeric", month: "long" }).format(new Date(work.event_date)) : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: desc,
    image: images.slice(0, 6),
    creator: { "@type": "Organization", name: "Ki Ki Decor", url: "https://kiki-shop.online" },
    dateCreated: work.event_date || undefined,
    keywords: work.tags?.join(", "),
  };

  return (
    <>
      <title>{`${title} — Ki Ki Decor`}</title>
      <meta name="description" content={desc.slice(0, 160) || (lang === "ru" ? `Проект Ki Ki Decor: ${title}` : `Ki Ki Decor project: ${title}`)} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc.slice(0, 160)} />
      <meta property="og:image" content={work.cover_image_url} />
      <meta property="og:type" content="article" />
      <link rel="canonical" href={`https://kiki-shop.online/portfolio/${work.slug}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cover */}
      <section className="relative h-[80vh] md:h-[92vh] overflow-hidden">
        <img src={work.cover_image_url} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-foreground/10" />
        <div className="relative z-10 h-full container mx-auto px-6 md:px-12 lg:px-20 flex flex-col justify-end pb-12 md:pb-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="max-w-4xl">
            <Link to="/portfolio" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-background/70 hover:text-background transition-colors mb-8 border-b border-background/30 hover:border-background/70 pb-1">
              <ArrowLeft size={12} /> {lang === "ru" ? "Все работы" : "All works"}
            </Link>
            {category && <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-background/60 font-medium mb-4">{category}{eventDateFmt && ` · ${eventDateFmt}`}</p>}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-background leading-[1] tracking-tight">{title}</h1>
            {desc && <p className="mt-6 text-base md:text-lg text-background/75 font-light leading-relaxed max-w-2xl">{desc.split("\n")[0]}</p>}
          </motion.div>
        </div>
      </section>

      {/* Description body */}
      {desc && desc.split("\n").length > 1 && (
        <section className="container mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24 max-w-3xl">
          <ScrollReveal>
            <div className="space-y-5 text-base md:text-lg text-foreground/85 font-normal leading-[1.85]">
              {desc.split("\n").slice(1).map((p, i) => p.trim() && <p key={i}>{p}</p>)}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Gallery */}
      {work.gallery.length > 0 && (
        <section className="px-4 md:px-8 lg:px-16 pb-16 md:pb-24">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-semibold mb-8">{lang === "ru" ? "Галерея" : "Gallery"}</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              {work.gallery.map((img, i) => (
                <ScrollReveal key={i} delay={i * 60}>
                  <button onClick={() => setLightbox(i + 1)} className={cn("group relative overflow-hidden block w-full", i % 3 === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/5]")}>
                    <img src={img} alt={`${title} — ${i + 1}`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.04]" />
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Meta */}
      {(work.tags?.length > 0 || work.materials?.length > 0 || work.price_range) && (
        <section className="border-t border-border/60 px-6 md:px-12 lg:px-20 py-16 md:py-24">
          <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-12">
            {work.tags?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-semibold mb-4">{lang === "ru" ? "Теги" : "Tags"}</p>
                <div className="flex flex-wrap gap-2">
                  {work.tags.map((t) => <span key={t} className="text-xs px-3 py-1 border border-border rounded-full text-foreground/70">{t}</span>)}
                </div>
              </div>
            )}
            {work.materials?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-semibold mb-4">{lang === "ru" ? "Материалы" : "Materials"}</p>
                <p className="text-sm text-foreground/75 font-light leading-[1.9]">{work.materials.join(" · ")}</p>
              </div>
            )}
            {work.price_range && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-semibold mb-4">{lang === "ru" ? "Бюджет" : "Budget"}</p>
                <p className="font-display text-2xl text-foreground font-light">{work.price_range}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-secondary/40 px-6 md:px-12 py-20 md:py-28">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-semibold mb-5">{lang === "ru" ? "Создадим для вас" : "Let us create for you"}</p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-[1.1] mb-8">
              {lang === "ru" ? "Хотите похожий проект?" : "Want a project like this?"}
            </h2>
            <Link to={`/booking?ref=${work.slug}`} className="inline-flex items-center gap-3 px-10 py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.3em] font-semibold hover:bg-primary transition-colors duration-500">
              {lang === "ru" ? "Обсудить проект" : "Discuss project"} <ArrowRight size={14} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container mx-auto px-6 md:px-12 lg:px-20 py-20 md:py-28">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12 border-b border-border/60 pb-5">
              <h3 className="font-display text-2xl md:text-3xl font-light">{lang === "ru" ? "Похожие работы" : "Related works"}</h3>
              <Link to="/portfolio" className="text-[10px] uppercase tracking-[0.3em] text-foreground/70 hover:text-primary border-b border-foreground/20 hover:border-primary pb-1">{lang === "ru" ? "Все" : "View all"}</Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {related.map((r, i) => {
              const rt = lang === "en" && r.title_en ? r.title_en : r.title;
              const rc = r.category ? (lang === "en" && r.category.name_en ? r.category.name_en : r.category.name) : "";
              return (
                <ScrollReveal key={r.id} delay={i * 80}>
                  <Link to={`/portfolio/${r.slug}`} className="group block">
                    <div className="relative overflow-hidden aspect-[4/5] mb-4">
                      <img src={r.cover_image_url} alt={rt} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.04]" />
                    </div>
                    {rc && <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-semibold mb-1">{rc}</p>}
                    <p className="font-display text-xl md:text-2xl font-light text-foreground group-hover:text-primary transition-colors">{rt}</p>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-foreground/95 backdrop-blur-md flex items-center justify-center px-4" onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 md:top-8 md:right-8 text-background/60 hover:text-background z-10"><X size={24} strokeWidth={1} /></button>
            {lightbox > 0 && <button onClick={(e) => { e.stopPropagation(); navLightbox(-1); }} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-background/40 hover:text-background z-10"><ChevronLeft size={28} strokeWidth={1} /></button>}
            {lightbox < images.length - 1 && <button onClick={(e) => { e.stopPropagation(); navLightbox(1); }} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-background/40 hover:text-background z-10"><ChevronRight size={28} strokeWidth={1} /></button>}
            <motion.img key={lightbox} src={images[lightbox]} alt={title} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="max-w-full max-h-[88vh] object-contain" onClick={(e) => e.stopPropagation()} />
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.25em] text-background/40">{lightbox + 1} / {images.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkDetail;