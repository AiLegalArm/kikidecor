// @ts-ignore
import "@fontsource/great-vibes";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";
import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import corporateImg from "@/assets/portfolio-corporate.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";
import logoDecor from "@/assets/logo-decor.png";

const serviceImages = [themedImg, weddingImg, birthdayImg, detailImg, proposalImg, corporateImg];

const Services = () => {
  const { lang, t } = useLanguage();
  const s = t.services;
  const a = t.about;

  return (
    <>
      <title>{s.title[lang]}</title>

      {/* Header */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 px-6 md:px-10">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            {/* Logo */}
            <div className="mb-8 md:mb-10">
              <img src={logoDecor} alt="KiKi Decor" className="mx-auto w-48 sm:w-56 md:w-64 h-auto" />
              <p className="mt-2 text-foreground/60" style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)" }}>
                By Kris
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-[0.35em] font-body mb-4 text-secondary-foreground font-semibold">{s.overline[lang]}</p>
            <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-light mb-5 leading-[1.05] text-foreground">{s.title[lang]}</h1>
            <div className="gold-divider" />
            <p className="text-foreground/70 text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed font-medium">{s.subtitle[lang]}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* About KiKi Decor intro */}
      <section className="px-6 md:px-10 pb-16 md:pb-24">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-foreground font-normal text-sm md:text-base leading-[1.9] mb-4">
              {a.heroParagraph1[lang]}
            </p>
            <p className="text-foreground/80 font-normal text-sm leading-[1.9]">
              {a.heroParagraph2[lang]}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="px-6 md:px-10 pb-24 md:pb-36">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-12">{a.ourServices[lang]}</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {s.items.map((service, i) =>
            <ScrollReveal key={i} delay={i * 80}>
                <div className="group relative overflow-hidden aspect-[3/4] sm:aspect-[4/5] cursor-pointer">
                  <img src={serviceImages[i]} alt={service.title[lang]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-[1.05]" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 transition-all duration-700 group-hover:from-black/95" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 md:p-8">
                    <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-light text-white mb-1.5 sm:mb-2">{service.title[lang]}</h2>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-3 sm:mb-4 max-w-xs font-semibold">{service.desc[lang]}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg sm:text-xl font-semibold text-primary-foreground">{service.price[lang]}</p>
                      <Link to="/booking" className="text-[9px] uppercase tracking-[0.25em] text-white/80 hover:text-white transition-colors duration-300 font-body">
                        {s.order[lang]} →
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 px-6 md:px-10 py-24 md:py-32">
        <div className="container mx-auto text-center max-w-2xl">
          <ScrollReveal>
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-light mb-5">{s.customTitle[lang]}</h2>
            <p className="text-muted-foreground font-light text-sm mb-10 leading-relaxed">{s.customText[lang]}</p>
            <Link to="/booking" className="group inline-flex items-center gap-3 px-6 sm:px-10 py-3.5 sm:py-4 border border-foreground/15 text-foreground text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-foreground hover:text-background transition-all duration-500 font-body">
              {s.discussProject[lang]}
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>);

};

export default Services;