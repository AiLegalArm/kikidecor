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

const serviceImages = [themedImg, weddingImg, birthdayImg, detailImg, proposalImg, corporateImg];

const Services = () => {
  const { lang, t } = useLanguage();
  const s = t.services;

  return (
    <>
      <title>{s.title[lang]}</title>

      {/* Header */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 px-6 md:px-10">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-4">{s.overline[lang]}</p>
            <h1 className="font-display text-5xl md:text-7xl font-light mb-5 leading-[1.05]">{s.title[lang]}</h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed">{s.subtitle[lang]}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="px-6 md:px-10 pb-24 md:pb-36">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {s.items.map((service, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="group relative overflow-hidden aspect-[4/5] cursor-pointer">
                  <img src={serviceImages[i]} alt={service.title[lang]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-[1.05]" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-foreground/10 transition-all duration-700 group-hover:from-foreground/90" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8">
                    <h2 className="font-display text-2xl md:text-3xl font-light text-background mb-2">{service.title[lang]}</h2>
                    <p className="text-xs text-background/40 font-light leading-relaxed mb-4 max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">{service.desc[lang]}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-xl text-primary">{service.price[lang]}</p>
                      <Link to="/booking" className="text-[9px] uppercase tracking-[0.25em] text-background/60 hover:text-background transition-colors duration-300 font-body">
                        {s.order[lang]} →
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 px-6 md:px-10 py-24 md:py-32">
        <div className="container mx-auto text-center max-w-2xl">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-5xl font-light mb-5">{s.customTitle[lang]}</h2>
            <p className="text-muted-foreground font-light text-sm mb-10 leading-relaxed">{s.customText[lang]}</p>
            <Link to="/booking" className="group inline-flex items-center gap-3 px-10 py-4 border border-foreground/15 text-foreground text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-foreground hover:text-background transition-all duration-500 font-body">
              {s.discussProject[lang]}
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default Services;
