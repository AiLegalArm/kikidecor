import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { CalendarDays, Send, Phone, Mail, User, CheckCircle, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useLanguage } from "@/i18n/LanguageContext";

const TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const schema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(100),
  phone: z.string().trim().min(1, "Введите телефон").max(30),
  email: z.string().trim().email("Введите корректный email").max(255),
  message: z.string().max(2000).optional(),
});

const ShowroomBooking = () => {
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: blockedDatesData } = useQuery({
    queryKey: ["blocked-dates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blocked_dates").select("blocked_date");
      if (error) throw error;
      return data?.map((d) => d.blocked_date) as string[];
    },
  });

  const blockedDateSet = useMemo(() => new Set(blockedDatesData || []), [blockedDatesData]);

  const isDateDisabled = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    const dateStr = format(date, "yyyy-MM-dd");
    if (blockedDateSet.has(dateStr)) return true;
    // Disable Sundays
    if (date.getDay() === 0) return true;
    return false;
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const timeNote = selectedTime ? `Время: ${selectedTime}` : "";
    const fullMsg = [form.message, timeNote].filter(Boolean).join("\n");

    const { error } = await supabase.from("event_leads").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      event_type: "Showroom Visit",
      event_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      message: fullMsg || null,
      status: "new",
      booking_type: "showroom",
    });

    try {
      await supabase.functions.invoke("notify-new-lead", {
        body: {
          name: result.data.name, email: result.data.email, phone: result.data.phone,
          eventType: "Showroom Visit",
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          message: fullMsg, source: "showroom",
        },
      });
    } catch {}

    setSubmitting(false);
    if (error) {
      toast.error("Произошла ошибка. Попробуйте ещё раз.");
    } else {
      setSubmitted(true);
    }
  };

  const dateLocale = lang === "ru" ? ru : enUS;

  if (submitted) {
    return (
      <>
        <title>Showroom Appointment — KiKi</title>
        <section className="pt-32 md:pt-40 pb-24 md:pb-36 px-6 md:px-10">
          <div className="container mx-auto max-w-lg text-center">
            <ScrollReveal>
              <CheckCircle size={48} className="text-primary mx-auto mb-6" strokeWidth={1} />
              <h1 className="font-display text-4xl md:text-5xl font-light mb-4">
                {lang === "ru" ? "Запись подтверждена" : "Appointment Confirmed"}
              </h1>
              <p className="text-muted-foreground font-light leading-relaxed mb-8">
                {lang === "ru" ? "Мы свяжемся с вами для подтверждения визита." : "We'll contact you to confirm your visit."}
              </p>
              <div className="border border-border/50 p-6 text-left space-y-3 mb-8">
                {selectedDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{lang === "ru" ? "Дата" : "Date"}</span>
                    <span className="font-medium">{format(selectedDate, "d MMMM yyyy", { locale: dateLocale })}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{lang === "ru" ? "Время" : "Time"}</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => { setSubmitted(false); setStep(0); setForm({ name: "", phone: "", email: "", message: "" }); setSelectedDate(undefined); setSelectedTime(""); }}
                variant="outline"
                className="rounded-none text-[10px] uppercase tracking-[0.2em] px-8 py-5 border-foreground/15 hover:bg-foreground hover:text-background"
              >
                {lang === "ru" ? "Новая запись" : "New Appointment"}
              </Button>
            </ScrollReveal>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <title>{lang === "ru" ? "Запись в Showroom" : "Showroom Appointment"} — KiKi</title>

      <section className="pt-32 md:pt-40 pb-10 md:pb-14 px-6 md:px-10">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-4">
              {lang === "ru" ? "Showroom" : "Showroom"}
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-light mb-5 leading-[1.05]">
              {lang === "ru" ? "Запись на визит" : "Book a Visit"}
            </h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed">
              {lang === "ru"
                ? "Запишитесь на персональный визит в наш шоурум для примерки и подбора образа"
                : "Schedule a personal visit to our showroom for fitting and styling"}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Stepper */}
      <section className="px-6 md:px-10 pb-6">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-0">
            {[
              { label: lang === "ru" ? "Дата и время" : "Date & Time", num: 0 },
              { label: lang === "ru" ? "Контакты" : "Contact", num: 1 },
            ].map((s, i, arr) => (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => setStep(s.num)}
                  className={cn(
                    "flex items-center gap-2 py-2 px-4 transition-all duration-300",
                    step === s.num ? "text-foreground" : step > s.num ? "text-primary" : "text-muted-foreground/40"
                  )}
                >
                  <span className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-body font-medium border transition-all duration-300",
                    step === s.num ? "border-foreground bg-foreground text-background" : step > s.num ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground/40"
                  )}>
                    {step > s.num ? "✓" : i + 1}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-body font-medium hidden sm:inline">{s.label}</span>
                </button>
                {i < arr.length - 1 && (
                  <div className={cn("w-8 md:w-16 h-px transition-colors duration-300", step > i ? "bg-primary" : "bg-border/50")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 pb-24 md:pb-36">
        <div className="container mx-auto max-w-2xl">
          <form onSubmit={handleSubmit}>
            {/* Step 0: Date & Time */}
            <div className={cn("transition-all duration-300", step === 0 ? "block" : "hidden")}>
              <div className="flex flex-col items-center">
                <div className="bg-card border border-border/50 p-4 md:p-6 mb-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    numberOfMonths={1}
                    locale={dateLocale}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </div>

                {selectedDate && (
                  <>
                    <p className="text-sm text-foreground mb-4 flex items-center gap-2 font-light">
                      <CalendarDays size={14} className="text-primary" />
                      {format(selectedDate, "d MMMM yyyy, EEEE", { locale: dateLocale })}
                    </p>

                    <div className="mb-6 w-full max-w-md">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 block font-body text-center">
                        <Clock size={12} className="inline mr-1" />
                        {lang === "ru" ? "Выберите время" : "Select time"}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(selectedTime === time ? "" : time)}
                            className={cn(
                              "py-3 text-sm border transition-all duration-300 font-body",
                              selectedTime === time
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border/40 text-muted-foreground hover:border-primary/40"
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={!selectedDate}
                  className="w-full max-w-md rounded-none text-[10px] uppercase tracking-[0.2em] py-6 bg-foreground hover:bg-primary text-background transition-all duration-500 gap-2"
                >
                  {lang === "ru" ? "Далее" : "Next"} <ArrowRight size={14} />
                </Button>
              </div>
            </div>

            {/* Step 1: Contact */}
            <div className={cn("transition-all duration-300", step === 1 ? "block" : "hidden")}>
              <div className="space-y-5">
                {/* Summary */}
                <div className="border border-border/40 p-5 space-y-2 mb-2">
                  {selectedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-light">{lang === "ru" ? "Дата" : "Date"}</span>
                      <span className="font-medium">{format(selectedDate, "d MMMM yyyy", { locale: dateLocale })}</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-light">{lang === "ru" ? "Время" : "Time"}</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{lang === "ru" ? "Имя" : "Name"} *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <Input value={form.name} onChange={update("name")} className={cn("pl-10 h-12 rounded-none border-border/50 bg-transparent focus:border-primary", errors.name && "border-destructive")} />
                  </div>
                  {errors.name && <p className="text-xs text-destructive mt-1 font-light">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{lang === "ru" ? "Телефон" : "Phone"} *</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input value={form.phone} onChange={update("phone")} className={cn("pl-10 h-12 rounded-none border-border/50 bg-transparent focus:border-primary", errors.phone && "border-destructive")} />
                    </div>
                    {errors.phone && <p className="text-xs text-destructive mt-1 font-light">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">Email *</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input type="email" value={form.email} onChange={update("email")} className={cn("pl-10 h-12 rounded-none border-border/50 bg-transparent focus:border-primary", errors.email && "border-destructive")} />
                    </div>
                    {errors.email && <p className="text-xs text-destructive mt-1 font-light">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{lang === "ru" ? "Комментарий" : "Notes"}</label>
                  <Textarea value={form.message} onChange={update("message")} rows={3} className="rounded-none border-border/50 bg-transparent focus:border-primary resize-none" />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1 rounded-none text-[10px] uppercase tracking-[0.2em] py-6 border-foreground/15 gap-2">
                    <ArrowLeft size={14} /> {lang === "ru" ? "Назад" : "Back"}
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1 rounded-none text-[10px] uppercase tracking-[0.2em] py-6 bg-foreground hover:bg-primary text-background transition-all duration-500 gap-2 btn-glow">
                    {submitting ? (lang === "ru" ? "Отправка..." : "Sending...") : (<>{lang === "ru" ? "Записаться" : "Book"} <Send size={13} /></>)}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ShowroomBooking;
