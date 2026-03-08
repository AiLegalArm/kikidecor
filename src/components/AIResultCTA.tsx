import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, PhoneCall, Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import { trackAIInteraction } from "@/hooks/useAITracking";

interface AIResultCTAProps {
  /** Which AI tool generated the result */
  toolName: string;
  /** Human-readable summary of AI result for the CRM lead */
  resultSummary: string;
  /** Product IDs involved in the result */
  productIds?: string[];
  /** Extra context (occasion, style, etc.) */
  context?: Record<string, any>;
}

const AIResultCTA = ({ toolName, resultSummary, productIds = [], context = {} }: AIResultCTAProps) => {
  const { lang } = useLanguage();
  const isRu = lang === "ru";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      toast.error(isRu ? "Укажите имя и телефон" : "Please enter name and phone");
      return;
    }

    setSubmitting(true);
    try {
      const message = [
        `🤖 ${toolName}`,
        resultSummary,
        form.comment ? `\n💬 ${form.comment}` : "",
      ].filter(Boolean).join("\n");

      // Save into CRM pipeline — must succeed
      const { error: dbError } = await supabase.from("event_leads").insert({
        name: form.name,
        phone: form.phone,
        email: "",
        event_type: "ai_consultation",
        booking_type: "ai",
        message,
        status: "new",
      });

      if (dbError) throw dbError;

      // Track as AI conversion (non-blocking)
      try {
        trackAIInteraction({
          type: "consultation_request",
          inputData: { toolName, ...context },
          outputData: { resultSummary: resultSummary.slice(0, 500) },
          selectedProductIds: productIds,
        });
      } catch { /* non-critical */ }

      // Notify admin via Telegram (non-blocking)
      try {
        await supabase.functions.invoke("notify-new-lead", {
          body: {
            name: form.name,
            phone: form.phone,
            email: "",
            eventType: `AI Консультация (${toolName})`,
            message,
            source: "ai_consultation",
          },
        });
      } catch { /* non-critical */ }

      setDone(true);
      toast.success(isRu ? "Заявка отправлена!" : "Request submitted!");
    } catch {
      toast.error(isRu ? "Ошибка. Попробуйте снова." : "Error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-primary/30 bg-primary/5 p-5 sm:p-6 text-center"
      >
        <Check className="w-6 h-6 text-primary mx-auto mb-2" />
        <p className="text-sm font-medium">
          {isRu ? "Спасибо! Мы свяжемся с вами в ближайшее время." : "Thank you! We'll contact you shortly."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="border border-border/50 bg-secondary/20 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium">
              {isRu ? "Понравился результат?" : "Like what you see?"}
            </p>
            <p className="text-xs text-muted-foreground font-light mt-0.5">
              {isRu
                ? "Оставьте заявку — стилист свяжется и поможет с подбором"
                : "Submit a request — our stylist will follow up and help you choose"}
            </p>
          </div>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-primary transition-colors duration-300"
          >
            <PhoneCall size={13} />
            {isRu ? "Запросить консультацию" : "Request Consultation"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={isRu ? "Имя *" : "Name *"}
                className="px-3 py-2.5 border border-border bg-background text-sm font-body focus:border-primary focus:outline-none transition-colors"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={isRu ? "Телефон *" : "Phone *"}
                className="px-3 py-2.5 border border-border bg-background text-sm font-body focus:border-primary focus:outline-none transition-colors"
              />
              <input
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder={isRu ? "Комментарий" : "Comment"}
                className="px-3 py-2.5 border border-border bg-background text-sm font-body focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-primary transition-colors duration-300 disabled:opacity-50"
            >
              <Send size={13} />
              {submitting
                ? (isRu ? "Отправка..." : "Sending...")
                : (isRu ? "Отправить заявку" : "Submit Request")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIResultCTA;
