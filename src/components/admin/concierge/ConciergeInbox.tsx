import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Pause, Play, MessageSquare, Instagram, Facebook } from "lucide-react";
import { toast } from "sonner";

type Conversation = {
  id: string;
  channel: "telegram" | "instagram" | "facebook";
  customer_display_name: string | null;
  customer_handle: string | null;
  status: string;
  ai_paused: boolean;
  unread_count: number;
  last_message_at: string;
  last_message_preview: string | null;
  language: string | null;
};

type Message = {
  id: string;
  role: "customer" | "agent" | "human" | "system";
  content: string;
  created_at: string;
};

const channelIcon = (c: string) => {
  if (c === "telegram") return <Send className="w-3.5 h-3.5" />;
  if (c === "instagram") return <Instagram className="w-3.5 h-3.5" />;
  if (c === "facebook") return <Facebook className="w-3.5 h-3.5" />;
  return <MessageSquare className="w-3.5 h-3.5" />;
};

const ConciergeInbox = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messaging_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    else setConversations((data as Conversation[]) || []);
    setLoading(false);
  };

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from("messaging_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    else setMessages((data as Message[]) || []);
  };

  useEffect(() => { loadConversations(); }, []);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("concierge-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "messaging_conversations" }, () => loadConversations())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messaging_messages" }, (p: any) => {
        if (selectedId && p.new?.conversation_id === selectedId) loadMessages(selectedId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
  }, [selectedId]);

  const selected = conversations.find(c => c.id === selectedId);

  const togglePause = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("messaging_conversations")
      .update({ ai_paused: !selected.ai_paused, status: !selected.ai_paused ? "pending_human" : "open" })
      .eq("id", selected.id);
    if (error) toast.error(error.message);
    else {
      toast.success(!selected.ai_paused ? "AI приостановлен" : "AI возобновлён");
      loadConversations();
    }
  };

  const sendHumanReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    // Persist as 'human' message; channel-send will be wired in Sprint 3 (telegram-bot already covers admin).
    const { error } = await supabase.from("messaging_messages").insert({
      conversation_id: selected.id,
      role: "human",
      content: reply.trim(),
    });
    if (error) {
      toast.error(error.message);
    } else {
      // Try to push via concierge-send (no-op if not yet deployed)
      try {
        await supabase.functions.invoke("concierge-send", {
          body: { conversationId: selected.id, text: reply.trim() },
        });
      } catch { /* ignore — message saved locally */ }
      setReply("");
      loadMessages(selected.id);
      toast.success("Сообщение отправлено");
    }
    setSending(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[70vh]">
      {/* List */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-3 py-2 border-b border-border text-sm font-semibold flex items-center justify-between">
          <span>Диалоги</span>
          <Badge variant="outline">{conversations.length}</Badge>
        </div>
        <ScrollArea className="h-[calc(70vh-40px)]">
          {loading && <div className="p-4 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Загрузка…</div>}
          {!loading && conversations.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground text-center">Пока нет входящих диалогов.</div>
          )}
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-muted/50 transition ${selectedId === c.id ? "bg-muted" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {channelIcon(c.channel)}
                <span className="text-sm font-medium truncate flex-1">
                  {c.customer_display_name || c.customer_handle || "Гость"}
                </span>
                {c.unread_count > 0 && <Badge className="h-5 px-1.5 text-[10px]">{c.unread_count}</Badge>}
              </div>
              <div className="text-xs text-muted-foreground truncate">{c.last_message_preview || "—"}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {c.status === "pending_human" && <Badge variant="destructive" className="h-4 text-[10px] px-1">Оператор</Badge>}
                {c.ai_paused && <Badge variant="secondary" className="h-4 text-[10px] px-1">AI off</Badge>}
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Conversation */}
      <div className="border border-border rounded-lg overflow-hidden bg-card flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Выберите диалог
          </div>
        ) : (
          <>
            <div className="px-4 py-2 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold flex items-center gap-2">
                  {channelIcon(selected.channel)}
                  {selected.customer_display_name || selected.customer_handle || "Гость"}
                </div>
                <div className="text-xs text-muted-foreground capitalize">{selected.channel} · {selected.status}</div>
              </div>
              <Button size="sm" variant={selected.ai_paused ? "default" : "outline"} onClick={togglePause}>
                {selected.ai_paused ? <><Play className="w-3.5 h-3.5 mr-1"/>Вернуть AI</> : <><Pause className="w-3.5 h-3.5 mr-1"/>Взять диалог</>}
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === "customer" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "customer" ? "bg-muted" :
                      m.role === "agent" ? "bg-primary/10 border border-primary/20" :
                      m.role === "human" ? "bg-primary text-primary-foreground" :
                      "bg-amber-100 text-amber-900 text-xs italic"
                    }`}>
                      {m.role !== "customer" && (
                        <div className="text-[10px] uppercase opacity-70 mb-0.5">{m.role}</div>
                      )}
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-border space-y-2">
              <Textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder={selected.ai_paused ? "Ответ от оператора…" : "Возьмите диалог, чтобы ответить вручную"}
                rows={2}
                disabled={!selected.ai_paused}
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={sendHumanReply} disabled={!selected.ai_paused || !reply.trim() || sending}>
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Send className="w-3.5 h-3.5 mr-1"/>}
                  Отправить
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConciergeInbox;