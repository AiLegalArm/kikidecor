import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoHero from "@/assets/logo-kiki-new.png";
// @ts-ignore
import "@fontsource/great-vibes";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { motion, AnimatePresence } from "framer-motion";

import heroDecor from "@/assets/hero-decor.jpg";
import portraitImg from "@/assets/about-portrait.jpg";

type FeaturedWork = {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  cover_image_url: string;
  category?: { name: string; name_en: string | null } | null;
};

const Home = () => {
  const { lang, t } = useLanguage();
  const [storyOpen, setStoryOpen] = useState(false);
  const [featured, setFeatured] = useState<FeaturedWork[]>([]);
  const [stats, setStats] = useState({ works: 0, categories: 0, leads: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [works, cats, leads, featuredWorks] = await Promise.all([
        supabase.from("works").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("event_leads").select("id", { count: "exact", head: true }),
        supabase.from("works").select("id, slug, title, title_en, cover_image_url, category:categories(name, name_en)").eq("status", "published").order("featured", { ascending: false }).order("sort_order", { ascending: true }).limit(3),
      ]);
      if (cancelled) return;
      setStats({ works: works.count || 0, categories: cats.count || 0, leads: leads.count || 0 });
      if (featuredWorks.data) setFeatured(featuredWorks.data as any);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <title>KiKi — Luxury Events & Fashion</title>
      <meta name="description" content="KiKi — premium lifestyle brand combining luxury event decoration studio and fashion showroom. Beauty in every detail." />

      {/* ═══ HERO ═══ */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroDecor} alt="" className="absolute inset-0 w-full h-full object-cover animate-hero-zoom-in" loading="eager" />
          <div className="absolute inset-0 bg-foreground/45" />
        </div>
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
            <p className="animate-reveal text-background/70 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]" style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(1rem, 2.5vw, 1.5rem)", animationDelay: "0.65s" }}>
              By Kris
            </p>
            <p
              className="animate-reveal text-background/90 tracking-wide mb-8 md:mb-12 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                animationDelay: "0.8s",
              }}
            >
              {lang === "ru" ? "Роскошь в каждой детали" : "Luxury in every detail"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center animate-reveal px-4 sm:px-0" style={{ animationDelay: "1.2s" }}>
              <Link
                to="/decor"
                className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-14 py-4 sm:py-6 text-[11px] sm:text-[12px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold overflow-hidden transition-all duration-700 min-w-0 sm:min-w-[240px]"
              >
                <span className="absolute inset-0 bg-background/90 backdrop-blur-sm border border-background/20 transition-all duration-700 group-hover:bg-primary group-hover:border-primary/60" />
                <span className="relative z-10 text-foreground group-hover:text-primary-foreground transition-colors duration-500">{t.home.exploreDecor[lang]}</span>
                <ArrowRight size={14} className="relative z-10 text-foreground group-hover:text-primary-foreground transition-all duration-500 group-hover:translate-x-1.5" />
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

      {/* ═══ MANIFESTO ═══ */}
      <section className="bg-background py-24 md:py-36 px-6 md:px-12">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-semibold mb-8">{lang === "ru" ? "Манифест" : "Manifesto"}</p>
            <p className="font-display text-3xl md:text-5xl lg:text-6xl font-light leading-[1.15] tracking-tight text-foreground italic">
              {lang === "ru"
                ? "Мы создаём атмосферу, которая остаётся в памяти дольше, чем сам вечер."
                : "We craft atmospheres that linger in memory longer than the evening itself."}
            </p>
            <div className="w-12 h-px bg-primary/50 mx-auto my-10" />
            <p className="text-sm md:text-base text-foreground/70 font-normal leading-[1.9] max-w-xl mx-auto">
              {t.about.heroParagraph1[lang]}
            </p>
            <button
              onClick={() => setStoryOpen(true)}
              className="mt-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-foreground/70 hover:text-primary transition-colors duration-500 font-semibold border-b border-foreground/20 hover:border-primary pb-1"
            >
              {lang === "ru" ? "История бренда" : "Brand story"} <ArrowRight size={12} />
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FEATURED WORKS ═══ */}
      {featured.length > 0 && (
        <section className="bg-secondary/30 py-20 md:py-32 px-6 md:px-12 lg:px-20">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-12 md:mb-16 border-b border-border/60 pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-semibold mb-3">{lang === "ru" ? "Избранные работы" : "Selected Works"}</p>
                  <h2 className="font-display text-3xl md:text-5xl font-light tracking-tight">{lang === "ru" ? "Портфолио" : "Portfolio"}</h2>
                </div>
                <Link to="/portfolio" className="hidden md:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-foreground/70 hover:text-primary border-b border-foreground/20 hover:border-primary pb-1">
                  {lang === "ru" ? "Смотреть все" : "View all"} <ArrowRight size={12} />
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {featured.map((w, i) => {
                const title = lang === "en" && w.title_en ? w.title_en : w.title;
                const cat = w.category ? (lang === "en" && w.category.name_en ? w.category.name_en : w.category.name) : "";
                return (
                  <ScrollReveal key={w.id} delay={i * 100}>
                    <Link to={`/portfolio/${w.slug}`} className="group block">
                      <div className={`relative overflow-hidden ${i === 1 ? "aspect-[3/4] md:mt-12" : "aspect-[4/5]"}`}>
                        <img src={w.cover_image_url} alt={title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.2s] ease-out group-hover:scale-[1.05]" />
                      </div>
                      <div className="pt-5">
                        <p className="font-display text-3xl md:text-4xl font-light text-border/60 leading-none mb-2">{String(i + 1).padStart(2, "0")}</p>
                        {cat && <p className="text-[9px] uppercase tracking-[0.35em] text-primary font-semibold mb-1">{cat}</p>}
                        <p className="font-display text-xl md:text-2xl font-light text-foreground group-hover:text-primary transition-colors duration-300">{title}</p>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
            <div className="mt-12 md:hidden text-center">
              <Link to="/portfolio" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-foreground/70 hover:text-primary border-b border-foreground/20 pb-1">
                {lang === "ru" ? "Смотреть все работы" : "View all works"} <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ NUMBERS ═══ */}
      {stats.works > 0 && (
        <section className="border-y border-border/60 py-16 md:py-20 px-6 bg-background">
          <div className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { v: stats.works, l: lang === "ru" ? "Опубликованных работ" : "Published works" },
              { v: stats.categories, l: lang === "ru" ? "Направлений декора" : "Decor directions" },
              { v: "Rostov · Gelendzhik", l: lang === "ru" ? "География" : "Locations" },
              { v: "By Kris", l: lang === "ru" ? "Автор и руководитель" : "Founder & Lead" },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div>
                  <p className="font-display text-3xl md:text-5xl font-light text-foreground tracking-tight">{s.v}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-3 font-semibold">{s.l}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══ PACKAGES TEASER ═══ */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-14 md:mb-20">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-semibold mb-4">{t.packages.overline[lang]}</p>
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">{t.packages.title[lang]}</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {t.packagesData.items.map((pkg, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <Link to="/packages" className="group block border border-border/60 hover:border-foreground/40 p-7 md:p-10 transition-all duration-500 hover:shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.15)] h-full">
                  <p className="font-display text-3xl font-light text-border leading-none mb-4">{String(i + 1).padStart(2, "0")}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold mb-2">{pkg.subtitle[lang]}</p>
                  <h3 className="font-display text-2xl md:text-3xl font-light tracking-tight mb-5">{pkg.name[lang]}</h3>
                  <div className="w-8 h-px bg-primary/40 mb-5" />
                  <p className="font-display text-2xl text-primary mb-6">{pkg.price[lang]}</p>
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-foreground/70 group-hover:text-primary transition-colors border-b border-foreground/20 group-hover:border-primary pb-1">
                    {lang === "ru" ? "Подробнее" : "Details"} <ArrowRight size={12} />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <img src={heroDecor} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-foreground/65" />
        <div className="relative z-10 h-full container mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-background/60 font-semibold mb-6">{lang === "ru" ? "Создадим вместе" : "Let us create together"}</p>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-background leading-[1.05] tracking-tight max-w-3xl">
              {lang === "ru" ? "Ваше событие" : "Your event"}<br />
              <span className="italic text-background/70">{lang === "ru" ? "заслуживает большего" : "deserves more"}</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link to="/booking" className="inline-flex items-center gap-3 px-10 py-4 bg-background text-foreground text-[11px] uppercase tracking-[0.3em] font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-500 justify-center">
                {lang === "ru" ? "Забронировать дату" : "Book a date"} <ArrowRight size={14} />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-4 border border-background/40 text-background text-[11px] uppercase tracking-[0.3em] font-semibold hover:bg-background hover:text-foreground transition-colors duration-500 justify-center">
                {lang === "ru" ? "Написать нам" : "Get in touch"}
              </Link>
            </div>
          </ScrollReveal>
        </div>
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
