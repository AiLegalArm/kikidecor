import { useState, useCallback, useEffect } from "react";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import dessertImg from "@/assets/portfolio-dessert.jpg";
import heroImg from "@/assets/hero-decoration.jpg";
import corporateImg from "@/assets/portfolio-corporate.jpg";
import corporate2Img from "@/assets/portfolio-corporate2.jpg";
import kidsImg from "@/assets/portfolio-kids.jpg";
import kids2Img from "@/assets/portfolio-kids2.jpg";

interface EditorialProject {
  img: string;
  secondaryImg?: string;
  category: string;
  title: string;
  subtitle: string;
  concept: string;
  style: string;
  elements: string;
  layout: "left" | "right" | "full" | "split";
}

const projects: EditorialProject[] = [
  {
    img: weddingImg,
    secondaryImg: detailImg,
    category: "Wedding",
    title: "Garden Romance",
    subtitle: "An Enchanted Outdoor Ceremony",
    concept: "A breathtaking garden wedding inspired by the romantic estates of Tuscany. Every element was designed to create an intimate, fairy-tale atmosphere under the open sky.",
    style: "Organic luxury with a soft, ethereal palette of ivory, blush, and champagne gold. Flowing fabrics and natural textures created a dreamlike setting.",
    elements: "Cascading white rose arch · Hand-calligraphed vow books · Crystal candelabras · Petal-strewn aisle · Vintage gold chairs",
    layout: "right",
  },
  {
    img: corporateImg,
    secondaryImg: corporate2Img,
    category: "Corporate",
    title: "Noir & Gold Gala",
    subtitle: "Annual Awards Ceremony",
    concept: "A cinematic black-tie gala for 300 guests, transforming a grand ballroom into a stage worthy of Hollywood's golden era. Drama, elegance, and theatrical lighting at every turn.",
    style: "Art Deco opulence meets modern minimalism. Deep navy drapes, polished gold accents, and geometric patterns created a powerful, sophisticated ambiance.",
    elements: "Towering floral centerpieces · Dramatic stage draping · Monogrammed cocktail napkins · LED uplighting · Custom step-and-repeat wall",
    layout: "left",
  },
  {
    img: proposalImg,
    category: "Proposal",
    title: "Sunset Whisper",
    subtitle: "A Private Rooftop Proposal",
    concept: "An ultra-intimate proposal designed for two, set against a golden-hour sky. Every detail was curated to feel effortlessly romantic — as if the universe conspired for this moment.",
    style: "Warm minimalism with candlelit warmth. A restrained palette of cream, terracotta, and dusty rose allowed the natural sunset to become the backdrop.",
    elements: "200 floating candles · Fresh peony arrangements · Silk cushion lounge · Champagne station · Personalized love letter display",
    layout: "full",
  },
  {
    img: birthdayImg,
    secondaryImg: dessertImg,
    category: "Birthday",
    title: "Golden Jubilee",
    subtitle: "A Milestone 50th Celebration",
    concept: "A lavish 50th birthday soirée that honored a lifetime of elegance. The design balanced nostalgic warmth with contemporary luxury, creating an unforgettable evening.",
    style: "Rich, warm tones of burnished gold, deep burgundy, and champagne. Velvet textures and crystal accents added layers of tactile luxury throughout the venue.",
    elements: "Multi-tiered floral installations · Custom dessert table · Gold balloon sculptures · Monogrammed table settings · Live music stage décor",
    layout: "right",
  },
  {
    img: kidsImg,
    secondaryImg: kids2Img,
    category: "Birthday",
    title: "Unicorn Fantasia",
    subtitle: "A Whimsical Children's Party",
    concept: "A pastel dreamscape for a little one's first birthday, where imagination meets refined design. Every corner held a surprise — from balloon tunnels to a custom candy forest.",
    style: "Soft pastels — lavender, mint, and blush — layered with iridescent accents and organic shapes. Playful yet polished, designed to delight both children and adults.",
    elements: "Rainbow balloon arch · Flower wall photo backdrop · Custom cake display · Balloon garland ceiling · Interactive play stations",
    layout: "left",
  },
  {
    img: themedImg,
    secondaryImg: loungeImg,
    category: "Wedding",
    title: "Villa Serena",
    subtitle: "Mediterranean Estate Wedding",
    concept: "A destination wedding concept bringing the warmth of the Amalfi Coast to a private estate. Lush greenery, terracotta tones, and the scent of jasmine defined this celebration of love.",
    style: "Mediterranean romanticism — sun-bleached whites, olive greens, and warm stone textures. The design honored the architecture while adding layers of botanical luxury.",
    elements: "Living green façade installation · Hanging floral chandeliers · Terracotta tableware · Olive branch table runners · Stone fountain centerpiece",
    layout: "full",
  },
];

