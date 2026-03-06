import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShoppingBag } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import heroDecor from "@/assets/hero-decor.jpg";
import heroShowroom from "@/assets/hero-showroom.jpg";
import logoImg from "@/assets/logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const Home = () => {
  return (
    <>
      <title>KiKi — Студия декора и шоурум одежды</title>
      <meta name="description" content="KiKi — премиальный бренд, объединяющий студию декора мероприятий и шоурум модной одежды. Создаём красоту в каждой детали." />

      {/* ── Hero ── */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Background split */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 relative overflow-hidden">
            <img src={heroDecor} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" />
            <div className="absolute inset-0 bg-foreground/40" />
          </div>
          <div className="w-1/2 relative overflow-hidden">
            <img src={heroShowroom} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" />
            <div className="absolute inset-0 bg-foreground/40" />
          </div>
        </div>

        {/* Divider line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-background/20 z-10 hidden md:block" />

        {/* Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.img
              src={logoImg}
              alt="KiKi"
              className="h-16 md:h-24 w-auto mx-auto brightness-0 invert"
              variants={fadeUp}
              custom={0}
            />
            <motion.p
              className="overline text-background/70"
              variants={fadeUp}
              custom={1}
            >
              Decor Studio · Fashion Showroom
            </motion.p>
            <motion.h1
              className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-background leading-[1.05]"
              variants={fadeUp}
              custom={2}
            >
              Красота в каждой
              <br />
              <span className="italic font-light">детали</span>
            </motion.h1>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              variants={fadeUp}
              custom={3}
            >
              <Link
                to="/decor"
                className="inline-flex items-center gap-3 px-8 py-4 bg-background text-foreground text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-500"
              >
                <Sparkles size={14} />
                Decor Studio
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/showroom"
                className="inline-flex items-center gap-3 px-8 py-4 border border-background/40 text-background text-xs uppercase tracking-[0.2em] font-medium hover:bg-background hover:text-foreground transition-all duration-500"
              >
                <ShoppingBag size={14} />
                Showroom
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ── Brand Philosophy ── */}
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <p className="overline text-primary mb-6">Философия бренда</p>
            <h2 className="font-display text-4xl md:text-6xl font-light leading-[1.1] mb-8">
              Два направления.
              <br />
              <span className="italic">Один стиль.</span>
            </h2>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-base md:text-lg max-w-2xl mx-auto mt-8 leading-relaxed">
              KiKi — это премиальный lifestyle-бренд, который объединяет искусство декора мероприятий 
              и мир модной одежды. Мы верим, что красота должна окружать вас во всём — 
              от праздничного пространства до повседневного стиля.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Two Divisions ── */}
      <section className="px-6 md:px-10 pb-20 md:pb-36">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Decor Studio */}
            <ScrollReveal delay={0}>
              <Link to="/decor" className="group block relative overflow-hidden aspect-[4/5]">
                <img
                  src={heroDecor}
                  alt="KiKi Decor Studio"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <p className="overline text-background/50 mb-3">Направление I</p>
                  <h3 className="font-display text-3xl md:text-5xl font-light text-background mb-4">
                    KiKi Decor
                  </h3>
                  <p className="text-sm text-background/60 font-light max-w-sm mb-6 leading-relaxed">
                    Свадьбы, дни рождения, фасады, фотозоны — создаём атмосферу, 
                    которая останется в памяти навсегда.
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-background/80 group-hover:text-primary transition-colors duration-300">
                    Подробнее <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </ScrollReveal>

            {/* Showroom */}
            <ScrollReveal delay={200}>
              <Link to="/showroom" className="group block relative overflow-hidden aspect-[4/5]">
                <img
                  src={heroShowroom}
                  alt="KiKi Showroom"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <p className="overline text-background/50 mb-3">Направление II</p>
                  <h3 className="font-display text-3xl md:text-5xl font-light text-background mb-4">
                    KiKi Showroom
                  </h3>
                  <p className="text-sm text-background/60 font-light max-w-sm mb-6 leading-relaxed">
                    Коллекции модной одежды и аксессуаров в атмосфере 
                    элегантного шоурума. Стиль, который вдохновляет.
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-background/80 group-hover:text-primary transition-colors duration-300">
                    Подробнее <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding bg-secondary/50">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="overline text-primary mb-6">Начните сейчас</p>
            <h2 className="font-display text-3xl md:text-5xl font-light mb-8">
              Готовы создать что-то <span className="italic">прекрасное</span>?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/booking"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary transition-all duration-500 btn-glow"
              >
                Заказать декор
              </Link>
              <Link
                to="/showroom"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-foreground text-foreground text-xs uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-all duration-500"
              >
                Посетить шоурум
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default Home;
