import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calculator as CalcIcon, ArrowRight, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const eventTypes = [
  { value: "wedding", label: "Свадьба", multiplier: 1.4 },
  { value: "birthday", label: "День рождения", multiplier: 1.0 },
  { value: "corporate", label: "Корпоратив", multiplier: 1.2 },
  { value: "kids", label: "Детский праздник", multiplier: 0.9 },
  { value: "proposal", label: "Предложение руки", multiplier: 1.1 },
  { value: "anniversary", label: "Юбилей", multiplier: 1.15 },
  { value: "other", label: "Другое", multiplier: 1.0 },
];

const decorStyles = [
  { value: "minimal", label: "Минимализм", multiplier: 0.8 },
  { value: "classic", label: "Классика", multiplier: 1.0 },
  { value: "romantic", label: "Романтика", multiplier: 1.15 },
  { value: "luxury", label: "Люкс", multiplier: 1.6 },
  { value: "themed", label: "Тематический", multiplier: 1.3 },
];

const extraServices = [
  { id: "balloons", label: "Шары и арки", price: 5000 },
  { id: "flowers", label: "Живые цветы", price: 8000 },
  { id: "lighting", label: "Световой дизайн", price: 7000 },
  { id: "photozone", label: "Фотозона", price: 6000 },
  { id: "sweetbar", label: "Сладкий стол", price: 4000 },
  { id: "lounge", label: "Лаунж-зона", price: 10000 },
  { id: "signage", label: "Таблички и нумерация", price: 3000 },
  { id: "cleanup", label: "Полная уборка", price: 5000 },
];

const BASE_PRICE = 10000;
const PER_GUEST = 300;

const Calculator = () => {
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState([30]);
  const [decorStyle, setDecorStyle] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const estimate = useMemo(() => {
    const event = eventTypes.find((e) => e.value === eventType);
    const style = decorStyles.find((s) => s.value === decorStyle);

    if (!event || !style) return null;

    const extrasTotal = extraServices
      .filter((s) => selectedExtras.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);

    const base =
      (BASE_PRICE + guestCount[0] * PER_GUEST) *
      event.multiplier *
      style.multiplier;

    const total = base + extrasTotal;
    const low = Math.round(total * 0.85 / 1000) * 1000;
    const high = Math.round(total * 1.2 / 1000) * 1000;

    return { low, high };
  }, [eventType, guestCount, decorStyle, selectedExtras]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("ru-RU").format(n) + " ₽";

  return (
    <>
      <title>Калькулятор стоимости декора | Ki Ki Decor</title>
      <meta name="description" content="Рассчитайте стоимость event decoration онлайн. Wedding decoration, birthday decor, proposal decor — мгновенный расчёт." />
      <meta property="og:title" content="Калькулятор стоимости декора — Ki Ki Decor" />
      <meta property="og:description" content="Онлайн-калькулятор стоимости оформления мероприятия. Мгновенный расчёт." />
      <meta property="og:type" content="website" />

      <section className="section-padding pb-8 md:pb-12">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">
              Онлайн-расчёт
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-light mb-5">
              Калькулятор стоимости
            </h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto">
              Получите предварительную оценку стоимости оформления за пару кликов. Финальная цена уточняется после консультации.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-5 md:px-8 lg:px-16 pb-20 md:pb-28">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <ScrollReveal className="lg:col-span-3">
              <div className="rounded-2xl bg-card border border-border/50 shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.07)] p-7 md:p-9 space-y-8">
                {/* Event Type */}
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                    Тип мероприятия
                  </Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="rounded-xl border-border">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Guest Count */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                      Количество гостей
                    </Label>
                    <span className="font-display text-2xl text-primary">
                      {guestCount[0]}
                    </span>
                  </div>
                  <Slider
                    value={guestCount}
                    onValueChange={setGuestCount}
                    min={10}
                    max={300}
                    step={5}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground font-light">
                    <span>10</span>
                    <span>300</span>
                  </div>
                </div>

                {/* Decoration Style */}
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                    Стиль декора
                  </Label>
                  <Select value={decorStyle} onValueChange={setDecorStyle}>
                    <SelectTrigger className="rounded-xl border-border">
                      <SelectValue placeholder="Выберите стиль" />
                    </SelectTrigger>
                    <SelectContent>
                      {decorStyles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Extra Services */}
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                    Дополнительные услуги
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {extraServices.map((svc) => (
                      <label
                        key={svc.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-200",
                          selectedExtras.includes(svc.id)
                            ? "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <Checkbox
                          checked={selectedExtras.includes(svc.id)}
                          onCheckedChange={() => toggleExtra(svc.id)}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-light text-foreground/90 block">
                            {svc.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            от {fmt(svc.price)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Result */}
            <ScrollReveal delay={200} className="lg:col-span-2">
              <div className="rounded-2xl bg-card border-2 border-primary shadow-[0_8px_40px_-8px_hsl(var(--primary)/0.2)] p-7 md:p-9 sticky top-28">
                <div className="flex items-center gap-2 mb-6">
                  <CalcIcon size={18} className="text-primary" />
                  <p className="text-[11px] uppercase tracking-[0.15em] text-primary font-medium">
                    Предварительный расчёт
                  </p>
                </div>

                {estimate ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-muted-foreground font-light mb-2">
                        Ориентировочный диапазон
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-3xl md:text-4xl text-primary">
                          {fmt(estimate.low)}
                        </span>
                        <span className="text-muted-foreground font-light">—</span>
                        <span className="font-display text-2xl md:text-3xl text-primary/80">
                          {fmt(estimate.high)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-4 space-y-2">
                      <div className="flex justify-between text-sm font-light">
                        <span className="text-muted-foreground">Тип</span>
                        <span className="text-foreground/80">
                          {eventTypes.find((e) => e.value === eventType)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-light">
                        <span className="text-muted-foreground">Гости</span>
                        <span className="text-foreground/80">{guestCount[0]} чел.</span>
                      </div>
                      <div className="flex justify-between text-sm font-light">
                        <span className="text-muted-foreground">Стиль</span>
                        <span className="text-foreground/80">
                          {decorStyles.find((s) => s.value === decorStyle)?.label}
                        </span>
                      </div>
                      {selectedExtras.length > 0 && (
                        <div className="flex justify-between text-sm font-light">
                          <span className="text-muted-foreground">Доп. услуги</span>
                          <span className="text-foreground/80">
                            {selectedExtras.length} шт.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/60 border border-border/40">
                      <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
                      <p className="text-xs font-light text-muted-foreground leading-relaxed">
                        Это предварительная оценка. Точная стоимость зависит от деталей и площадки.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Link to="/booking" className="block">
                        <Button className="w-full rounded-xl text-xs uppercase tracking-[0.12em] py-5 bg-primary hover:bg-primary/90 text-primary-foreground">
                          Оставить заявку <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </Link>
                      <Link to="/contact" className="block">
                        <Button
                          variant="outline"
                          className="w-full rounded-xl text-xs uppercase tracking-[0.12em] py-5 border-border hover:bg-secondary"
                        >
                          Обсудить с декоратором
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      <CalcIcon size={24} className="text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-light text-muted-foreground">
                      Выберите тип мероприятия и стиль декора, чтобы увидеть расчёт
                    </p>
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
