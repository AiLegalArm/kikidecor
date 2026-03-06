import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const packages = [
  {
    name: "Petal",
    subtitle: "Intimate Events",
    price: "From $1,500",
    features: [
      "Initial consultation",
      "Custom mood board",
      "Basic floral arrangements",
      "Table styling (up to 5 tables)",
      "Setup & teardown",
    ],
    featured: false,
  },
  {
    name: "Bloom",
    subtitle: "Full Styling",
    price: "From $3,500",
    features: [
      "Everything in Petal, plus:",
      "Venue walkthrough",
      "Premium floral design",
      "Table styling (up to 15 tables)",
      "Lighting design",
      "Backdrop installation",
      "Day-of coordination support",
    ],
    featured: true,
  },
  {
    name: "Luxe",
    subtitle: "Complete Experience",
    price: "From $7,000",
    features: [
      "Everything in Bloom, plus:",
      "Unlimited consultations",
      "Custom installations",
      "Full venue transformation",
      "Lounge area styling",
      "Dessert table design",
      "Vendor coordination",
      "Post-event breakdown",
    ],
    featured: false,
  },
];

const Packages = () => (
  <>
    <title>Packages | Élara Events</title>
    <meta name="description" content="Choose from our curated event decoration packages — Petal, Bloom, or Luxe — designed to suit every occasion and budget." />

    <section className="section-padding">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Pricing</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-center mb-6">Our Packages</h1>
          <div className="gold-divider" />
          <p className="text-center text-muted-foreground font-light text-sm max-w-xl mx-auto mt-6">
            Each package is a starting point — we customize every detail to match your vision and budget.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {packages.map((pkg, i) => (
            <ScrollReveal key={pkg.name} delay={i * 150}>
              <div className={cn(
                "border p-8 md:p-10 h-full flex flex-col",
                pkg.featured
                  ? "border-primary bg-card shadow-lg relative"
                  : "border-border bg-card"
              )}>
                {pkg.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] px-4 py-1">
                    Most Popular
                  </span>
                )}
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">{pkg.subtitle}</p>
                <h3 className="font-display text-3xl font-light mb-2">{pkg.name}</h3>
                <p className="font-display text-xl text-muted-foreground mb-8">{pkg.price}</p>
                <ul className="space-y-3 flex-1">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm font-light text-foreground/80">
                      <Check size={14} className="text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/booking" className="mt-8">
                  <Button className={cn(
                    "w-full rounded-none text-xs uppercase tracking-[0.15em] py-5",
                    pkg.featured
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-transparent border border-foreground/20 text-foreground hover:bg-foreground hover:text-background"
                  )}>
                    Get Started
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={500}>
          <p className="text-center text-muted-foreground font-light text-xs mt-12">
            Need something bespoke? <Link to="/contact" className="text-primary hover:underline">Contact us</Link> for a custom quote.
          </p>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default Packages;
