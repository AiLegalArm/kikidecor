import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const eventTypes = ["Свадьба", "День рождения", "Декор фасада", "Фотозона", "Входная группа", "Корпоратив", "Другое"];

const Booking = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", eventType: "", guests: "", budget: "", message: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Fetch booked dates
  const { data: bookedDates } = useQuery({
    queryKey: ["booked-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_leads")
        .select("event_date")
        .not("event_date", "is", null)
        .in("status", ["booked", "contacted", "new"]);
      if (error) throw error;
      return data
        ?.map((d) => d.event_date)
        .filter(Boolean) as string[];
    },
  });

  const disabledDates = useMemo(() => {
    if (!bookedDates) return [];
    // Count bookings per date — disable if 2+ bookings on same day
    const counts: Record<string, number> = {};
    bookedDates.forEach((d) => {
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count >= 2)
      .map(([date]) => new Date(date + "T00:00:00"));
  }, [bookedDates]);

  const isDateDisabled = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    return disabledDates.some(
      (d) => d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
    );
  };

  // Dates with 1 booking — show as "limited"
  const limitedDates = useMemo(() => {
    if (!bookedDates) return [];
    const counts: Record<string, number> = {};
    bookedDates.forEach((d) => {
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count === 1)
      .map(([date]) => new Date(date + "T00:00:00"));
  }, [bookedDates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("event_leads").insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      event_type: formData.eventType,
      event_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      location: null,
      guests: formData.guests ? parseInt(formData.guests) : null,
      message: formData.message || null,
      status: "new",
    });

    try {
      await supabase.functions.invoke("notify-new-lead", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          eventType: formData.eventType,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          guests: formData.guests,
          budget: formData.budget,
          message: formData.message,
          source: "booking",
        },
      });
    } catch (err) {
      console.warn("Email notification failed:", err);
    }

    setSubmitting(false);
    if (error) {
      console.error(error);
      toast.error("Ошибка отправки. Попробуйте позже.");
    } else {
      toast.success("Спасибо! Мы свяжемся с вами в течение 24 часов.");
      setFormData({ name: "", email: "", phone: "", eventType: "", guests: "", budget: "", message: "" });
      setSelectedDate(undefined);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <>
      <title>Заявка на декор мероприятия | Ki Ki Decor</title>
      <meta name="description" content="Оставьте заявку на event decoration — бесплатная консультация по wedding decoration, birthday decor, proposal decor." />
      <meta property="og:title" content="Заявка на декор — Ki Ki Decor" />
      <meta property="og:description" content="Оставьте заявку на оформление мероприятия и получите бесплатную консультацию." />
      <meta property="og:type" content="website" />

      <section className="section-padding">
        <div className="container mx-auto max-w-2xl">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Начнём</p>
            <h1 className="font-display text-4xl md:text-6xl font-light text-center mb-6">Заявка на декор</h1>
            <div className="gold-divider" />
            <p className="text-center text-muted-foreground font-light text-sm max-w-lg mx-auto mt-6 mb-12">
              Расскажите о вашем мероприятии — мы свяжемся в течение 24 часов для бесплатной консультации.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Ваше имя *</label>
                  <Input value={formData.name} onChange={update("name")} required className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Email *</label>
                  <Input type="email" value={formData.email} onChange={update("email")} required className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Телефон</label>
                  <Input value={formData.phone} onChange={update("phone")} placeholder="+7 (___) ___-__-__" className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Тип мероприятия *</label>
                  <select
                    value={formData.eventType}
                    onChange={update("eventType")}
                    required
                    className="w-full h-10 px-3 border border-border bg-transparent text-sm font-body focus:outline-none focus:border-primary"
                  >
                    <option value="">Выберите...</option>
                    {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Calendar Date Picker */}
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Дата мероприятия</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-none border-border bg-transparent hover:bg-muted/30",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {selectedDate
                          ? format(selectedDate, "d MMMM yyyy", { locale: ru })
                          : "Выберите дату"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={isDateDisabled}
                        modifiers={{ limited: limitedDates }}
                        modifiersClassNames={{ limited: "bg-primary/15 text-primary" }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="px-4 pb-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/40" />
                          Почти занято
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                          Недоступно
                        </span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Количество гостей</label>
                  <Input value={formData.guests} onChange={update("guests")} placeholder="например, 50-100" className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Бюджет</label>
                  <Input value={formData.budget} onChange={update("budget")} placeholder="например, 30 000 - 50 000 ₽" className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Расскажите о вашей идее *</label>
                <Textarea value={formData.message} onChange={update("message")} required rows={5} placeholder="Опишите ваше мероприятие, пожелания по стилю и декору..." className="rounded-none border-border bg-transparent focus:border-primary resize-none" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full rounded-none text-xs uppercase tracking-[0.15em] py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                {submitting ? "Отправка..." : "Отправить заявку"}
              </Button>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default Booking;
