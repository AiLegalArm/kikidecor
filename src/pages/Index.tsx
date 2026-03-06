import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import heroImg from "@/assets/hero-decoration.jpg";
import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";
import { Button } from "@/components/ui/button";

const services = [
  { title: "Weddings", desc: "Timeless elegance for your perfect day" },
  { title: "Birthdays", desc: "Celebrations as unique as you" },
  { title: "Proposals", desc: "Intimate moments, beautifully styled" },
  { title: "Themed Parties", desc: "Immersive experiences brought to life" },
];

const Index = () => {
  return (
    <>
      {/* SEO */}
      <title>Élara Events | Luxury Event Decoration Studio</title>
      <meta name="description" content="Élara Events is a luxury event decoration studio specializing in weddings, birthdays, proposals and themed parties. Creating unforgettable moments." />

      {/* Hero */}
      <section className="relative h-[90vh] md:h-screen overflow-hidden">
        <img
          src={heroImg}
          alt="Luxury wedding decoration with pink flowers and crystal chandeliers"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-5">
          <div>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-background/80 font-body font-light mb-4 animate-fade-up">
              Luxury Event Decoration
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-background leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
              Where Dreams<br />Become Reality
            </h1>
            <div className="animate-fade-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
              <Link to="/portfolio">
                <Button variant="outline" size="lg" className="border-background/40 text-background bg-transparent hover:bg-background/10 font-body text-xs uppercase tracking-[0.15em] rounded-none px-8 py-6">
                  View Our Work <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Welcome to Élara</p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-6">
              We Create Moments That Last Forever
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="gold-divider" />
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <p className="text-muted-foreground font-light leading-relaxed text-sm md:text-base">
              With an eye for detail and a passion for beauty, Élara transforms spaces into extraordinary experiences. 
              Every event is a canvas, and we paint it with elegance, warmth, and a touch of magic.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Work Grid */}
      <section className="px-5 md:px-8 lg:px-16 pb-16 md:pb-24">
        <div className="container mx-auto">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Portfolio</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-12">Featured Work</h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { img: weddingImg, alt: "Wedding ceremony arch", span: "col-span-2 row-span-2" },
              { img: birthdayImg, alt: "Birthday party decoration" },
              { img: proposalImg, alt: "Proposal setup" },
              { img: detailImg, alt: "Table centerpiece detail", span: "col-span-2" },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100} className={item.span}>
                <Link to="/portfolio" className="block group overflow-hidden relative aspect-square">
                  <img
                    src={item.img}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-500" />
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={400}>
            <div className="text-center mt-10">
              <Link to="/portfolio" className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors font-medium">
                View All Projects <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">What We Do</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-14">Our Services</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 100}>
                <div className="text-center group">
                  <h3 className="font-display text-xl md:text-2xl font-light mb-3 group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-muted-foreground text-sm font-light">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={400}>
            <div className="text-center mt-12">
              <Link to="/services">
                <Button variant="outline" className="rounded-none text-xs uppercase tracking-[0.15em] px-8 py-5 border-foreground/20 hover:bg-foreground hover:text-background">
                  Explore Services <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Let's Create Together</p>
            <h2 className="font-display text-3xl md:text-5xl font-light mb-6">Ready to Bring Your Vision to Life?</h2>
            <p className="text-muted-foreground font-light text-sm md:text-base mb-8">
              Every great celebration begins with a conversation. Tell us about your dream event.
            </p>
            <Link to="/booking">
              <Button className="rounded-none text-xs uppercase tracking-[0.15em] px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                Book a Consultation
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default Index;
