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
{ value: "accessories", ru: "Аксессуары", en: "Accessories" }];


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
    color: "from-primary/20 to-primary/5"
  },
  {
    icon: Camera,
    title: lang === "ru" ? "Поиск по фото" : "Visual Search",
    desc: lang === "ru" ? "Загрузите фото — найдём похожие вещи в каталоге" : "Upload a photo — we'll find similar items",
    link: "/find-similar",
    color: "from-accent/20 to-accent/5"
  },
  {
    icon: Eye,
    title: lang === "ru" ? "Виртуальная примерка" : "Virtual Try-On",
    desc: lang === "ru" ? "Примерьте вещи онлайн с помощью AI" : "Try on items online with AI",
    link: "/try-on",
    color: "from-secondary/40 to-secondary/10"
  },
  {
    icon: Shirt,
    title: lang === "ru" ? "Генератор образов" : "Outfit Generator",
    desc: lang === "ru" ? "AI подберёт готовый образ из нашей коллекции" : "AI will create a complete look from our collection",
    link: "/outfits",
    color: "from-primary/15 to-accent/10"
  }];


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
              <p className="overline text-primary mb-4 font-semibold">{s.aboutOverline[lang]}</p>
              <h2 className="font-display text-3xl md:text-5xl font-light mb-6 leading-tight">
                {s.aboutTitle[lang]} <span className="italic">{s.aboutTitleItalic[lang]}</span>
              </h2>
              <p className="text-foreground/75 leading-[2] text-sm mb-4 font-normal">{s.aboutP1[lang]}</p>
              <p className="text-foreground/75 leading-[2] text-sm font-normal">{s.aboutP2[lang]}</p>
            </ScrollReveal>
          </div>
        </div>

        























        
      </section>

      {/* AI Features */}
      <section className="px-6 md:px-10 py-20 md:py-28 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="overline text-primary mb-4 text-center font-normal">{lang === "ru" ? "Умный шоппинг" : "Smart Shopping"}</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-center mb-4">
              {lang === "ru" ? "AI-инструменты" : "AI Tools"}
            </h2>
            <p className="text-center text-foreground/60 text-sm max-w-lg mx-auto mb-14 leading-relaxed font-medium">
              {lang === "ru" ?
              "Технологии, которые делают подбор идеального образа простым и увлекательным" :
              "Technologies that make finding your perfect look easy and exciting"}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {aiFeatures.map((feature, i) =>
            <ScrollReveal key={feature.title} delay={i * 100}>
                <Link
                to={feature.link}
                className="group block luxury-card p-7 h-full hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                
                  <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mb-5", feature.color)}>
                    <feature.icon size={20} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-lg mb-2 group-hover:text-primary transition-colors duration-300 font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60 text-sm leading-relaxed mb-4 font-medium">{feature.desc}</p>
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                    {lang === "ru" ? "Попробовать" : "Try it"}
                    <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </ScrollReveal>
            )}
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
          <div className="flex overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible justify-start sm:justify-center gap-2 sm:gap-3 mb-12 -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-hide">
            {categories.map((cat) =>
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] px-4 sm:px-5 py-2 sm:py-2.5 border transition-all duration-300 font-body font-medium whitespace-nowrap flex-shrink-0",
                category === cat.value ?
                "bg-foreground text-background border-foreground" :
                "border-border text-foreground/60 hover:border-foreground hover:text-foreground"
              )}>
              
                {cat[lang]}
              </button>
            )}
          </div>

          {/* Products grid */}
          {isLoading ?
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) =>
            <div key={i} className="aspect-[3/4] bg-secondary/50 animate-pulse" />
            )}
            </div> :
          products.length === 0 ?
          <div className="text-center py-20">
              <Search size={40} className="mx-auto text-muted-foreground/40 mb-4" strokeWidth={1} />
              <p className="text-muted-foreground font-light">
                {lang === "ru" ? "Товары скоро появятся" : "Products coming soon"}
              </p>
            </div> :

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, i) =>
            <ScrollReveal key={product.id} delay={i * 60}>
                  <ProductCard product={product} onQuickView={() => setQuickViewProduct(product)} />
                </ScrollReveal>
            )}
            </div>
          }

          {products.length > 0 &&
          <ScrollReveal delay={300}>
              <div className="text-center mt-14">
                <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-10 py-4 border border-foreground/15 text-foreground text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-foreground hover:text-background transition-all duration-500 font-body">
                
                  {lang === "ru" ? "Весь каталог" : "Full Catalog"}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>
          }
        </div>
      </section>

      {/* Social Links */}
      <section className="border-t border-border/50 px-6 md:px-10 py-16 bg-secondary/10">
        <div className="container mx-auto max-w-2xl">
          <ScrollReveal>
            <p className="overline text-primary mb-4 text-center">{lang === "ru" ? "Мы на связи" : "Stay Connected"}</p>
            <h2 className="font-display text-3xl md:text-5xl font-light text-center mb-10">
              {lang === "ru" ? "Свяжитесь с нами" : "Get in Touch"}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://www.instagram.com/ki_ki_showroom?igsh=ZWcyODllczN0c2lo" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-all duration-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Instagram
              </a>
              <a href="https://t.me/ki_ki_showroom" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-all duration-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </a>
              <a href="https://wa.me/79882598522" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-all duration-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Book Visit CTA */}
      <section className="border-t border-border/50 px-6 md:px-10 py-20 md:py-28 bg-secondary/20">
        <div className="container mx-auto text-center max-w-2xl">
          <ScrollReveal>
            <CalendarDays size={32} className="mx-auto text-primary mb-5" strokeWidth={1.5} />
            <h2 className="font-display text-4xl md:text-6xl font-semibold mb-5">
              {s.bookVisit[lang]}
            </h2>
            <p className="text-foreground/70 font-medium text-base mb-10 leading-relaxed max-w-md mx-auto">
              {lang === "ru" ?
              "Запишитесь на визит в шоурум для персональной консультации и примерки" :
              "Book a visit to the showroom for a personal consultation and fitting"}
            </p>
            <Link
              to="/showroom-booking"
              className="inline-flex items-center gap-3 px-14 py-5 bg-foreground text-background text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-primary transition-all duration-500 font-body">
              <CalendarDays size={16} />
              {s.bookVisit[lang]}
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {quickViewProduct &&
      <QuickView product={quickViewProduct} open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      }
    </>);

};

export default Showroom;