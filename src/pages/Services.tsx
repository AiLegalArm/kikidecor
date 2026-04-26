// @ts-ignore
import "@fontsource/great-vibes";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
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

  useSEO({
    title: lang === "ru" ? "Услуги декора — Ki Ki Decor" : "Decor Services — Ki Ki Decor",
    description: lang === "ru"
      ? "Полный спектр оформления: свадьбы, дни рождения, предложения, корпоративы, тематические события."
      : "Full-service event styling: weddings, birthdays, proposals, corporates, themed events.",
    canonical: "https://kiki-shop.online/decor",
  });

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

      {/* Services — Editorial list */}
      <section className="px-6 md:px-10 pb-24 md:pb-36">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-16 md:mb-24 border-b border-border/60 pb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-semibold mb-3">{s.overline[lang]}</p>
                <h2 className="font-display text-3xl md:text-5xl font-light leading-[1]">{a.ourServices[lang]}</h2>
              </div>
              <p className="hidden md:block font-display text-6xl font-light text-border">{String(s.items.length).padStart(2, "0")}</p>
            </div>
          </ScrollReveal>

          <div className="flex flex-col">
            {s.items.map((service, i) => {
              const number = String(i + 1).padStart(2, "0");
              const imageRight = i % 2 === 0;
              return (
                <ScrollReveal key={i} delay={i * 60}>
                  <article className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-10 md:py-16 border-b border-border/50">
                    {/* Image */}
                    <div className={cn("lg:col-span-7", imageRight ? "lg:order-2" : "lg:order-1")}>
                      <div className="relative overflow-hidden aspect-[5/4]">
                        <img
                          src={serviceImages[i]}
                          alt={service.title[lang]}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                    </div>

                    {/* Text */}
                    <div className={cn("lg:col-span-5", imageRight ? "lg:order-1 lg:pr-10" : "lg:order-2 lg:pl-10")}>
                      <p className="font-display text-6xl md:text-7xl font-light text-border/70 leading-none mb-5">{number}</p>
                      <h3 className="font-display text-2xl md:text-4xl font-light text-foreground leading-[1.1] mb-3">
                        {service.title[lang]}
                      </h3>
                      <div className="w-12 h-px bg-primary/40 my-5" />
                      <p className="text-sm md:text-base text-muted-foreground leading-[1.9] font-normal mb-7 max-w-md">
                        {service.desc[lang]}
                      </p>
                      <div className="flex items-baseline justify-between gap-4 max-w-md">
                        <p className="font-display text-xl md:text-2xl text-primary">{service.price[lang]}</p>
                        <Link
                          to="/booking"
                          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-foreground/70 hover:text-primary transition-colors duration-500 font-semibold border-b border-foreground/20 hover:border-primary pb-1"
                        >
                          {s.order[lang]}
                          <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
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