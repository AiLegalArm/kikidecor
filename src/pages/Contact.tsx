import { Mail, Phone, MapPin, Instagram, Clock, MessageCircle, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

const Contact = () => {
  const { lang, t } = useLanguage();
  const c = t.contact;

  useSEO({
    title: lang === "ru" ? "Контакты — Ki Ki Decor" : "Contacts — Ki Ki Decor",
    description: lang === "ru"
      ? "Свяжитесь с Ki Ki Decor: телефон, WhatsApp, Telegram, Instagram. Ростов-на-Дону и Геленджик."
      : "Reach Ki Ki Decor: phone, WhatsApp, Telegram, Instagram. Rostov & Gelendzhik.",
    canonical: "https://kiki-shop.online/contact",
  });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const contactInfo = [
  { icon: Phone, label: c.phone[lang], value: "+7 988 259-85-22", href: "tel:+79882598522" },
  { icon: MessageCircle, label: "WhatsApp", value: "+7 988 259-85-22", href: "https://wa.me/79882598522" },
  { icon: Instagram, label: "Instagram", value: "@ki_ki_decor", href: "https://instagram.com/ki_ki_decor" },
  { icon: Mail, label: "Email", value: "info@kikidecor.ru", href: "mailto:info@kikidecor.ru" },
  { icon: MapPin, label: c.geography[lang], value: c.geographyValue[lang] },
  { icon: Clock, label: c.workHoursLabel[lang], value: c.workHoursValue[lang] }];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("event_leads").insert({
      name: form.name, email: form.email, phone: "не указан",
      event_type: lang === "ru" ? "Обратная связь" : "Feedback",
      message: `${form.subject ? `[${form.subject}] ` : ""}${form.message}`,
      status: "new"
    });

    try {
      await supabase.functions.invoke("notify-new-lead", {
        body: { name: form.name, email: form.email, subject: form.subject, message: form.message, source: "contact" }
      });
    } catch (err) {console.warn("Email notification failed:", err);}

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
  setForm((p) => ({ ...p, [f]: e.target.value }));

  return (
    <>
      <title>{c.title[lang]} — KiKi</title>

      {/* Header */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 px-6 md:px-10">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-4">{c.overline[lang]}</p>
            <h1 className="font-display text-5xl md:text-7xl font-light mb-5 leading-[1.05]">{c.title[lang]}</h1>
            <div className="gold-divider" />
            <p className="text-muted-foreground text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed font-semibold">{c.subtitle[lang]}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-6 md:px-10 pb-16">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
              { label: c.callBtn[lang], icon: Phone, href: "tel:+79882598522", cls: "bg-foreground text-background hover:bg-foreground/90" },
              { label: c.whatsappBtn[lang], icon: MessageCircle, href: "https://wa.me/79882598522", cls: "bg-[hsl(142,70%,40%)] text-white hover:opacity-90" },
              { label: c.instagramBtn[lang], icon: Instagram, href: "https://instagram.com/ki_ki_decor", cls: "bg-gradient-to-br from-[hsl(330,70%,55%)] to-[hsl(25,90%,55%)] text-white hover:opacity-90" },
              { label: c.emailBtn[lang], icon: Mail, href: "mailto:info@kikidecor.ru", cls: "bg-primary text-primary-foreground hover:bg-primary/90" }].
              map((btn) =>
              <a key={btn.label} href={btn.href} target={btn.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
              className={`flex flex-col items-center gap-2 py-5 px-4 transition-all duration-300 hover:scale-[1.02] ${btn.cls}`}>
                  <btn.icon size={20} strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-[0.15em] font-medium font-body">{btn.label}</span>
                </a>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact info + Form */}
      <section className="px-6 md:px-10 pb-24 md:pb-32">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
            <ScrollReveal>
              <div className="space-y-8">
                <p className="text-foreground/60 text-sm leading-[2] font-semibold">{c.formIntro[lang]}</p>
                {contactInfo.map(({ icon: Icon, label, value, href }) =>
                <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-border flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 font-body font-semibold">{label}</p>
                      {href ?
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-foreground hover:text-primary transition-colors font-semibold">{value}</a> :

                    <p className="text-sm text-foreground font-semibold">{value}</p>
                    }
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block font-body">{c.nameLabel[lang]} *</label>
                    <Input value={form.name} onChange={update("name")} required className="border-border/50 bg-transparent focus:border-primary h-12 rounded-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block font-body">{c.emailLabel[lang]} *</label>
                    <Input type="email" value={form.email} onChange={update("email")} required className="border-border/50 bg-transparent focus:border-primary h-12 rounded-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block font-body">{c.subjectLabel[lang]}</label>
                  <Input value={form.subject} onChange={update("subject")} className="border-border/50 bg-transparent focus:border-primary h-12 rounded-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block font-body">{c.messageLabel[lang]} *</label>
                  <Textarea value={form.message} onChange={update("message")} required rows={5} className="border-border/50 bg-transparent focus:border-primary resize-none rounded-none" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full rounded-none text-[10px] uppercase tracking-[0.2em] py-6 bg-foreground hover:bg-primary text-background transition-all duration-500">
                  {submitting ? c.sending[lang] : c.send[lang]} {!submitting && <ArrowRight size={13} className="ml-2" />}
                </Button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Map */}
      <section>
        <ScrollReveal>
          <div className="container mx-auto max-w-5xl px-6 md:px-10 mb-8">
            <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-4 text-center">{c.mapOverline[lang]}</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-4">{c.mapTitle[lang]}</h2>
            <div className="gold-divider" />
          </div>
          <div className="w-full h-[350px] md:h-[450px] grayscale hover:grayscale-0 transition-all duration-700">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2709.5!2d39.7!3d47.23!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDEzJzQ4LjAiTiAzOcKwNDInMDAuMCJF!5e0!3m2!1sru!2sru!4v1700000000000!5m2!1sru!2sru"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Map" />
            
          </div>
        </ScrollReveal>
      </section>
    </>);

};

export default Contact;