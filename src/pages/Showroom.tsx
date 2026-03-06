import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import heroShowroom from "@/assets/hero-showroom.jpg";
import { MapPin, Clock, Phone, CalendarDays, ArrowRight } from "lucide-react";

const Showroom = () => {
  return (
    <>
      <title>KiKi Showroom — Шоурум модной одежды</title>
      <meta name="description" content="KiKi Showroom — коллекции модной одежды и аксессуаров в элегантном шоуруме. Запись на визит." />

      {/* Hero */}
      <section className="relative h-[70vh] flex items-end overflow-hidden">
        <img src={heroShowroom} alt="KiKi Showroom" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
        <div className="relative z-10 container mx-auto px-6 md:px-10 pb-16">
          <p className="overline text-background/50 mb-4">Направление II</p>
          <h1 className="font-display text-5xl md:text-7xl font-light text-background">KiKi Showroom</h1>
        </div>
      </section>

      {/* About */}
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="overline text-primary mb-4">О шоуруме</p>
                <h2 className="font-display text-3xl md:text-5xl font-light mb-6 leading-tight">
                  Стиль, который <span className="italic">вдохновляет</span>
                </h2>
                <p className="text-muted-foreground font-light leading-relaxed mb-4">
                  KiKi Showroom — это пространство, где мода встречается с элегантностью. 
                  Мы курируем коллекции, которые подчёркивают индивидуальность и уверенность.
                </p>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Приглашаем на персональную консультацию — подберём образ для любого случая.
                </p>
              </div>
              <div className="space-y-6">
                <div className="border border-border p-6 flex items-start gap-4">
                  <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Адрес</p>
                    <p className="text-sm font-light">Ростов-на-Дону, ул. Примерная, 42</p>
                  </div>
                </div>
                <div className="border border-border p-6 flex items-start gap-4">
                  <Clock size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Часы работы</p>
                    <p className="text-sm font-light">Пн–Сб: 10:00 – 20:00</p>
                    <p className="text-sm font-light text-muted-foreground">Вс: по записи</p>
                  </div>
                </div>
                <div className="border border-border p-6 flex items-start gap-4">
                  <Phone size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Телефон</p>
                    <a href="tel:+79001234567" className="text-sm font-light hover:text-primary transition-colors">
                      +7 (900) 123-45-67
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Collections placeholder */}
      <section className="section-padding bg-secondary/30">
        <div className="container mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <p className="overline text-primary mb-4">Коллекции</p>
            <h2 className="font-display text-3xl md:text-5xl font-light mb-8">Скоро</h2>
            <p className="text-muted-foreground font-light max-w-lg mx-auto mb-8">
              Каталог коллекций будет доступен в ближайшее время. 
              Подпишитесь на Instagram, чтобы не пропустить обновления.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary transition-all duration-500"
            >
              <CalendarDays size={14} />
              Записаться на визит
              <ArrowRight size={14} />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default Showroom;
