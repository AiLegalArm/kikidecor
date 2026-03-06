import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram, Mail, Phone, MapPin, ArrowUp, Globe, Send, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import CartSidebar from "@/components/shop/CartSidebar";
import logoImg from "@/assets/logo.png";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { count } = useCart();

  const navLinks = [
    { name: t.nav.home[lang], path: "/" },
    { name: t.nav.decor[lang], path: "/decor" },
    { name: t.nav.showroom[lang], path: "/showroom" },
    { name: t.nav.about[lang], path: "/about" },
    { name: t.nav.contact[lang], path: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const toggleLang = () => setLang(lang === "ru" ? "en" : "ru");

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
          scrolled
            ? "bg-background/90 backdrop-blur-2xl border-b border-border/20 py-3"
            : "bg-transparent py-5 md:py-6"
        )}
      >
        <nav className="container mx-auto flex items-center justify-between px-6 md:px-10">
          {/* Left nav */}
          <div className="hidden lg:flex items-center gap-8 flex-1">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-[10px] uppercase tracking-[0.25em] font-body font-medium transition-all duration-300 hover:text-primary relative py-1",
                  location.pathname === link.path
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Center logo */}
          <Link to="/" className="transition-opacity hover:opacity-80 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <img src={logoImg} alt="KiKi" className={cn("w-auto transition-all duration-500", scrolled ? "h-8 md:h-10" : "h-10 md:h-14")} />
          </Link>

          {/* Right nav */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-end">
            {navLinks.slice(3).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-[10px] uppercase tracking-[0.25em] font-body font-medium transition-all duration-300 hover:text-primary relative py-1",
                  location.pathname === link.path
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors duration-300 ml-2"
              aria-label="Switch language"
            >
              <Globe size={13} strokeWidth={1.5} />
              {lang === "ru" ? "EN" : "RU"}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-muted-foreground hover:text-primary transition-colors duration-300 ml-2"
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-body font-medium rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={toggleLang}
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1"
              aria-label="Switch language"
            >
              <Globe size={13} strokeWidth={1.5} />
              {lang === "ru" ? "EN" : "RU"}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-foreground p-1 transition-transform duration-300"
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu — fullscreen overlay */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 top-0 bg-background/98 backdrop-blur-2xl transition-all duration-500 z-40 flex flex-col items-center justify-center",
            menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 text-foreground p-2">
            <X size={24} strokeWidth={1.5} />
          </button>
          <div className="flex flex-col items-center gap-8">
            {navLinks.map((link, i) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "font-display text-3xl font-light transition-all duration-500",
                  menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  location.pathname === link.path ? "text-primary" : "text-foreground"
                )}
                style={{ transitionDelay: menuOpen ? `${i * 80 + 100}ms` : "0ms" }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="bg-foreground text-background/60">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
            {/* Brand */}
            <div className="lg:col-span-4">
              <img src={logoImg} alt="KiKi" className="h-12 w-auto brightness-0 invert opacity-60 mb-6" />
              <p className="font-display text-lg italic font-light text-background/30 leading-relaxed mb-8">
                {t.footer.tagline[lang]}
              </p>
              <div className="flex items-center gap-4">
                <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-background/10 flex items-center justify-center text-background/30 hover:text-primary hover:border-primary/40 transition-all duration-500">
                  <Instagram size={16} strokeWidth={1.5} />
                </a>
                <a href="https://t.me/kikidecor" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-background/10 flex items-center justify-center text-background/30 hover:text-primary hover:border-primary/40 transition-all duration-500">
                  <Send size={16} strokeWidth={1.5} />
                </a>
                <a href="mailto:info@kikidecor.ru"
                  className="w-10 h-10 rounded-full border border-background/10 flex items-center justify-center text-background/30 hover:text-primary hover:border-primary/40 transition-all duration-500">
                  <Mail size={16} strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {/* Decor */}
            <div className="lg:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-background/20 mb-6 font-body font-medium">{t.footer.decorStudio[lang]}</h4>
              <div className="flex flex-col gap-3">
                {[
                  { to: "/decor", label: t.footer.decorServices[lang] },
                  { to: "/portfolio", label: t.footer.portfolio[lang] },
                  { to: "/packages", label: t.footer.packages[lang] },
                  { to: "/booking", label: t.footer.booking[lang] },
                ].map(l => (
                  <Link key={l.to} to={l.to} className="text-sm font-light text-background/35 hover:text-primary transition-colors duration-500">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Showroom */}
            <div className="lg:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-background/20 mb-6 font-body font-medium">{t.footer.showroom[lang]}</h4>
              <div className="flex flex-col gap-3">
                {[
                  { to: "/showroom", label: t.footer.collection[lang] },
                  { to: "/calculator", label: t.footer.calculator[lang] },
                ].map(l => (
                  <Link key={l.to} to={l.to} className="text-sm font-light text-background/35 hover:text-primary transition-colors duration-500">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="lg:col-span-4">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-background/20 mb-6 font-body font-medium">{t.footer.contacts[lang]}</h4>
              <div className="flex flex-col gap-4 text-sm font-light text-background/35">
                <a href="mailto:info@kikidecor.ru" className="flex items-center gap-3 hover:text-primary transition-colors duration-500">
                  <Mail size={14} strokeWidth={1.5} className="opacity-50" /> info@kikidecor.ru
                </a>
                <a href="tel:+79001234567" className="flex items-center gap-3 hover:text-primary transition-colors duration-500">
                  <Phone size={14} strokeWidth={1.5} className="opacity-50" /> +7 (900) 123-45-67
                </a>
                <span className="flex items-center gap-3">
                  <MapPin size={14} strokeWidth={1.5} className="opacity-50" />
                  {lang === "ru" ? "Ростов-на-Дону · Геленджик" : "Rostov-on-Don · Gelendzhik"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-background/6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-background/15 font-body">
              © {new Date().getFullYear()} KiKi. {t.footer.rights[lang]}
            </p>
            <div className="flex items-center gap-6">
              <Link to="/contact" className="text-[10px] uppercase tracking-[0.15em] text-background/15 hover:text-primary/50 transition-colors duration-500 font-body">
                {t.footer.getInTouch[lang]}
              </Link>
              <span className="w-px h-3 bg-background/8" />
              <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer"
                className="text-[10px] uppercase tracking-[0.15em] text-background/15 hover:text-primary/50 transition-colors duration-500 font-body">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full bg-foreground/90 text-background flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-500 hover:bg-primary",
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label={t.footer.backToTop[lang]}
      >
        <ArrowUp size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default Layout;
