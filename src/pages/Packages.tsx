import { Link } from "react-router-dom";
import { Check, X, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const packages = [
  {
    name: "Basic Package",
    subtitle: "Essential Elegance",
    price: "$800",
    featured: false,
    items: {
      decor: "Standard table décor & accent pieces",
      balloons: "Single-color balloon cluster (up to 30)",
      flowers: "3 small floral arrangements",
      backdrop: "Simple fabric backdrop (8×6 ft)",
      setup: "Setup & teardown included",
    },
    extras: [
      "Color coordination",
      "1 consultation session",
      "Event day setup crew (2 staff)",
    ],
  },
  {
    name: "Standard Package",
    subtitle: "Most Popular",
    price: "$2,200",
    featured: true,
    items: {
      decor: "Premium table styling with centerpieces & candles",
      balloons: "Custom balloon garland & arch (up to 80)",
      flowers: "6 medium floral arrangements + bouquet",
      backdrop: "Decorated backdrop with florals & lights (10×8 ft)",
      setup: "Full setup, styling & teardown",
    },
    extras: [
      "Custom color palette & mood board",
      "2 consultation sessions + venue visit",
      "Event day crew (4 staff)",
      "Welcome signage & table numbers",
      "Candle & lighting accents",
    ],
  },
  {
    name: "Premium Package",
    subtitle: "Complete Luxury",
    price: "$5,500",
    featured: false,
    items: {
      decor: "Bespoke installations, lounge area & full venue styling",
      balloons: "Grand balloon installation & multiple arches (150+)",
      flowers: "10+ premium floral arrangements & hanging installations",
      backdrop: "Custom-designed statement backdrop (12×10 ft)",
      setup: "Full design, setup, management & teardown",
    },
    extras: [
      "Unlimited consultations & revisions",
      "Complete event design from concept to execution",
      "Event day crew (6+ staff)",
      "Dessert table & cake stand styling",
      "Photo area / selfie corner design",
      "Lighting design (fairy lights, uplighting)",
      "Vendor coordination support",
      "Post-event breakdown & cleanup",
    ],
  },
];

const comparisonFeatures = [
  { label: "Consultation sessions", basic: "1", standard: "2 + venue visit", premium: "Unlimited" },
  { label: "Balloon decoration", basic: "Cluster (30 pcs)", standard: "Garland & arch (80)", premium: "Grand installation (150+)" },
  { label: "Floral arrangements", basic: "3 small", standard: "6 medium + bouquet", premium: "10+ premium + hanging" },
  { label: "Backdrop", basic: "Simple fabric 8×6ft", standard: "Decorated 10×8ft", premium: "Custom statement 12×10ft" },
  { label: "Table styling", basic: "Basic accents", standard: "Centerpieces & candles", premium: "Full bespoke styling" },
  { label: "Setup crew", basic: "2 staff", standard: "4 staff", premium: "6+ staff" },
  { label: "Mood board & color palette", basic: false, standard: true, premium: true },
  { label: "Welcome signage", basic: false, standard: true, premium: true },
  { label: "Lighting design", basic: false, standard: false, premium: true },
  { label: "Dessert table styling", basic: false, standard: false, premium: true },
  { label: "Photo area / selfie corner", basic: false, standard: false, premium: true },
  { label: "Lounge area styling", basic: false, standard: false, premium: true },
  { label: "Vendor coordination", basic: false, standard: false, premium: true },
  { label: "Post-event cleanup", basic: "Basic teardown", standard: "Full teardown", premium: "Full breakdown & cleanup" },
];

const Packages = () => (
  <>
    <title>Decoration Packages | Élara Events</title>
    <meta name="description" content="Choose from Basic, Standard, or Premium decoration packages. Each includes balloons, flowers, backdrop, decor elements, and professional setup service." />

    {/* Header */}
    <section className="section-padding pb-8 md:pb-12">
      <div className="container mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Pricing</p>
          <h1 className="font-display text-4xl md:text-6xl font-light mb-5">Decoration Packages</h1>
          <div className="gold-divider" />
          <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto">
            From intimate gatherings to grand celebrations — choose a package that fits your event, then let us customize every detail.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* Package Cards */}
    <section className="px-5 md:px-8 lg:px-16 pb-20 md:pb-28">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {packages.map((pkg, i) => (
            <ScrollReveal key={pkg.name} delay={i * 120}>
              <div
                className={cn(
                  "rounded-2xl p-7 md:p-9 h-full flex flex-col transition-shadow duration-500 relative",
                  pkg.featured
                    ? "bg-card shadow-[0_8px_40px_-8px_hsl(var(--primary)/0.25)] border-2 border-primary"
                    : "bg-card shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.07)] border border-border hover:shadow-[0_8px_35px_-8px_hsl(var(--foreground)/0.12)]"
                )}
              >
                {pkg.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] px-5 py-1.5 rounded-full font-medium">
                    Most Popular
                  </span>
                )}

                {/* Tier */}
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary mb-2">{pkg.subtitle}</p>
                <h2 className="font-display text-2xl md:text-3xl font-medium mb-1">{pkg.name}</h2>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="font-display text-3xl md:text-4xl text-primary">{pkg.price}</span>
                  <span className="text-xs text-muted-foreground font-light">starting</span>
                </div>

                {/* What's Included */}
                <div className="space-y-4 flex-1 mb-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Includes</p>

                  {/* Core items */}
                  {Object.entries(pkg.items).map(([key, val]) => (
                    <div key={key} className="flex items-start gap-3">
                      <Check size={14} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-foreground/60 block mb-0.5">
                          {key === "decor" ? "Decor Elements" : key === "setup" ? "Setup Service" : key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span className="text-sm font-light text-foreground/80">{val}</span>
                      </div>
                    </div>
                  ))}

                  {/* Extras */}
                  {pkg.extras.length > 0 && (
                    <div className="pt-3 border-t border-border/60">
                      {pkg.extras.map((extra) => (
                        <div key={extra} className="flex items-start gap-3 mb-2.5">
                          <Check size={12} className="text-primary/70 mt-0.5 shrink-0" />
                          <span className="text-[13px] font-light text-foreground/70">{extra}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <Link to="/booking" className="block">
                    <Button
                      className={cn(
                        "w-full rounded-xl text-xs uppercase tracking-[0.12em] py-5",
                        pkg.featured
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-foreground hover:bg-foreground/90 text-background"
                      )}
                    >
                      Book Package
                    </Button>
                  </Link>
                  <Link to="/contact" className="block">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl text-xs uppercase tracking-[0.12em] py-5 border-border hover:bg-secondary"
                    >
                      Contact Planner
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Comparison Table */}
    <section className="section-padding bg-secondary">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Compare</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-4">Package Comparison</h2>
          <div className="gold-divider mb-14" />
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="overflow-x-auto rounded-2xl bg-card shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.06)] border border-border/50">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium w-[35%]">
                    Feature
                  </th>
                  <th className="text-center p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                    Basic
                  </th>
                  <th className="text-center p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-primary font-medium bg-primary/5">
                    Standard ★
                  </th>
                  <th className="text-center p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={row.label} className={cn("border-b border-border/50 last:border-0", i % 2 === 0 ? "" : "bg-secondary/30")}>
                    <td className="p-4 md:p-5 text-sm font-light text-foreground/80">{row.label}</td>
                    {(["basic", "standard", "premium"] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td
                          key={tier}
                          className={cn(
                            "p-4 md:p-5 text-center text-sm font-light",
                            tier === "standard" ? "bg-primary/5" : ""
                          )}
                        >
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check size={16} className="text-primary mx-auto" />
                            ) : (
                              <X size={16} className="text-muted-foreground/30 mx-auto" />
                            )
                          ) : (
                            <span className="text-foreground/70">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="text-center mt-12">
            <p className="text-muted-foreground font-light text-sm mb-6">
              Not sure which package is right for you? We're happy to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/booking">
                <Button className="rounded-xl text-xs uppercase tracking-[0.12em] px-8 py-5 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[180px]">
                  Book Package <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="rounded-xl text-xs uppercase tracking-[0.12em] px-8 py-5 border-foreground/20 hover:bg-foreground hover:text-background min-w-[180px]">
                  Contact Planner
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default Packages;
