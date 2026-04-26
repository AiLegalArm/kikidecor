import { useState, useCallback, useEffect } from "react";
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
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  cover_image_url: string;
  gallery: string[];
  tags: string[];
  materials: string[];
  event_date: string | null;
  category?: { name: string; name_en: string | null } | null;
};

const Portfolio = () => {
  const { lang, t } = useLanguage();
  const p = t.portfolio;
  const projects = t.portfolioProjects;
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (modalIndex === null) return;
      const next = modalIndex + dir;
      if (next >= 0 && next < projects.length) setModalIndex(next);
    },
    [modalIndex, projects.length]
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

  const currentItem = modalIndex !== null ? projects[modalIndex] : null;
  const currentImages = modalIndex !== null ? projectImages[modalIndex] : null;

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

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}>
          <p className="text-[9px] uppercase tracking-[0.3em] text-background/25">{lang === "ru" ? "Листайте" : "Scroll"}</p>
          <motion.div className="w-px h-8 bg-background/20" animate={{ scaleY: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ originY: 0 }} />
        </motion.div>
      </section>

      {/* Editorial Projects */}
      <div className="bg-background">
        {projects.map((project, index) => (
          <EditorialSection
            key={index}
            project={project}
            images={projectImages[index]}
            index={index}
            lang={lang}
            labels={p}
            onImageClick={() => openModal(index)}
          />
        ))}
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
        {currentItem && currentImages && modalIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 backdrop-blur-md px-4 sm:px-6" onClick={closeModal}>
            <button onClick={closeModal} className="absolute top-4 right-4 md:top-10 md:right-10 text-background/40 hover:text-background transition-colors duration-300 z-10" aria-label="Close"><X size={24} strokeWidth={1} /></button>
            {modalIndex > 0 && (<button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background transition-colors duration-300 z-10" aria-label="Previous"><ChevronLeft size={28} strokeWidth={1} /></button>)}
            {modalIndex < projects.length - 1 && (<button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background transition-colors duration-300 z-10" aria-label="Next"><ChevronRight size={28} strokeWidth={1} /></button>)}
            <div className="flex flex-col items-center max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
              <motion.div key={modalIndex} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="w-full max-h-[60vh] sm:max-h-[72vh] flex items-center justify-center">
                <img src={currentImages.img} alt={currentItem.title[lang]} className="max-w-full max-h-[60vh] sm:max-h-[72vh] object-contain" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="text-center mt-4 sm:mt-8 px-4">
                <p className="text-[9px] uppercase tracking-[0.35em] text-background/30 mb-2">{currentItem.category[lang]}</p>
                <p className="font-display text-lg sm:text-xl md:text-3xl text-background font-light tracking-tight mb-1.5">{currentItem.title[lang]}</p>
                <p className="text-[11px] sm:text-xs text-background/40 font-light max-w-md mx-auto">{currentItem.subtitle[lang]}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-8 h-px bg-background/15" />
                  <p className="text-[10px] text-background/20 tracking-[0.2em]">{modalIndex + 1} / {projects.length}</p>
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
  project: typeof import("@/i18n/translations").translations.portfolioProjects[number];
  images: { img: string; secondaryImg?: string; layout: "left" | "right" | "full" };
  index: number;
  lang: "ru" | "en";
  labels: typeof import("@/i18n/translations").translations.portfolio;
  onImageClick: () => void;
}

const EditorialSection = ({ project, images, index, lang, labels, onImageClick }: EditorialSectionProps) => {
  const isEven = index % 2 === 0;
  const number = String(index + 1).padStart(2, "0");

  if (images.layout === "full") {
    return (
      <section className="relative">
        <ScrollReveal variant="fade">
          <div className="relative h-[70vh] md:h-[85vh] img-zoom cursor-pointer group" onClick={onImageClick}>
            <img src={images.img} alt={project.title[lang]} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary/70 mb-3">{number} — {project.category[lang]}</p>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-background leading-[0.95] tracking-tight mb-3">{project.title[lang]}</h2>
              <p className="font-display text-lg md:text-xl text-background/50 italic font-light">{project.subtitle[lang]}</p>
            </div>
          </div>
        </ScrollReveal>

        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            <ScrollReveal delay={100}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-4">{labels.theConcept[lang]}</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.concept[lang]}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-4">{labels.designStyle[lang]}</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.style[lang]}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-4">{labels.decorElements[lang]}</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.elements[lang]}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
        <div className="container mx-auto px-6 md:px-12 lg:px-20"><div className="h-px bg-border/60" /></div>
      </section>
    );
  }

  const imageOnLeft = images.layout === "left" || isEven;

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-28">
      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-6 items-start")}>
        {/* Image column */}
        <div className={cn("lg:col-span-7", !imageOnLeft ? "lg:order-2" : "lg:order-1")}>
          <ScrollReveal variant={imageOnLeft ? "slide-left" : "slide-right"}>
            <div className="relative img-zoom cursor-pointer group" onClick={onImageClick}>
              <div className="aspect-[4/5] md:aspect-[3/4]">
                <img src={images.img} alt={project.title[lang]} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 transition-all duration-700 pointer-events-none" />
            </div>
            {images.secondaryImg && (
              <div className={cn("relative -mt-20 md:-mt-32 z-10", imageOnLeft ? "ml-auto mr-0 w-3/5 md:w-2/5 pr-0 pl-4" : "mr-auto ml-0 w-3/5 md:w-2/5 pl-0 pr-4")}>
                <div className="img-zoom shadow-xl cursor-pointer group" onClick={onImageClick}>
                  <div className="aspect-[4/3]">
                    <img src={images.secondaryImg} alt={`${project.title[lang]} detail`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>

        {/* Text column */}
        <div className={cn("lg:col-span-5 flex flex-col justify-center", !imageOnLeft ? "lg:order-1 lg:pr-10" : "lg:order-2 lg:pl-10")}>
          <ScrollReveal delay={250} variant={imageOnLeft ? "slide-right" : "slide-left"}>
            <div className="sticky top-32">
              <p className="font-display text-6xl md:text-8xl font-light text-border/60 leading-none mb-6">{number}</p>
              <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-3">{project.category[lang]}</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-[1.05] tracking-tight mb-2">{project.title[lang]}</h2>
              <p className="font-display text-base md:text-lg text-muted-foreground italic font-light mb-8">{project.subtitle[lang]}</p>
              <div className="w-12 h-px bg-primary/40 mb-8" />
              <div className="mb-8">
                <p className="text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-medium mb-3">{labels.theConcept[lang]}</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.concept[lang]}</p>
              </div>
              <div className="mb-8">
                <p className="text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-medium mb-3">{labels.designStyle[lang]}</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.style[lang]}</p>
              </div>
              <div className="mb-8">
                <p className="text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-medium mb-3">{labels.decorElements[lang]}</p>
                <p className="text-sm text-muted-foreground/70 font-light leading-[1.9] tracking-wide">{project.elements[lang]}</p>
              </div>
              <button onClick={onImageClick} className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-foreground/60 hover:text-primary transition-colors duration-500 group/btn mt-2">
                {labels.viewProject[lang]}
                <ArrowRight size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
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
