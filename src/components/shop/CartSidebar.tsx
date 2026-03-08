import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

const CartSidebar = ({ open, onClose }: CartSidebarProps) => {
  const { lang } = useLanguage();
  const { items, total, updateQuantity, removeItem } = useCart();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l border-border/40">
        <SheetHeader className="px-6 py-5 border-b border-border/40">
          <SheetTitle className="flex items-center gap-2 font-display text-xl font-light">
            <ShoppingBag size={18} strokeWidth={1.5} />
            {lang === "ru" ? "Корзина" : "Shopping Bag"} ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag size={48} strokeWidth={1} className="text-muted-foreground/30 mb-4" />
            <p className="font-display text-lg font-light mb-2">
              {lang === "ru" ? "Корзина пуста" : "Your bag is empty"}
            </p>
            <p className="text-sm text-muted-foreground font-light mb-8">
              {lang === "ru" ? "Добавьте что-нибудь из каталога" : "Add something from the catalog"}
            </p>
            <Link
              to="/shop"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-8 py-3 border border-foreground text-[10px] uppercase tracking-[0.2em] font-body font-medium hover:bg-foreground hover:text-background transition-all duration-500"
            >
              {lang === "ru" ? "Перейти в каталог" : "Browse Catalog"}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => {
                const name = lang === "en" && item.product?.name_en ? item.product.name_en : item.product?.name;
                return (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-border/30 last:border-0">
                    <div className="w-20 h-24 bg-secondary/30 overflow-hidden shrink-0">
                      <img
                        src={item.product?.images?.[0] || "/placeholder.svg"}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm font-light truncate mb-1">{name}</h4>
                      {(item.size || item.color) && (
                        <p className="text-[10px] text-muted-foreground font-body mb-2">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center border border-border">
                          <button
                            onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity - 1 })}
                            className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <Minus size={11} strokeWidth={1.5} />
                          </button>
                          <span className="w-8 h-7 flex items-center justify-center text-xs font-body border-x border-border">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })}
                            className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <Plus size={11} strokeWidth={1.5} />
                          </button>
                        </div>
                        <span className="text-sm font-body font-medium">
                          {((item.product?.price || 0) * item.quantity).toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors self-start"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border/40 px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-medium">
                  {lang === "ru" ? "Итого" : "Total"}
                </span>
                <span className="font-display text-xl">{total.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽</span>
              </div>
              <Link
                to="/checkout"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-body font-medium hover:bg-primary transition-colors duration-500"
              >
                {lang === "ru" ? "Оформить заявку" : "Submit Request"}
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
