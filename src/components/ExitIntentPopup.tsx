import { useState, useEffect, useCallback } from "react";
import { X, Send, CheckCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

interface ExitIntentPopupProps {
  /** Which offer to show — auto-detected from page context */
  offer?: "decor" | "showroom";
}

const SESSION_KEY = "kiki_exit_intent_shown";

const ExitIntentPopup = ({ offer = "decor" }: ExitIntentPopupProps) => {
  const { lang } = useLanguage();
  const isRu = lang === "ru";
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const schema = z.object({
    name: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(5).max(30),
    email: z.string().trim().email().max(255),
  });

  const show = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  useEffect(() => {
    // Exit intent: mouse leaves viewport top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [show]);

  const close = () => setVisible(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ name, phone, email });
    if (!result.success) {
      setError(isRu ? "Заполните все поля корректно" : "Please fill in all fields correctly");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { error: dbError } = await supabase.from("event_leads").insert({
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email,
        event_type: offer || "exit_intent",
        booking_type: "decor",
        status: "new",
      });
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch {
      setError(isRu ? "Ошибка. Попробуйте ещё раз." : "Error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const titles = {
    decor: {
      ru: "Бесплатная консультация по декору",
      en: "Free Decor Consultation",
    },
    showroom: {
      ru: "Бесплатная стилистическая консультация",
      en: "Free Styling Consultation",
    },
  };

  const subtitles = {
    decor: {
      ru: "Не уходите! Оставьте заявку — мы подберём концепцию декора именно для вашего события.",
      en: "Wait! Leave your details — we'll create a decor concept tailored to your event.",
    },
    showroom: {
      ru: "Подождите! Наш стилист подберёт идеальный образ лично для вас — бесплатно.",
      en: "Hold on! Our stylist will curate the perfect look just for you — for free.",
    },
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-md"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-md bg-background border border-border/40 p-8 md:p-10"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle size={36} className="text-primary mx-auto mb-5" strokeWidth={1.2} />
                <h3 className="font-display text-2xl font-light mb-3">
                  {isRu ? "Спасибо!" : "Thank you!"}
                </h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">
                  {isRu
                    ? "Мы свяжемся с вами в ближайшее время."
                    : "We'll get back to you shortly."}
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <Sparkles className="w-6 h-6 text-primary mx-auto mb-4" strokeWidth={1.2} />
                  <h3 className="font-display text-2xl md:text-3xl font-light mb-3 leading-tight">
                    {titles[offer][lang]}
                  </h3>
                  <p className="text-muted-foreground text-sm font-light leading-relaxed">
                    {subtitles[offer][lang]}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isRu ? "Ваше имя" : "Your name"}
                    className="w-full bg-transparent border-b border-border/60 py-3 text-sm font-light focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/40"
                    maxLength={100}
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full bg-transparent border-b border-border/60 py-3 text-sm font-light focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/40"
                    maxLength={30}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border-b border-border/60 py-3 text-sm font-light focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/40"
                    maxLength={255}
                  />

                  {error && <p className="text-destructive text-xs font-light">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 inline-flex items-center justify-center gap-3 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-primary transition-all duration-500 disabled:opacity-50"
                  >
                    {submitting ? (
                      isRu ? "Отправляем..." : "Sending..."
                    ) : (
                      <>
                        {isRu ? "Получить консультацию" : "Get consultation"}
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
