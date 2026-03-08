import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram, Mail, Phone, MapPin, ArrowUp, Globe, Send, ShoppingBag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import CartSidebar from "@/components/shop/CartSidebar";
import logoImg from "@/assets/logo-kiki.png";

const Layout = ({ children }: {children: React.ReactNode;}) => {
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
  { name: t.nav.contact[lang], path: "/contact" }];


  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {setMenuOpen(false);}, [location.pathname]);

  const toggleLang = () => setLang(lang === "ru" ? "en" : "ru");

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
          scrolled ?
          "bg-background/90 backdrop-blur-2xl border-b border-border/20 py-3" :
          "bg-transparent py-5 md:py-6"
        )}>
        
        <nav className="container mx-auto flex items-center justify-between px-6 md:px-10">
          {/* Left nav */}
          <div className="hidden lg:flex items-center gap-10 flex-1">
            {navLinks.slice(0, 3).map((link) =>
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-[12px] uppercase tracking-[0.2em] font-body font-semibold transition-all duration-300 relative py-1",
                scrolled
                  ? (location.pathname === link.path
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-primary"
                    : "text-foreground/70 hover:text-primary")
                  : (location.pathname === link.path
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-white"
                    : "text-white/80 hover:text-white")
              )}>
              
                {link.name}
              </Link>
            )}
          </div>

          {/* Center logo — hidden on homepage hero */}
          <Link to="/" className={cn(
            "transition-all duration-500 hover:opacity-80 lg:absolute lg:left-1/2 lg:-translate-x-1/2",
            location.pathname === "/" && !scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
          )}>
            <img src={logoImg} alt="KiKi" className={cn("w-auto transition-all duration-500 opacity-100", scrolled ? "h-12 md:h-14" : "h-14 md:h-18")} />
          </Link>

          {/* Right nav */}
          <div className="hidden lg:flex items-center gap-10 flex-1 justify-end">
            {navLinks.slice(3).map((link) =>
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-[12px] uppercase tracking-[0.2em] font-body font-semibold transition-all duration-300 relative py-1",
                scrolled
                  ? (location.pathname === link.path
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-primary"
                    : "text-foreground/70 hover:text-primary")
                  : (location.pathname === link.path
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-white"
                    : "text-white/80 hover:text-white")
              )}>
              
                {link.name}
              </Link>
            )}
            <button
              onClick={toggleLang}
              className={cn(
                "flex items-center gap-1.5 text-[12px] uppercase tracking-[0.2em] transition-colors duration-300 ml-2 font-semibold",
                scrolled ? "text-foreground/70 hover:text-primary" : "text-white/80 hover:text-white"
              )}
              aria-label="Switch language">
              
              <Globe size={16} strokeWidth={2} />
              {lang === "ru" ? "EN" : "RU"}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className={cn(
                "relative transition-colors duration-300 ml-2",
                scrolled ? "text-foreground/70 hover:text-primary" : "text-white/80 hover:text-white"
              )}
              aria-label="Cart">
              
              <ShoppingBag size={22} strokeWidth={2} />
              {count > 0 &&
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-primary text-primary-foreground text-[9px] font-body font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              }
            </button>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-foreground/70 hover:text-primary transition-colors duration-300"
              aria-label="Cart">
              
              <ShoppingBag size={20} strokeWidth={2} />
              {count > 0 &&
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-body font-medium rounded-full flex items-center justify-center">
                  {count}
                </span>
              }
            </button>
            <button
              onClick={toggleLang}
              className="text-[11px] uppercase tracking-[0.2em] text-foreground/70 hover:text-primary transition-colors duration-300 flex items-center gap-1 font-medium"
              aria-label="Switch language">
              
              <Globe size={15} strokeWidth={2} className="text-primary-foreground w-0 h-0" />
              {lang === "ru" ? "EN" : "RU"}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn("p-1 transition-transform duration-300", scrolled ? "text-foreground" : "text-white")}
              aria-label="Menu">
              
              {menuOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu — fullscreen overlay */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 top-0 bg-background/98 backdrop-blur-2xl transition-all duration-500 z-40 flex flex-col items-center justify-center",
            menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}>
          
          <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 text-foreground p-2">
            <X size={24} strokeWidth={1.5} />
          </button>
          <div className="flex flex-col items-center gap-8">
            {navLinks.map((link, i) =>
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "font-display text-3xl font-light transition-all duration-500",
                menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                location.pathname === link.path ? "text-primary" : "text-foreground"
              )}
              style={{ transitionDelay: menuOpen ? `${i * 80 + 100}ms` : "0ms" }}>
              
                {link.name}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* ── Footer (hidden on homepage) ── */}
      {location.pathname !== "/" &&
      <footer className="bg-foreground text-background/80">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto px-5 sm:px-6 md:px-10 py-10 md:py-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 mb-10 md:mb-20">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-3">
              <img src={logoImg} alt="KiKi" className="h-20 w-auto brightness-0 invert opacity-80 mb-6 block mx-auto" />
              <p className="font-display italic text-background/60 leading-relaxed mb-8 text-center font-medium text-2xl">
                {t.footer.tagline[lang]}
              </p>
              <div className="gap-4 items-center justify-center flex flex-row">
                <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center text-background/60 hover:text-primary hover:border-primary/40 transition-all duration-500">
                  <Instagram size={16} strokeWidth={1.5} />
                </a>
                <a href="https://t.me/kikidecor" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center text-background/60 hover:text-primary hover:border-primary/40 transition-all duration-500">
                  <Send size={16} strokeWidth={1.5} />
                </a>
                <a href="mailto:info@kikidecor.ru"
                className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center text-background/60 hover:text-primary hover:border-primary/40 transition-all duration-500">
                  <Mail size={16} strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {/* Decor */}
            <div className="lg:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-background/50 mb-4 md:mb-6 font-body font-medium">{t.footer.decorStudio[lang]}</h4>
              <div className="flex flex-col gap-3 mb-5">
                {[
                { to: "/decor", label: t.footer.decorServices[lang] },
                { to: "/portfolio", label: t.footer.portfolio[lang] },
                { to: "/packages", label: t.footer.packages[lang] },
                { to: "/booking", label: t.footer.booking[lang] }].
                map((l) =>
                <Link key={l.to} to={l.to} className="text-sm font-semibold text-background/70 hover:text-primary transition-colors duration-500">{l.label}</Link>
                )}
              </div>
              <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-background/70 hover:text-primary transition-colors duration-500">
                <Instagram size={14} strokeWidth={1.5} /> @ki_ki_decor
              </a>
            </div>

            {/* Showroom */}
            <div className="lg:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-background/50 mb-4 md:mb-6 font-body font-medium">{t.footer.showroom[lang]}</h4>
              <div className="flex flex-col gap-3 mb-5">
                {[
                { to: "/showroom", label: t.footer.collection[lang] },
                { to: "/shop", label: lang === "ru" ? "Каталог" : "Catalog" },
                { to: "/lookbook", label: "Lookbook" },
                { to: "/calculator", label: t.footer.calculator[lang] }].
                map((l) =>
                <Link key={l.to} to={l.to} className="text-sm font-semibold text-background/70 hover:text-primary transition-colors duration-500">{l.label}</Link>
                )}
              </div>
              <a href="https://instagram.com/ki_ki_showroom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-background/70 hover:text-primary transition-colors duration-500">
                <Instagram size={14} strokeWidth={1.5} /> @ki_ki_showroom
              </a>
            </div>

            {/* Contacts */}
            <div className="lg:col-span-3">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-background/50 mb-4 md:mb-6 font-body font-medium">{lang === "ru" ? "Контакты" : "Contacts"}</h4>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-background/70">{lang === "ru" ? "Шоу Рум Ростов / Геленджик" : "Showroom Rostov / Gelendzhik"}</p>
                <a href="tel:+79882598522" className="flex items-center gap-2 text-sm font-semibold text-background/70 hover:text-primary transition-colors duration-500">
                  <Phone size={14} strokeWidth={1.5} /> +7 988 259-85-22
                </a>
                <div className="flex items-start gap-2 text-sm font-semibold text-background/70">
                  <MapPin size={14} strokeWidth={1.5} className="shrink-0 mt-0.5" />
                  <span>{lang === "ru" ? "Ростов: Северный, ТЦ Орбита, 2 эт." : "Rostov: Severny, TC Orbita, 2nd fl."}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-background/70">
                  <Clock size={14} strokeWidth={1.5} /> 10:30 – 20:30
                </div>
              </div>
            </div>

          </div>

          {/* Bottom */}
          <div className="border-t border-background/15 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-background/40 font-body">
              © {new Date().getFullYear()} KiKi. {t.footer.rights[lang]}
            </p>
            <div className="flex items-center gap-6">
              <Link to="/contact" className="text-[10px] uppercase tracking-[0.15em] text-background/40 hover:text-primary transition-colors duration-500 font-body">
                {t.footer.getInTouch[lang]}
              </Link>
              <span className="w-px h-3 bg-background/20" />
              <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.15em] text-background/40 hover:text-primary transition-colors duration-500 font-body">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
      }

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full bg-foreground/90 text-background flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-500 hover:bg-primary",
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label={t.footer.backToTop[lang]}>
        
        <ArrowUp size={16} strokeWidth={1.5} />
      </button>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>);

};

export default Layout;