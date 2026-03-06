import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
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

      <section className="section-padding pb-8 md:pb-12">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">{s.overline[lang]}</p>
            <h1 className="font-display text-4xl md:text-6xl font-light mb-5">{s.title[lang]}</h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto">{s.subtitle[lang]}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-5 md:px-8 lg:px-16 pb-16 md:pb-28">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {s.items.map((service, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-card rounded-2xl overflow-hidden shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.08)] hover:shadow-[0_12px_40px_-8px_hsl(var(--foreground)/0.15)] transition-shadow duration-500 flex flex-col h-full group">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={serviceImages[i]} alt={service.title[lang]} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <h2 className="font-display text-xl md:text-2xl font-medium mb-3">{service.title[lang]}</h2>
                    <p className="text-muted-foreground font-light text-sm leading-relaxed flex-1 mb-5">{service.desc[lang]}</p>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{s.priceLabel[lang]}</p>
                        <p className="font-display text-2xl text-primary">{service.price[lang]}</p>
                      </div>
                      <Link to="/booking">
                        <Button className="rounded-full text-[11px] uppercase tracking-[0.12em] px-5 py-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-none">
                          {s.order[lang]}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container mx-auto text-center max-w-2xl">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-4xl font-light mb-5">{s.customTitle[lang]}</h2>
            <p className="text-muted-foreground font-light text-sm mb-8">{s.customText[lang]}</p>
            <Link to="/booking">
              <Button variant="outline" className="rounded-full text-xs uppercase tracking-[0.15em] px-10 py-6 border-foreground/20 hover:bg-foreground hover:text-background">
                {s.discussProject[lang]} <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default Services;
