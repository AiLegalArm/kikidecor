import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Services", path: "/services" },
  { name: "Packages", path: "/packages" },
  { name: "About", path: "/about" },
  { name: "Booking", path: "/booking" },
  { name: "Contact", path: "/contact" },
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
            Élara<span className="text-primary">.</span>
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
            aria-label="Toggle menu"
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
                Élara<span className="text-primary">.</span>
              </h3>
              <p className="text-sm font-light leading-relaxed text-background/60">
                Crafting unforgettable moments through exquisite event decoration and styling.
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-background/40 mb-5">Quick Links</h4>
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
              <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-background/40 mb-5">Get in Touch</h4>
              <div className="flex flex-col gap-3 text-sm text-background/60">
                <a href="mailto:hello@elaraevents.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail size={14} /> hello@elaraevents.com
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone size={14} /> +1 (234) 567-890
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Instagram size={14} /> @elaraevents
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/10 mt-12 pt-8 text-center text-xs text-background/30">
            © {new Date().getFullYear()} Élara Events. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
