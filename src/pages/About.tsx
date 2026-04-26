import ScrollReveal from "@/components/ScrollReveal";
import portraitImg from "@/assets/about-portrait.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  const { lang, t } = useLanguage();
  const a = t.about;

  useSEO({
    title: lang === "ru" ? "О студии — Ki Ki Decor" : "About — Ki Ki Decor",
    description: lang === "ru"
      ? "Студия декора Kris (By Kris): философия, опыт, география, авторский подход к каждому событию."
      : "Kris (By Kris) decor studio: philosophy, experience, geography, author's approach.",
    canonical: "https://kiki-shop.online/about",
  });

  const stats = [
    { number: "500+", label: a.stats.projects[lang] },
    { number: "7", label: a.stats.experience[lang] },
    { number: "100+", label: a.stats.reviews[lang] },
    { number: a.stats.geography.number[lang], label: a.stats.geography.label[lang] },
  ];

  return (
    <>
      <title>{a.metaTitle[lang]}</title>

      {/* Hero — editorial asymmetric */}
      <section className="relative h-[75vh] overflow-hidden">
        <img src={portraitImg} alt="KiKi" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-foreground/10" />
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-6 md:px-10 pb-16 md:pb-20">
            <p className="text-[10px] uppercase tracking-[0.35em] text-primary/70 font-body mb-4 animate-reveal" style={{ animationDelay: "0.3s" }}>{a.ourStory[lang]}</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-background leading-[1.05] max-w-2xl animate-reveal" style={{ animationDelay: "0.5s" }}>
              {a.heroTitle[lang]}
            </h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 md:px-10 py-24 md:py-36">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <ScrollReveal>
              <div className="w-12 h-px bg-primary mb-8" />
              <p className="text-foreground/70 font-light leading-[2] text-sm">{a.heroParagraph1[lang]}</p>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <p className="text-foreground/70 font-light leading-[2] text-sm md:mt-12">{a.heroParagraph2[lang]}</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-b border-border/50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 80}>
                <div className={`text-center py-14 md:py-20 ${i < 3 ? "md:border-r md:border-border/50" : ""}`}>
                  <p className="font-display text-4xl md:text-5xl text-primary mb-2">{s.number}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
        <div className="h-[50vh] md:h-auto">
          <img src={loungeImg} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex items-center justify-center px-6 md:px-16 py-20 md:py-0">
          <div className="max-w-md">
            <ScrollReveal>
              <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-4">{a.approach[lang]}</p>
              <h2 className="font-display text-3xl md:text-5xl font-light mb-6 leading-tight">{a.approachTitle[lang]}</h2>
              <p className="text-foreground/65 font-light leading-[2] text-sm mb-8">{a.approachText[lang]}</p>
              <Link to="/services" className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] font-body font-medium text-foreground hover:text-primary transition-colors duration-300">
                {a.ourServices[lang]}
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
