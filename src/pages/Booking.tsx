import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const eventTypes = ["Wedding", "Birthday", "Proposal", "Themed Party", "Corporate", "Other"];

const Booking = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", eventType: "", date: "", guests: "", budget: "", message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! We'll be in touch within 24 hours.");
    setFormData({ name: "", email: "", phone: "", eventType: "", date: "", guests: "", budget: "", message: "" });
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <>
      <title>Book a Consultation | Élara Events</title>
      <meta name="description" content="Book a consultation with Élara Events. Tell us about your dream event and let's create something beautiful together." />

      <section className="section-padding">
        <div className="container mx-auto max-w-2xl">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4 text-center">Get Started</p>
            <h1 className="font-display text-4xl md:text-6xl font-light text-center mb-6">Book a Consultation</h1>
            <div className="gold-divider" />
            <p className="text-center text-muted-foreground font-light text-sm max-w-lg mx-auto mt-6 mb-12">
              Tell us about your event and we'll reach out within 24 hours to schedule your complimentary consultation.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Full Name *</label>
                  <Input value={formData.name} onChange={update("name")} required className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Email *</label>
                  <Input type="email" value={formData.email} onChange={update("email")} required className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Phone</label>
                  <Input value={formData.phone} onChange={update("phone")} className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Event Type *</label>
                  <select
                    value={formData.eventType}
                    onChange={update("eventType")}
                    required
                    className="w-full h-10 px-3 border border-border bg-transparent text-sm font-body focus:outline-none focus:border-primary"
                  >
                    <option value="">Select...</option>
                    {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Event Date</label>
                  <Input type="date" value={formData.date} onChange={update("date")} className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Estimated Guests</label>
                  <Input value={formData.guests} onChange={update("guests")} placeholder="e.g. 50-100" className="rounded-none border-border bg-transparent focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Budget Range</label>
                <Input value={formData.budget} onChange={update("budget")} placeholder="e.g. $3,000 - $5,000" className="rounded-none border-border bg-transparent focus:border-primary" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Tell Us About Your Vision *</label>
                <Textarea value={formData.message} onChange={update("message")} required rows={5} placeholder="Describe your dream event..." className="rounded-none border-border bg-transparent focus:border-primary resize-none" />
              </div>
              <Button type="submit" className="w-full rounded-none text-xs uppercase tracking-[0.15em] py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                Send Inquiry
              </Button>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default Booking;
