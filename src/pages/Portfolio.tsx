import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { X, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-decoration.jpg";

type WorkItem = {
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
  category_id: string | null;
  category?: { name: string; name_en: string | null } | null;
};

type Category = { id: string; name: string; name_en: string | null };

const Portfolio = () => {
  const { lang, t } = useLanguage();
  const p = t.portfolio;

  const [works, setWorks] = useState<WorkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [worksRes, catsRes] = await Promise.all([
        supabase
          .from("works")
          .select("id, slug, title, title_en, description, description_en, cover_image_url, gallery, tags, materials, event_date, category_id, category:categories(name, name_en)")
          .eq("status", "published")
          .order("featured", { ascending: false })
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, name_en").order("sort_order", { ascending: true }),
      ]);
      const { data, error } = worksRes;
      if (!error && data) {
        setWorks(
          data.map((w: any) => ({
            ...w,
            gallery: Array.isArray(w.gallery) ? w.gallery : [],
          }))
        );
      }
      if (catsRes.data) setCategories(catsRes.data as Category[]);
      setLoading(false);
    };
    load();
  }, []);

  const filteredWorks = useMemo(() => {
    if (!activeCat) return works;
    return works.filter((w) => w.category_id === activeCat);
  }, [works, activeCat]);

  const openModal = (index: number) => { setModalIndex(index); setGalleryIndex(0); };
  const closeModal = () => setModalIndex(null);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (modalIndex === null) return;
      const next = modalIndex + dir;
      if (next >= 0 && next < filteredWorks.length) { setModalIndex(next); setGalleryIndex(0); }
    },
    [modalIndex, filteredWorks.length]
  );

  useEffect(() => {
    if (modalIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [modalIndex, navigate]);

  const current = modalIndex !== null ? filteredWorks[modalIndex] : null;
  const currentImages = current ? [current.cover_image_url, ...(current.gallery || [])] : [];

  const titleOf = (w: WorkItem) => (lang === "en" && w.title_en ? w.title_en : w.title);
  const descOf = (w: WorkItem) => (lang === "en" && w.description_en ? w.description_en : w.description) || "";
  const categoryOf = (w: WorkItem) => {
    if (!w.category) return "";
    return lang === "en" && w.category.name_en ? w.category.name_en : w.category.name;
  };

  return (
    <>
      <title>{lang === "ru" ? "Портфолио — Студия декора мероприятий" : "Portfolio — Luxury Event Decoration Studio"}</title>
      <meta name="description" content={lang === "ru" ? "Портфолио Ki Ki Decor. Роскошные свадьбы, предложения, дни рождения и корпоративные мероприятия — каждый проект как история безупречного дизайна." : "Editorial portfolio by Ki Ki Decor. Luxury weddings, proposals, birthdays, and corporate events — each project a story of impeccable design."} />

      {/* Editorial Cover */}
      <section className="relative h-[85vh] md:h-[90vh] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          <img src={heroImg} alt={lang === "ru" ? "Роскошный декор мероприятий" : "Luxury event decoration"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/30 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 pb-16 md:pb-24">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-primary/70 font-medium mb-5">
              {p.coverOverline[lang]}
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-background leading-[0.95] tracking-tight max-w-3xl">
              {p.coverTitle1[lang]}<br />
              <span className="italic font-light text-background/60">{p.coverTitle2[lang]}</span>
            </h1>
            <div className="w-16 h-px bg-primary/50 mt-8 mb-6" />
            <p className="text-background/40 font-light text-sm md:text-base max-w-md leading-relaxed">
              {p.coverSubtitle[lang]}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && !loading && works.length > 0 && (
        <div className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 md:px-12 lg:px-20 py-4 overflow-x-auto">
            <div className="flex items-center gap-2 md:gap-3 min-w-max">
              <button onClick={() => setActiveCat(null)} className={cn("text-[10px] uppercase tracking-[0.25em] font-semibold px-4 py-2 transition-colors duration-300 whitespace-nowrap", activeCat === null ? "text-foreground border-b border-foreground" : "text-foreground/50 hover:text-foreground")}>
                {lang === "ru" ? "Все" : "All"}
              </button>
              {categories.map((c) => {
                const name = lang === "en" && c.name_en ? c.name_en : c.name;
                return (
                  <button key={c.id} onClick={() => setActiveCat(c.id)} className={cn("text-[10px] uppercase tracking-[0.25em] font-semibold px-4 py-2 transition-colors duration-300 whitespace-nowrap", activeCat === c.id ? "text-foreground border-b border-foreground" : "text-foreground/50 hover:text-foreground")}>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Editorial Projects */}
      <div className="bg-background">
        {loading ? (
          <div className="container mx-auto py-32 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="container mx-auto py-32 text-center max-w-xl px-6">
            <p className="font-display text-2xl md:text-3xl font-light text-foreground/70 italic">
              {lang === "ru" ? "Скоро здесь появятся избранные проекты студии." : "Featured projects coming soon."}
            </p>
          </div>
        ) : (
          filteredWorks.map((work, index) => (
            <EditorialSection
              key={work.id}
              work={work}
              index={index}
              lang={lang}
              labels={p}
              titleOf={titleOf}
              descOf={descOf}
              categoryOf={categoryOf}
              onImageClick={() => openModal(index)}
            />
          ))
        )}
      </div>

      {/* Closing Statement */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <div className="gold-divider" />
            <p className="font-display text-2xl md:text-3xl font-light text-foreground/80 mt-10 leading-relaxed italic">
              {p.closingQuote[lang]}
            </p>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mt-6">
              — Ki Ki Decor Studio
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {current && modalIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 backdrop-blur-md px-4 sm:px-6" onClick={closeModal}>
            <button onClick={closeModal} className="absolute top-4 right-4 md:top-10 md:right-10 text-background/40 hover:text-background transition-colors duration-300 z-10" aria-label="Close"><X size={24} strokeWidth={1} /></button>
            {modalIndex > 0 && (<button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background transition-colors duration-300 z-10" aria-label="Previous"><ChevronLeft size={28} strokeWidth={1} /></button>)}
            {modalIndex < works.length - 1 && (<button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background transition-colors duration-300 z-10" aria-label="Next"><ChevronRight size={28} strokeWidth={1} /></button>)}
            <div className="flex flex-col items-center max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
              <motion.div key={`${modalIndex}-${galleryIndex}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="w-full max-h-[60vh] sm:max-h-[72vh] flex items-center justify-center">
                <img src={currentImages[galleryIndex]} alt={titleOf(current)} className="max-w-full max-h-[60vh] sm:max-h-[72vh] object-contain" />
              </motion.div>
              {currentImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-4">
                  {currentImages.map((img, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setGalleryIndex(i); }} className={cn("shrink-0 w-16 h-16 overflow-hidden rounded transition-opacity", galleryIndex === i ? "opacity-100 ring-2 ring-primary" : "opacity-40 hover:opacity-70")}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="text-center mt-4 sm:mt-6 px-4">
                {categoryOf(current) && <p className="text-[9px] uppercase tracking-[0.35em] text-background/30 mb-2">{categoryOf(current)}</p>}
                <p className="font-display text-lg sm:text-xl md:text-3xl text-background font-light tracking-tight mb-1.5">{titleOf(current)}</p>
                {descOf(current) && <p className="text-[11px] sm:text-xs text-background/40 font-light max-w-md mx-auto">{descOf(current)}</p>}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-8 h-px bg-background/15" />
                  <p className="text-[10px] text-background/20 tracking-[0.2em]">{modalIndex + 1} / {works.length}</p>
                  <div className="w-8 h-px bg-background/15" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── Editorial Section Component ─── */

interface EditorialSectionProps {
  work: WorkItem;
  index: number;
  lang: "ru" | "en";
  labels: any;
  titleOf: (w: WorkItem) => string;
  descOf: (w: WorkItem) => string;
  categoryOf: (w: WorkItem) => string;
  onImageClick: () => void;
}

const EditorialSection = ({ work, index, lang, labels, titleOf, descOf, categoryOf, onImageClick }: EditorialSectionProps) => {
  const isEven = index % 2 === 0;
  const number = String(index + 1).padStart(2, "0");
  // Layout cycle: full every 3rd item, alternating left/right otherwise
  const layout: "left" | "right" | "full" = index % 3 === 2 ? "full" : isEven ? "right" : "left";
  const secondaryImg = work.gallery?.[0];

  if (layout === "full") {
    return (
      <section className="relative">
        <ScrollReveal variant="fade">
          <div className="relative h-[70vh] md:h-[85vh] img-zoom cursor-pointer group" onClick={onImageClick}>
            <img src={work.cover_image_url} alt={titleOf(work)} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary/70 mb-3">{number}{categoryOf(work) && ` — ${categoryOf(work)}`}</p>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-background leading-[0.95] tracking-tight mb-3">{titleOf(work)}</h2>
              {descOf(work) && <p className="font-display text-lg md:text-xl text-background/60 italic font-light max-w-2xl">{descOf(work)}</p>}
            </div>
          </div>
        </ScrollReveal>

        {(work.tags?.length > 0 || work.materials?.length > 0) && (
          <div className="container mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              {work.tags?.length > 0 && (
                <ScrollReveal delay={100}>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-4">{lang === "ru" ? "Теги" : "Tags"}</p>
                    <div className="flex flex-wrap gap-2">
                      {work.tags.map((tag) => <span key={tag} className="text-xs px-3 py-1 border border-border rounded-full text-muted-foreground">{tag}</span>)}
                    </div>
                  </div>
                </ScrollReveal>
              )}
              {work.materials?.length > 0 && (
                <ScrollReveal delay={200}>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-4">{lang === "ru" ? "Материалы" : "Materials"}</p>
                    <p className="text-sm text-muted-foreground font-light leading-[1.9]">{work.materials.join(" · ")}</p>
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        )}
        <div className="container mx-auto px-6 md:px-12 lg:px-20"><div className="h-px bg-border/60" /></div>
      </section>
    );
  }

  const imageOnLeft = layout === "left";

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-28">
      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-6 items-start")}>
        <div className={cn("lg:col-span-7", !imageOnLeft ? "lg:order-2" : "lg:order-1")}>
          <ScrollReveal variant={imageOnLeft ? "slide-left" : "slide-right"}>
            <div className="relative img-zoom cursor-pointer group" onClick={onImageClick}>
              <div className="aspect-[4/5] md:aspect-[3/4]">
                <img src={work.cover_image_url} alt={titleOf(work)} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 transition-all duration-700 pointer-events-none" />
            </div>
            {secondaryImg && (
              <div className={cn("relative -mt-20 md:-mt-32 z-10", imageOnLeft ? "ml-auto mr-0 w-3/5 md:w-2/5 pr-0 pl-4" : "mr-auto ml-0 w-3/5 md:w-2/5 pl-0 pr-4")}>
                <div className="img-zoom shadow-xl cursor-pointer group" onClick={onImageClick}>
                  <div className="aspect-[4/3]">
                    <img src={secondaryImg} alt={`${titleOf(work)} detail`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>

        <div className={cn("lg:col-span-5 flex flex-col justify-center", !imageOnLeft ? "lg:order-1 lg:pr-10" : "lg:order-2 lg:pl-10")}>
          <ScrollReveal delay={250} variant={imageOnLeft ? "slide-right" : "slide-left"}>
            <div className="sticky top-32">
              <p className="font-display text-6xl md:text-8xl font-light text-border/60 leading-none mb-6">{number}</p>
              {categoryOf(work) && <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-3">{categoryOf(work)}</p>}
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-[1.05] tracking-tight mb-2">{titleOf(work)}</h2>
              <div className="w-12 h-px bg-primary/40 my-6" />
              {descOf(work) && (
                <p className="text-sm text-muted-foreground font-light leading-[1.9] mb-8">{descOf(work)}</p>
              )}
              {work.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {work.tags.slice(0, 5).map((tag) => <span key={tag} className="text-[10px] uppercase tracking-wider px-2.5 py-1 border border-border rounded-full text-muted-foreground/70">{tag}</span>)}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link to={`/portfolio/${work.slug}`} className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-foreground hover:text-primary transition-colors duration-500 group/btn font-semibold border-b border-foreground/30 hover:border-primary pb-1">
                  {labels.viewProject?.[lang] || (lang === "ru" ? "Смотреть проект" : "View project")}
                  <ArrowRight size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
                <button onClick={onImageClick} className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-foreground/50 hover:text-foreground transition-colors duration-500">
                  {lang === "ru" ? "Быстрый просмотр" : "Quick preview"}
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
      <div className="h-px bg-border/40 mt-16 md:mt-28" />
    </section>
  );
};

export default function PortfolioWithPopup() {
  return (
    <>
      <Portfolio />
      <ExitIntentPopup offer="decor" />
    </>
  );
}
