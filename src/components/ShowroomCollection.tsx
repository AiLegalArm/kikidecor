import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { motion } from "framer-motion";

import heroShowroom from "@/assets/hero-showroom.jpg";
import corporateImg from "@/assets/portfolio-corporate.jpg";
import corporate2Img from "@/assets/portfolio-corporate2.jpg";
import kidsImg from "@/assets/portfolio-kids.jpg";

type Product = {
  img: string;
  name: string;
  price: string;
  category: string;
};

const products: Product[] = [
  {
    img: heroShowroom,
    name: "Silk Midi Dress",
    price: "₽ 18 900",
    category: "Dresses",
  },
  {
    img: corporateImg,
    name: "Tailored Blazer",
    price: "₽ 24 500",
    category: "Outerwear",
  },
  {
    img: corporate2Img,
    name: "Cashmere Knit",
    price: "₽ 15 200",
    category: "Knitwear",
  },
  {
    img: kidsImg,
    name: "Linen Wrap Top",
    price: "₽ 12 800",
    category: "Tops",
  },
];

const ShowroomCollection = () => {
  return (
    <section className="section-padding bg-secondary/25">
      <div className="container mx-auto">
        <ScrollReveal>
          <p className="overline text-primary mb-5 text-center">KiKi Showroom</p>
          <h2 className="font-display text-4xl md:text-6xl font-light text-center mb-5 leading-[1.08]">
            Showroom <span className="italic">Collection</span>
          </h2>
          <div className="gold-divider mb-16" />
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ScrollReveal key={product.name} delay={i * 100}>
              <Link to="/showroom" className="group block">
                {/* Image */}
                <div className="relative overflow-hidden aspect-[3/4] mb-5">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                  {/* Quick view overlay */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-500 flex items-center justify-center">
                    <motion.span
                      className="px-5 py-2.5 bg-background text-foreground text-[9px] uppercase tracking-[0.25em] opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500"
                    >
                      View Product
                    </motion.span>
                  </div>
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 text-[8px] uppercase tracking-[0.2em] px-2.5 py-1 bg-background/80 backdrop-blur-sm text-foreground/70 font-medium">
                    {product.category}
                  </span>
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="font-display text-base md:text-lg font-light mb-1.5 group-hover:text-primary transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light tracking-wide">
                    {product.price}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={500}>
          <div className="text-center mt-14">
            <Link
              to="/showroom"
              className="inline-flex items-center gap-3 px-8 py-4 border border-foreground text-foreground text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-foreground hover:text-background transition-all duration-500"
            >
              View Full Collection
              <ArrowRight size={12} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ShowroomCollection;
