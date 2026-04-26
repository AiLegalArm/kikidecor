import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calculator as CalcIcon, ArrowRight, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

const eventMultipliers: Record<string, number> = {
  wedding: 1.4, birthday: 1.0, corporate: 1.2, kids: 0.9, proposal: 1.1, anniversary: 1.15, other: 1.0,
};

const styleMultipliers: Record<string, number> = {
  minimal: 0.8, classic: 1.0, romantic: 1.15, luxury: 1.6, themed: 1.3,
};

const extraPrices: Record<string, number> = {
  balloons: 5000, flowers: 8000, lighting: 7000, photozone: 6000, sweetbar: 4000, lounge: 10000, signage: 3000, cleanup: 5000,
};

const BASE_PRICE = 10000;
const PER_GUEST = 300;

const Calculator = () => {
  const { lang, t } = useLanguage();
  const c = t.calc;

  useSEO({
    title: lang === "ru" ? "Калькулятор стоимости декора — Ki Ki Decor" : "Decor Cost Calculator — Ki Ki Decor",
    description: lang === "ru"
      ? "Рассчитайте ориентировочную стоимость оформления вашего события за минуту."
      : "Estimate your event styling cost in under a minute.",
    canonical: "https://kiki-shop.online/calculator",
  });

  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState([30]);
  const [decorStyle, setDecorStyle] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const estimate = useMemo(() => {
    const eventMult = eventMultipliers[eventType];
    const styleMult = styleMultipliers[decorStyle];
    if (!eventMult || !styleMult) return null;

    const extrasTotal = selectedExtras.reduce((sum, id) => sum + (extraPrices[id] || 0), 0);
    const base = (BASE_PRICE + guestCount[0] * PER_GUEST) * eventMult * styleMult;
    const total = base + extrasTotal;
    return { low: Math.round(total * 0.85 / 1000) * 1000, high: Math.round(total * 1.2 / 1000) * 1000 };
  }, [eventType, guestCount, decorStyle, selectedExtras]);

  const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

  return (
    <>
      <title>{c.title[lang]} — KiKi</title>

      <section className="section-padding pb-8 md:pb-12">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">{c.overline[lang]}</p>
            <h1 className="font-display text-4xl md:text-6xl font-light mb-5">{c.title[lang]}</h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto">{c.subtitle[lang]}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-5 md:px-8 lg:px-16 pb-20 md:pb-28">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <ScrollReveal className="lg:col-span-3">
              <div className="rounded-2xl bg-card border border-border/50 shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.07)] p-7 md:p-9 space-y-8">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{c.eventType[lang]}</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="rounded-xl border-border"><SelectValue placeholder={c.selectType[lang]} /></SelectTrigger>
                    <SelectContent>
                      {c.eventTypes.map((et) => (
                        <SelectItem key={et.value} value={et.value}>{et[lang]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{c.guests[lang]}</Label>
                    <span className="font-display text-2xl text-primary">{guestCount[0]}</span>
                  </div>
                  <Slider value={guestCount} onValueChange={setGuestCount} min={10} max={300} step={5} className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary" />
                  <div className="flex justify-between text-[11px] text-muted-foreground font-light"><span>10</span><span>300</span></div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{c.decorStyle[lang]}</Label>
                  <Select value={decorStyle} onValueChange={setDecorStyle}>
                    <SelectTrigger className="rounded-xl border-border"><SelectValue placeholder={c.selectStyle[lang]} /></SelectTrigger>
                    <SelectContent>
                      {c.decorStyles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s[lang]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{c.extras[lang]}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {c.extraServices.map((svc) => (
                      <label
                        key={svc.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-200",
                          selectedExtras.includes(svc.id) ? "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]" : "border-border hover:border-primary/30"
                        )}
                      >
                        <Checkbox checked={selectedExtras.includes(svc.id)} onCheckedChange={() => toggleExtra(svc.id)} />
                        <div className="flex-1">
                          <span className="text-sm font-light text-foreground/90 block">{svc[lang]}</span>
                          <span className="text-xs text-muted-foreground">{c.from[lang]} {fmt(extraPrices[svc.id])}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200} className="lg:col-span-2">
              <div className="rounded-2xl bg-card border-2 border-primary shadow-[0_8px_40px_-8px_hsl(var(--primary)/0.2)] p-7 md:p-9 sticky top-28">
                <div className="flex items-center gap-2 mb-6">
                  <CalcIcon size={18} className="text-primary" />
                  <p className="text-[11px] uppercase tracking-[0.15em] text-primary font-medium">{c.estimate[lang]}</p>
                </div>

                {estimate ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-2">{c.range[lang]}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-3xl md:text-4xl text-primary">{fmt(estimate.low)}</span>
                        <span className="text-muted-foreground font-light">—</span>
                        <span className="font-display text-2xl md:text-3xl text-primary/80">{fmt(estimate.high)}</span>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-4 space-y-2">
                      <div className="flex justify-between text-sm font-light">
                        <span className="text-muted-foreground">{c.type[lang]}</span>
                        <span className="text-foreground/80">{c.eventTypes.find((e) => e.value === eventType)?.[lang]}</span>
                      </div>
                      <div className="flex justify-between text-sm font-light">
                        <span className="text-muted-foreground">{c.guestsLabel[lang]}</span>
                        <span className="text-foreground/80">{guestCount[0]} {c.people[lang]}</span>
                      </div>
                      <div className="flex justify-between text-sm font-light">
                        <span className="text-muted-foreground">{c.style[lang]}</span>
                        <span className="text-foreground/80">{c.decorStyles.find((s) => s.value === decorStyle)?.[lang]}</span>
                      </div>
                      {selectedExtras.length > 0 && (
                        <div className="flex justify-between text-sm font-light">
                          <span className="text-muted-foreground">{c.extrasCount[lang]}</span>
                          <span className="text-foreground/80">{selectedExtras.length} {c.pcs[lang]}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/60 border border-border/40">
                      <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
                      <p className="text-xs font-light text-muted-foreground leading-relaxed">{c.disclaimer[lang]}</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Link to="/booking" className="block">
                        <Button className="w-full rounded-xl text-xs uppercase tracking-[0.12em] py-5 bg-primary hover:bg-primary/90 text-primary-foreground">
                          {c.submitRequest[lang]} <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </Link>
                      <Link to="/contact" className="block">
                        <Button variant="outline" className="w-full rounded-xl text-xs uppercase tracking-[0.12em] py-5 border-border hover:bg-secondary">
                          {c.discussDecorator[lang]}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      <CalcIcon size={24} className="text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-light text-muted-foreground">{c.emptyState[lang]}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default Calculator;
