import { Mail, Phone, MapPin, Instagram, Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@elaraevents.com", href: "mailto:hello@elaraevents.com" },
  { icon: Phone, label: "Phone", value: "+1 (234) 567-890", href: "tel:+1234567890" },
  { icon: MapPin, label: "Studio", value: "Los Angeles, California" },
  { icon: Instagram, label: "Instagram", value: "@elaraevents", href: "#" },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 9am–6pm" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <>
      <title>Contact | Élara Events</title>
      <meta name="description" content="Get in touch with Élara Events. We'd love to hear from you about your next celebration." />

      <section className="section-padding">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Say Hello</p>
            <h1 className="font-display text-4xl md:text-6xl font-light text-center mb-6">Contact Us</h1>
            <div className="gold-divider" />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
            {/* Info */}
            <ScrollReveal>
              <div className="space-y-8">
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  Whether you have a question, want to discuss an upcoming event, or simply want to say hello — we'd love to hear from you.
                </p>
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <Icon size={18} className="text-primary mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm text-foreground hover:text-primary transition-colors">{value}</a>
                      ) : (
                        <p className="text-sm text-foreground">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal delay={200}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Name *</label>
                    <Input value={form.name} onChange={update("name")} required className="rounded-none border-border bg-transparent focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Email *</label>
                    <Input type="email" value={form.email} onChange={update("email")} required className="rounded-none border-border bg-transparent focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Subject</label>
                  <Input value={form.subject} onChange={update("subject")} className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Message *</label>
                  <Textarea value={form.message} onChange={update("message")} required rows={5} className="rounded-none border-border bg-transparent focus:border-primary resize-none" />
                </div>
                <Button type="submit" className="w-full rounded-none text-xs uppercase tracking-[0.15em] py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Send Message
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