const Portfolio = () => {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (modalIndex === null) return;
      const next = modalIndex + dir;
      if (next >= 0 && next < projects.length) setModalIndex(next);
    },
    [modalIndex]
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

  return (
    <>
      <title>Portfolio — Luxury Event Decoration Studio</title>
      <meta name="description" content="Editorial portfolio by Ki Ki Decor. Luxury weddings, proposals, birthdays, and corporate events — each project a story of impeccable design." />

      {/* Editorial Cover */}
      <section className="relative h-[85vh] md:h-[90vh] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Luxury event decoration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/30 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-primary/70 font-medium mb-5">
              The Collection
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-background leading-[0.95] tracking-tight max-w-3xl">
              Stories Told<br />
              <span className="italic font-light text-background/60">Through Design</span>
            </h1>
            <div className="w-16 h-px bg-primary/50 mt-8 mb-6" />
            <p className="text-background/40 font-light text-sm md:text-base max-w-md leading-relaxed">
              Each project is a narrative — a convergence of vision, craft, and emotion. Browse our editorial collection of bespoke event designs.
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <p className="text-[9px] uppercase tracking-[0.3em] text-background/25">Scroll</p>
          <motion.div
            className="w-px h-8 bg-background/20"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originY: 0 }}
          />
        </motion.div>
      </section>

      {/* Editorial Projects */}
      <div className="bg-background">
        {projects.map((project, index) => (
          <EditorialSection
            key={project.title}
            project={project}
            index={index}
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
              "Every event is a blank canvas. We turn it into a masterpiece."
            </p>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mt-6">
              — Ki Ki Decor Studio
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {currentItem && modalIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 backdrop-blur-md"
            onClick={closeModal}
          >
            <button onClick={closeModal} className="absolute top-6 right-6 md:top-10 md:right-10 text-background/40 hover:text-background transition-colors duration-300 z-10" aria-label="Close">
              <X size={24} strokeWidth={1} />
            </button>
            {modalIndex > 0 && (
              <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background transition-colors duration-300 z-10" aria-label="Previous">
                <ChevronLeft size={32} strokeWidth={1} />
              </button>
            )}
            {modalIndex < projects.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background transition-colors duration-300 z-10" aria-label="Next">
                <ChevronRight size={32} strokeWidth={1} />
              </button>
            )}
            <div className="flex flex-col items-center max-w-6xl w-full mx-6 md:mx-12" onClick={(e) => e.stopPropagation()}>
              <motion.div
                key={modalIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-h-[72vh] flex items-center justify-center"
              >
                <img src={currentItem.img} alt={currentItem.title} className="max-w-full max-h-[72vh] object-contain" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="text-center mt-8">
                <p className="text-[9px] uppercase tracking-[0.35em] text-background/30 mb-2.5">{currentItem.category}</p>
                <p className="font-display text-xl md:text-3xl text-background font-light tracking-tight mb-2">{currentItem.title}</p>
                <p className="text-xs text-background/40 font-light max-w-md mx-auto">{currentItem.subtitle}</p>
                <div className="flex items-center justify-center gap-2 mt-5">
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
  project: EditorialProject;
  index: number;
  onImageClick: () => void;
}

const EditorialSection = ({ project, index, onImageClick }: EditorialSectionProps) => {
  const isEven = index % 2 === 0;
  const number = String(index + 1).padStart(2, "0");

  if (project.layout === "full") {
    return (
      <section className="relative">
        {/* Full-bleed image */}
        <ScrollReveal variant="fade">
          <div className="relative h-[70vh] md:h-[85vh] img-zoom cursor-pointer group" onClick={onImageClick}>
            <img
              src={project.img}
              alt={project.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 to-transparent" />

            {/* Overlay content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary/70 mb-3">{number} — {project.category}</p>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-background leading-[0.95] tracking-tight mb-3">
                {project.title}
              </h2>
              <p className="font-display text-lg md:text-xl text-background/50 italic font-light">{project.subtitle}</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Text block below */}
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            <ScrollReveal delay={100}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-4">The Concept</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.concept}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-4">Design Style</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.style}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-4">Décor Elements</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.elements}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="h-px bg-border/60" />
        </div>
      </section>
    );
  }

  // Split layout: image + text side by side
  const imageOnLeft = project.layout === "left" || (project.layout === "split" && isEven);

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-28">
      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-6 items-start", !imageOnLeft && "direction-rtl")}>
        {/* Image column */}
        <div className={cn("lg:col-span-7", !imageOnLeft ? "lg:order-2" : "lg:order-1")}>
          <ScrollReveal variant={imageOnLeft ? "slide-left" : "slide-right"}>
            <div className="relative img-zoom cursor-pointer group" onClick={onImageClick}>
              <div className="aspect-[4/5] md:aspect-[3/4]">
                <img
                  src={project.img}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Subtle border accent on hover */}
              <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 transition-all duration-700 pointer-events-none" />
            </div>

            {/* Secondary image offset */}
            {project.secondaryImg && (
              <div className={cn("relative -mt-20 md:-mt-32 z-10", imageOnLeft ? "ml-auto mr-0 w-3/5 md:w-2/5 pr-0 pl-4" : "mr-auto ml-0 w-3/5 md:w-2/5 pl-0 pr-4")}>
                <div className="img-zoom shadow-xl cursor-pointer group" onClick={onImageClick}>
                  <div className="aspect-[4/3]">
                    <img
                      src={project.secondaryImg}
                      alt={`${project.title} detail`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
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
              {/* Project number */}
              <p className="font-display text-6xl md:text-8xl font-light text-border/60 leading-none mb-6">{number}</p>

              <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-medium mb-3">{project.category}</p>

              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-[1.05] tracking-tight mb-2">
                {project.title}
              </h2>
              <p className="font-display text-base md:text-lg text-muted-foreground italic font-light mb-8">
                {project.subtitle}
              </p>

              <div className="w-12 h-px bg-primary/40 mb-8" />

              {/* Concept */}
              <div className="mb-8">
                <p className="text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-medium mb-3">The Concept</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.concept}</p>
              </div>

              {/* Style */}
              <div className="mb-8">
                <p className="text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-medium mb-3">Design Style</p>
                <p className="text-sm text-muted-foreground font-light leading-[1.9]">{project.style}</p>
              </div>

              {/* Elements */}
              <div className="mb-8">
                <p className="text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-medium mb-3">Décor Elements</p>
                <p className="text-sm text-muted-foreground/70 font-light leading-[1.9] tracking-wide">{project.elements}</p>
              </div>

              <button
                onClick={onImageClick}
                className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-foreground/60 hover:text-primary transition-colors duration-500 group/btn mt-2"
              >
                View Project
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
