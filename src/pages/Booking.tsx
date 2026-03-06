import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const eventTypes = ["Свадьба", "День рождения", "Декор фасада", "Фотозона", "Входная группа", "Корпоратив", "Другое"];

const Booking = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", eventType: "", date: "", guests: "", budget: "", message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("event_leads").insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      event_type: formData.eventType,
      event_date: formData.date || null,
      location: null,
      guests: formData.guests ? parseInt(formData.guests) : null,
      message: formData.message || null,
      status: "new",
    });

    // Trigger email notification
    try {
      await supabase.functions.invoke("notify-new-lead", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          eventType: formData.eventType,
          date: formData.date,
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
      setFormData({ name: "", email: "", phone: "", eventType: "", date: "", guests: "", budget: "", message: "" });
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
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Дата мероприятия</label>
                  <Input type="date" value={formData.date} onChange={update("date")} className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Количество гостей</label>
                  <Input value={formData.guests} onChange={update("guests")} placeholder="например, 50-100" className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Бюджет</label>
                <Input value={formData.budget} onChange={update("budget")} placeholder="например, 30 000 - 50 000 ₽" className="rounded-none border-border bg-transparent focus:border-primary" />
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