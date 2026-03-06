import { useState } from "react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, X, ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { lang } = useLanguage();
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "info" | "done">("cart");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      toast.error(lang === "ru" ? "Заполните обязательные поля" : "Please fill required fields");
      return;
    }
    setSubmitting(true);
    // Simulate order placement
    await new Promise((r) => setTimeout(r, 1500));
    clearCart.mutate();
    setStep("done");
    setSubmitting(false);
  };

  if (step === "done") {
    return (
      <section className="pt-32 pb-20 px-6 md:px-10 min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <ScrollReveal>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} strokeWidth={1.2} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-light mb-4">
              {lang === "ru" ? "Заказ оформлен!" : "Order Placed!"}
            </h1>
            <p className="text-muted-foreground font-light mb-8">
              {lang === "ru"
                ? "Спасибо за заказ! Мы свяжемся с вами для подтверждения."
                : "Thank you for your order! We'll contact you for confirmation."}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-body font-medium hover:bg-primary transition-colors duration-500"
            >
              {lang === "ru" ? "Продолжить покупки" : "Continue Shopping"}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  return (
    <>
      <title>{lang === "ru" ? "Оформление заказа" : "Checkout"} — KiKi Showroom</title>

      <section className="pt-28 pb-20 md:pt-36 md:pb-28 px-6 md:px-10">
        <div className="container mx-auto max-w-4xl">
          <Link to="/shop" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-body mb-8">
            <ArrowLeft size={14} strokeWidth={1.5} />
            {lang === "ru" ? "Каталог" : "Catalog"}
          </Link>

          <ScrollReveal>
            <h1 className="font-display text-4xl md:text-5xl font-light mb-12">
              {lang === "ru" ? "Оформление заказа" : "Checkout"}
            </h1>
          </ScrollReveal>

          {items.length === 0 && step !== "done" ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-light mb-6">
                {lang === "ru" ? "Корзина пуста" : "Your cart is empty"}
              </p>
              <Link to="/shop" className="text-primary hover:underline font-body text-sm">
                {lang === "ru" ? "Перейти в каталог" : "Browse Catalog"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Main */}
              <div className="lg:col-span-3">
                {step === "cart" && (
                  <div className="space-y-0">
                    {items.map((item) => {
                      const name = lang === "en" && item.product?.name_en ? item.product.name_en : item.product?.name;
                      return (
                        <div key={item.id} className="flex gap-4 py-6 border-b border-border/40">
                          <div className="w-24 h-32 bg-secondary/30 overflow-hidden shrink-0">
                            <img src={item.product?.images?.[0] || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <h3 className="font-display text-base font-light">{name}</h3>
                              <button onClick={() => removeItem.mutate(item.id)} className="text-muted-foreground hover:text-foreground">
                                <X size={14} />
                              </button>
                            </div>
                            {(item.size || item.color) && (
                              <p className="text-[10px] text-muted-foreground font-body mb-3">
                                {[item.size, item.color].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="inline-flex items-center border border-border">
                                <button onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity - 1 })} className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors">
                                  <Minus size={12} />
                                </button>
                                <span className="w-10 h-8 flex items-center justify-center text-xs font-body border-x border-border">{item.quantity}</span>
                                <button onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })} className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors">
                                  <Plus size={12} />
                                </button>
                              </div>
                              <span className="text-sm font-body font-medium">
                                {((item.product?.price || 0) * item.quantity).toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-6">
                      <button
                        onClick={() => setStep("info")}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-body font-medium hover:bg-primary transition-colors duration-500"
                      >
                        {lang === "ru" ? "Далее" : "Continue"}
                        <ArrowRight size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                )}

                {step === "info" && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-medium block mb-2">
                        {lang === "ru" ? "Имя *" : "Name *"}
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-transparent text-sm font-body focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-medium block mb-2">
                        {lang === "ru" ? "Телефон *" : "Phone *"}
                      </label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-transparent text-sm font-body focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-medium block mb-2">Email</label>
                      <input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-transparent text-sm font-body focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-medium block mb-2">
                        {lang === "ru" ? "Адрес доставки" : "Delivery Address"}
                      </label>
                      <input
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full px-4 py-3 border border-border bg-transparent text-sm font-body focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-medium block mb-2">
                        {lang === "ru" ? "Комментарий" : "Comment"}
                      </label>
                      <textarea
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-border bg-transparent text-sm font-body focus:border-primary focus:outline-none transition-colors resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setStep("cart")} className="px-6 py-4 border border-border text-[10px] uppercase tracking-[0.2em] font-body font-medium hover:bg-secondary transition-colors">
                        <ArrowLeft size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-body font-medium hover:bg-primary transition-colors duration-500 disabled:opacity-50"
                      >
                        {submitting
                          ? (lang === "ru" ? "Оформление..." : "Processing...")
                          : (lang === "ru" ? "Оформить заказ" : "Place Order")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="lg:col-span-2">
                <div className="bg-secondary/30 p-6 md:p-8 sticky top-32">
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-body font-medium mb-6">
                    {lang === "ru" ? "Ваш заказ" : "Order Summary"}
                  </h3>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm font-light">
                        <span className="truncate mr-2">{lang === "en" && item.product?.name_en ? item.product.name_en : item.product?.name} × {item.quantity}</span>
                        <span className="font-body shrink-0">{((item.product?.price || 0) * item.quantity).toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-border mb-4" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-medium">
                      {lang === "ru" ? "Итого" : "Total"}
                    </span>
                    <span className="font-display text-2xl">{total.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")} ₽</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CheckoutPage;
