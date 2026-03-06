import ScrollReveal from "@/components/ScrollReveal";
import portraitImg from "@/assets/about-portrait.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const stats = [
  { number: "500+", label: "Проектов" },
  { number: "7", label: "Лет опыта" },
  { number: "100+", label: "Отзывов 5★" },
  { number: "Вся", label: "Россия" },
];

const About = () => (
  <>
    <title>О студии Ki Ki Decor — 500+ проектов декора</title>
    <meta name="description" content="Ki Ki Decor — 7 лет опыта, 500+ проектов event decoration и wedding decoration. Команда профессионалов по всей России." />
    <meta property="og:title" content="О студии Ki Ki Decor — 500+ проектов декора" />
    <meta property="og:description" content="7 лет опыта в event styling, wedding decoration, birthday decor по всей России." />
    <meta property="og:type" content="website" />

    <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
      <div className="flex items-center justify-center section-padding">
        <div className="max-w-md">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Наша история</p>
            <h1 className="font-display text-4xl md:text-5xl font-light leading-tight mb-6">
              Красота в каждой детали
            </h1>
            <div className="w-16 h-px bg-primary mb-6" />
            <p className="text-muted-foreground font-light leading-relaxed text-sm mb-4">
              Ki Ki Decor — студия декора, которая творит волшебство. Мы специализируемся на оформлении фасадов домов, входных групп, свадебных площадок, праздников и тематических фотозон.
            </p>
            <p className="text-muted-foreground font-light leading-relaxed text-sm">
              Работаем по всей России — от Ростова до Геленджика и далеко за их пределами. Каждый проект для нас — это возможность преобразить пространство и создать эмоции, которые запомнятся навсегда.
            </p>
          </ScrollReveal>
        </div>
      </div>
      <div className="h-[50vh] md:h-auto">
        <img src={portraitImg} alt="Команда Ki Ki Decor" className="w-full h-full object-cover" loading="lazy" />
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
        <img src={loungeImg} alt="Оформление зоны отдыха" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex items-center justify-center section-padding order-1 md:order-2">
        <div className="max-w-md">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Наш подход</p>
            <h2 className="font-display text-3xl md:text-4xl font-light mb-6">Уют, стиль и внимание к деталям</h2>
            <p className="text-muted-foreground font-light leading-relaxed text-sm mb-6">
              Мы верим в силу визуального преображения. Наш подход — это природные цвета, актуальные тренды и индивидуальный стиль для каждого проекта. 
              Будь то стиль «Аля Русс» для свадьбы или современный минимализм для фасада — мы найдём идеальное решение.
            </p>
            <Link to="/services">
              <Button variant="outline" className="rounded-none text-xs uppercase tracking-[0.15em] px-8 py-5 border-foreground/20 hover:bg-foreground hover:text-background">
                Наши услуги
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  </>
);

export default About;