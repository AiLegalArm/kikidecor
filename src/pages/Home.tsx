import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, Quote, Instagram, Mail, Phone } from "lucide-react";
import { useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";

import heroDecor from "@/assets/hero-decor.jpg";
import heroShowroom from "@/assets/hero-showroom.jpg";
import logoImg from "@/assets/logo.png";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import LifestyleGallery from "@/components/LifestyleGallery";
import SignatureDecor from "@/components/SignatureDecor";
import ShowroomCollection from "@/components/ShowroomCollection";

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
        {/* Parallax background — split with Ken Burns */}
        <motion.div className="absolute inset-0 flex" style={{ y: heroY }}>
          <div className="w-1/2 relative overflow-hidden">
            <motion.img
              src={heroDecor}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              initial={{ scale: 1.15 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            />
            <div className="absolute inset-0 bg-foreground/50" />
          </div>
          <div className="w-1/2 relative overflow-hidden">
            <motion.img
              src={heroShowroom}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1.15 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            />
            <div className="absolute inset-0 bg-foreground/50" />
          </div>
        </motion.div>

        {/* Center divider — elegant thin line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-background/10 z-10 hidden md:block" />

        {/* Vignette overlay */}
        <div className="absolute inset-0 z-[5]" style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.3) 100%)" }} />

        {/* Hero content */}
        <motion.div
          className="relative z-20 h-full flex items-center justify-center text-center px-6"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            {/* Top decorative line */}
            <motion.div
              className="w-px h-20 bg-background/20 mx-auto mb-10"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
            />

            {/* Brand name */}
            <motion.h1
              className="font-display text-6xl md:text-8xl lg:text-[7rem] font-light text-background leading-none tracking-[-0.02em] mb-6"
              variants={fadeUp}
              custom={0}
            >
              KiKi
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="font-body text-[11px] md:text-xs uppercase tracking-[0.45em] text-background/50 mb-14"
              variants={fadeUp}
              custom={1}
            >
              Luxury Events & Fashion
            </motion.p>

            {/* Elegant divider */}
            <motion.div
              className="w-16 h-px bg-primary/50 mx-auto mb-14"
              variants={fadeUp}
              custom={2}
            />

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-5 justify-center"
              variants={fadeUp}
              custom={3}
            >
              <Link
                to="/decor"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-background/95 text-foreground text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-700 backdrop-blur-sm"
              >
                Explore Decor Studio
                <ArrowRight size={12} className="transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/showroom"
                className="group inline-flex items-center gap-3 px-10 py-5 border border-background/25 text-background text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-background hover:text-foreground transition-all duration-700 backdrop-blur-sm"
              >
                Visit Showroom
                <ArrowRight size={12} className="transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="w-px h-12 bg-background/15"
              animate={{ scaleY: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "top" }}
            />
            <p className="text-[8px] uppercase tracking-[0.4em] text-background/25 font-light">Scroll</p>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
      </section>

      {/* ═══ 2. THE STORY OF KIKI ═══ */}
      <section className="section-padding overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            {/* Image */}
            <ScrollReveal>
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={heroDecor}
                  alt="KiKi brand story — luxury lifestyle"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
                {/* Accent frame */}
                <div className="absolute top-6 left-6 right-6 bottom-6 border border-primary/15 pointer-events-none" />
              </div>
            </ScrollReveal>

            {/* Text */}
            <div className="lg:py-12">
              <ScrollReveal delay={150}>
                <p className="overline text-primary mb-6">Our Story</p>
              </ScrollReveal>
              <ScrollReveal delay={250}>
                <h2 className="font-display text-4xl md:text-6xl font-light leading-[1.08] mb-8">
                  The Story
                  <br />
                  of <span className="italic">KiKi</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={350}>
                <div className="w-16 h-px bg-primary/40 mb-10" />
              </ScrollReveal>
              <ScrollReveal delay={450}>
                <p className="text-muted-foreground font-light text-base md:text-lg leading-[2] mb-6">
                  KiKi was born from a simple belief — that beauty is not a luxury, 
                  it's a way of life. What started as a passion for transforming spaces 
                  into unforgettable experiences has grown into a lifestyle brand that 
                  touches every aspect of aesthetic living.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={550}>
                <p className="text-muted-foreground font-light text-base md:text-lg leading-[2] mb-6">
                  Our Decor Studio crafts immersive atmospheres for weddings, celebrations, 
                  and private events — where every petal, candle, and drape tells a story. 
                  Our Showroom curates fashion that embodies the same refined elegance — 
                  clothing and accessories chosen for women who see style as self-expression.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={650}>
                <p className="text-foreground/80 font-display text-lg md:text-xl italic leading-relaxed">
                  Two worlds, one philosophy: surround yourself with beauty, always.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. TWO WORLDS OF KIKI ═══ */}
      <section className="px-6 md:px-10 pb-24 md:pb-40">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-20">
              <p className="overline text-primary mb-5">Discover</p>
              <h2 className="font-display text-4xl md:text-6xl font-light leading-[1.08]">
                Two Worlds of <span className="italic">KiKi</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* KiKi Decor */}
            <ScrollReveal delay={0}>
              <Link to="/decor" className="group block relative overflow-hidden aspect-[3/4]">
                <img
                  src={heroDecor}
                  alt="KiKi Decor — luxury event decoration"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/5 transition-all duration-700 group-hover:from-foreground/85 group-hover:via-foreground/40" />
                {/* Accent border on hover */}
                <div className="absolute inset-4 border border-background/0 group-hover:border-background/10 transition-all duration-700 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
                  <p className="overline text-primary/70 mb-3 text-[9px]">Division I</p>
                  <h3 className="font-display text-3xl md:text-5xl font-light text-background mb-4 leading-[1.1]">
                    KiKi <span className="italic">Decor</span>
                  </h3>
                  <p className="text-sm text-background/50 font-light max-w-sm mb-8 leading-[1.8]">
                    Luxury event decoration studio for weddings, birthdays 
                    and celebrations. We craft atmospheres that live in memory forever.
                  </p>
                  <span className="inline-flex items-center gap-3 px-6 py-3 border border-background/20 text-[10px] uppercase tracking-[0.25em] text-background/80 group-hover:bg-background group-hover:text-foreground transition-all duration-600">
                    Explore Decor Studio
                    <ArrowRight size={12} className="transition-transform duration-500 group-hover:translate-x-1" />
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
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/5 transition-all duration-700 group-hover:from-foreground/85 group-hover:via-foreground/40" />
                <div className="absolute inset-4 border border-background/0 group-hover:border-background/10 transition-all duration-700 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
                  <p className="overline text-primary/70 mb-3 text-[9px]">Division II</p>
                  <h3 className="font-display text-3xl md:text-5xl font-light text-background mb-4 leading-[1.1]">
                    KiKi <span className="italic">Showroom</span>
                  </h3>
                  <p className="text-sm text-background/50 font-light max-w-sm mb-8 leading-[1.8]">
                    Fashion showroom with curated clothing collections 
                    and accessories. Style that inspires confidence and elegance.
                  </p>
                  <span className="inline-flex items-center gap-3 px-6 py-3 border border-background/20 text-[10px] uppercase tracking-[0.25em] text-background/80 group-hover:bg-background group-hover:text-foreground transition-all duration-600">
                    Visit Showroom
                    <ArrowRight size={12} className="transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ 4. SIGNATURE DECOR ═══ */}
      <SignatureDecor />

      {/* ═══ 5. LIFESTYLE GALLERY ═══ */}
      <LifestyleGallery />

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
