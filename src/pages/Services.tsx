import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import corporateImg from "@/assets/portfolio-corporate.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";

const services = [
  {
    title: "Wedding Decoration",
    desc: "Timeless floral arches, elegant table styling, bespoke lighting, and luxurious installations to make your special day truly unforgettable.",
    price: "$1,500",
    img: weddingImg,
  },
  {
    title: "Birthday Decoration",
    desc: "Custom balloon artistry, dessert table design, photo-worthy backdrops, and themed styling for milestone celebrations of all ages.",
    price: "$800",
    img: birthdayImg,
  },
  {
    title: "Proposal Decoration",
    desc: "Romantic candlelit setups, rose petal arrangements, fairy light canopies, and intimate dining scenes for the perfect moment.",
    price: "$600",
    img: proposalImg,
  },
  {
    title: "Corporate Event Decoration",
    desc: "Polished stage designs, branded floral centerpieces, gala dinner styling, and professional décor for conferences and awards.",
    price: "$2,000",
    img: corporateImg,
  },
  {
    title: "Custom Themed Decoration",
    desc: "Fully immersive themed experiences — from concept to execution with custom props, lighting, greenery, and bespoke installations.",
    price: "$1,200",
    img: themedImg,
  },
];

const Services = () => (
  <>
    <title>Services | Élara Events — Luxury Event Decoration</title>
    <meta name="description" content="Explore our luxury event decoration services — weddings, birthdays, proposals, corporate events, and custom themed decorations. Starting from $600." />

    {/* Header */}
    <section className="section-padding pb-8 md:pb-12">
      <div className="container mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">What We Offer</p>
          <h1 className="font-display text-4xl md:text-6xl font-light mb-5">Our Services</h1>
          <div className="gold-divider" />
          <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto">
            Every event is unique, and so is our approach. Explore our curated decoration services designed to bring your vision to life.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* Service Cards Grid */}
    <section className="px-5 md:px-8 lg:px-16 pb-16 md:pb-28">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 100}>
              <div className="bg-card rounded-2xl overflow-hidden shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.08)] hover:shadow-[0_12px_40px_-8px_hsl(var(--foreground)/0.15)] transition-shadow duration-500 flex flex-col h-full group">
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <h2 className="font-display text-xl md:text-2xl font-medium mb-3">{service.title}</h2>
                  <p className="text-muted-foreground font-light text-sm leading-relaxed flex-1 mb-5">
                    {service.desc}
                  </p>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Starting from</p>
                      <p className="font-display text-2xl text-primary">{service.price}</p>
                    </div>
                    <Link to="/booking">
                      <Button className="rounded-full text-[11px] uppercase tracking-[0.12em] px-5 py-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-none">
                        Request Service
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section-padding bg-secondary">
      <div className="container mx-auto text-center max-w-2xl">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-5">Have Something Special in Mind?</h2>
          <p className="text-muted-foreground font-light text-sm mb-8">
            We love bringing unique ideas to life. Let's discuss your vision and create something extraordinary together.
          </p>
          <Link to="/booking">
            <Button variant="outline" className="rounded-full text-xs uppercase tracking-[0.15em] px-10 py-6 border-foreground/20 hover:bg-foreground hover:text-background">
              Book a Consultation <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default Services;
