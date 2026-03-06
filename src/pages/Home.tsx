import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import logoHero from "@/assets/logo-kiki-new.png";
// @ts-ignore
import "@fontsource/great-vibes";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

import heroDecor from "@/assets/hero-decor.jpg";
import heroShowroom from "@/assets/hero-showroom.jpg";
import portraitImg from "@/assets/about-portrait.jpg";

const Home = () => {
  const { lang, t } = useLanguage();
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <>
      <title>KiKi — Luxury Events & Fashion</title>
      <meta name="description" content="KiKi — premium lifestyle brand combining luxury event decoration studio and fashion showroom. Beauty in every detail." />

      {/* ═══ HERO ═══ */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 relative overflow-hidden">
            <img src={heroDecor} alt="" className="absolute inset-0 w-full h-full object-cover animate-hero-zoom-in" loading="eager" />
            <div className="absolute inset-0 bg-foreground/45" />
          </div>
          <div className="w-1/2 relative overflow-hidden">
            <img src={heroShowroom} alt="" className="absolute inset-0 w-full h-full object-cover animate-hero-zoom-out" loading="eager" />
            <div className="absolute inset-0 bg-foreground/45" />
          </div>
        </div>
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-background/8 z-10 hidden md:block" />
        <div className="absolute inset-0 z-[5]" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(0 0% 0% / 0.4) 100%)" }} />

        <div className="relative z-20 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <div className="w-px h-10 md:h-16 bg-background/15 mx-auto mb-6 md:mb-8 animate-reveal" style={{ animationDelay: "0.3s" }} />
            <div className="relative w-44 sm:w-60 md:w-72 lg:w-80 mx-auto mb-4 md:mb-6 animate-reveal" style={{ animationDelay: "0.5s" }}>
              <img
                src={logoHero}
                alt="KiKi — Luxury Events & Fashion"
                className="relative w-full h-auto drop-shadow-[0_4px_40px_rgba(0,0,0,0.35)]"
              />
            </div>
            <p
              className="animate-reveal text-background/90 tracking-wide mb-8 md:mb-12 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                animationDelay: "0.8s",
              }}
            >
              Роскошь в каждой детали
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center animate-reveal px-6 sm:px-0" style={{ animationDelay: "1.2s" }}>
              <Link
                to="/decor"
                className="group relative inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-5 sm:py-6 text-[12px] uppercase tracking-[0.3em] font-bold overflow-hidden transition-all duration-700 min-w-[240px]"
              >
                <span className="absolute inset-0 bg-background/90 backdrop-blur-sm border border-background/20 transition-all duration-700 group-hover:bg-primary group-hover:border-primary/60" />
                <span className="relative z-10 text-foreground group-hover:text-primary-foreground transition-colors duration-500">{t.home.exploreDecor[lang]}</span>
                <ArrowRight size={15} className="relative z-10 text-foreground group-hover:text-primary-foreground transition-all duration-500 group-hover:translate-x-1.5" />
              </Link>
              <Link
                to="/showroom"
                className="group relative inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-5 sm:py-6 text-[12px] uppercase tracking-[0.3em] font-bold overflow-hidden transition-all duration-700 min-w-[240px]"
              >
                <span className="absolute inset-0 border-2 border-background/40 transition-all duration-700 group-hover:border-primary/60 group-hover:bg-background/10" />
                <span className="relative z-10 text-background group-hover:text-primary transition-colors duration-500">{t.home.visitShowroom[lang]}</span>
                <ArrowRight size={15} className="relative z-10 text-background group-hover:text-primary transition-all duration-500 group-hover:translate-x-1.5" />
              </Link>
            </div>

            {/* Brand Story trigger */}
            <button
              onClick={() => setStoryOpen(true)}
              className="mt-12 text-[13px] uppercase tracking-[0.35em] text-background/80 hover:text-background transition-colors duration-500 font-body font-bold animate-reveal border-b border-background/30 pb-1 hover:border-background/60"
              style={{ animationDelay: "1.4s" }}
            >
              {t.home.storyOverline[lang]}
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <div className="flex flex-col items-center gap-3 animate-reveal" style={{ animationDelay: "2s" }}>
            <div className="w-px h-10 bg-background/15 animate-scroll-pulse" />
            <p className="text-[8px] uppercase tracking-[0.4em] text-background/20 font-body">{t.home.scroll[lang]}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ═══ BRAND STORY MODAL ═══ */}
      <AnimatePresence>
        {storyOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-foreground/60 backdrop-blur-md"
              onClick={() => setStoryOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              className="relative z-10 w-[90vw] max-w-4xl max-h-[85vh] overflow-y-auto bg-background border border-border/40"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ boxShadow: "var(--shadow-elevated)" }}
            >
              <button
                onClick={() => setStoryOpen(false)}
                className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-[4/5] md:aspect-auto overflow-hidden">
                  <img
                    src={portraitImg}
                    alt="KiKi Brand"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-background/20 to-transparent md:hidden" />
                </div>

                {/* Text */}
                <div className="p-8 md:p-12 lg:p-16 flex items-center">
                  <div>
                    <p className="overline text-primary mb-5">{t.home.storyOverline[lang]}</p>
                    <h2 className="font-display text-3xl md:text-4xl font-light mb-6 leading-[1.1] text-foreground">
                      {t.home.storyTitle1[lang]} <span className="italic">{t.home.storyTitle2[lang]}</span> KiKi
                    </h2>
                    <div className="w-12 h-px bg-primary/40 mb-6" />
                    <p className="text-foreground/85 font-light leading-[1.9] text-[15px] mb-5">
                      {t.home.storyParagraph1[lang]}
                    </p>
                    <p className="text-foreground/85 font-light leading-[1.9] text-[15px] mb-6">
                      {t.home.storyParagraph2[lang]}
                    </p>
                    <p className="font-display text-base italic text-primary leading-relaxed">
                      {t.home.storyPhilosophy[lang]}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Home;
