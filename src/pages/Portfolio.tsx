import { useState, useCallback, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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

const categories = [
  { key: "all", label: "All Projects" },
  { key: "weddings", label: "Weddings" },
  { key: "proposals", label: "Proposals" },
  { key: "birthdays", label: "Birthdays" },
  { key: "corporate", label: "Corporate" },
];

interface PortfolioItem {
  img: string;
  category: string;
  title: string;
  caption: string;
  height: "tall" | "medium" | "short";
}

const portfolioItems: PortfolioItem[] = [
  { img: weddingImg, category: "weddings", title: "Garden Romance", caption: "Outdoor wedding ceremony with cascading white roses and a golden arch", height: "tall" },
  { img: corporateImg, category: "corporate", title: "Gala Evening", caption: "Navy & gold corporate dinner with towering floral centerpieces", height: "medium" },
  { img: kidsImg, category: "birthdays", title: "Rainbow Adventure", caption: "Vibrant children's celebration with a rainbow balloon arch", height: "short" },
  { img: proposalImg, category: "proposals", title: "Sunset Proposal", caption: "Romantic photo zone with fresh flowers and candlelight", height: "tall" },
  { img: birthdayImg, category: "birthdays", title: "Golden Jubilee", caption: "Elegant anniversary décor with golden balloons and florals", height: "medium" },
  { img: themedImg, category: "weddings", title: "Façade Dream", caption: "Complete façade transformation with lush greenery and drapery", height: "short" },
  { img: detailImg, category: "weddings", title: "Floral Elegance", caption: "Delicate roses in a vintage golden vase arrangement", height: "medium" },
  { img: corporate2Img, category: "corporate", title: "Awards Ceremony", caption: "Dramatic stage with golden drapes and spotlights", height: "tall" },
  { img: kids2Img, category: "birthdays", title: "Unicorn Party", caption: "Pastel celebration with flower wall and balloon garland", height: "short" },
  { img: dessertImg, category: "proposals", title: "Sweet Table", caption: "Multi-tiered cake, macarons, and cupcakes on an elegant dessert display", height: "medium" },
  { img: loungeImg, category: "corporate", title: "VIP Lounge", caption: "Stylish entrance zone with cushions and hanging florals", height: "tall" },
  { img: heroImg, category: "weddings", title: "Crystal Ballroom", caption: "Banquet hall with crystal chandeliers and pink peonies", height: "medium" },
];

const heightMap = {
  tall: "h-[520px] md:h-[600px]",
  medium: "h-[360px] md:h-[420px]",
  short: "h-[280px] md:h-[320px]",
};

const Portfolio = () => {
  const [filter, setFilter] = useState("all");
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  const filtered = filter === "all" ? portfolioItems : portfolioItems.filter((i) => i.category === filter);

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (modalIndex === null) return;
      const next = modalIndex + dir;
      if (next >= 0 && next < filtered.length) setModalIndex(next);
    },
    [modalIndex, filtered.length]
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

  const currentItem = modalIndex !== null ? filtered[modalIndex] : null;

  return (
    <>
      <title>Portfolio — Luxury Event Decoration</title>
      <meta name="description" content="Portfolio of Ki Ki Decor: wedding decoration, birthday décor, proposal styling, corporate events. Over 500 completed projects." />

      {/* Editorial Hero */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          <img
            src={weddingImg}
            alt="Luxury event decoration portfolio"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/10" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-10 pb-12 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="overline text-background/50 mb-4">Our Portfolio</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-background tracking-tight">
              Curated Works
            </h1>
            <p className="text-background/60 font-light text-sm md:text-base mt-4 max-w-lg leading-relaxed">
              A collection of our finest projects — each crafted with love, precision, and an unwavering attention to detail.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="sticky top-[72px] z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex gap-1 md:gap-2 py-4 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setFilter(cat.key); setModalIndex(null); setImageLoaded({}); }}
                className={cn(
                  "px-4 md:px-6 py-2 md:py-2.5 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-500 whitespace-nowrap rounded-none border",
                  filter === cat.key
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border/60 hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="px-4 md:px-6 lg:px-10 py-10 md:py-16">
        <div className="container mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="columns-1 sm:columns-2 lg:columns-3 gap-3 md:gap-4"
            >
              {filtered.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="break-inside-avoid mb-3 md:mb-4"
                >
                  <div
                    className={cn(
                      "group relative overflow-hidden cursor-pointer",
                      heightMap[item.height]
                    )}
                    onClick={() => openModal(i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openModal(i)}
                    aria-label={`View ${item.title}`}
                  >
                    {/* Shimmer placeholder */}
                    {!imageLoaded[i] && (
                      <div className="absolute inset-0 bg-muted animate-pulse" />
                    )}

                    <img
                      src={item.img}
                      alt={item.caption}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-[1.2s] ease-out will-change-transform",
                        "group-hover:scale-110",
                        imageLoaded[i] ? "opacity-100" : "opacity-0"
                      )}
                      loading="lazy"
                      onLoad={() => setImageLoaded((prev) => ({ ...prev, [i]: true }))}
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-5 md:p-8">
                      <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                        <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-primary/80 font-medium mb-2">
                          {categories.find(c => c.key === item.category)?.label}
                        </p>
                        <p className="font-display text-xl md:text-2xl text-background font-light tracking-tight mb-1.5">
                          {item.title}
                        </p>
                        <p className="text-[11px] md:text-xs text-background/50 font-light leading-relaxed line-clamp-2">
                          {item.caption}
                        </p>
                      </div>
                    </div>

                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-primary/60" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Project count */}
      <section className="pb-20 md:pb-32 pt-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground/40 text-[11px] uppercase tracking-[0.3em]">
            Showing {filtered.length} of {portfolioItems.length} projects
          </p>
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
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-background/40 hover:text-background transition-colors duration-300 z-10"
              aria-label="Close"
            >
              <X size={24} strokeWidth={1} />
            </button>

            {modalIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background transition-colors duration-300 z-10"
                aria-label="Previous"
              >
                <ChevronLeft size={32} strokeWidth={1} />
              </button>
            )}

            {modalIndex < filtered.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-background/30 hover:text-background transition-colors duration-300 z-10"
                aria-label="Next"
              >
                <ChevronRight size={32} strokeWidth={1} />
              </button>
            )}

            <div className="flex flex-col items-center max-w-6xl w-full mx-6 md:mx-12" onClick={(e) => e.stopPropagation()}>
              <motion.div
                key={modalIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-h-[72vh] flex items-center justify-center"
              >
                <img
                  src={currentItem.img}
                  alt={currentItem.caption}
                  className="max-w-full max-h-[72vh] object-contain"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-center mt-8"
              >
                <p className="text-[9px] uppercase tracking-[0.35em] text-background/30 mb-2.5">
                  {categories.find(c => c.key === currentItem.category)?.label}
                </p>
                <p className="font-display text-xl md:text-3xl text-background font-light tracking-tight mb-2">
                  {currentItem.title}
                </p>
                <p className="text-xs md:text-sm text-background/40 font-light max-w-md mx-auto">
                  {currentItem.caption}
                </p>
                <div className="flex items-center justify-center gap-2 mt-5">
                  <div className="w-8 h-px bg-background/15" />
                  <p className="text-[10px] text-background/20 tracking-[0.2em]">
                    {modalIndex + 1} / {filtered.length}
                  </p>
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

export default Portfolio;
