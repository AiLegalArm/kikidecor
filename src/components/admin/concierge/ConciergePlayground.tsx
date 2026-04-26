import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Turn = { role: "user" | "agent"; content: string; meta?: any };

const ConciergePlayground = () => {
  const [channel, setChannel] = useState<"telegram" | "instagram" | "facebook" | "playground">("playground");
  const [language, setLanguage] = useState<"ru" | "en">("ru");
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    const userText = text.trim();
    setTurns(t => [...t, { role: "user", content: userText }]);
    setText("");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("agent-respond", {
        body: { mode: "playground", channel, language, text: userText },
      });
      if (error) throw error;
      const reply = data?.reply ?? data?.text ?? "(без ответа)";
      setTurns(t => [...t, { role: "agent", content: reply, meta: data }]);
    } catch (e: any) {
      toast.error(e.message || "Ошибка агента");
      setTurns(t => [...t, { role: "agent", content: "⚠️ Ошибка: " + (e.message || "unknown") }]);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-3 max-w-3xl">
      <div className="flex items-center gap-2 flex-wrap">
        <Sparkles className="w-4 h-4 text-primary"/>
        <span className="text-sm font-semibold">Песочница агента</span>
        <span className="text-xs text-muted-foreground">— тест ответов без записи в Inbox</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Select value={channel} onValueChange={(v: any) => setChannel(v)}>
          <SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="playground">Playground</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
          </SelectContent>
        </Select>
        <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
          <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="ru">Русский</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={() => setTurns([])}>Очистить</Button>
      </div>

      <div className="border border-border rounded-lg bg-card p-3 min-h-[300px] max-h-[50vh] overflow-y-auto space-y-2">
        {turns.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-12">
            Напишите сообщение, как клиент. Агент ответит в стиле выбранного канала.
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              t.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              {t.content}
              {t.meta?.scope && (
                <div className="text-[10px] mt-1 opacity-70">scope: {t.meta.scope} · handoff: {String(!!t.meta.handoff)}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          rows={2}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Сообщение от клиента…"
        />
        <Button onClick={send} disabled={busy || !text.trim()}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
        </Button>
      </div>
    </div>
  );
};

export default ConciergePlayground;