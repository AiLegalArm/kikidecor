import { Link } from "react-router-dom";
import { ArrowRight, Star, Quote, Instagram, Mail, Phone } from "lucide-react";
import { lazy, Suspense } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";

import heroDecor from "@/assets/hero-decor.jpg";
import heroShowroom from "@/assets/hero-showroom.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
const SignatureDecor = lazy(() => import("@/components/SignatureDecor"));

const Home = () => {
  const { lang, t } = useLanguage();
  const testimonials = t.testimonials;

  return (
    <>
      <title>KiKi — Luxury Events & Fashion</title>
      <meta name="description" content="KiKi — premium lifestyle brand combining luxury event decoration studio and fashion showroom. Beauty in every detail." />

      {/* ═══ HERO — Full-bleed cinematic ═══ */}
      <section className="relative h-screen overflow-hidden">
        {/* Split background */}
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

        {/* Center divider */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-background/8 z-10 hidden md:block" />

        {/* Vignette */}
        <div className="absolute inset-0 z-[5]" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(0 0% 0% / 0.4) 100%)" }} />

        {/* Content */}
        <div className="relative z-20 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <div className="w-px h-16 bg-background/15 mx-auto mb-8 animate-reveal" style={{ animationDelay: "0.3s" }} />
            <h1 className="font-display text-7xl md:text-9xl lg:text-[10rem] font-light text-background leading-none tracking-[-0.03em] mb-4 animate-reveal" style={{ animationDelay: "0.5s" }}>
              KiKi
            </h1>
            <p className="font-body text-[10px] md:text-xs uppercase tracking-[0.5em] text-background/40 mb-16 animate-reveal" style={{ animationDelay: "0.7s" }}>
              {t.home.subtitle[lang]}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-reveal" style={{ animationDelay: "1s" }}>
              <Link to="/decor" className="group inline-flex items-center gap-3 px-10 py-4 bg-background text-foreground text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-700">
                {t.home.exploreDecor[lang]}
                <ArrowRight size={12} className="transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <Link to="/showroom" className="group inline-flex items-center gap-3 px-10 py-4 border border-background/20 text-background text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-background hover:text-foreground transition-all duration-700">
                {t.home.visitShowroom[lang]}
                <ArrowRight size={12} className="transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <div className="flex flex-col items-center gap-3 animate-reveal" style={{ animationDelay: "2s" }}>
            <div className="w-px h-10 bg-background/15 animate-scroll-pulse" />
            <p className="text-[8px] uppercase tracking-[0.4em] text-background/20 font-body">{t.home.scroll[lang]}</p>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ═══ TWO WORLDS ═══ */}
      <section className="px-6 md:px-10 py-24 md:py-36">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-20">
              <p className="overline text-primary mb-4">{t.home.discoverOverline[lang]}</p>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light leading-[1.05]">
                {t.home.twoWorldsTitle[lang]} <span className="italic">KiKi</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { to: "/decor", img: heroDecor, alt: "KiKi Decor", division: t.home.divisionI[lang], title: "KiKi", titleItalic: "Decor", desc: t.home.decorDescription[lang], cta: t.home.exploreDecor[lang] },
              { to: "/showroom", img: heroShowroom, alt: "KiKi Showroom", division: t.home.divisionII[lang], title: "KiKi", titleItalic: "Showroom", desc: t.home.showroomDescription[lang], cta: t.home.visitShowroom[lang] },
            ].map((item, i) => (
              <ScrollReveal key={item.to} delay={i * 150}>
                <Link to={item.to} className="group block relative overflow-hidden aspect-[3/4]">
                  <img src={item.img} alt={item.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-[1.05]" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/25 to-transparent transition-all duration-700 group-hover:from-foreground/85" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-primary/60 mb-3 font-body">{item.division}</p>
                    <h3 className="font-display text-4xl md:text-5xl font-light text-background mb-3 leading-[1.1]">
                      {item.title} <span className="italic">{item.titleItalic}</span>
                    </h3>
                    <p className="text-sm text-background/45 font-light max-w-sm mb-6 leading-[1.8]">{item.desc}</p>
                    <span className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-background/70 group-hover:text-background transition-colors duration-500 font-body font-medium">
                      {item.cta}
                      <ArrowRight size={12} className="transition-transform duration-500 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SIGNATURE DECOR ═══ */}
      <Suspense fallback={<div className="h-96" />}>
        <SignatureDecor />
      </Suspense>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="px-6 md:px-10 py-24 md:py-36">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="overline text-primary mb-4 text-center">{t.home.testimonialsOverline[lang]}</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-center mb-4 leading-tight">
              {t.home.testimonialsTitle[lang]}
            </h2>
            <div className="gold-divider mb-16" />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tItem, i) => (
              <ScrollReveal key={tItem.name} delay={i * 100}>
                <div className="border border-border/50 p-8 md:p-10 h-full flex flex-col hover:border-primary/20 transition-colors duration-700">
                  <Quote size={20} className="text-primary/15 mb-6" strokeWidth={1} />
                  <p className="text-sm font-light leading-[2] text-foreground/65 flex-1 mb-8 italic">
                    «{tItem.text[lang]}»
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={9} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-display text-base font-medium">{tItem.name}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1 font-body">{tItem.event}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden">
        <img src={loungeImg} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-foreground/65" />
        <div className="relative z-10 px-6 md:px-10 py-28 md:py-40">
          <div className="container mx-auto max-w-3xl text-center">
            <ScrollReveal>
              <p className="overline text-primary mb-5">{t.home.ctaOverline[lang]}</p>
              <h2 className="font-display text-4xl md:text-6xl font-light text-background leading-tight mb-5">
                {t.home.ctaTitle[lang]} <span className="italic">{t.home.ctaTitleItalic[lang]}</span>?
              </h2>
              <p className="text-background/45 font-light text-sm md:text-base mb-12 max-w-lg mx-auto leading-relaxed">
                {t.home.ctaSubtitle[lang]}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/booking" className="btn-glow inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-primary/90 transition-all duration-500">
                  {t.home.bookConsultation[lang]}
                </Link>
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-background/25 text-background text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-background hover:text-foreground transition-all duration-500">
                  {t.home.contactUs[lang]}
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 text-background/30">
                <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-300">
                  <Instagram size={17} strokeWidth={1.5} />
                </a>
                <a href="mailto:info@kikidecor.ru" className="hover:text-primary transition-colors duration-300">
                  <Mail size={17} strokeWidth={1.5} />
                </a>
                <a href="tel:+79001234567" className="hover:text-primary transition-colors duration-300">
                  <Phone size={17} strokeWidth={1.5} />
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
