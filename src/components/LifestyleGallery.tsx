import { useState } from "react";
import { Instagram, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import dessertImg from "@/assets/portfolio-dessert.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import corporateImg from "@/assets/portfolio-corporate.jpg";

type GalleryItem = {
  img: string;
  alt: string;
  brand: "decor" | "showroom";
  label: string;
  span?: string;
  instaUrl: string;
};

const galleryItems: GalleryItem[] = [
  {
    img: weddingImg,
    alt: "Luxury wedding arch with white florals",
    brand: "decor",
    label: "Wedding Arch",
    span: "md:col-span-2 md:row-span-2",
    instaUrl: "https://instagram.com/ki_ki_decor",
  },
  {
    img: detailImg,
    alt: "Floral arrangement detail",
    brand: "decor",
    label: "Floral Detail",
    instaUrl: "https://instagram.com/ki_ki_decor",
  },
  {
    img: corporateImg,
    alt: "Fashion styling editorial",
    brand: "showroom",
    label: "Editorial Look",
    instaUrl: "https://instagram.com/ki_ki_showroom",
  },
  {
    img: loungeImg,
    alt: "Lounge zone styling",
    brand: "decor",
    label: "Lounge Zone",
    span: "md:col-span-2",
    instaUrl: "https://instagram.com/ki_ki_decor",
  },
  {
    img: birthdayImg,
    alt: "Birthday celebration setup",
    brand: "decor",
    label: "Birthday Glow",
    instaUrl: "https://instagram.com/ki_ki_decor",
  },
  {
    img: proposalImg,
    alt: "Curated fashion accessories",
    brand: "showroom",
    label: "Accessories",
    instaUrl: "https://instagram.com/ki_ki_showroom",
  },
  {
    img: dessertImg,
    alt: "Dessert table styling",
    brand: "decor",
    label: "Dessert Table",
    instaUrl: "https://instagram.com/ki_ki_decor",
  },
  {
    img: themedImg,
    alt: "Fashion showroom interior",
    brand: "showroom",
    label: "Showroom Vibes",
    span: "md:col-span-2",
    instaUrl: "https://instagram.com/ki_ki_showroom",
  },
];

const LifestyleGallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-center gap-3 mb-5">
            <Instagram size={16} className="text-primary" strokeWidth={1.5} />
            <p className="overline text-primary">Our Lifestyle</p>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-center mb-4">
            Life Through <span className="italic">KiKi</span>
          </h2>
          <p className="text-center text-muted-foreground font-light text-sm max-w-md mx-auto mb-6">
            Events, fashion, beauty — a glimpse into both worlds.
          </p>
          <div className="flex items-center justify-center gap-6 mb-14">
            <a
              href="https://instagram.com/ki_ki_decor"
              target="_blank"
              rel="noopener noreferrer"
              className="overline text-muted-foreground hover:text-primary transition-colors duration-300 text-[9px]"
            >
              @ki_ki_decor
            </a>
            <span className="w-px h-3 bg-border" />
            <a
              href="https://instagram.com/ki_ki_showroom"
              target="_blank"
              rel="noopener noreferrer"
              className="overline text-muted-foreground hover:text-primary transition-colors duration-300 text-[9px]"
            >
              @ki_ki_showroom
            </a>
          </div>
        </ScrollReveal>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[200px] md:auto-rows-[260px]">
          {galleryItems.map((item, i) => (
            <ScrollReveal key={i} delay={i * 60} className={item.span}>
              <button
                onClick={() => setSelectedImage(item)}
                className="group block w-full h-full relative overflow-hidden cursor-pointer text-left"
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.08]"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-500 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <Instagram size={20} className="text-background" strokeWidth={1.5} />
                  <span className="text-[9px] uppercase tracking-[0.3em] text-background/80">
                    {item.brand === "decor" ? "KiKi Decor" : "KiKi Showroom"}
                  </span>
                </div>
                {/* Brand badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[8px] uppercase tracking-[0.2em] px-2.5 py-1 font-medium backdrop-blur-md ${
                    item.brand === "decor"
                      ? "bg-primary/20 text-background"
                      : "bg-background/20 text-background"
                  }`}>
                    {item.brand === "decor" ? "Decor" : "Showroom"}
                  </span>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>

        {/* Follow links */}
        <ScrollReveal delay={500}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14">
            <a
              href="https://instagram.com/ki_ki_decor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-500"
            >
              <Instagram size={13} strokeWidth={1.5} />
              Follow KiKi Decor
            </a>
            <a
              href="https://instagram.com/ki_ki_showroom"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-500"
            >
              <Instagram size={13} strokeWidth={1.5} />
              Follow KiKi Showroom
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* ── Modal Preview ── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative max-w-4xl w-full max-h-[85vh] bg-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <img
                src={selectedImage.img}
                alt={selectedImage.alt}
                className="w-full max-h-[70vh] object-cover"
              />

              {/* Info bar */}
              <div className="p-6 md:p-8 flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-light mb-1">{selectedImage.label}</p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                    {selectedImage.brand === "decor" ? "KiKi Decor" : "KiKi Showroom"}
                  </p>
                </div>
                <a
                  href={selectedImage.instaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-400"
                >
                  <ExternalLink size={12} />
                  View on Instagram
                </a>
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 text-background/70 hover:text-background transition-colors duration-300"
                aria-label="Close"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LifestyleGallery;
