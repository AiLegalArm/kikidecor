import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2, MessageCircle, X, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isUpdate?: boolean;
};

interface ConceptChatProps {
  concept: any;
  onConceptUpdate: (updatedConcept: any) => void;
}

const ConceptChat = ({ concept, onConceptUpdate }: ConceptChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || sending) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("refine-concept", {
        body: { concept, message: msg, chatHistory },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.message || data.error);

      if (data.type === "update") {
        onConceptUpdate(data.updatedConcept);
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: `✅ **Концепция обновлена**\n\n${data.explanation}`, isUpdate: true },
        ]);
        toast.success("Концепция обновлена!");
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "❌ Ошибка: " + (err instanceof Error ? err.message : "Попробуйте снова") },
      ]);
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    "Сделай палитру теплее",
    "Добавь больше зелени",
    "Упрости декор",
    "Замени цветы на более бюджетные",
    "Добавь фотозону",
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
          width: "56px", height: "56px", borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
          color: "#fff", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
      width: "min(400px, calc(100vw - 32px))", height: "min(560px, calc(100vh - 100px))",
      background: "#fff", borderRadius: "20px", border: "1px solid #E5E5E5",
      boxShadow: "0 12px 48px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid #F0F0F0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Sparkles size={18} color="#fff" />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "#fff" }}>AI Ассистент</p>
            <p style={{ margin: 0, fontSize: "0.6875rem", color: "rgba(255,255,255,0.7)" }}>Доработка концепции</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#fff" }}>
              <RotateCcw size={14} />
            </button>
          )}
          <button onClick={() => setIsOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#fff" }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 16px" }}>
            <Sparkles size={32} style={{ color: "#D1D5DB", margin: "0 auto 12px" }} />
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: "0.9375rem", color: "#333" }}>
              Доработайте концепцию
            </p>
            <p style={{ margin: "0 0 16px", fontSize: "0.8125rem", color: "#888", lineHeight: 1.5 }}>
              Напишите что хотите изменить — AI обновит концепцию автоматически
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
              {quickPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => { setInput(p); inputRef.current?.focus(); }}
                  style={{
                    padding: "6px 12px", borderRadius: "20px",
                    border: "1px solid #E5E5E5", background: "#FAFAFA",
                    color: "#555", fontSize: "0.75rem", fontWeight: 500,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor = "#7C3AED"; (e.currentTarget).style.color = "#7C3AED"; }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = "#E5E5E5"; (e.currentTarget).style.color = "#555"; }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px", borderRadius: "14px",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #7C3AED, #6D28D9)"
                : msg.isUpdate ? "#F0FDF4" : "#F5F5F5",
              color: msg.role === "user" ? "#fff" : "#111",
              fontSize: "0.8125rem", lineHeight: 1.55,
              border: msg.isUpdate ? "1px solid #BBF7D0" : "none",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {msg.content.split("**").map((part, j) =>
                j % 2 === 1
                  ? <strong key={j}>{part}</strong>
                  : <span key={j}>{part}</span>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: "14px", background: "#F5F5F5", display: "flex", alignItems: "center", gap: "8px" }}>
              <Loader2 size={14} className="animate-spin" style={{ color: "#7C3AED" }} />
              <span style={{ fontSize: "0.8125rem", color: "#888" }}>AI думает...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #F0F0F0", display: "flex", gap: "8px" }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Напишите что изменить..."
          disabled={sending}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: "10px",
            border: "1px solid #E5E5E5", fontSize: "0.875rem",
            outline: "none", background: "#FAFAFA", color: "#111",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          style={{
            width: "40px", height: "40px", borderRadius: "10px", border: "none",
            background: input.trim() && !sending ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#E5E5E5",
            color: input.trim() && !sending ? "#fff" : "#999",
            cursor: input.trim() && !sending ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.15s",
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ConceptChat;
