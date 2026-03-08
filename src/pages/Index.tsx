import { Link } from "react-router-dom";
import { ArrowRight, Star, Instagram, Quote } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

import heroImg from "@/assets/hero-decoration.jpg";
import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import dessertImg from "@/assets/portfolio-dessert.jpg";

const featuredImages = [weddingImg, birthdayImg, proposalImg, themedImg, detailImg, dessertImg];
const featuredSpans = ["col-span-2 row-span-2", "", "", "col-span-2", "", ""];

const instaImages = [weddingImg, detailImg, loungeImg, birthdayImg, dessertImg, themedImg];

const Index = () => {
  const { lang, t } = useLanguage();
  const idx = t.index;

  return (
    <>
      <title>{lang === "ru" ? "Ki Ki Decor — Декор мероприятий, свадеб и праздников" : "Ki Ki Decor — Event, Wedding & Celebration Decoration"}</title>
      <meta name="description" content={lang === "ru" ? "Ki Ki Decor — профессиональный декор мероприятий: свадьбы, дни рождения, предложения, корпоративы, декор фасадов. По всей России." : "Ki Ki Decor — professional event decoration: weddings, birthdays, proposals, corporate events, facade decor. Across Russia."} />

      {/* Hero */}
      <section className="relative h-screen overflow-hidden -mt-18 md:-mt-24">
        <img
          src={heroImg}
          alt={lang === "ru" ? "Роскошное оформление мероприятия с цветами, свечами и декором от Ki Ki Decor" : "Luxury event decoration with flowers, candles and decor by Ki Ki Decor"}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/15 via-foreground/25 to-foreground/65" />

        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-3xl">
            <div className="w-px h-16 bg-background/30 mx-auto mb-10 animate-fade-up" />
            <p className="overline text-background/60 mb-6 animate-fade-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
              {idx.heroOverline[lang]}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] font-light text-background leading-[1.02] mb-6 animate-fade-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
              Ki Ki Decor
            </h1>
            <p className="font-display text-xl md:text-2xl font-light italic text-background/70 mb-12 animate-fade-up" style={{ animationDelay: "0.45s", opacity: 0 }}>
              {idx.heroTagline[lang]}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-up" style={{ animationDelay: "0.6s", opacity: 0 }}>
              <Link to="/portfolio">
                <Button variant="outline" size="lg" className="btn-glow border-background/30 text-background bg-transparent hover:bg-background/10 font-body text-[10px] uppercase tracking-luxury rounded-none px-8 sm:px-10 py-6 sm:py-7 min-w-0 sm:min-w-[220px] w-full sm:w-auto transition-all duration-500">
                  {idx.portfolioBtn[lang]} <ArrowRight size={14} className="ml-3" />
                </Button>
              </Link>
              <Link to="/booking">
                <Button size="lg" className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground font-body text-[10px] uppercase tracking-luxury rounded-none px-8 sm:px-10 py-6 sm:py-7 min-w-0 sm:min-w-[220px] w-full sm:w-auto transition-all duration-500 shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.4)]">
                  {idx.orderBtn[lang]}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-fade-up" style={{ animationDelay: "0.9s", opacity: 0 }}>
          <div className="w-px h-12 bg-background/20 mx-auto mb-3 animate-float" />
          <p className="overline text-background/30 text-[9px]">{idx.scroll[lang]}</p>
        </div>
      </section>

      {/* Featured Portfolio */}
      <section className="section-padding">
        <div className="container mx-auto">
          <ScrollReveal>
            <p className="overline text-primary mb-5 text-center">{idx.worksOverline[lang]}</p>
            <h2 className="font-display text-4xl md:text-6xl font-light text-center mb-5 leading-tight">
              {idx.worksTitle[lang]}
            </h2>
            <div className="gold-divider" />
            <p className="text-center text-muted-foreground font-light text-sm max-w-lg mx-auto mt-8 mb-16 leading-relaxed">
              {idx.worksSubtitle[lang]}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {idx.featured.map((item, i) => (
              <ScrollReveal key={i} delay={i * 100} className={featuredSpans[i]}>
                <Link to="/portfolio" className="block group overflow-hidden relative aspect-square">
                  <img src={featuredImages[i]} alt={item.title[lang]} className="w-full h-full object-cover transition-all duration-[800ms] group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-600 flex items-end p-5 md:p-8">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-600">
                      <p className="overline text-background/50 mb-1.5 text-[9px]">{item.category[lang]}</p>
                      <p className="font-display text-lg md:text-xl text-background font-light">{item.title[lang]}</p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={600}>
            <div className="text-center mt-14">
              <Link to="/portfolio" className="inline-flex items-center overline text-primary hover:text-primary/80 transition-colors duration-300 group">
                {idx.viewAll[lang]}
                <ArrowRight size={14} className="ml-3 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-secondary/60">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="overline text-primary mb-5 text-center">{idx.testimonialsOverline[lang]}</p>
            <h2 className="font-display text-4xl md:text-6xl font-light text-center mb-5 leading-tight">
              {idx.testimonialsTitle[lang]}
            </h2>
            <div className="gold-divider mb-16" />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {t.testimonials.map((testimonial, i) => (
              <ScrollReveal key={testimonial.name} delay={i * 150}>
                <div className="luxury-card p-8 md:p-10 h-full flex flex-col">
                  <Quote size={28} className="text-primary/25 mb-6" strokeWidth={1} />
                  <p className="text-sm font-light leading-[1.9] text-foreground/75 flex-1 mb-8 italic">
                    «{testimonial.text[lang]}»
                  </p>
                  <div className="flex items-center gap-1.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={11} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-display text-lg font-medium">{testimonial.name}</p>
                  <p className="overline text-muted-foreground mt-1.5 text-[9px]">{testimonial.event}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="section-padding">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-5">
              <Instagram size={16} className="text-primary" strokeWidth={1.5} />
              <p className="overline text-primary">{idx.followOverline[lang]}</p>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-light text-center mb-4 leading-tight">
              Instagram
            </h2>
            <p className="text-center text-muted-foreground font-light text-sm mb-14">@ki_ki_decor</p>
          </ScrollReveal>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {instaImages.map((img, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer" className="block group overflow-hidden relative aspect-square">
                  <img src={img} alt={idx.instaAlts[i][lang]} className="w-full h-full object-cover transition-all duration-[600ms] group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-400 flex items-center justify-center">
                    <Instagram size={20} className="text-background opacity-0 group-hover:opacity-100 transition-opacity duration-400" strokeWidth={1.5} />
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={loungeImg} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="relative z-10 section-padding">
          <div className="container mx-auto max-w-2xl text-center">
            <ScrollReveal>
              <p className="overline text-primary mb-5">{idx.ctaOverline[lang]}</p>
              <h2 className="font-display text-4xl md:text-6xl font-light text-background leading-tight mb-6">
                {idx.ctaTitle[lang]}
              </h2>
              <p className="text-background/60 font-light text-sm md:text-base mb-12 max-w-lg mx-auto leading-relaxed">
                {idx.ctaText[lang]}
              </p>
              <Link to="/booking">
                <Button size="lg" className="rounded-none text-[10px] uppercase tracking-luxury px-14 py-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.4)] transition-all duration-500">
                  {idx.orderBtn[lang]}
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
