import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import heroShowroom from "@/assets/hero-showroom.jpg";
import { MapPin, Clock, Phone, CalendarDays, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Showroom = () => {
  const { lang, t } = useLanguage();
  const s = t.showroom;

  return (
    <>
      <title>KiKi Showroom</title>

      <section className="relative h-[70vh] flex items-end overflow-hidden">
        <img src={heroShowroom} alt="KiKi Showroom" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
        <div className="relative z-10 container mx-auto px-6 md:px-10 pb-16">
          <p className="overline text-background/50 mb-4">{s.divisionII[lang]}</p>
          <h1 className="font-display text-5xl md:text-7xl font-light text-background">KiKi Showroom</h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="overline text-primary mb-4">{s.aboutOverline[lang]}</p>
                <h2 className="font-display text-3xl md:text-5xl font-light mb-6 leading-tight">
                  {s.aboutTitle[lang]} <span className="italic">{s.aboutTitleItalic[lang]}</span>
                </h2>
                <p className="text-muted-foreground font-light leading-relaxed mb-4">{s.aboutP1[lang]}</p>
                <p className="text-muted-foreground font-light leading-relaxed">{s.aboutP2[lang]}</p>
              </div>
              <div className="space-y-6">
                <div className="border border-border p-6 flex items-start gap-4">
                  <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.address[lang]}</p>
                    <p className="text-sm font-light">{s.addressValue[lang]}</p>
                  </div>
                </div>
                <div className="border border-border p-6 flex items-start gap-4">
                  <Clock size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.hours[lang]}</p>
                    <p className="text-sm font-light">{s.hoursValue1[lang]}</p>
                    <p className="text-sm font-light text-muted-foreground">{s.hoursValue2[lang]}</p>
                  </div>
                </div>
                <div className="border border-border p-6 flex items-start gap-4">
                  <Phone size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.phoneLabel[lang]}</p>
                    <a href="tel:+79001234567" className="text-sm font-light hover:text-primary transition-colors">+7 (900) 123-45-67</a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-secondary/30">
        <div className="container mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <p className="overline text-primary mb-4">{s.collectionsOverline[lang]}</p>
            <h2 className="font-display text-3xl md:text-5xl font-light mb-8">{s.comingSoon[lang]}</h2>
            <p className="text-muted-foreground font-light max-w-lg mx-auto mb-8">{s.comingSoonText[lang]}</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary transition-all duration-500"
            >
              <CalendarDays size={14} />
              {s.bookVisit[lang]}
              <ArrowRight size={14} />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default Showroom;
