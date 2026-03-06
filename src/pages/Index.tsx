import { Link } from "react-router-dom";
import { ArrowRight, Star, Instagram, Quote } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import heroImg from "@/assets/hero-decoration.jpg";
import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import dessertImg from "@/assets/portfolio-dessert.jpg";
import { Button } from "@/components/ui/button";

const featuredDecorations = [
  { img: weddingImg, title: "Свадебная арка", category: "Свадьба", span: "col-span-2 row-span-2" },
  { img: birthdayImg, title: "Праздник золота", category: "День рождения" },
  { img: proposalImg, title: "Предложение мечты", category: "Предложение" },
  { img: themedImg, title: "Декор фасада", category: "Фасад", span: "col-span-2" },
  { img: detailImg, title: "Цветочная композиция", category: "Детали" },
  { img: dessertImg, title: "Сладкий стол", category: "Фотозона" },
];

const testimonials = [
  {
    name: "Анна и Дмитрий",
    event: "Свадьба",
    text: "Ki Ki Decor превратили нашу свадебную площадку в настоящую сказку. Каждая деталь была продумана до мелочей — от цветочных арок до свечей на столах. Гости до сих пор вспоминают!",
    rating: 5,
  },
  {
    name: "Екатерина М.",
    event: "Оформление фасада",
    text: "Невероятное преображение нашего дома! Крыльцо и входная группа стали выглядеть как из журнала. Соседи приходят фотографироваться. Команда — настоящие волшебники.",
    rating: 5,
  },
  {
    name: "Ольга и Сергей",
    event: "Фотозона на юбилей",
    text: "Заказывали фотозону на юбилей мамы — результат превзошёл все ожидания. Живые цветы, подсветка, продуманный стиль. Все фотографии получились потрясающими!",
    rating: 5,
  },
];

const instaImages = [
  { img: weddingImg, alt: "Свадебный декор" },
  { img: detailImg, alt: "Цветочная композиция" },
  { img: loungeImg, alt: "Оформление зоны отдыха" },
  { img: birthdayImg, alt: "Праздничное оформление" },
  { img: dessertImg, alt: "Сладкий стол" },
  { img: themedImg, alt: "Декор фасада" },
];

const Index = () => {
  return (
    <>
      <title>Ki Ki Decor — Студия декора | Фасады, свадьбы, фотозоны</title>
      <meta name="description" content="Ki Ki Decor — студия декора. Оформление фасадов, входных групп, свадеб, праздников и фотозон. Работаем по всей России." />

      {/* Hero */}
      <section className="relative h-screen overflow-hidden">
        <img
          src={heroImg}
          alt="Роскошное оформление мероприятия с цветами, свечами и декором от Ki Ki Decor"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/30 to-foreground/60" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-5">
          <div className="max-w-3xl">
            <div className="w-12 h-px bg-background/50 mx-auto mb-8 animate-fade-up" />
            <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-background/70 font-body font-light mb-5 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
              Студия декора
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-light text-background leading-[1.05] mb-5 animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
              Ki Ki Decor
            </h1>
            <p className="font-display text-lg md:text-2xl font-light italic text-background/80 mb-10 animate-fade-up" style={{ animationDelay: "0.35s", opacity: 0 }}>
              Творим волшебство
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
              <Link to="/portfolio">
                <Button variant="outline" size="lg" className="border-background/40 text-background bg-transparent hover:bg-background/10 font-body text-xs uppercase tracking-[0.15em] rounded-none px-8 py-6 min-w-[200px]">
                  Портфолио <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/booking">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-body text-xs uppercase tracking-[0.15em] rounded-none px-8 py-6 min-w-[200px]">
                  Заказать декор
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-fade-up" style={{ animationDelay: "0.7s", opacity: 0 }}>
          <div className="w-px h-10 bg-background/30 mx-auto mb-2 animate-pulse" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-background/40">Листайте</p>
        </div>
      </section>

      {/* Featured */}
      <section className="section-padding">
        <div className="container mx-auto">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Наши работы</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-center mb-4">Избранные проекты</h2>
            <div className="gold-divider" />
            <p className="text-center text-muted-foreground font-light text-sm max-w-xl mx-auto mt-6 mb-14">
              Каждый проект — уникальная история, рассказанная через цветы, свет и внимание к деталям.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {featuredDecorations.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 80} className={item.span}>
                <Link to="/portfolio" className="block group overflow-hidden relative aspect-square">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 md:p-6">
                    <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-background/60 mb-1">{item.category}</p>
                      <p className="font-display text-base md:text-lg text-background">{item.title}</p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={500}>
            <div className="text-center mt-12">
              <Link to="/portfolio" className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors font-medium group">
                Смотреть все работы <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Отзывы</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-center mb-4">Что говорят клиенты</h2>
            <div className="gold-divider mb-14" />
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 150}>
                <div className="bg-card p-8 md:p-10 border border-border/50 h-full flex flex-col">
                  <Quote size={24} className="text-primary/30 mb-5" strokeWidth={1} />
                  <p className="text-sm font-light leading-relaxed text-foreground/80 flex-1 mb-6 italic">
                    «{t.text}»
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={12} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-display text-base font-medium">{t.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-1">{t.event}</p>
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Instagram size={18} className="text-primary" strokeWidth={1.5} />
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-body">Подписывайтесь</p>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-light text-center mb-4">Instagram</h2>
            <p className="text-center text-muted-foreground font-light text-sm mb-12">@ki_ki_decor</p>
          </ScrollReveal>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {instaImages.map((item, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer" className="block group overflow-hidden relative aspect-square">
                  <img src={item.img} alt={item.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300 flex items-center justify-center">
                    <Instagram size={20} className="text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={loungeImg} alt="Оформление зоны отдыха" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 section-padding">
          <div className="container mx-auto max-w-2xl text-center">
            <ScrollReveal>
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Давайте создадим вместе</p>
              <h2 className="font-display text-3xl md:text-5xl font-light text-background leading-tight mb-5">
                Готовы преобразить ваше пространство?
              </h2>
              <p className="text-background/70 font-light text-sm md:text-base mb-10 max-w-lg mx-auto">
                Каждое великое преображение начинается с идеи. Расскажите нам свою — и мы воплотим её в жизнь с любовью и вниманием к каждой детали.
              </p>
              <Link to="/booking">
                <Button size="lg" className="rounded-none text-xs uppercase tracking-[0.15em] px-12 py-7 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  Заказать декор
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