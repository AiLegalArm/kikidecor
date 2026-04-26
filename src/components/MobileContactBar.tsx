import { Phone, MessageCircle, Send } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const PHONE = "+79882598522";
const WHATSAPP = "79882598522";
const TELEGRAM = "kikidecor";

/**
 * Mobile-only sticky contact bar with Phone / WhatsApp / Telegram.
 * Hidden on home hero and admin route.
 */
const MobileContactBar = () => {
  const { pathname } = useLocation();
  if (pathname === "/admin") return null;

  const items = [
    {
      href: `tel:${PHONE}`,
      label: "Call",
      icon: Phone,
    },
    {
      href: `https://wa.me/${WHATSAPP}`,
      label: "WhatsApp",
      icon: MessageCircle,
    },
    {
      href: `https://t.me/${TELEGRAM}`,
      label: "Telegram",
      icon: Send,
    },
  ];

  return (
    <div
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-40",
        "bg-background/95 backdrop-blur-xl border-t border-border/40",
        "pb-[env(safe-area-inset-bottom)]"
      )}
      role="navigation"
      aria-label="Quick contact"
    >
      <div className="grid grid-cols-3">
        {items.map(({ href, label, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex flex-col items-center justify-center gap-1 py-3 text-foreground/80 hover:text-primary active:bg-muted/40 transition-colors"
          >
            <Icon size={18} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-body font-medium">
              {label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default MobileContactBar;