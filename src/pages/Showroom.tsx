import { useState } from "react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import heroShowroom from "@/assets/hero-showroom.jpg";
import { MapPin, Clock, Phone, CalendarDays, ArrowRight, Sparkles, Camera, Shirt, Search, Eye } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ProductCard from "@/components/shop/ProductCard";
import QuickView from "@/components/shop/QuickView";
import { useProducts, Product } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", ru: "Все", en: "All" },
  { value: "dresses", ru: "Платья", en: "Dresses" },
  { value: "tops", ru: "Топы", en: "Tops" },
  { value: "bottoms", ru: "Низ", en: "Bottoms" },
  { value: "outerwear", ru: "Верхняя одежда", en: "Outerwear" },
  { value: "knitwear", ru: "Трикотаж", en: "Knitwear" },
  { value: "accessories", ru: "Аксессуары", en: "Accessories" },
];

const Showroom = () => {
  const { lang, t } = useLanguage();
  const s = t.showroom;
  const [category, setCategory] = useState("all");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { data: products = [], isLoading } = useProducts(category);

  const aiFeatures = [
    {
      icon: Sparkles,
      title: lang === "ru" ? "AI Стилист" : "AI Stylist",
      desc: lang === "ru" ? "Персональный подбор образов по вашим предпочтениям" : "Personal outfit selection based on your preferences",
      link: "/stylist",
      color: "from-primary/20 to-primary/5",
    },
    {
      icon: Camera,
      title: lang === "ru" ? "Поиск по фото" : "Visual Search",
      desc: lang === "ru" ? "Загрузите фото — найдём похожие вещи в каталоге" : "Upload a photo — we'll find similar items",
      link: "/find-similar",
      color: "from-accent/20 to-accent/5",
    },
    {
      icon: Eye,
      title: lang === "ru" ? "Виртуальная примерка" : "Virtual Try-On",
      desc: lang === "ru" ? "Примерьте вещи онлайн с помощью AI" : "Try on items online with AI",
      link: "/try-on",
      color: "from-secondary/40 to-secondary/10",
    },
    {
      icon: Shirt,
      title: lang === "ru" ? "Генератор образов" : "Outfit Generator",
      desc: lang === "ru" ? "AI подберёт готовый образ из нашей коллекции" : "AI will create a complete look from our collection",
      link: "/outfits",
      color: "from-primary/15 to-accent/10",
    },
  ];

  return (
    <>
      <title>KiKi Showroom</title>

      {/* Hero */}
      <section className="relative h-[70vh] overflow-hidden">
        <img src={heroShowroom} alt="KiKi Showroom" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/30 to-foreground/15" />
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-6 md:px-10 pb-16 md:pb-20">
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary/60 mb-4 font-body animate-reveal" style={{ animationDelay: "0.3s" }}>{s.divisionII[lang]}</p>
            <h1 className="font-display text-5xl md:text-8xl font-light text-background leading-[1.05] animate-reveal" style={{ animationDelay: "0.5s" }}>
              KiKi <span className="italic">Showroom</span>
            </h1>
          </div>
        </div>
      </section>

      {/* About + Info */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[40vh]">
        <div className="flex items-center px-6 md:px-10 lg:px-16 py-16 lg:py-0">
          <div className="max-w-md">
            <ScrollReveal>
              <p className="overline text-primary mb-4">{s.aboutOverline[lang]}</p>
              <h2 className="font-display text-3xl md:text-5xl font-light mb-6 leading-tight">
                {s.aboutTitle[lang]} <span className="italic">{s.aboutTitleItalic[lang]}</span>
              </h2>
              <p className="text-foreground/75 font-light leading-[2] text-sm mb-4">{s.aboutP1[lang]}</p>
              <p className="text-foreground/75 font-light leading-[2] text-sm">{s.aboutP2[lang]}</p>
            </ScrollReveal>
          </div>
        </div>

        <div className="flex items-center px-6 md:px-10 lg:px-16 py-12 lg:py-0 bg-secondary/30">
          <ScrollReveal delay={150}>
            <div className="space-y-6 max-w-sm">
              {[
                { icon: MapPin, label: s.address[lang], value: s.addressValue[lang] },
                { icon: Clock, label: s.hours[lang], value: `${s.hoursValue1[lang]}\n${s.hoursValue2[lang]}` },
                { icon: Phone, label: s.phoneLabel[lang], value: "+7 (900) 123-45-67", href: "tel:+79001234567" },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-border flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 font-body">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-light hover:text-primary transition-colors whitespace-pre-line">{value}</a>
                    ) : (
                      <p className="text-sm font-light whitespace-pre-line">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* AI Features */}
      <section className="px-6 md:px-10 py-20 md:py-28 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="overline text-primary mb-4 text-center">{lang === "ru" ? "Умный шоппинг" : "Smart Shopping"}</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-center mb-4">
              {lang === "ru" ? "AI-инструменты" : "AI Tools"}
            </h2>
            <p className="text-center text-foreground/60 font-light text-sm max-w-lg mx-auto mb-14 leading-relaxed">
              {lang === "ru"
                ? "Технологии, которые делают подбор идеального образа простым и увлекательным"
                : "Technologies that make finding your perfect look easy and exciting"}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {aiFeatures.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 100}>
                <Link
                  to={feature.link}
                  className="group block luxury-card p-7 h-full hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
                >
                  <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mb-5", feature.color)}>
                    <feature.icon size={20} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-lg font-medium mb-2 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60 font-light text-sm leading-relaxed mb-4">{feature.desc}</p>
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                    {lang === "ru" ? "Попробовать" : "Try it"}
                    <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <section className="px-6 md:px-10 py-20 md:py-28">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="overline text-primary mb-4 text-center">{lang === "ru" ? "Коллекция" : "Collection"}</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-center mb-12">
              {lang === "ru" ? "Каталог" : "Catalog"}
            </h2>
          </ScrollReveal>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "text-[11px] uppercase tracking-[0.2em] px-5 py-2.5 border transition-all duration-300 font-body font-medium",
                  category === cat.value
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground/60 hover:border-foreground hover:text-foreground"
                )}
              >
                {cat[lang]}
              </button>
            ))}
          </div>

          {/* Products grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Search size={40} className="mx-auto text-muted-foreground/40 mb-4" strokeWidth={1} />
              <p className="text-muted-foreground font-light">
                {lang === "ru" ? "Товары скоро появятся" : "Products coming soon"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 60}>
                  <ProductCard product={product} onQuickView={() => setQuickViewProduct(product)} />
                </ScrollReveal>
              ))}
            </div>
          )}

          {products.length > 0 && (
            <ScrollReveal delay={300}>
              <div className="text-center mt-14">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-3 px-10 py-4 border border-foreground/15 text-foreground text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-foreground hover:text-background transition-all duration-500 font-body"
                >
                  {lang === "ru" ? "Весь каталог" : "Full Catalog"}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Book Visit CTA */}
      <section className="border-t border-border/50 px-6 md:px-10 py-20 md:py-28 bg-secondary/20">
        <div className="container mx-auto text-center max-w-2xl">
          <ScrollReveal>
            <CalendarDays size={28} className="mx-auto text-primary mb-5" strokeWidth={1.5} />
            <h2 className="font-display text-3xl md:text-5xl font-light mb-5">
              {s.bookVisit[lang]}
            </h2>
            <p className="text-foreground/60 font-light text-sm mb-10 leading-relaxed max-w-md mx-auto">
              {lang === "ru"
                ? "Запишитесь на визит в шоурум для персональной консультации и примерки"
                : "Book a visit to the showroom for a personal consultation and fitting"}
            </p>
            <Link
              to="/showroom-booking"
              className="inline-flex items-center gap-3 px-12 py-5 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-primary transition-all duration-500 font-body"
            >
              <CalendarDays size={15} />
              {s.bookVisit[lang]}
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {quickViewProduct && (
        <QuickView product={quickViewProduct} open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </>
  );
};

export default Showroom;