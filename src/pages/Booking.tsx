import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { CalendarDays, Send, MapPin, Users, Phone, Mail, User, Sparkles, DollarSign, Palette, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
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

const Booking = () => {
  const { lang, t } = useLanguage();
  const b = t.booking;
  const eventTypes = b.eventTypes.map((et) => et[lang]);
  const budgetRanges = b.budgetRanges.map((br) => br[lang]);
  const decorStyles = b.decorStyles.map((ds) => ds[lang]);

  const bookingSchema = z.object({
    name: z.string().trim().min(1, b.validationName[lang]).max(100),
    phone: z.string().trim().min(1, b.validationPhone[lang]).max(30),
    email: z.string().trim().email(b.validationEmail[lang]).max(255),
    eventType: z.string().min(1, b.validationType[lang]),
    guests: z.string().max(20).optional(),
    location: z.string().max(200).optional(),
    budget: z.string().optional(),
    decorStyle: z.string().optional(),
    message: z.string().max(2000).optional(),
  });

  type BookingForm = z.infer<typeof bookingSchema>;

  const initialForm: BookingForm = {
    name: "", phone: "", email: "", eventType: "", guests: "", location: "", budget: "", decorStyle: "", message: "",
  };

  const [step, setStep] = useState(0); // 0 = details, 1 = date, 2 = contact
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState<BookingForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: bookedDates } = useQuery({
    queryKey: ["booked-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_leads")
        .select("event_date")
        .not("event_date", "is", null)
        .in("status", ["booked", "contacted", "new"]);
      if (error) throw error;
      return data?.map((d) => d.event_date).filter(Boolean) as string[];
    },
  });

  const { data: blockedDatesData } = useQuery({
    queryKey: ["blocked-dates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blocked_dates").select("blocked_date");
      if (error) throw error;
      return data?.map((d) => d.blocked_date) as string[];
    },
  });

  const blockedDateSet = useMemo(() => new Set(blockedDatesData || []), [blockedDatesData]);

  const { disabledDates, limitedDates } = useMemo(() => {
    if (!bookedDates) return { disabledDates: [], limitedDates: [] };
    const counts: Record<string, number> = {};
    bookedDates.forEach((d) => { counts[d] = (counts[d] || 0) + 1; });
    return {
      disabledDates: Object.entries(counts).filter(([, c]) => c >= 2).map(([d]) => new Date(d + "T00:00:00")),
      limitedDates: Object.entries(counts).filter(([, c]) => c === 1).map(([d]) => new Date(d + "T00:00:00")),
    };
  }, [bookedDates]);

  const isDateDisabled = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    const dateStr = format(date, "yyyy-MM-dd");
    if (blockedDateSet.has(dateStr)) return true;
    return disabledDates.some(
      (d) => d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
    );
  };

  const update = (field: keyof BookingForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BookingForm, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof BookingForm;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      // Go to the step with errors
      if (fieldErrors.eventType) setStep(0);
      else if (fieldErrors.name || fieldErrors.phone || fieldErrors.email) setStep(2);
      return;
    }

    setSubmitting(true);
    const budgetMsg = result.data.budget ? `\n${b.budgetLabel[lang]}: ${result.data.budget}` : "";
    const styleMsg = result.data.decorStyle ? `\n${b.decorStyleLabel[lang]}: ${result.data.decorStyle}` : "";
    const fullMessage = `${result.data.message || ""}${budgetMsg}${styleMsg}`.trim();

    const { error } = await supabase.from("event_leads").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      event_type: result.data.eventType,
      event_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      location: result.data.location || null,
      guests: result.data.guests ? parseInt(result.data.guests) : null,
      message: fullMessage || null,
      status: "new",
      booking_type: "decor",
    });

    try {
      await supabase.functions.invoke("notify-new-lead", {
        body: {
          name: result.data.name, email: result.data.email, phone: result.data.phone,
          eventType: result.data.eventType,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          guests: result.data.guests, location: result.data.location,
          budget: result.data.budget, decorStyle: result.data.decorStyle,
          message: result.data.message, source: "booking",
        },
      });
    } catch (err) { console.warn("Notification failed:", err); }

    setSubmitting(false);
    if (error) {
      toast.error(b.errorMsg[lang]);
    } else {
      setSubmitted(true);
    }
  };

  const dateLocale = lang === "ru" ? ru : enUS;

  const steps = [
    { label: b.stepDetails[lang], num: 0 },
    { label: b.stepDate[lang], num: 1 },
    { label: b.stepContact[lang], num: 2 },
  ];

  if (submitted) {
    return (
      <>
        <title>{b.title[lang]} — KiKi</title>
        <section className="pt-32 md:pt-40 pb-24 md:pb-36 px-6 md:px-10">
          <div className="container mx-auto max-w-lg text-center">
            <ScrollReveal>
              <CheckCircle size={48} className="text-primary mx-auto mb-6" strokeWidth={1} />
              <h1 className="font-display text-4xl md:text-5xl font-light mb-4">{b.successTitle[lang]}</h1>
              <p className="text-muted-foreground font-light leading-relaxed mb-8">{b.successMsg[lang]}</p>
              <div className="border border-border/50 p-6 text-left space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{b.eventTypeLabel[lang]}</span>
                  <span className="font-medium">{formData.eventType}</span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{b.dateLabel[lang]}</span>
                    <span className="font-medium">{format(selectedDate, "d MMMM yyyy", { locale: dateLocale })}</span>
                  </div>
                )}
                {formData.guests && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{b.guestsLabel[lang]}</span>
                    <span className="font-medium">{formData.guests}</span>
                  </div>
                )}
                {formData.budget && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{b.budgetLabel[lang]}</span>
                    <span className="font-medium">{formData.budget}</span>
                  </div>
                )}
                {formData.decorStyle && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{b.decorStyleLabel[lang]}</span>
                    <span className="font-medium">{formData.decorStyle}</span>
                  </div>
                )}
              </div>
              <Button onClick={() => { setSubmitted(false); setStep(0); setFormData(initialForm); setSelectedDate(undefined); }} variant="outline" className="rounded-none text-[10px] uppercase tracking-[0.2em] px-8 py-5 border-foreground/15 hover:bg-foreground hover:text-background">
                {lang === "ru" ? "Новая заявка" : "New Request"}
              </Button>
            </ScrollReveal>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <title>{b.title[lang]} — KiKi</title>

      {/* Header */}
      <section className="pt-32 md:pt-40 pb-10 md:pb-14 px-6 md:px-10">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-4">{b.overline[lang]}</p>
            <h1 className="font-display text-5xl md:text-7xl font-light mb-5 leading-[1.05]">{b.title[lang]}</h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed">{b.subtitle[lang]}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Stepper */}
      <section className="px-6 md:px-10 pb-6">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-0">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => setStep(s.num)}
                  className={cn(
                    "flex items-center gap-2 py-2 px-4 transition-all duration-300",
                    step === s.num
                      ? "text-foreground"
                      : step > s.num
                        ? "text-primary"
                        : "text-muted-foreground/40"
                  )}
                >
                  <span className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-body font-medium border transition-all duration-300",
                    step === s.num
                      ? "border-foreground bg-foreground text-background"
                      : step > s.num
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground/40"
                  )}>
                    {step > s.num ? "✓" : i + 1}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-body font-medium hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className={cn("w-8 md:w-16 h-px transition-colors duration-300", step > i ? "bg-primary" : "bg-border/50")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="px-6 md:px-10 pb-24 md:pb-36">
        <div className="container mx-auto max-w-2xl">
          <form onSubmit={handleSubmit}>
            {/* Step 0: Event Details */}
            <div className={cn("transition-all duration-300", step === 0 ? "block" : "hidden")}>
              <div className="space-y-5">
                {/* Event Type */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{b.eventTypeLabel[lang]} *</label>
                  <select
                    value={formData.eventType}
                    onChange={update("eventType")}
                    className={cn("w-full h-12 px-4 border bg-transparent text-sm font-body font-light focus:outline-none focus:border-primary transition-colors", errors.eventType ? "border-destructive" : "border-border/50")}
                  >
                    <option value="">{b.selectPlaceholder[lang]}</option>
                    {eventTypes.map((et) => <option key={et} value={et}>{et}</option>)}
                  </select>
                  {errors.eventType && <p className="text-xs text-destructive mt-1 font-light">{errors.eventType}</p>}
                </div>

                {/* Guests + Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{b.guestsLabel[lang]}</label>
                    <div className="relative">
                      <Users size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input value={formData.guests} onChange={update("guests")} placeholder="50–150" className="pl-10 h-12 rounded-none border-border/50 bg-transparent focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{b.locationLabel[lang]}</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input value={formData.location} onChange={update("location")} className="pl-10 h-12 rounded-none border-border/50 bg-transparent focus:border-primary" />
                    </div>
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 block font-body">{b.budgetLabel[lang]}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {budgetRanges.map((br) => (
                      <button
                        key={br}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, budget: p.budget === br ? "" : br }))}
                        className={cn(
                          "py-3 px-3 text-[10px] uppercase tracking-[0.15em] border transition-all duration-300 font-body",
                          formData.budget === br
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/40 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {br}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decor Style */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 block font-body">{b.decorStyleLabel[lang]}</label>
                  <div className="flex flex-wrap gap-2">
                    {decorStyles.map((ds) => (
                      <button
                        key={ds}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, decorStyle: p.decorStyle === ds ? "" : ds }))}
                        className={cn(
                          "py-2.5 px-5 text-[10px] uppercase tracking-[0.15em] border transition-all duration-300 font-body",
                          formData.decorStyle === ds
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/40 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {ds}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wishes */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{b.wishesLabel[lang]}</label>
                  <Textarea value={formData.message} onChange={update("message")} rows={3} placeholder={b.wishesPlaceholder[lang]} className="rounded-none border-border/50 bg-transparent focus:border-primary resize-none" />
                </div>

                <Button type="button" onClick={() => setStep(1)} className="w-full rounded-none text-[10px] uppercase tracking-[0.2em] py-6 bg-foreground hover:bg-primary text-background transition-all duration-500 gap-2">
                  {b.stepDate[lang]} <ArrowRight size={14} />
                </Button>
              </div>
            </div>

            {/* Step 1: Date Selection */}
            <div className={cn("transition-all duration-300", step === 1 ? "block" : "hidden")}>
              <div className="flex flex-col items-center">
                <div className="bg-card border border-border/50 p-4 md:p-6 mb-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    modifiers={{ limited: limitedDates }}
                    modifiersClassNames={{ limited: "bg-primary/15 text-primary font-medium" }}
                    numberOfMonths={2}
                    locale={dateLocale}
                    className={cn("p-3 pointer-events-auto")}
                  />
                  <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap justify-center gap-6 text-[10px] text-muted-foreground font-body">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />{b.selected[lang]}</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/20 border border-primary/40" />{b.almostBooked[lang]}</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" />{b.unavailable[lang]}</span>
                  </div>
                </div>

                {selectedDate && (
                  <p className="text-sm text-foreground mb-6 flex items-center gap-2 font-light">
                    <CalendarDays size={14} className="text-primary" />
                    {format(selectedDate, "d MMMM yyyy, EEEE", { locale: dateLocale })}
                  </p>
                )}

                <div className="flex gap-3 w-full max-w-md">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1 rounded-none text-[10px] uppercase tracking-[0.2em] py-6 border-foreground/15 gap-2">
                    <ArrowLeft size={14} /> {b.stepDetails[lang]}
                  </Button>
                  <Button type="button" onClick={() => setStep(2)} className="flex-1 rounded-none text-[10px] uppercase tracking-[0.2em] py-6 bg-foreground hover:bg-primary text-background transition-all duration-500 gap-2">
                    {b.stepContact[lang]} <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 2: Contact Info */}
            <div className={cn("transition-all duration-300", step === 2 ? "block" : "hidden")}>
              <div className="space-y-5">
                {/* Summary bar */}
                <div className="border border-border/40 p-5 space-y-2 mb-2">
                  {formData.eventType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-light">{b.eventTypeLabel[lang]}</span>
                      <span className="font-medium">{formData.eventType}</span>
                    </div>
                  )}
                  {selectedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-light">{b.dateLabel[lang]}</span>
                      <span className="font-medium">{format(selectedDate, "d MMMM yyyy", { locale: dateLocale })}</span>
                    </div>
                  )}
                  {formData.budget && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-light">{b.budgetLabel[lang]}</span>
                      <span className="font-medium">{formData.budget}</span>
                    </div>
                  )}
                  {formData.decorStyle && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-light">{b.decorStyleLabel[lang]}</span>
                      <span className="font-medium">{formData.decorStyle}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{b.nameLabel[lang]} *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <Input value={formData.name} onChange={update("name")} className={cn("pl-10 h-12 rounded-none border-border/50 bg-transparent focus:border-primary", errors.name && "border-destructive")} />
                  </div>
                  {errors.name && <p className="text-xs text-destructive mt-1 font-light">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{b.phoneLabel[lang]} *</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input value={formData.phone} onChange={update("phone")} className={cn("pl-10 h-12 rounded-none border-border/50 bg-transparent focus:border-primary", errors.phone && "border-destructive")} />
                    </div>
                    {errors.phone && <p className="text-xs text-destructive mt-1 font-light">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block font-body">{b.emailLabel[lang]} *</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input type="email" value={formData.email} onChange={update("email")} className={cn("pl-10 h-12 rounded-none border-border/50 bg-transparent focus:border-primary", errors.email && "border-destructive")} />
                    </div>
                    {errors.email && <p className="text-xs text-destructive mt-1 font-light">{errors.email}</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-none text-[10px] uppercase tracking-[0.2em] py-6 border-foreground/15 gap-2">
                    <ArrowLeft size={14} /> {b.stepDate[lang]}
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1 rounded-none text-[10px] uppercase tracking-[0.2em] py-6 bg-foreground hover:bg-primary text-background transition-all duration-500 gap-2 btn-glow">
                    {submitting ? b.submitting[lang] : (<>{b.submitBtn[lang]} <Send size={13} /></>)}
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

export default Booking;
