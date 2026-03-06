import ScrollReveal from "@/components/ScrollReveal";
import portraitImg from "@/assets/about-portrait.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const About = () => {
  const { lang, t } = useLanguage();
  const a = t.about;

  const stats = [
    { number: "500+", label: a.stats.projects[lang] },
    { number: "7", label: a.stats.experience[lang] },
    { number: "100+", label: a.stats.reviews[lang] },
    { number: a.stats.geography.number[lang], label: a.stats.geography.label[lang] },
  ];

  return (
    <>
      <title>{a.metaTitle[lang]}</title>

      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
        <div className="flex items-center justify-center section-padding">
          <div className="max-w-md">
            <ScrollReveal>
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">{a.ourStory[lang]}</p>
              <h1 className="font-display text-4xl md:text-5xl font-light leading-tight mb-6">{a.heroTitle[lang]}</h1>
              <div className="w-16 h-px bg-primary mb-6" />
              <p className="text-muted-foreground font-light leading-relaxed text-sm mb-4">{a.heroParagraph1[lang]}</p>
              <p className="text-muted-foreground font-light leading-relaxed text-sm">{a.heroParagraph2[lang]}</p>
            </ScrollReveal>
          </div>
        </div>
        <div className="h-[50vh] md:h-auto">
          <img src={portraitImg} alt="Ki Ki Decor" className="w-full h-full object-cover" loading="lazy" />
        </div>
      </section>

      <section className="bg-secondary section-padding">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 100}>
                <p className="font-display text-3xl md:text-4xl text-primary mb-1">{s.number}</p>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[50vh]">
        <div className="h-[50vh] md:h-auto order-2 md:order-1">
          <img src={loungeImg} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex items-center justify-center section-padding order-1 md:order-2">
          <div className="max-w-md">
            <ScrollReveal>
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">{a.approach[lang]}</p>
              <h2 className="font-display text-3xl md:text-4xl font-light mb-6">{a.approachTitle[lang]}</h2>
              <p className="text-muted-foreground font-light leading-relaxed text-sm mb-6">{a.approachText[lang]}</p>
              <Link to="/services">
                <Button variant="outline" className="rounded-none text-xs uppercase tracking-[0.15em] px-8 py-5 border-foreground/20 hover:bg-foreground hover:text-background">
                  {a.ourServices[lang]}
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
