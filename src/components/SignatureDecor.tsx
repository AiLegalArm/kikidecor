import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";

import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import dessertImg from "@/assets/portfolio-dessert.jpg";

type DecorProject = {
  img: string;
  eventType: string;
  title: { ru: string; en: string };
  description: { ru: string; en: string };
  span?: string;
};

const projects: DecorProject[] = [
  {
    img: weddingImg,
    eventType: "Wedding",
    title: { ru: "Вечное цветение", en: "Eternal Bloom" },
    description: {
      ru: "Романтичная свадьба в саду с каскадными цветами, мягким свечным светом и арками.",
      en: "A dreamy garden-inspired wedding with cascading florals, soft candlelight, and a romantic arch framing the ceremony.",
    },
    span: "md:col-span-2 md:row-span-2",
  },
  {
    img: birthdayImg,
    eventType: "Birthday",
    title: { ru: "Золотой час", en: "Golden Hour" },
    description: {
      ru: "Камерный день рождения в тёплых золотых тонах и мягких текстурах.",
      en: "An intimate birthday celebration wrapped in warm golds and soft textures.",
    },
  },
  {
    img: proposalImg,
    eventType: "Proposal",
    title: { ru: "Идеальный момент", en: "The Perfect Moment" },
    description: {
      ru: "Приватное предложение на крыше, украшенное розами и гирляндами.",
      en: "A private rooftop proposal adorned with roses and fairy lights.",
    },
  },
  {
    img: dessertImg,
    eventType: "Dessert Styling",
    title: { ru: "Сладкая элегантность", en: "Sweet Elegance" },
    description: {
      ru: "Искусно оформленный сладкий стол — визуальный центр любого торжества.",
      en: "An artfully curated dessert table that doubles as a stunning visual centerpiece.",
    },
    span: "md:col-span-2",
  },
];

const SignatureDecor = () => {
  const { lang, t } = useLanguage();
  const s = t.signature;

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <ScrollReveal>
          <p className="overline text-primary mb-5 text-center">{s.overline[lang]}</p>
          <h2 className="font-display text-4xl md:text-6xl font-light text-center mb-5 leading-[1.08]">
            {s.title[lang]} <span className="italic">{s.titleItalic[lang]}</span>
          </h2>
          <div className="gold-divider mb-16" />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 auto-rows-[280px] md:auto-rows-[320px]">
          {projects.map((project, i) => (
            <ScrollReveal key={project.title.en} delay={i * 100} className={project.span}>
              <Link to="/portfolio" className="group block relative w-full h-full overflow-hidden">
                <img src={project.img} alt={project.title[lang]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.06]" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/20 to-transparent transition-all duration-700 group-hover:from-foreground/85" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-primary/80 mb-2">{project.eventType}</p>
                  <h3 className="font-display text-xl md:text-2xl font-light text-background mb-2 leading-tight">{project.title[lang]}</h3>
                  <p className="text-xs text-background/50 font-light leading-relaxed mb-4 max-w-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{project.description[lang]}</p>
                  <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-background/60 group-hover:text-background transition-colors duration-500">
                    {s.viewProject[lang]}
                    <ArrowRight size={11} className="transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={500}>
          <div className="text-center mt-14">
            <Link to="/portfolio" className="inline-flex items-center gap-3 overline text-primary hover:text-primary/70 transition-colors duration-300 group">
              {s.viewFull[lang]}
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SignatureDecor;
