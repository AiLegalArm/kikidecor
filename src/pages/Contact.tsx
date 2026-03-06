import { Mail, Phone, MapPin, Instagram, Clock, MessageCircle, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

const Contact = () => {
  const { lang, t } = useLanguage();
  const c = t.contact;
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const contactInfo = [
    { icon: Phone, label: c.phone[lang], value: "+7 (900) 123-45-67", href: "tel:+79001234567" },
    { icon: MessageCircle, label: "WhatsApp", value: "+7 (900) 123-45-67", href: "https://wa.me/79001234567" },
    { icon: Instagram, label: "Instagram", value: "@ki_ki_decor", href: "https://instagram.com/ki_ki_decor" },
    { icon: Mail, label: "Email", value: "info@kikidecor.ru", href: "mailto:info@kikidecor.ru" },
    { icon: MapPin, label: c.geography[lang], value: c.geographyValue[lang] },
    { icon: Clock, label: c.workHoursLabel[lang], value: c.workHoursValue[lang] },
  ];

  const quickButtons = [
    { label: c.callBtn[lang], icon: Phone, href: "tel:+79001234567", className: "bg-foreground text-background hover:bg-foreground/90" },
    { label: c.whatsappBtn[lang], icon: MessageCircle, href: "https://wa.me/79001234567", className: "bg-[hsl(142,70%,40%)] text-white hover:bg-[hsl(142,70%,35%)]" },
    { label: c.instagramBtn[lang], icon: Instagram, href: "https://instagram.com/ki_ki_decor", className: "bg-gradient-to-br from-[hsl(330,70%,55%)] to-[hsl(25,90%,55%)] text-white hover:opacity-90" },
    { label: c.emailBtn[lang], icon: Mail, href: "mailto:info@kikidecor.ru", className: "bg-primary text-primary-foreground hover:bg-primary/90" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("event_leads").insert({
      name: form.name, email: form.email, phone: "",
      event_type: lang === "ru" ? "Обратная связь" : "Feedback",
      message: `${form.subject ? `[${form.subject}] ` : ""}${form.message}`,
      status: "new",
    });

    try {
      await supabase.functions.invoke("notify-new-lead", {
        body: { name: form.name, email: form.email, subject: form.subject, message: form.message, source: "contact" },
      });
    } catch (err) { console.warn("Email notification failed:", err); }

    setSubmitting(false);
    if (error) {
      console.error(error);
      toast.error(c.errorMsg[lang]);
    } else {
      toast.success(c.successMsg[lang]);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <>
      <title>{c.title[lang]} — KiKi</title>

      <section className="section-padding pb-8 md:pb-12">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">{c.overline[lang]}</p>
            <h1 className="font-display text-4xl md:text-6xl font-light mb-5">{c.title[lang]}</h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground font-light text-sm md:text-base mt-6 max-w-xl mx-auto">{c.subtitle[lang]}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-5 md:px-8 lg:px-16 pb-12">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {quickButtons.map((btn) => (
                <a
                  key={btn.label}
                  href={btn.href}
                  target={btn.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-2 rounded-2xl py-5 px-4 transition-all duration-300 hover:scale-[1.03] shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.1)] ${btn.className}`}
                >
                  <btn.icon size={22} strokeWidth={1.5} />
                  <span className="text-xs uppercase tracking-[0.12em] font-medium">{btn.label}</span>
                </a>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-5 md:px-8 lg:px-16 pb-20 md:pb-28">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <ScrollReveal>
              <div className="space-y-8">
                <p className="text-muted-foreground font-light text-sm leading-relaxed">{c.formIntro[lang]}</p>
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
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
                    <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{c.nameLabel[lang]} *</label>
                    <Input value={form.name} onChange={update("name")} required className="rounded-xl border-border bg-transparent focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{c.emailLabel[lang]} *</label>
                    <Input type="email" value={form.email} onChange={update("email")} required className="rounded-xl border-border bg-transparent focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{c.subjectLabel[lang]}</label>
                  <Input value={form.subject} onChange={update("subject")} className="rounded-xl border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{c.messageLabel[lang]} *</label>
                  <Textarea value={form.message} onChange={update("message")} required rows={5} className="rounded-xl border-border bg-transparent focus:border-primary resize-none" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full rounded-xl text-xs uppercase tracking-[0.12em] py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {submitting ? c.sending[lang] : c.send[lang]} {!submitting && <ArrowRight size={14} className="ml-2" />}
                </Button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="pb-0">
        <ScrollReveal>
          <div className="container mx-auto max-w-5xl px-5 md:px-8 lg:px-16 mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">{c.mapOverline[lang]}</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-4">{c.mapTitle[lang]}</h2>
            <div className="gold-divider" />
          </div>
          <div className="w-full h-[350px] md:h-[450px] grayscale hover:grayscale-0 transition-all duration-700">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2709.5!2d39.7!3d47.23!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDEzJzQ4LjAiTiAzOcKwNDInMDAuMCJF!5e0!3m2!1sru!2sru!4v1700000000000!5m2!1sru!2sru"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Map"
            />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
};

export default Contact;
