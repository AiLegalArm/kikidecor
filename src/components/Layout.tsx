import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram, Mail, Phone, MapPin, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Decor Studio", path: "/decor" },
  { name: "Showroom", path: "/showroom" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-[0_1px_20px_-8px_hsl(0_0%_8%/0.06)]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <nav className="container mx-auto flex items-center justify-between h-18 md:h-24 px-6 md:px-10">
          <Link to="/" className="transition-opacity hover:opacity-80">
            <img src={logoImg} alt="KiKi" className="h-10 md:h-14 w-auto" />
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
      <footer className="bg-foreground text-background/60">
        {/* Top decorative line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="container mx-auto px-6 md:px-10 py-20 md:py-28">
          {/* Logo & tagline centered */}
          <div className="text-center mb-20">
            <img src={logoImg} alt="KiKi" className="h-14 w-auto brightness-0 invert opacity-70 mx-auto mb-6" />
            <p className="font-cormorant text-lg md:text-xl italic font-light text-background/35 tracking-wide">
              Красота в каждой детали
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 lg:gap-10">
            {/* Decor Studio */}
            <div>
              <h4 className="overline text-background/25 mb-7 tracking-[0.2em]">Decor Studio</h4>
              <div className="flex flex-col gap-3.5">
                <Link to="/decor" className="text-sm font-light text-background/45 hover:text-primary transition-colors duration-500">
                  Услуги декора
                </Link>
                <Link to="/portfolio" className="text-sm font-light text-background/45 hover:text-primary transition-colors duration-500">
                  Портфолио
                </Link>
                <Link to="/packages" className="text-sm font-light text-background/45 hover:text-primary transition-colors duration-500">
                  Пакеты
                </Link>
                <Link to="/booking" className="text-sm font-light text-background/45 hover:text-primary transition-colors duration-500">
                  Бронирование
                </Link>
              </div>
            </div>

            {/* Showroom */}
            <div>
              <h4 className="overline text-background/25 mb-7 tracking-[0.2em]">Showroom</h4>
              <div className="flex flex-col gap-3.5">
                <Link to="/showroom" className="text-sm font-light text-background/45 hover:text-primary transition-colors duration-500">
                  Коллекция
                </Link>
                <Link to="/services" className="text-sm font-light text-background/45 hover:text-primary transition-colors duration-500">
                  Стилист
                </Link>
                <Link to="/calculator" className="text-sm font-light text-background/45 hover:text-primary transition-colors duration-500">
                  Калькулятор
                </Link>
              </div>
            </div>

            {/* Quick Nav */}
            <div>
              <h4 className="overline text-background/25 mb-7 tracking-[0.2em]">Навигация</h4>
              <div className="flex flex-col gap-3.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm font-light text-background/45 hover:text-primary transition-colors duration-500"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="overline text-background/25 mb-7 tracking-[0.2em]">Контакты</h4>
              <div className="flex flex-col gap-4 text-sm font-light text-background/45">
                <a href="mailto:info@kikidecor.ru" className="flex items-center gap-3 hover:text-primary transition-colors duration-500">
                  <Mail size={14} strokeWidth={1.5} className="opacity-60" /> info@kikidecor.ru
                </a>
                <a href="tel:+79001234567" className="flex items-center gap-3 hover:text-primary transition-colors duration-500">
                  <Phone size={14} strokeWidth={1.5} className="opacity-60" /> +7 (900) 123-45-67
                </a>
                <span className="flex items-center gap-3">
                  <MapPin size={14} strokeWidth={1.5} className="opacity-60" /> Ростов-на-Дону · Геленджик
                </span>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-5 mt-8">
                <a
                  href="https://instagram.com/ki_ki_decor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-background/15 flex items-center justify-center text-background/40 hover:text-primary hover:border-primary/50 transition-all duration-500"
                >
                  <Instagram size={15} strokeWidth={1.5} />
                </a>
                <a
                  href="https://t.me/kikidecor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-background/15 flex items-center justify-center text-background/40 hover:text-primary hover:border-primary/50 transition-all duration-500"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a
                  href="mailto:info@kikidecor.ru"
                  className="w-9 h-9 rounded-full border border-background/15 flex items-center justify-center text-background/40 hover:text-primary hover:border-primary/50 transition-all duration-500"
                >
                  <Mail size={15} strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-background/6 mt-20 pt-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="overline text-background/20 tracking-[0.15em]">
              © {new Date().getFullYear()} KiKi. Все права защищены.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/contact" className="overline text-background/20 hover:text-primary/60 transition-colors duration-500 tracking-[0.15em]">
                Связаться
              </Link>
              <span className="w-px h-3 bg-background/10" />
              <a
                href="https://instagram.com/ki_ki_decor"
                target="_blank"
                rel="noopener noreferrer"
                className="overline text-background/20 hover:text-primary/60 transition-colors duration-500 tracking-[0.15em]"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
