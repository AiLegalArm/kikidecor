import { useState } from "react";
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
  { name: "Контакты", path: "/contact" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <nav className="container mx-auto flex items-center justify-between h-16 md:h-20 px-5 md:px-8">
          <Link to="/" className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-foreground">
            Ki Ki<span className="text-primary">.</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-xs font-body font-medium uppercase tracking-[0.15em] transition-colors hover:text-primary",
                  location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-foreground p-2"
            aria-label="Меню"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-background border-t border-border animate-fade-in">
            <div className="container mx-auto px-5 py-8 flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "text-sm font-body font-medium uppercase tracking-[0.15em] transition-colors",
                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 pt-16 md:pt-20">{children}</main>

      {/* Footer */}
      <footer className="bg-foreground text-background/80">
        <div className="container mx-auto px-5 md:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-display text-3xl font-semibold text-background mb-4">
                Ki Ki<span className="text-primary">.</span>
              </h3>
              <p className="text-sm font-light leading-relaxed text-background/60">
                Студия декора — творим волшебство. Оформление фасадов, входных групп, свадеб, праздников и фотозон по всей России.
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-background/40 mb-5">Навигация</h4>
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-background/40 mb-5">Свяжитесь с нами</h4>
              <div className="flex flex-col gap-3 text-sm text-background/60">
                <a href="mailto:info@kikidecor.ru" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail size={14} /> info@kikidecor.ru
                </a>
                <a href="tel:+79001234567" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone size={14} /> +7 (900) 123-45-67
                </a>
                <a href="https://instagram.com/ki_ki_decor" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Instagram size={14} /> @ki_ki_decor
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/10 mt-12 pt-8 text-center text-xs text-background/30">
            © {new Date().getFullYear()} Ki Ki Decor. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;