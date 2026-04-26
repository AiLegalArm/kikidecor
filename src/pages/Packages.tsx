import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

type DbPackage = {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  price_from: number;
  price_to: number | null;
  currency: string;
  features: string[];
  features_en: string[];
  is_featured: boolean;
  cta_label: string | null;
  cta_label_en: string | null;
};

const Packages = () => {
  const { lang, t } = useLanguage();
  const p = t.packages;
  const pd = t.packagesData;
  const fallback = pd.items;
  const comparison = pd.comparison;
  const [dbPackages, setDbPackages] = useState<DbPackage[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("packages")
        .select("id, slug, name, name_en, subtitle, subtitle_en, price_from, price_to, currency, features, features_en, is_featured, cta_label, cta_label_en")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (!cancelled && data && data.length > 0) {
        setDbPackages(data as unknown as DbPackage[]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useSEO({
    title: lang === "ru" ? "Пакеты декора — Ki Ki Decor" : "Decor Packages — Ki Ki Decor",
    description: lang === "ru"
      ? "Готовые пакеты: Базовый, Стандарт, Премиум. Прозрачные цены и состав."
      : "Ready packages: Basic, Standard, Premium. Transparent pricing and scope.",
    canonical: "https://kiki-shop.online/packages",
  });

  const itemKeyLabels: Record<string, { ru: string; en: string }> = {
    decor: { ru: "Декор", en: "Decor" },
    balloons: { ru: "Шары", en: "Balloons" },
    flowers: { ru: "Цветы", en: "Flowers" },
    backdrop: { ru: "Задник", en: "Backdrop" },
    setup: { ru: "Монтаж", en: "Setup" },
  };

  const fmtPrice = (n: number, currency: string) => {
    const sym = currency === "RUB" ? "₽" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;
    return `${new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US").format(n)} ${sym}`;
  };

  return (
    <>
      <title>{lang === "ru" ? "Пакеты и цены на event decoration | Ki Ki Decor" : "Packages & Pricing for Event Decoration | Ki Ki Decor"}</title>
      <meta name="description" content={lang === "ru" ? "Пакеты декора Ki Ki Decor: Базовый, Стандарт, Премиум. Wedding decoration, birthday decor, event styling от 15 000 ₽." : "Ki Ki Decor packages: Basic, Standard, Premium. Wedding decoration, birthday decor, event styling from ₽15,000."} />

      <section className="section-padding pb-8 md:pb-12">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary font-semibold mb-5">{p.overline[lang]}</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light mb-5 leading-[1] tracking-tight">{p.title[lang]}</h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-normal text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed">
              {p.subtitle[lang]}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-5 md:px-8 lg:px-16 pb-20 md:pb-28">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {dbPackages ? dbPackages.map((pkg, i) => {
              const featured = pkg.is_featured;
              const number = String(i + 1).padStart(2, "0");
              const name = lang === "en" && pkg.name_en ? pkg.name_en : pkg.name;
              const subtitle = lang === "en" && pkg.subtitle_en ? pkg.subtitle_en : (pkg.subtitle || "");
              const features = lang === "en" && pkg.features_en?.length ? pkg.features_en : pkg.features;
              const cta = lang === "en" && pkg.cta_label_en ? pkg.cta_label_en : (pkg.cta_label || p.orderPackage[lang]);
              return (
                <ScrollReveal key={pkg.id} delay={i * 120}>
                  <div className={cn(
                    "p-7 md:p-9 h-full flex flex-col transition-all duration-500 relative",
                    featured
                      ? "bg-card border border-primary/60 shadow-[0_12px_50px_-12px_hsl(var(--primary)/0.30)]"
                      : "bg-card border border-border/70 hover:border-foreground/30 hover:shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.15)]"
                  )}>
                    {featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.3em] px-5 py-1.5 font-semibold">
                        {p.popular[lang]}
                      </span>
                    )}
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">{subtitle}</p>
                      <span className="font-display text-3xl font-light text-border leading-none">{number}</span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-1">{name}</h2>
                    <div className="w-10 h-px bg-primary/40 my-4" />
                    <div className="flex items-baseline gap-1 mb-7">
                      <span className="font-display text-3xl md:text-4xl text-primary">{fmtPrice(pkg.price_from, pkg.currency)}</span>
                      <span className="text-xs text-muted-foreground font-light">{p.from[lang]}</span>
                    </div>
                    <div className="space-y-4 flex-1 mb-8">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">{p.included[lang]}</p>
                      {features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check size={14} className="text-primary mt-0.5 shrink-0" />
                          <span className="text-sm font-light text-foreground/80">{feat}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <Link to="/booking" className="block">
                        <Button className={cn(
                          "w-full rounded-none text-[11px] uppercase tracking-[0.25em] py-5 font-semibold",
                          featured ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-foreground hover:bg-foreground/90 text-background"
                        )}>
                          {cta}
                        </Button>
                      </Link>
                      <Link to="/contact" className="block">
                        <Button variant="outline" className="w-full rounded-none text-[11px] uppercase tracking-[0.25em] py-5 border-border hover:bg-secondary font-semibold">
                          {p.contactDecorator[lang]}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            }) : fallback.map((pkg, i) => {
              const featured = i === 1;
              const number = String(i + 1).padStart(2, "0");
              return (
                <ScrollReveal key={i} delay={i * 120}>
                  <div className={cn(
                    "p-7 md:p-9 h-full flex flex-col transition-all duration-500 relative",
                    featured
                      ? "bg-card border border-primary/60 shadow-[0_12px_50px_-12px_hsl(var(--primary)/0.30)]"
                      : "bg-card border border-border/70 hover:border-foreground/30 hover:shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.15)]"
                  )}>
                    {featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.3em] px-5 py-1.5 font-semibold">
                        {p.popular[lang]}
                      </span>
                    )}
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">{pkg.subtitle[lang]}</p>
                      <span className="font-display text-3xl font-light text-border leading-none">{number}</span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-1">{pkg.name[lang]}</h2>
                    <div className="w-10 h-px bg-primary/40 my-4" />
                    <div className="flex items-baseline gap-1 mb-7">
                      <span className="font-display text-3xl md:text-4xl text-primary">{pkg.price[lang]}</span>
                      <span className="text-xs text-muted-foreground font-light">{p.from[lang]}</span>
                    </div>
                    <div className="space-y-4 flex-1 mb-8">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">{p.included[lang]}</p>
                      {(["decor", "balloons", "flowers", "backdrop", "setup"] as const).map((key) => (
                        <div key={key} className="flex items-start gap-3">
                          <Check size={14} className="text-primary mt-0.5 shrink-0" />
                          <div>
                            <span className="text-xs font-medium uppercase tracking-wide text-foreground/60 block mb-0.5">
                              {itemKeyLabels[key][lang]}
                            </span>
                            <span className="text-sm font-light text-foreground/80">{pkg[key][lang]}</span>
                          </div>
                        </div>
                      ))}
                      {pkg.extras[lang].length > 0 && (
                        <div className="pt-3 border-t border-border/60">
                          {pkg.extras[lang].map((extra) => (
                            <div key={extra} className="flex items-start gap-3 mb-2.5">
                              <Check size={12} className="text-primary/70 mt-0.5 shrink-0" />
                              <span className="text-[13px] font-light text-foreground/70">{extra}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Link to="/booking" className="block">
                        <Button className={cn(
                          "w-full rounded-none text-[11px] uppercase tracking-[0.25em] py-5 font-semibold",
                          featured ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-foreground hover:bg-foreground/90 text-background"
                        )}>
                          {p.orderPackage[lang]}
                        </Button>
                      </Link>
                      <Link to="/contact" className="block">
                        <Button variant="outline" className="w-full rounded-none text-[11px] uppercase tracking-[0.25em] py-5 border-border hover:bg-secondary font-semibold">
                          {p.contactDecorator[lang]}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">{p.comparisonOverline[lang]}</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-4">{p.comparisonTitle[lang]}</h2>
            <div className="gold-divider mb-14" />
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="overflow-x-auto rounded-2xl bg-card shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.06)] border border-border/50">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium w-[35%]">{p.option[lang]}</th>
                    <th className="text-center p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{fallback[0].name[lang]}</th>
                    <th className="text-center p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-primary font-medium bg-primary/5">{fallback[1].name[lang]} ★</th>
                    <th className="text-center p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{fallback[2].name[lang]}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={i} className={cn("border-b border-border/50 last:border-0", i % 2 === 0 ? "" : "bg-secondary/30")}>
                      <td className="p-4 md:p-5 text-sm font-light text-foreground/80">{row.label[lang]}</td>
                      {(["basic", "standard", "premium"] as const).map((tier) => {
                        const val = row[tier];
                        return (
                          <td key={tier} className={cn("p-4 md:p-5 text-center text-sm font-light", tier === "standard" ? "bg-primary/5" : "")}>
                            {typeof val === "boolean" ? (
                              val ? <Check size={16} className="text-primary mx-auto" /> : <X size={16} className="text-muted-foreground/30 mx-auto" />
                            ) : (
                              <span className="text-foreground/70">{typeof val === "object" ? val[lang] : val}</span>
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
              <p className="text-muted-foreground font-light text-sm mb-6">{p.notSure[lang]}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/booking">
                  <Button className="rounded-xl text-xs uppercase tracking-[0.12em] px-8 py-5 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[180px]">
                    {p.orderPackage[lang]} <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="rounded-xl text-xs uppercase tracking-[0.12em] px-8 py-5 border-foreground/20 hover:bg-foreground hover:text-background min-w-[180px]">
                    {p.contactUs[lang]}
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default Packages;
