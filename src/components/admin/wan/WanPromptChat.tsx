import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User, Copy, Wand2, Loader2, X, Lightbulb, Film, Image as ImageIcon, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "ideas" | "video" | "image";

const MODE_META: Record<Mode, { label: string; icon: any; hint: string; greeting: string; quick: string[] }> = {
  ideas: {
    label: "Идеи",
    icon: Lightbulb,
    hint: "Креативные концепции для съёмок и проектов",
    greeting:
      "💡 Режим **Идеи**. Опиши контекст (свадьба / съёмка / Instagram-серия / инсталляция), а я выдам 3–5 свежих editorial-концепций с локацией, декором и палитрой.",
    quick: [
      "5 идей для зимней свадьбы в стиле quiet luxury",
      "Идеи Instagram-серии о цветочных арках",
      "Концепции для премиум welcome-зоны",
    ],
  },
  video: {
    label: "Видео",
    icon: Film,
    hint: "Кинематографичные промпты для Veo / Wan",
    greeting:
      "🎬 Режим **Видео-промпты**. Опиши сцену на русском — я соберу готовый английский промпт для Veo 3 / Wan 2.5 (5–8 сек, движение камеры, свет, атмосфера).",
    quick: [
      "Свадебная арка из белых пионов в солнечном зале",
      "Камерный ужин при свечах, тёплое золото",
      "Цветочный потолок над банкетным столом",
    ],
  },
  image: {
    label: "Изображения",
    icon: ImageIcon,
    hint: "Фотореалистичные интерьерные промпты (5–8 вариаций)",
    greeting:
      "🖼 Режим **Изображения**. Назови интерьер/сцену — я задам 3 коротких вопроса (стиль / свет / назначение) и выдам 5–8 премиум вариаций промптов в стиле Architectural Digest.",
    quick: [
      "luxury bedroom",
      "minimalist kitchen",
      "modern living room",
      "contemporary office lounge",
    ],
  },
};

const extractPromptBlock = (text: string): string | null => {
  const m = text.match(/```(?:prompt)?\s*\n([\s\S]*?)```/i);
  return m ? m[1].trim() : null;
};

const extractAllPromptBlocks = (text: string): string[] => {
  const out: string[] = [];
  const re = /```(?:prompt)?\s*\n([\s\S]*?)```/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[1].trim());
  return out;
};

