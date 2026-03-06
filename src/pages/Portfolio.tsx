import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import weddingImg from "@/assets/portfolio-wedding.jpg";
import birthdayImg from "@/assets/portfolio-birthday.jpg";
import proposalImg from "@/assets/portfolio-proposal.jpg";
import themedImg from "@/assets/portfolio-themed.jpg";
import detailImg from "@/assets/portfolio-detail.jpg";
import loungeImg from "@/assets/portfolio-lounge.jpg";
import dessertImg from "@/assets/portfolio-dessert.jpg";
import heroImg from "@/assets/hero-decoration.jpg";
import { cn } from "@/lib/utils";

const categories = ["All", "Weddings", "Birthdays", "Proposals", "Themed"];

const portfolioItems = [
  { img: weddingImg, category: "Weddings", title: "Garden Romance", span: "col-span-2 row-span-2" },
  { img: birthdayImg, category: "Birthdays", title: "Golden Celebration" },
  { img: proposalImg, category: "Proposals", title: "Sunset Proposal" },
  { img: themedImg, category: "Themed", title: "Enchanted Garden" },
  { img: detailImg, category: "Weddings", title: "Floral Elegance" },
  { img: loungeImg, category: "Weddings", title: "Garden Soirée", span: "col-span-2" },
  { img: dessertImg, category: "Birthdays", title: "Sweet Delights" },
  { img: heroImg, category: "Weddings", title: "Crystal Ballroom", span: "col-span-2" },
];

const Portfolio = () => {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? portfolioItems : portfolioItems.filter(i => i.category === filter);

  return (
    <>
      <title>Portfolio | Élara Events</title>
      <meta name="description" content="Browse our portfolio of luxury event decorations including weddings, birthdays, proposals, and themed parties." />

      <section className="section-padding">
        <div className="container mx-auto">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Our Work</p>
            <h1 className="font-display text-4xl md:text-6xl font-light text-center mb-6">Portfolio</h1>
            <div className="gold-divider" />
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex justify-center gap-4 md:gap-8 mb-12 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "text-xs uppercase tracking-[0.15em] font-medium transition-colors pb-1 border-b-2",
                    filter === cat ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((item, i) => (
              <ScrollReveal key={item.title + filter} delay={i * 80} className={item.span}>
                <div className="group overflow-hidden relative aspect-square cursor-pointer">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-500 flex items-end justify-start p-4 md:p-6">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                      <p className="text-xs uppercase tracking-[0.15em] text-background/70 mb-1">{item.category}</p>
                      <p className="font-display text-lg md:text-xl text-background">{item.title}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Portfolio;
