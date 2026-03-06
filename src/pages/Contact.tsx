import { Mail, Phone, MapPin, Instagram, Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const contactInfo = [
  { icon: Mail, label: "Email", value: "info@kikidecor.ru", href: "mailto:info@kikidecor.ru" },
  { icon: Phone, label: "Телефон", value: "+7 (900) 123-45-67", href: "tel:+79001234567" },
  { icon: MapPin, label: "География", value: "Вся Россия (Ростов, Геленджик и др.)" },
  { icon: Instagram, label: "Instagram", value: "@ki_ki_decor", href: "https://instagram.com/ki_ki_decor" },
  { icon: Clock, label: "Режим работы", value: "Пн–Сб, 9:00–18:00" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <>
      <title>Контакты | Ki Ki Decor</title>
      <meta name="description" content="Свяжитесь со студией Ki Ki Decor — мы будем рады обсудить ваш проект декора." />

      <section className="section-padding">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Напишите нам</p>
            <h1 className="font-display text-4xl md:text-6xl font-light text-center mb-6">Контакты</h1>
            <div className="gold-divider" />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
            <ScrollReveal>
              <div className="space-y-8">
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  Хотите обсудить проект, задать вопрос или просто поздороваться — мы всегда на связи. Пишите в директ Instagram или заполните форму.
                </p>
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <Icon size={18} className="text-primary mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
                      {href ? (
                        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-foreground hover:text-primary transition-colors">{value}</a>
                      ) : (
                        <p className="text-sm text-foreground">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Имя *</label>
                    <Input value={form.name} onChange={update("name")} required className="rounded-none border-border bg-transparent focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Email *</label>
                    <Input type="email" value={form.email} onChange={update("email")} required className="rounded-none border-border bg-transparent focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Тема</label>
                  <Input value={form.subject} onChange={update("subject")} className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Сообщение *</label>
                  <Textarea value={form.message} onChange={update("message")} required rows={5} className="rounded-none border-border bg-transparent focus:border-primary resize-none" />
                </div>
                <Button type="submit" className="w-full rounded-none text-xs uppercase tracking-[0.15em] py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Отправить
                </Button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;