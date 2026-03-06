import { useState } from "react";
import { ArrowRight, ArrowLeft, Send, CheckCircle, CalendarIcon, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ScrollReveal from "@/components/ScrollReveal";

const TOTAL_STEPS = 4;

const eventTypes = {
  ru: ["Свадьба", "День рождения", "Корпоратив", "Предложение", "Детский праздник", "Другое"],
  en: ["Wedding", "Birthday", "Corporate", "Proposal", "Kids party", "Other"],
};

const budgets = {
  ru: ["до 50 000 ₽", "50 000 – 150 000 ₽", "150 000 – 300 000 ₽", "300 000+ ₽", "Обсудим"],
  en: ["Up to $700", "$700 – $2,000", "$2,000 – $4,000", "$4,000+", "Let's discuss"],
};

const styleOptions = {
  ru: ["Классический", "Минимализм", "Романтичный", "Бохо", "Люкс", "Тематический"],
  en: ["Classic", "Minimalist", "Romantic", "Boho", "Luxury", "Themed"],
};

const MultiStepLeadForm = () => {
  const { lang } = useLanguage();
  const isRu = lang === "ru";

  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState<Date>();
  const [budget, setBudget] = useState("");
  const [style, setStyle] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const contactSchema = z.object({
    name: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(5).max(30),
    email: z.string().trim().email().max(255),
  });

  const canNext = () => {
    if (step === 0) return !!eventType;
    if (step === 1) return !!eventDate;
    if (step === 2) return !!budget && !!style;
    if (step === 3) return !!name && !!phone && !!email;
    return false;
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1 && canNext()) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const result = contactSchema.safeParse({ name, phone, email });
    if (!result.success) {
      setError(isRu ? "Заполните все поля корректно" : "Please fill all fields correctly");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { error: dbError } = await supabase.from("event_leads").insert({
        event_type: eventType,
        event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
        guests: null,
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email,
        message: `${isRu ? "Бюджет" : "Budget"}: ${budget} | ${isRu ? "Стиль" : "Style"}: ${style}`,
        location: null,
      });
      if (dbError) throw dbError;

      // Trigger notification
      try {
        await supabase.functions.invoke("notify-new-lead", {
          body: {
            type: "event",
            name: result.data.name,
            phone: result.data.phone,
            email: result.data.email,
            event_type: eventType,
            event_date: eventDate ? format(eventDate, "dd.MM.yyyy") : "—",
            message: `${budget} / ${style}`,
          },
        });
      } catch {}

      setSubmitted(true);
    } catch {
      setError(isRu ? "Ошибка. Попробуйте ещё раз." : "Error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = isRu
    ? ["Тип события", "Дата", "Бюджет и стиль", "Контакты"]
    : ["Event type", "Date", "Budget & style", "Contact"];

  const ChipGrid = ({
    options,
    value,
    onChange,
  }: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-5 py-3 text-xs tracking-wider uppercase border transition-all duration-300",
            value === opt
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); next(); };
  const goPrev = () => { setDirection(-1); prev(); };

  if (submitted) {
    return (
      <section className="section-padding bg-secondary/30">
        <div className="container mx-auto max-w-lg text-center">
          <ScrollReveal>
            <CheckCircle size={44} className="text-primary mx-auto mb-6" strokeWidth={1.2} />
            <h3 className="font-display text-3xl font-light mb-4">
              {isRu ? "Спасибо!" : "Thank you!"}
            </h3>
            <p className="text-muted-foreground font-light leading-relaxed">
              {isRu
                ? "Мы получили вашу заявку и свяжемся с вами в ближайшее время."
                : "We've received your request and will contact you shortly."}
            </p>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto max-w-2xl">
        <ScrollReveal>
          <div className="text-center mb-10">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-4" strokeWidth={1.2} />
            <h2 className="font-display text-3xl md:text-4xl font-light mb-3">
              {isRu ? "Расскажите о вашем событии" : "Tell us about your event"}
            </h2>
            <p className="text-muted-foreground font-light text-sm">
              {isRu ? "Четыре простых шага — и мы подготовим индивидуальное предложение" : "Four simple steps — and we'll prepare a personalized proposal"}
            </p>
          </div>
        </ScrollReveal>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-3">
          {stepLabels.map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-0.5 transition-colors duration-500",
                i <= step ? "bg-foreground" : "bg-border"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between mb-10">
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            {isRu ? "Шаг" : "Step"} {step + 1}/{TOTAL_STEPS}
          </p>
          <p className="text-[9px] uppercase tracking-[0.3em] text-primary">
            {stepLabels[step]}
          </p>
        </div>

        {/* Steps */}
        <div className="min-h-[280px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <div>
                  <p className="overline text-primary mb-5">{isRu ? "Тип мероприятия" : "Event type"}</p>
                  <ChipGrid
                    options={isRu ? eventTypes.ru : eventTypes.en}
                    value={eventType}
                    onChange={setEventType}
                  />
                </div>
              )}

              {step === 1 && (
                <div>
                  <p className="overline text-primary mb-5">{isRu ? "Дата события" : "Event date"}</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 px-5 py-4 border text-sm font-light text-left transition-colors",
                          eventDate ? "border-foreground text-foreground" : "border-border text-muted-foreground"
                        )}
                      >
                        <CalendarIcon size={16} strokeWidth={1.5} />
                        {eventDate ? format(eventDate, "dd.MM.yyyy") : (isRu ? "Выберите дату" : "Pick a date")}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={eventDate}
                        onSelect={setEventDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <p className="overline text-primary mb-5">{isRu ? "Бюджет" : "Budget"}</p>
                    <ChipGrid
                      options={isRu ? budgets.ru : budgets.en}
                      value={budget}
                      onChange={setBudget}
                    />
                  </div>
                  <div>
                    <p className="overline text-primary mb-5">{isRu ? "Стиль" : "Style"}</p>
                    <ChipGrid
                      options={isRu ? styleOptions.ru : styleOptions.en}
                      value={style}
                      onChange={setStyle}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <p className="overline text-primary mb-5">{isRu ? "Контактные данные" : "Contact details"}</p>
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
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ArrowLeft size={14} /> {isRu ? "Назад" : "Back"}
          </button>

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={goNext}
              disabled={!canNext()}
              className="flex items-center gap-2 px-8 py-3.5 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-primary transition-all duration-500 disabled:opacity-30 disabled:pointer-events-none"
            >
              {isRu ? "Далее" : "Next"} <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || submitting}
              className="flex items-center gap-2 px-8 py-3.5 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-primary transition-all duration-500 disabled:opacity-30 disabled:pointer-events-none"
            >
              {submitting
                ? (isRu ? "Отправка..." : "Sending...")
                : (<>{isRu ? "Отправить" : "Submit"} <Send size={12} /></>)}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default MultiStepLeadForm;