const WanPromptChat = ({
  onApplyPrompt,
  context,
}: {
  onApplyPrompt: (prompt: string) => void;
  context?: Record<string, unknown>;
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("video");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: MODE_META.video.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refineBase, setRefineBase] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setMessages([{ role: "assistant", content: MODE_META[next].greeting }]);
  };

  const send = async (text: string, opts?: { refineOf?: string }) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    const isRefine = !!opts?.refineOf || !!refineBase;
    const baseForRefine = opts?.refineOf || refineBase;

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content !== messages[messages.length - 1]?.content) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Нет сессии — войдите заново");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wan-prompt-assistant`;
      const outboundMessages = isRefine && baseForRefine
        ? [
            {
              role: "system" as const,
              content: `Исходный промпт, который нужно усилить, не меняя сцену:\n\`\`\`prompt\n${baseForRefine}\n\`\`\``,
            },
            ...[...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          ]
        : [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: outboundMessages,
          context,
          mode: isRefine ? "refine" : mode,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) throw new Error("Слишком много запросов, подождите минуту");
        if (resp.status === 402) throw new Error("Закончились AI-кредиты Lovable");
        const errText = await resp.text();
        throw new Error(errText.slice(0, 200) || "Ошибка чата");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) upsert(delta);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `❌ ${e.message || "Ошибка"}` }]);
    } finally {
      setLoading(false);
      // если ответ содержал новый промпт-блок — выходим из режима refine
      if (isRefine) {
        setTimeout(() => {
          setMessages((curr) => {
            const last = curr[curr.length - 1];
            if (last?.role === "assistant" && /```(?:prompt)?/i.test(last.content)) {
              setRefineBase(null);
            }
            return curr;
          });
        }, 0);
      }
    }
  };

  const startRefine = (basePrompt: string) => {
    setRefineBase(basePrompt);
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: "🔍 Уточняем сцену. Задам один короткий вопрос — ответь, и я усилю промпт, не меняя локацию.",
      },
    ]);
    // отправим триггер ассистенту чтобы он задал 1 вопрос
    void send("Задай мне один короткий уточняющий вопрос по этой сцене.", { refineOf: basePrompt });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 h-12 pl-3 pr-4 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-105 transition"
      >
        <span className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Bot size={16} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider">AI помощник</span>
      </button>
    );
  }

  const meta = MODE_META[mode];

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[min(420px,calc(100vw-2rem))] h-[min(620px,calc(100vh-3rem))] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles size={15} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">AI Помощник KiKi</p>
            <p className="text-[10px] text-muted-foreground">{meta.hint}</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center">
          <X size={14} />
        </button>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-1 p-2 border-b bg-muted/30">
        {(Object.keys(MODE_META) as Mode[]).map((k) => {
          const M = MODE_META[k];
          const Icon = M.icon;
          const active = k === mode;
          return (
            <button
              key={k}
              onClick={() => switchMode(k)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-[11px] font-semibold transition",
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-background text-muted-foreground hover:text-foreground border"
              )}
            >
              <Icon size={12} />
              {M.label}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => {
          const blocks = m.role === "assistant" ? extractAllPromptBlocks(m.content) : [];
          const visibleText = blocks.length
            ? m.content.replace(/```(?:prompt)?\s*\n[\s\S]*?```/gi, "").trim()
            : m.content;
          return (
            <div key={i} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
              <div className={cn(
                "w-7 h-7 rounded-full shrink-0 flex items-center justify-center",
                m.role === "user" ? "bg-muted" : "bg-primary/15 text-primary"
              )}>
                {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
              </div>
              <div className={cn("max-w-[85%] space-y-2", m.role === "user" && "items-end")}>
                {visibleText && (
                  <div className={cn(
                    "text-xs leading-relaxed rounded-2xl px-3 py-2 whitespace-pre-wrap",
                    m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                  )}>
                    {visibleText}
                  </div>
                )}
                {blocks.map((promptBlock, bi) => (
                  <div key={bi} className="border border-primary/40 rounded-xl bg-primary/5 p-2.5 space-y-2">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-primary flex items-center gap-1">
                      <Sparkles size={10} /> Промпт {blocks.length > 1 ? `#${bi + 1}` : ""}
                    </p>
                    <p className="text-[11px] font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {promptBlock}
                    </p>
                    <div className="flex gap-1">
                      {mode === "video" && (
                        <Button
                          size="sm"
                          className="h-7 text-[10px] flex-1"
                          onClick={() => { onApplyPrompt(promptBlock); toast.success("Промпт вставлен в форму"); }}
                        >
                          <Wand2 size={11} className="mr-1" />Использовать
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={mode === "video" ? "outline" : "default"}
                        className={cn("h-7 text-[10px]", mode !== "video" && "flex-1")}
                        onClick={() => { navigator.clipboard.writeText(promptBlock); toast.success("Скопировано"); }}
                      >
                        <Copy size={11} className="mr-1" />
                        {mode === "video" ? "" : "Копировать"}
                      </Button>
                    </div>
                    {mode === "video" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-[10px] w-full"
                        disabled={loading || refineBase === promptBlock}
                        onClick={() => startRefine(promptBlock)}
                      >
                        <MessageCircleQuestion size={11} className="mr-1" />
                        Уточнить сцену
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <Bot size={13} />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              <span className="text-xs text-muted-foreground">думаю…</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick ideas */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {meta.quick.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-[10px] px-2 py-1 rounded-full border bg-background hover:border-primary hover:text-primary transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-2 flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={
            mode === "ideas" ? "Опиши контекст для идей…" :
            mode === "image" ? "Назови интерьер (например: luxury bedroom)…" :
            "Опиши сцену или попроси улучшить промпт…"
          }
          rows={1}
          className="resize-none min-h-[40px] max-h-32 text-xs"
        />
        <Button onClick={() => send(input)} disabled={loading || !input.trim()} size="icon" className="h-10 w-10 shrink-0">
          <Send size={15} />
        </Button>
      </div>
    </div>
  );
};

export default WanPromptChat;