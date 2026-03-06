import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import corporateImg from "@/assets/portfolio-corporate.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";

const services = [
  {
    title: "Декор фасадов",
    desc: "Преображение фасадов домов, крылечек и входных групп — сезонное оформление, праздничный декор, стильные композиции из живых и искусственных материалов.",
    price: "от 15 000 ₽",
    img: themedImg,
  },
  {
    title: "Свадебный декор",
    desc: "Цветочные арки, оформление столов, освещение и инсталляции — создаём атмосферу вашей мечты для самого важного дня.",
    price: "от 30 000 ₽",
    img: weddingImg,
  },
  {
    title: "Оформление праздников",
    desc: "Дни рождения, юбилеи, детские праздники — шары, цветы, тематический декор и сладкие столы для любого торжества.",
    price: "от 10 000 ₽",
    img: birthdayImg,
  },
  {
    title: "Фотозоны",
    desc: "Стильные фотозоны для свадеб, корпоративов и частных мероприятий — цветочные стены, неоновые вывески, авторские инсталляции.",
    price: "от 12 000 ₽",
    img: detailImg,
  },
  {
    title: "Декор входных групп",
    desc: "Оформление входных зон ресторанов, отелей, магазинов и частных домов — создаём первое впечатление, которое запоминается.",
    price: "от 8 000 ₽",
    img: proposalImg,
  },
  {
    title: "Корпоративные мероприятия",
    desc: "Брендированный декор для конференций, презентаций, гала-ужинов и корпоративных праздников любого масштаба.",
    price: "от 25 000 ₽",
    img: corporateImg,
  },
];

const Services = () => (
  <>
    <title>Услуги декора — свадьбы, фасады, праздники</title>
    <meta name="description" content="Услуги Ki Ki Decor: event decoration, wedding decoration, birthday decor, event styling. Декор фасадов, свадеб, фотозон по всей России." />
    <meta property="og:title" content="Услуги Ki Ki Decor — декор мероприятий" />
    <meta property="og:description" content="Профессиональный event styling: свадьбы, дни рождения, корпоративы, декор фасадов." />
    <meta property="og:type" content="website" />

    <section className="section-padding pb-8 md:pb-12">
      <div className="container mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Что мы делаем</p>
          <h1 className="font-display text-4xl md:text-6xl font-light mb-5">Наши услуги</h1>
          <div className="gold-divider" />
          <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto">
            Каждый проект уникален — мы подбираем решение под ваш стиль, пространство и бюджет.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="px-5 md:px-8 lg:px-16 pb-16 md:pb-28">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 100}>
              <div className="bg-card rounded-2xl overflow-hidden shadow-[0_4px_30px_-8px_hsl(var(--foreground)/0.08)] hover:shadow-[0_12px_40px_-8px_hsl(var(--foreground)/0.15)] transition-shadow duration-500 flex flex-col h-full group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <h2 className="font-display text-xl md:text-2xl font-medium mb-3">{service.title}</h2>
                  <p className="text-muted-foreground font-light text-sm leading-relaxed flex-1 mb-5">{service.desc}</p>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Стоимость</p>
                      <p className="font-display text-2xl text-primary">{service.price}</p>
                    </div>
                    <Link to="/booking">
                      <Button className="rounded-full text-[11px] uppercase tracking-[0.12em] px-5 py-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-none">
                        Заказать
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <section className="section-padding bg-secondary">
      <div className="container mx-auto text-center max-w-2xl">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-5">Есть особенная идея?</h2>
          <p className="text-muted-foreground font-light text-sm mb-8">
            Мы обожаем воплощать нестандартные задумки. Расскажите о вашем проекте — и мы создадим нечто особенное.
          </p>
          <Link to="/booking">
            <Button variant="outline" className="rounded-full text-xs uppercase tracking-[0.15em] px-10 py-6 border-foreground/20 hover:bg-foreground hover:text-background">
              Обсудить проект <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default Services;