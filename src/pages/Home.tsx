import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, Quote, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";

import heroDecor from "@/assets/hero-decor.jpg";
import heroShowroom from "@/assets/hero-showroom.jpg";
import logoImg from "@/assets/logo.png";
import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import dessertImg from "@/assets/portfolio-dessert.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, delay: 0.4 + i * 0.22, ease: "easeOut" as const },
  }),
};

const testimonials = [
  {
    name: "Анна и Дмитрий",
    event: "Wedding Decor",
    text: "KiKi Decor превратили нашу свадебную площадку в настоящую сказку. Каждая деталь была продумана до мелочей — от цветочных арок до свечей на столах.",
    rating: 5,
  },
  {
    name: "Екатерина М.",
    event: "Facade Design",
    text: "Невероятное преображение нашего дома! Крыльцо и входная группа стали выглядеть как из журнала. Команда — настоящие волшебники.",
    rating: 5,
  },
  {
    name: "Ольга и Сергей",
    event: "Photo Zone",
    text: "Заказывали фотозону на юбилей — результат превзошёл все ожидания. Живые цветы, подсветка, продуманный стиль.",
    rating: 5,
  },
];

const instaFeed = [
  { img: weddingImg, alt: "Wedding decor" },
  { img: detailImg, alt: "Floral details" },
  { img: loungeImg, alt: "Lounge styling" },
  { img: birthdayImg, alt: "Birthday setup" },
  { img: dessertImg, alt: "Dessert table" },
  { img: themedImg, alt: "Facade decor" },
];

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      <title>KiKi — Luxury Events & Fashion</title>
      <meta name="description" content="KiKi — premium lifestyle brand combining luxury event decoration studio and fashion showroom. Beauty in every detail." />

      {/* ═══ 1. CINEMATIC HERO ═══ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden -mt-18 md:-mt-24">
        {/* Parallax background — split */}
        <motion.div className="absolute inset-0 flex" style={{ y: heroY }}>
          <div className="w-1/2 relative overflow-hidden">
            <img src={heroDecor} alt="" className="absolute inset-0 w-full h-full object-cover scale-110" loading="eager" />
            <div className="absolute inset-0 bg-foreground/45" />
          </div>
          <div className="w-1/2 relative overflow-hidden">
            <img src={heroShowroom} alt="" className="absolute inset-0 w-full h-full object-cover scale-110" loading="eager" />
            <div className="absolute inset-0 bg-foreground/45" />
          </div>
        </motion.div>

        {/* Center divider */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-background/15 z-10 hidden md:block" />

        {/* Hero content */}
        <motion.div
          className="relative z-20 h-full flex items-center justify-center text-center px-6"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl space-y-6"
          >
            {/* Decorative line */}
            <motion.div
              className="w-px h-16 bg-background/25 mx-auto"
              variants={fadeUp}
              custom={0}
            />

            <motion.img
              src={logoImg}
              alt="KiKi"
              className="h-14 md:h-20 w-auto mx-auto brightness-0 invert"
              variants={fadeUp}
              custom={1}
            />

            <motion.p
              className="font-body text-xs md:text-sm uppercase tracking-[0.35em] text-background/60"
              variants={fadeUp}
              custom={2}
            >
              Luxury Events & Fashion
            </motion.p>

            <motion.h1
              className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-light text-background leading-[1.05]"
              variants={fadeUp}
              custom={3}
            >
              Beauty in every
              <br />
              <span className="italic">detail</span>
            </motion.h1>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
              variants={fadeUp}
              custom={4}
            >
              <Link
                to="/decor"
                className="inline-flex items-center gap-3 px-10 py-4.5 bg-background text-foreground text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-500"
              >
                Explore Decor Studio
                <ArrowRight size={13} />
              </Link>
              <Link
                to="/showroom"
                className="inline-flex items-center gap-3 px-10 py-4.5 border border-background/35 text-background text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-background hover:text-foreground transition-all duration-500"
              >
                Visit Showroom
                <ArrowRight size={13} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-px h-10 bg-background/20 animate-float" />
            <p className="text-[9px] uppercase tracking-[0.3em] text-background/30">Scroll</p>
          </motion.div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ═══ 2. BRAND MANIFESTO ═══ */}
      <section className="section-padding">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="overline text-primary mb-6">Our Philosophy</p>
            <h2 className="font-display text-4xl md:text-6xl font-light leading-[1.08] mb-8">
              Two worlds.
              <br />
              <span className="italic">One vision.</span>
            </h2>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-base md:text-lg max-w-2xl mx-auto mt-10 leading-[1.9]">
              KiKi is a premium lifestyle brand where the art of event decoration meets 
              the world of curated fashion. We believe beauty should surround you in 
              everything — from the spaces you celebrate in to the style you wear every day.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ 3. TWO BRAND WORLDS ═══ */}
      <section className="px-6 md:px-10 pb-24 md:pb-40">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* KiKi Decor */}
            <ScrollReveal delay={0}>
              <Link to="/decor" className="group block relative overflow-hidden aspect-[3/4]">
                <img
                  src={heroDecor}
                  alt="KiKi Decor — luxury event decoration"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
                  <p className="overline text-primary/80 mb-3">Division I</p>
                  <h3 className="font-display text-3xl md:text-5xl font-light text-background mb-4 leading-[1.1]">
                    KiKi
                    <br />
                    <span className="italic">Decor</span>
                  </h3>
                  <p className="text-sm text-background/55 font-light max-w-sm mb-8 leading-relaxed">
                    Weddings, celebrations, facades, photo zones — 
                    we craft atmospheres that live in memory forever.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-background/70 group-hover:text-primary transition-colors duration-500">
                    Explore Studio <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            </ScrollReveal>

            {/* KiKi Showroom */}
            <ScrollReveal delay={200}>
              <Link to="/showroom" className="group block relative overflow-hidden aspect-[3/4]">
                <img
                  src={heroShowroom}
                  alt="KiKi Showroom — fashion boutique"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
                  <p className="overline text-primary/80 mb-3">Division II</p>
                  <h3 className="font-display text-3xl md:text-5xl font-light text-background mb-4 leading-[1.1]">
                    KiKi
                    <br />
                    <span className="italic">Showroom</span>
                  </h3>
                  <p className="text-sm text-background/55 font-light max-w-sm mb-8 leading-relaxed">
                    Curated fashion collections and accessories in 
                    an atmosphere of refined elegance. Style that inspires.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-background/70 group-hover:text-primary transition-colors duration-500">
                    Visit Showroom <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 4. INSTAGRAM LIFESTYLE FEED ═══ */}
      <section className="section-padding bg-secondary/40">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-5">
              <Instagram size={16} className="text-primary" strokeWidth={1.5} />
              <p className="overline text-primary">Follow Our World</p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-center mb-4">
              @ki_ki_decor
            </h2>
            <p className="text-center text-muted-foreground font-light text-sm mb-14">
              A glimpse into our lifestyle — events, fashion, beauty.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {instaFeed.map((item, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <a
                  href="https://instagram.com/ki_ki_decor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group overflow-hidden relative aspect-square"
                >
                  <img
                    src={item.img}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-500 flex items-center justify-center">
                    <Instagram
                      size={18}
                      className="text-background opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      strokeWidth={1.5}
                    />
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. TESTIMONIALS ═══ */}
      <section className="section-padding">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="overline text-primary mb-5 text-center">Testimonials</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-center mb-5 leading-tight">
              What Our Clients Say
            </h2>
            <div className="gold-divider mb-16" />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 120}>
                <div className="luxury-card p-8 md:p-10 h-full flex flex-col">
                  <Quote size={24} className="text-primary/20 mb-6" strokeWidth={1} />
                  <p className="text-sm font-light leading-[1.9] text-foreground/70 flex-1 mb-8 italic">
                    «{t.text}»
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={10} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-display text-base font-medium">{t.name}</p>
                  <p className="overline text-muted-foreground mt-1 text-[9px]">{t.event}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. CONTACT & SOCIAL ═══ */}
      <section className="relative overflow-hidden">
        <img
          src={loungeImg}
          alt="KiKi brand atmosphere"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 section-padding">
          <div className="container mx-auto max-w-3xl text-center">
            <ScrollReveal>
              <p className="overline text-primary mb-6">Get in Touch</p>
              <h2 className="font-display text-4xl md:text-6xl font-light text-background leading-tight mb-6">
                Ready to create something <span className="italic">beautiful</span>?
              </h2>
              <p className="text-background/55 font-light text-sm md:text-base mb-10 max-w-lg mx-auto leading-relaxed">
                Whether it's a dream event or your perfect wardrobe — 
                let's make it happen together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4.5 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-primary/90 transition-all duration-500 shadow-[var(--shadow-lavender)]"
                >
                  Book a Consultation
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4.5 border border-background/30 text-background text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-background hover:text-foreground transition-all duration-500"
                >
                  Contact Us
                </Link>
              </div>

              {/* Social links */}
              <div className="flex items-center justify-center gap-8 text-background/40">
                <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-300">
                  <Instagram size={18} strokeWidth={1.5} />
                </a>
                <a href="mailto:info@kikidecor.ru" className="hover:text-primary transition-colors duration-300">
                  <Mail size={18} strokeWidth={1.5} />
                </a>
                <a href="tel:+79001234567" className="hover:text-primary transition-colors duration-300">
                  <Phone size={18} strokeWidth={1.5} />
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
