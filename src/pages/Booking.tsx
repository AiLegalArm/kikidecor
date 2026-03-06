import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, X, Send, MapPin, Users, Phone, Mail, User, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const eventTypes = ["Свадьба", "День рождения", "Декор фасада", "Фотозона", "Входная группа", "Корпоратив", "Другое"];

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(100),
  phone: z.string().trim().min(1, "Укажите телефон").max(30),
  email: z.string().trim().email("Неверный email").max(255),
  eventType: z.string().min(1, "Выберите тип"),
  guests: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const initialForm: BookingForm = {
  name: "", phone: "", email: "", eventType: "", guests: "", location: "", message: "",
};

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<BookingForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

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
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("blocked_date");
      if (error) throw error;
      return data?.map((d) => d.blocked_date) as string[];
    },
  });

  const blockedDateSet = useMemo(
    () => new Set(blockedDatesData || []),
    [blockedDatesData]
  );

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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setFormData(initialForm);
    setErrors({});
    setFormOpen(true);
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
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("event_leads").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      event_type: result.data.eventType,
      event_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      location: result.data.location || null,
      guests: result.data.guests ? parseInt(result.data.guests) : null,
      message: result.data.message || null,
      status: "new",
    });

    try {
      await supabase.functions.invoke("notify-new-lead", {
        body: {
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          eventType: result.data.eventType,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          guests: result.data.guests,
          location: result.data.location,
          message: result.data.message,
          source: "booking",
        },
      });
    } catch (err) {
      console.warn("Email notification failed:", err);
    }

    setSubmitting(false);
    if (error) {
      toast.error("Ошибка отправки. Попробуйте позже.");
    } else {
      toast.success("Спасибо! Мы свяжемся с вами в течение 24 часов.");
      setFormOpen(false);
      setSelectedDate(undefined);
    }
  };

  return (
    <>
      <title>Заявка на декор мероприятия | Ki Ki Decor</title>
      <meta name="description" content="Оставьте заявку на event decoration — бесплатная консультация по wedding decoration, birthday decor, proposal decor." />

      <section className="section-padding">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Бронирование</p>
            <h1 className="font-display text-4xl md:text-6xl font-light text-center mb-6">Выберите дату</h1>
            <div className="gold-divider" />
            <p className="text-center text-muted-foreground font-light text-sm max-w-lg mx-auto mt-6 mb-12">
              Выберите удобную дату для вашего мероприятия — мы покажем форму для заполнения деталей.
            </p>
          </ScrollReveal>

          {/* Full Calendar */}
          <ScrollReveal delay={150}>
            <div className="flex justify-center">
              <div className="bg-card border border-border/60 shadow-sm p-4 md:p-8">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  modifiers={{ limited: limitedDates }}
                  modifiersClassNames={{ limited: "bg-primary/15 text-primary font-medium" }}
                  numberOfMonths={2}
                  className={cn("p-3 pointer-events-auto")}
                />
                <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap justify-center gap-6 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    Выбрано
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/40" />
                    Почти занято
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                    Недоступно
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Booking Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-card border-border/50 rounded-none sm:rounded-sm">
          <div className="bg-primary/5 border-b border-border/40 px-6 py-5">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-light flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                Бронирование
              </DialogTitle>
            </DialogHeader>
            {selectedDate && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <CalendarDays size={14} className="text-primary" />
                {format(selectedDate, "d MMMM yyyy, EEEE", { locale: ru })}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Ваше имя *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  value={formData.name}
                  onChange={update("name")}
                  placeholder="Анна Иванова"
                  className={cn("pl-9 rounded-none border-border bg-transparent focus:border-primary", errors.name && "border-destructive")}
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Телефон *</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    value={formData.phone}
                    onChange={update("phone")}
                    placeholder="+7 (900) 123-45-67"
                    className={cn("pl-9 rounded-none border-border bg-transparent focus:border-primary", errors.phone && "border-destructive")}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={update("email")}
                    placeholder="anna@mail.ru"
                    className={cn("pl-9 rounded-none border-border bg-transparent focus:border-primary", errors.email && "border-destructive")}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Тип мероприятия *</label>
              <select
                value={formData.eventType}
                onChange={update("eventType")}
                className={cn(
                  "w-full h-10 px-3 border bg-transparent text-sm font-body focus:outline-none focus:border-primary",
                  errors.eventType ? "border-destructive" : "border-border"
                )}
              >
                <option value="">Выберите...</option>
                {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.eventType && <p className="text-xs text-destructive mt-1">{errors.eventType}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Guests */}
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Гостей</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    value={formData.guests}
                    onChange={update("guests")}
                    placeholder="50-100"
                    className="pl-9 rounded-none border-border bg-transparent focus:border-primary"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Локация</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    value={formData.location}
                    onChange={update("location")}
                    placeholder="Москва"
                    className="pl-9 rounded-none border-border bg-transparent focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Пожелания</label>
              <Textarea
                value={formData.message}
                onChange={update("message")}
                rows={3}
                placeholder="Расскажите о стиле, цветах, идеях..."
                className="rounded-none border-border bg-transparent focus:border-primary resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-none text-xs uppercase tracking-[0.15em] py-5 gap-2 btn-glow"
            >
              {submitting ? (
                "Отправка..."
              ) : (
                <>
                  <Send size={14} />
                  Забронировать
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Booking;
