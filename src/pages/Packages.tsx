import { Link } from "react-router-dom";
import { Check, X, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const packages = [
  {
    name: "Базовый",
    subtitle: "Для небольших праздников",
    price: "15 000 ₽",
    featured: false,
    items: {
      decor: "Стандартное оформление стола и акцентные элементы",
      balloons: "Однотонная связка шаров (до 30 шт.)",
      flowers: "3 небольших цветочных композиции",
      backdrop: "Тканевый задник (2.5×2 м)",
      setup: "Монтаж и демонтаж включены",
    },
    extras: [
      "Подбор цветовой гаммы",
      "1 консультация",
      "Команда монтажа (2 чел.)",
    ],
  },
  {
    name: "Стандарт",
    subtitle: "Самый популярный",
    price: "40 000 ₽",
    featured: true,
    items: {
      decor: "Премиальное оформление столов с центральными композициями и свечами",
      balloons: "Гирлянда и арка из шаров (до 80 шт.)",
      flowers: "6 средних цветочных композиций + букет",
      backdrop: "Декорированный задник с цветами и подсветкой (3×2.5 м)",
      setup: "Полный монтаж, стилизация и демонтаж",
    },
    extras: [
      "Мудборд и цветовая палитра",
      "2 консультации + выезд на площадку",
      "Команда монтажа (4 чел.)",
      "Приветственная табличка и нумерация столов",
      "Свечи и световые акценты",
    ],
  },
  {
    name: "Премиум",
    subtitle: "Полный люкс",
    price: "100 000 ₽",
    featured: false,
    items: {
      decor: "Авторские инсталляции, лаунж-зона и полное оформление площадки",
      balloons: "Масштабная инсталляция и несколько арок (150+ шт.)",
      flowers: "10+ премиальных цветочных композиций и подвесные инсталляции",
      backdrop: "Индивидуальный дизайнерский задник (3.5×3 м)",
      setup: "Полный дизайн, монтаж, координация и демонтаж",
    },
    extras: [
      "Неограниченные консультации и правки",
      "Полный дизайн-проект от идеи до реализации",
      "Команда монтажа (6+ чел.)",
      "Оформление сладкого стола",
      "Фотозона / селфи-уголок",
      "Световой дизайн (гирлянды, подсветка)",
      "Координация подрядчиков",
      "Полная уборка после мероприятия",
    ],
  },
];

const comparisonFeatures = [
  { label: "Консультации", basic: "1", standard: "2 + выезд", premium: "Без ограничений" },
  { label: "Шары", basic: "Связка (30 шт.)", standard: "Гирлянда и арка (80)", premium: "Масштабная инсталляция (150+)" },
  { label: "Цветочные композиции", basic: "3 небольших", standard: "6 средних + букет", premium: "10+ премиум + подвесные" },
  { label: "Задник", basic: "Ткань 2.5×2 м", standard: "Декорированный 3×2.5 м", premium: "Авторский 3.5×3 м" },
  { label: "Оформление столов", basic: "Базовые акценты", standard: "Центральные композиции и свечи", premium: "Полная авторская стилизация" },
  { label: "Команда монтажа", basic: "2 чел.", standard: "4 чел.", premium: "6+ чел." },
  { label: "Мудборд и палитра", basic: false, standard: true, premium: true },
  { label: "Приветственная табличка", basic: false, standard: true, premium: true },
  { label: "Световой дизайн", basic: false, standard: false, premium: true },
  { label: "Сладкий стол", basic: false, standard: false, premium: true },
  { label: "Фотозона", basic: false, standard: false, premium: true },
  { label: "Лаунж-зона", basic: false, standard: false, premium: true },
  { label: "Координация подрядчиков", basic: false, standard: false, premium: true },
  { label: "Уборка после мероприятия", basic: "Базовый демонтаж", standard: "Полный демонтаж", premium: "Полная уборка" },
];

const Packages = () => (
  <>
    <title>Пакеты и цены на event decoration | Ki Ki Decor</title>
    <meta name="description" content="Пакеты декора Ki Ki Decor: Базовый, Стандарт, Премиум. Wedding decoration, birthday decor, event styling от 15 000 ₽." />
    <meta property="og:title" content="Пакеты декора — Ki Ki Decor" />
    <meta property="og:description" content="Выберите пакет оформления: шары, цветы, задники, монтаж. От 15 000 ₽." />
    <meta property="og:type" content="website" />

    <section className="section-padding pb-8 md:pb-12">
      <div className="container mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Цены</p>
          <h1 className="font-display text-4xl md:text-6xl font-light mb-5">Пакеты декора</h1>
          <div className="gold-divider" />
          <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto">
            От камерных торжеств до масштабных праздников — выберите пакет, а мы настроим каждую деталь под вас.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="px-5 md:px-8 lg:px-16 pb-20 md:pb-28">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {packages.map((pkg, i) => (
            <ScrollReveal key={pkg.name} delay={i * 120}>
              <div className={cn(
                "rounded-2xl p-7 md:p-9 h-full flex flex-col transition-shadow duration-500 relative",
                pkg.featured
                  ? "bg-card shadow-[0_8px_40px_-8px_hsl(var(--primary)/0.25)] border-2 border-primary"
                  : "bg-card shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.07)] border border-border hover:shadow-[0_8px_35px_-8px_hsl(var(--foreground)/0.12)]"
              )}>
                {pkg.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] px-5 py-1.5 rounded-full font-medium">
                    Популярный
                  </span>
                )}
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary mb-2">{pkg.subtitle}</p>
                <h2 className="font-display text-2xl md:text-3xl font-medium mb-1">{pkg.name}</h2>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="font-display text-3xl md:text-4xl text-primary">{pkg.price}</span>
                  <span className="text-xs text-muted-foreground font-light">от</span>
                </div>
                <div className="space-y-4 flex-1 mb-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Включено</p>
                  {Object.entries(pkg.items).map(([key, val]) => (
                    <div key={key} className="flex items-start gap-3">
                      <Check size={14} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-foreground/60 block mb-0.5">
                          {key === "decor" ? "Декор" : key === "setup" ? "Монтаж" : key === "balloons" ? "Шары" : key === "flowers" ? "Цветы" : "Задник"}
                        </span>
                        <span className="text-sm font-light text-foreground/80">{val}</span>
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-3">
                  <Link to="/booking" className="block">
                    <Button className={cn(
                      "w-full rounded-xl text-xs uppercase tracking-[0.12em] py-5",
                      pkg.featured ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-foreground hover:bg-foreground/90 text-background"
                    )}>
                      Заказать пакет
                    </Button>
                  </Link>
                  <Link to="/contact" className="block">
                    <Button variant="outline" className="w-full rounded-xl text-xs uppercase tracking-[0.12em] py-5 border-border hover:bg-secondary">
                      Связаться с декоратором
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <section className="section-padding bg-secondary">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Сравнение</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-4">Сравнение пакетов</h2>
          <div className="gold-divider mb-14" />
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <div className="overflow-x-auto rounded-2xl bg-card shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.06)] border border-border/50">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium w-[35%]">Опция</th>
                  <th className="text-center p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Базовый</th>
                  <th className="text-center p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-primary font-medium bg-primary/5">Стандарт ★</th>
                  <th className="text-center p-4 md:p-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Премиум</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={row.label} className={cn("border-b border-border/50 last:border-0", i % 2 === 0 ? "" : "bg-secondary/30")}>
                    <td className="p-4 md:p-5 text-sm font-light text-foreground/80">{row.label}</td>
                    {(["basic", "standard", "premium"] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className={cn("p-4 md:p-5 text-center text-sm font-light", tier === "standard" ? "bg-primary/5" : "")}>
                          {typeof val === "boolean" ? (
                            val ? <Check size={16} className="text-primary mx-auto" /> : <X size={16} className="text-muted-foreground/30 mx-auto" />
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
            <p className="text-muted-foreground font-light text-sm mb-6">Не уверены, какой пакет вам подходит? Мы с радостью поможем.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/booking">
                <Button className="rounded-xl text-xs uppercase tracking-[0.12em] px-8 py-5 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[180px]">
                  Заказать пакет <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="rounded-xl text-xs uppercase tracking-[0.12em] px-8 py-5 border-foreground/20 hover:bg-foreground hover:text-background min-w-[180px]">
                  Связаться с нами
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