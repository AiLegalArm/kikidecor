import { Link } from "react-router-dom";
import { ArrowRight, Flower2, Heart, PartyPopper, Sparkles, Palette, Camera } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";

const services = [
  {
    icon: Heart,
    title: "Wedding Decoration",
    desc: "From intimate ceremonies to grand receptions, we craft every detail with love. Floral arches, table styling, lighting design, and bespoke installations.",
    img: weddingImg,
  },
  {
    icon: PartyPopper,
    title: "Birthday Styling",
    desc: "Milestone birthdays deserve extraordinary settings. Custom themes, balloon artistry, dessert table design, and photo-worthy backdrops.",
    img: birthdayImg,
  },
  {
    icon: Sparkles,
    title: "Proposal Setups",
    desc: "Create an unforgettable moment. Romantic candle-lit settings, floral arrangements, fairy light installations, and intimate dining setups.",
    img: proposalImg,
  },
  {
    icon: Palette,
    title: "Themed Events",
    desc: "Immersive themed experiences that transport your guests. From concept development to full execution with props, lighting, and custom décor.",
  },
  {
    icon: Flower2,
    title: "Floral Design",
    desc: "Bespoke floral arrangements using premium blooms. Bouquets, centerpieces, installations, and seasonal arrangements for any occasion.",
  },
  {
    icon: Camera,
    title: "Event Styling",
    desc: "Complete event styling consultation. Colour palette development, venue selection support, vendor coordination, and day-of styling.",
  },
];

const Services = () => (
  <>
    <title>Services | Élara Events</title>
    <meta name="description" content="Explore our luxury event decoration services including weddings, birthdays, proposals, themed parties, floral design, and event styling." />

    <section className="section-padding">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">What We Offer</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-center mb-6">Our Services</h1>
          <div className="gold-divider" />
          <p className="text-center text-muted-foreground font-light text-sm md:text-base max-w-2xl mx-auto mt-6">
            Every event is unique, and so is our approach. We offer a comprehensive range of decoration and styling services tailored to your vision.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {services.map((service, i) => (
      <section key={service.title} className={i % 2 === 0 ? "bg-background" : "bg-secondary"}>
        <div className="container mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-24">
          <div className={`grid grid-cols-1 ${service.img ? "md:grid-cols-2" : ""} gap-12 items-center`}>
            <ScrollReveal className={i % 2 !== 0 && service.img ? "md:order-2" : ""}>
              <div className="max-w-lg">
                <service.icon size={28} className="text-primary mb-4" strokeWidth={1.5} />
                <h2 className="font-display text-2xl md:text-4xl font-light mb-4">{service.title}</h2>
                <p className="text-muted-foreground font-light leading-relaxed text-sm md:text-base">{service.desc}</p>
              </div>
            </ScrollReveal>
            {service.img && (
              <ScrollReveal delay={200} className={i % 2 !== 0 ? "md:order-1" : ""}>
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>
    ))}

    <section className="section-padding bg-background">
      <div className="container mx-auto text-center max-w-2xl">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-6">Have Something Special in Mind?</h2>
          <p className="text-muted-foreground font-light text-sm mb-8">
            We love bringing unique ideas to life. Let's discuss your vision.
          </p>
          <Link to="/booking">
            <Button className="rounded-none text-xs uppercase tracking-[0.15em] px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              Book a Consultation <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default Services;
