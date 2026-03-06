import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(100),
  phone: z.string().trim().min(5, "Введите телефон").max(30),
  email: z.string().trim().email("Введите корректный email").max(255),
  interest: z.enum(["decor", "showroom"], { required_error: "Выберите направление" }),
});

type LeadForm = z.infer<typeof leadSchema>;

const LeadCapture = () => {
  const [form, setForm] = useState<LeadForm>({ name: "", phone: "", email: "", interest: "decor" });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof LeadForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LeadForm, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LeadForm;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("brand_leads").insert({
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email,
        interest: result.data.interest,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      setErrors({ name: "Произошла ошибка. Попробуйте ещё раз." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="section-padding bg-secondary/30">
        <div className="container mx-auto max-w-lg text-center">
          <ScrollReveal>
            <CheckCircle size={40} className="text-primary mx-auto mb-6" strokeWidth={1.2} />
            <h3 className="font-display text-3xl font-light mb-4">Thank You</h3>
            <p className="text-muted-foreground font-light leading-relaxed">
              We've received your request and will contact you shortly to schedule your free consultation.
            </p>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Copy */}
          <ScrollReveal>
            <p className="overline text-primary mb-5">Free Consultation</p>
            <h2 className="font-display text-3xl md:text-5xl font-light mb-6 leading-[1.1]">
              Let's create something <span className="italic">extraordinary</span>
            </h2>
            <p className="text-muted-foreground font-light leading-[1.9] mb-6">
              Whether you're dreaming of the perfect event or looking for personal styling,
              our team is here to bring your vision to life. Book a free consultation — no commitment required.
            </p>
            <div className="w-16 h-px bg-primary/30" />
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal delay={200}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent border-b border-border/60 py-3 text-sm font-light focus:border-primary focus:outline-none transition-colors duration-300 placeholder:text-muted-foreground/40"
                  maxLength={100}
                />
                {errors.name && <p className="text-destructive text-xs mt-1.5 font-light">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full bg-transparent border-b border-border/60 py-3 text-sm font-light focus:border-primary focus:outline-none transition-colors duration-300 placeholder:text-muted-foreground/40"
                  maxLength={30}
                />
                {errors.phone && <p className="text-destructive text-xs mt-1.5 font-light">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-b border-border/60 py-3 text-sm font-light focus:border-primary focus:outline-none transition-colors duration-300 placeholder:text-muted-foreground/40"
                  maxLength={255}
                />
                {errors.email && <p className="text-destructive text-xs mt-1.5 font-light">{errors.email}</p>}
              </div>

              {/* Interest */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3 block">
                  I'm interested in
                </label>
                <div className="flex gap-3">
                  {[
                    { value: "decor" as const, label: "Decor Studio" },
                    { value: "showroom" as const, label: "Showroom" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange("interest", option.value)}
                      className={`flex-1 py-3 text-[10px] uppercase tracking-[0.2em] border transition-all duration-500 ${
                        form.interest === option.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.interest && <p className="text-destructive text-xs mt-1.5 font-light">{errors.interest}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-glow w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-primary transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none mt-4"
              >
                {submitting ? (
                  "Sending..."
                ) : (
                  <>
                    Book Free Consultation
                    <Send size={12} />
                  </>
                )}
              </button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default LeadCapture;
