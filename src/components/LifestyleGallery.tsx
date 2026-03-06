import { useState } from "react";
import { Instagram, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";

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
  { img: weddingImg, alt: "Luxury wedding arch", brand: "decor", label: "Wedding Arch", span: "md:col-span-2 md:row-span-2", instaUrl: "https://instagram.com/ki_ki_decor" },
  { img: detailImg, alt: "Floral detail", brand: "decor", label: "Floral Detail", instaUrl: "https://instagram.com/ki_ki_decor" },
  { img: corporateImg, alt: "Fashion editorial", brand: "showroom", label: "Editorial Look", instaUrl: "https://instagram.com/ki_ki_showroom" },
  { img: loungeImg, alt: "Lounge zone", brand: "decor", label: "Lounge Zone", span: "md:col-span-2", instaUrl: "https://instagram.com/ki_ki_decor" },
  { img: birthdayImg, alt: "Birthday celebration", brand: "decor", label: "Birthday Glow", instaUrl: "https://instagram.com/ki_ki_decor" },
  { img: proposalImg, alt: "Accessories", brand: "showroom", label: "Accessories", instaUrl: "https://instagram.com/ki_ki_showroom" },
  { img: dessertImg, alt: "Dessert table", brand: "decor", label: "Dessert Table", instaUrl: "https://instagram.com/ki_ki_decor" },
  { img: themedImg, alt: "Showroom interior", brand: "showroom", label: "Showroom Vibes", span: "md:col-span-2", instaUrl: "https://instagram.com/ki_ki_showroom" },
];

const LifestyleGallery = () => {
  const { lang, t } = useLanguage();
  const lg = t.lifestyle;
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-3 mb-5">
            <Instagram size={16} className="text-primary" strokeWidth={1.5} />
            <p className="overline text-primary">{lg.overline[lang]}</p>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-center mb-4">
            {lg.title[lang]} <span className="italic">KiKi</span>
          </h2>
          <p className="text-center text-muted-foreground font-light text-sm max-w-md mx-auto mb-6">{lg.subtitle[lang]}</p>
          <div className="flex items-center justify-center gap-6 mb-14">
            <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer" className="overline text-muted-foreground hover:text-primary transition-colors duration-300 text-[9px]">@ki_ki_decor</a>
            <span className="w-px h-3 bg-border" />
            <a href="https://instagram.com/ki_ki_showroom" target="_blank" rel="noopener noreferrer" className="overline text-muted-foreground hover:text-primary transition-colors duration-300 text-[9px]">@ki_ki_showroom</a>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[200px] md:auto-rows-[260px]">
          {galleryItems.map((item, i) => (
            <ScrollReveal key={i} delay={i * 60} className={item.span}>
              <button onClick={() => setSelectedImage(item)} className="group block w-full h-full relative overflow-hidden cursor-pointer text-left">
                <img src={item.img} alt={item.alt} className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.08]" loading="lazy" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-500 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <Instagram size={20} className="text-background" strokeWidth={1.5} />
                  <span className="text-[9px] uppercase tracking-[0.3em] text-background/80">{item.brand === "decor" ? "KiKi Decor" : "KiKi Showroom"}</span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`text-[8px] uppercase tracking-[0.2em] px-2.5 py-1 font-medium backdrop-blur-md ${item.brand === "decor" ? "bg-primary/20 text-background" : "bg-background/20 text-background"}`}>
                    {item.brand === "decor" ? "Decor" : "Showroom"}
                  </span>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={500}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14">
            <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-500">
              <Instagram size={13} strokeWidth={1.5} />
              {lg.followDecor[lang]}
            </a>
            <a href="https://instagram.com/ki_ki_showroom" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-500">
              <Instagram size={13} strokeWidth={1.5} />
              {lg.followShowroom[lang]}
            </a>
          </div>
        </ScrollReveal>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4 md:p-10" onClick={() => setSelectedImage(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="relative max-w-4xl w-full max-h-[85vh] bg-card overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage.img} alt={selectedImage.alt} className="w-full max-h-[70vh] object-cover" />
              <div className="p-6 md:p-8 flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-light mb-1">{selectedImage.label}</p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{selectedImage.brand === "decor" ? "KiKi Decor" : "KiKi Showroom"}</p>
                </div>
                <a href={selectedImage.instaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-400">
                  <ExternalLink size={12} />
                  {lg.viewOnInstagram[lang]}
                </a>
              </div>
              <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 text-background/70 hover:text-background transition-colors duration-300" aria-label="Close">
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
