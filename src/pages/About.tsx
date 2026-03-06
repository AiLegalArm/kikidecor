import ScrollReveal from "@/components/ScrollReveal";
import portraitImg from "@/assets/about-portrait.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const stats = [
  { number: "200+", label: "Events Styled" },
  { number: "8", label: "Years Experience" },
  { number: "50+", label: "5-Star Reviews" },
  { number: "100%", label: "Love & Passion" },
];

const About = () => (
  <>
    <title>About | Élara Events</title>
    <meta name="description" content="Meet the creative mind behind Élara Events — a luxury event decoration studio dedicated to crafting unforgettable celebrations." />

    {/* Hero split */}
    <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
      <div className="flex items-center justify-center section-padding">
        <div className="max-w-md">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Our Story</p>
            <h1 className="font-display text-4xl md:text-5xl font-light leading-tight mb-6">
              Beauty in Every Detail
            </h1>
            <div className="w-16 h-px bg-primary mb-6" />
            <p className="text-muted-foreground font-light leading-relaxed text-sm mb-4">
              Founded with a deep love for aesthetics and a belief that every celebration deserves to be extraordinary, 
              Élara Events has grown from a passionate dream into a premier event decoration studio.
            </p>
            <p className="text-muted-foreground font-light leading-relaxed text-sm">
              We believe that the right ambiance transforms an event from memorable to magical. 
              Every flower placed, every candle lit, every detail curated — it all tells your story.
            </p>
          </ScrollReveal>
        </div>
      </div>
      <div className="h-[50vh] md:h-auto">
        <img src={portraitImg} alt="Élara Events founder" className="w-full h-full object-cover" loading="lazy" />
      </div>
    </section>

    {/* Stats */}
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

    {/* Philosophy */}
    <section className="grid grid-cols-1 md:grid-cols-2 min-h-[50vh]">
      <div className="h-[50vh] md:h-auto order-2 md:order-1">
        <img src={loungeImg} alt="Luxury event lounge styling" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex items-center justify-center section-padding order-1 md:order-2">
        <div className="max-w-md">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Our Philosophy</p>
            <h2 className="font-display text-3xl md:text-4xl font-light mb-6">Less Is More, But Make It Luxe</h2>
            <p className="text-muted-foreground font-light leading-relaxed text-sm mb-6">
              We believe in the power of understated elegance. Our approach focuses on quality over quantity — 
              selecting the finest materials, the most beautiful blooms, and the perfect lighting to create 
              atmospheres that feel both grand and intimate.
            </p>
            <Link to="/services">
              <Button variant="outline" className="rounded-none text-xs uppercase tracking-[0.15em] px-8 py-5 border-foreground/20 hover:bg-foreground hover:text-background">
                Our Services
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  </>
);

export default About;
