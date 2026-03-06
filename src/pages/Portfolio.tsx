import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import dessertImg from "@/assets/portfolio-dessert.jpg";
import heroImg from "@/assets/hero-decoration.jpg";
import corporateImg from "@/assets/portfolio-corporate.jpg";
import corporate2Img from "@/assets/portfolio-corporate2.jpg";
import kidsImg from "@/assets/portfolio-kids.jpg";
import kids2Img from "@/assets/portfolio-kids2.jpg";

const categories = [
  "Все",
  "Свадебный декор",
  "Праздники",
  "Декор фасадов",
  "Фотозоны",
  "Корпоративы",
];

interface PortfolioItem {
  img: string;
  category: string;
  title: string;
  caption: string;
  span?: string;
}

const portfolioItems: PortfolioItem[] = [
  { img: weddingImg, category: "Свадебный декор", title: "Садовая романтика", caption: "Свадебная церемония на открытом воздухе с каскадами белых роз и золотой аркой", span: "col-span-2 row-span-2" },
  { img: corporateImg, category: "Корпоративы", title: "Гала-вечер", caption: "Корпоративный ужин в стиле navy & gold с высокими цветочными композициями" },
  { img: kidsImg, category: "Праздники", title: "Радужное приключение", caption: "Яркий детский праздник с радужной аркой из шаров" },
  { img: proposalImg, category: "Фотозоны", title: "Предложение на закате", caption: "Романтическая фотозона с живыми цветами и свечами" },
  { img: birthdayImg, category: "Праздники", title: "Золотой юбилей", caption: "Элегантное оформление юбилея с золотыми шарами и цветами" },
  { img: themedImg, category: "Декор фасадов", title: "Фасад мечты", caption: "Полное преображение фасада частного дома с живой зеленью", span: "col-span-2" },
  { img: detailImg, category: "Свадебный декор", title: "Цветочная элегантность", caption: "Нежные розы в винтажной золотой вазе" },
  { img: corporate2Img, category: "Корпоративы", title: "Церемония награждения", caption: "Драматичная сцена с золотыми драпировками и прожекторами" },
  { img: kids2Img, category: "Праздники", title: "Единорожка", caption: "Пастельный детский праздник с цветочной стеной и гирляндой шаров" },
  { img: dessertImg, category: "Фотозоны", title: "Сладкий стол", caption: "Многоярусный торт, макаруны и капкейки на изящном десертном столе" },
  { img: loungeImg, category: "Декор фасадов", title: "Входная группа", caption: "Стильное оформление входной зоны с подушками и подвесными цветами", span: "col-span-2" },
  { img: heroImg, category: "Свадебный декор", title: "Хрустальный зал", caption: "Банкетный зал с хрустальными люстрами и розовыми пионами", span: "col-span-2" },
];

const Portfolio = () => {
  const [filter, setFilter] = useState("Все");
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const filtered = filter === "Все" ? portfolioItems : portfolioItems.filter((i) => i.category === filter);

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (modalIndex === null) return;
      const next = modalIndex + dir;
      if (next >= 0 && next < filtered.length) setModalIndex(next);
    },
    [modalIndex, filtered.length]
  );

  useEffect(() => {
    if (modalIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [modalIndex, navigate]);

  const currentItem = modalIndex !== null ? filtered[modalIndex] : null;

  return (
    <>
      <title>Портфолио декора — свадьбы, праздники, фасады</title>
      <meta name="description" content="Портфолио Ki Ki Decor: wedding decoration, birthday decor, proposal decor, event styling. Более 500 реализованных проектов." />
      <meta property="og:title" content="Портфолио Ki Ki Decor — декор мероприятий" />
      <meta property="og:description" content="Фотогалерея проектов: свадебный декор, дни рождения, предложения, корпоративы." />
      <meta property="og:type" content="website" />

      <section className="section-padding pb-8 md:pb-12">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Наши работы</p>
            <h1 className="font-display text-4xl md:text-6xl font-light mb-5">Портфолио</h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-sm md:text-base mt-6">
              Коллекция наших лучших проектов — каждый создан с любовью и вниманием к деталям.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-5 md:px-8 pb-6">
        <div className="container mx-auto">
          <ScrollReveal delay={150}>
            <div className="flex justify-center gap-3 md:gap-6 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setFilter(cat); setModalIndex(null); }}
                  className={cn(
                    "text-[11px] md:text-xs uppercase tracking-[0.12em] font-medium transition-all duration-300 pb-1.5 border-b-2 whitespace-nowrap",
                    filter === cat ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-5 md:px-8 lg:px-16 pb-20 md:pb-32 pt-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5 auto-rows-[minmax(180px,1fr)] md:auto-rows-[minmax(220px,1fr)]">
            {filtered.map((item, i) => (
              <ScrollReveal key={item.title + filter} delay={i * 60} className={item.span}>
                <div
                  className="group overflow-hidden relative h-full cursor-pointer"
                  onClick={() => openModal(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openModal(i)}
                  aria-label={`Смотреть ${item.title}`}
                >
                  <img src={item.img} alt={item.caption} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 md:p-6">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-background/60 mb-1">{item.category}</p>
                      <p className="font-display text-base md:text-xl text-background mb-1">{item.title}</p>
                      <p className="text-[11px] md:text-xs text-background/70 font-light line-clamp-2 leading-relaxed hidden sm:block">{item.caption}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {currentItem && modalIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/90 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
          <button onClick={closeModal} className="absolute top-5 right-5 md:top-8 md:right-8 text-background/70 hover:text-background transition-colors z-10" aria-label="Закрыть">
            <X size={28} strokeWidth={1.5} />
          </button>
          {modalIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 text-background/50 hover:text-background transition-colors z-10" aria-label="Предыдущее фото">
              <ChevronLeft size={36} strokeWidth={1.5} />
            </button>
          )}
          {modalIndex < filtered.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 text-background/50 hover:text-background transition-colors z-10" aria-label="Следующее фото">
              <ChevronRight size={36} strokeWidth={1.5} />
            </button>
          )}
          <div className="flex flex-col items-center max-w-5xl w-full mx-4 md:mx-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-h-[70vh] flex items-center justify-center">
              <img src={currentItem.img} alt={currentItem.caption} className="max-w-full max-h-[70vh] object-contain animate-scale-in" />
            </div>
            <div className="text-center mt-6 animate-fade-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
              <p className="text-[10px] uppercase tracking-[0.25em] text-background/40 mb-2">{currentItem.category}</p>
              <p className="font-display text-xl md:text-2xl text-background mb-2">{currentItem.title}</p>
              <p className="text-xs md:text-sm text-background/60 font-light max-w-md">{currentItem.caption}</p>
              <p className="text-[10px] text-background/30 mt-4">{modalIndex + 1} / {filtered.length}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Portfolio;