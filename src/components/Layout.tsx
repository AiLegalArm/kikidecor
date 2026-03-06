import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Главная", path: "/" },
  { name: "Портфолио", path: "/portfolio" },
  { name: "Услуги", path: "/services" },
  { name: "Пакеты", path: "/packages" },
  { name: "О нас", path: "/about" },
  { name: "Заявка", path: "/booking" },
  { name: "Instagram", path: "/instagram" },
  { name: "Контакты", path: "/contact" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-[0_1px_20px_-8px_hsl(var(--foreground)/0.06)]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <nav className="container mx-auto flex items-center justify-between h-18 md:h-24 px-6 md:px-10">
          <Link
            to="/"
            className="font-display text-2xl md:text-3xl font-light tracking-subtle text-foreground transition-colors"
          >
            Ki Ki<span className="text-gold-gradient font-medium">.</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "overline transition-all duration-300 hover:text-primary relative",
                  location.pathname === link.path
                    ? "text-primary after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-px after:bg-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-foreground p-2 transition-transform duration-300"
            aria-label="Меню"
          >
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-500 ease-out bg-background/98 backdrop-blur-xl",
            menuOpen ? "max-h-[500px] border-t border-border/30" : "max-h-0"
          )}
        >
          <div className="container mx-auto px-6 py-10 flex flex-col gap-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "overline transition-all duration-300",
                  menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                  location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                )}
                style={{ transitionDelay: menuOpen ? `${i * 50}ms` : "0ms" }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pt-18 md:pt-24">{children}</main>

      {/* Footer */}
      <footer className="bg-foreground text-background/70">
        <div className="container mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <h3 className="font-display text-4xl font-light text-background mb-5">
                Ki Ki<span className="text-primary">.</span>
              </h3>
              <p className="text-sm font-light leading-[1.8] text-background/50 max-w-xs">
                Студия декора — творим волшебство. Оформление фасадов, входных групп, свадеб, праздников и фотозон по всей России.
              </p>
            </div>
            <div>
              <h4 className="overline text-background/30 mb-6">Навигация</h4>
              <div className="flex flex-col gap-3.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm font-light text-background/50 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="overline text-background/30 mb-6">Свяжитесь с нами</h4>
              <div className="flex flex-col gap-4 text-sm font-light text-background/50">
                <a href="mailto:info@kikidecor.ru" className="flex items-center gap-3 hover:text-primary transition-colors duration-300">
                  <Mail size={14} strokeWidth={1.5} /> info@kikidecor.ru
                </a>
                <a href="tel:+79001234567" className="flex items-center gap-3 hover:text-primary transition-colors duration-300">
                  <Phone size={14} strokeWidth={1.5} /> +7 (900) 123-45-67
                </a>
                <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors duration-300">
                  <Instagram size={14} strokeWidth={1.5} /> @ki_ki_decor
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/8 mt-16 pt-10 text-center">
            <p className="overline text-background/25">
              © {new Date().getFullYear()} Ki Ki Decor. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
