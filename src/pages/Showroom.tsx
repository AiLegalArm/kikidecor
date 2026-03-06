import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import heroShowroom from "@/assets/hero-showroom.jpg";
import heroDecoration from "@/assets/hero-decoration.jpg";
import { MapPin, Clock, Phone, CalendarDays, ArrowRight, Instagram } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Showroom = () => {
  const { lang, t } = useLanguage();
  const s = t.showroom;

  return (
    <>
      <title>KiKi Showroom</title>

      {/* Hero — cinematic */}
      <section className="relative h-[80vh] overflow-hidden">
        <img src={heroShowroom} alt="KiKi Showroom" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/30 to-foreground/15" />
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-6 md:px-10 pb-16 md:pb-20">
            <p className="text-[9px] uppercase tracking-[0.4em] text-primary/60 mb-4 font-body animate-reveal" style={{ animationDelay: "0.3s" }}>{s.divisionII[lang]}</p>
            <h1 className="font-display text-6xl md:text-8xl font-light text-background leading-[1.05] animate-reveal" style={{ animationDelay: "0.5s" }}>
              KiKi <span className="italic">Showroom</span>
            </h1>
          </div>
        </div>
      </section>

      {/* About + Info */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[50vh]">
        <div className="flex items-center px-6 md:px-10 lg:px-16 py-20 lg:py-0">
          <div className="max-w-md">
            <ScrollReveal>
              <p className="overline text-primary mb-4">{s.aboutOverline[lang]}</p>
              <h2 className="font-display text-3xl md:text-5xl font-light mb-6 leading-tight">
                {s.aboutTitle[lang]} <span className="italic">{s.aboutTitleItalic[lang]}</span>
              </h2>
              <p className="text-foreground/65 font-light leading-[2] text-sm mb-4">{s.aboutP1[lang]}</p>
              <p className="text-foreground/65 font-light leading-[2] text-sm">{s.aboutP2[lang]}</p>
            </ScrollReveal>
          </div>
        </div>

        <div className="flex items-center px-6 md:px-10 lg:px-16 py-16 lg:py-0 bg-secondary/30">
          <ScrollReveal delay={150}>
            <div className="space-y-6 max-w-sm">
              {[
                { icon: MapPin, label: s.address[lang], value: s.addressValue[lang] },
                { icon: Clock, label: s.hours[lang], value: `${s.hoursValue1[lang]}\n${s.hoursValue2[lang]}` },
                { icon: Phone, label: s.phoneLabel[lang], value: "+7 (900) 123-45-67", href: "tel:+79001234567" },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-border flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-body">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-light hover:text-primary transition-colors whitespace-pre-line">{value}</a>
                    ) : (
                      <p className="text-sm font-light whitespace-pre-line">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Collections teaser */}
      <section className="relative overflow-hidden">
        <img src={heroDecoration} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" loading="lazy" />
        <div className="relative z-10 px-6 md:px-10 py-28 md:py-36">
          <div className="container mx-auto max-w-3xl text-center">
            <ScrollReveal>
              <p className="overline text-primary mb-4">{s.collectionsOverline[lang]}</p>
              <h2 className="font-display text-4xl md:text-6xl font-light mb-6">{s.comingSoon[lang]}</h2>
              <p className="text-muted-foreground font-light max-w-lg mx-auto mb-10 leading-relaxed">{s.comingSoonText[lang]}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-primary transition-all duration-500 font-body">
                  <CalendarDays size={14} />
                  {s.bookVisit[lang]}
                </Link>
                <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-4 border border-foreground/15 text-foreground text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-foreground hover:text-background transition-all duration-500 font-body">
                  <Instagram size={14} />
                  Instagram
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default Showroom;
