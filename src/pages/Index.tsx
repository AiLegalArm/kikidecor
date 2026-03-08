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

      {/* Social Links */}
      <section className="section-padding bg-secondary/15">
        <div className="container mx-auto max-w-2xl">
          <ScrollReveal>
            <p className="overline text-primary mb-4 text-center">{lang === "ru" ? "Мы на связи" : "Stay Connected"}</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-center mb-10">
              {lang === "ru" ? "Свяжитесь с нами" : "Get in Touch"}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://www.instagram.com/ki_ki_decor?igsh=OWx0dWNvdHdjeWly" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-all duration-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Instagram
              </a>
              <a href="https://wa.me/79882598522" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-all duration-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </ScrollReveal>
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
