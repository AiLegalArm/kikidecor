import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Send, Image as ImageIcon, Upload, Copy, Wand2, Download, BookOpen, Check, Search } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { CLIENT_PRESETS, type ClientPreset } from "@/data/decorPresets";

type Msg = { role: "user" | "assistant"; content: string };

const PRESET_HINTS = [
  "1 — Modern luxury",
  "2 — Quiet luxury",
  "5 — Japandi",
  "19 — Ivory & champagne",
  "82 — Christmas premium",
  "88 — Wedding white floral",
  "92 — Floral arch premium",
  "117 — Couture brand event",
  "184 — Candlelight romance",
];

export default function AdminDecorPromptGenerator() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Привет! Я **Decor Prompt Generator PRO**.\n\nНапиши, что нужно (например: «**свадебная арка во входной зоне, пресет 3, шампань**» или «**микс 1 и 19**»). Я соберу финальный промт для редактирования фото.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Last generated structured result
  const [finalPrompt, setFinalPrompt] = useState("");
  const [preset, setPreset] = useState("");
  const [area, setArea] = useState("");
  const [negative, setNegative] = useState("");

  // Image edit
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [editedUrl, setEditedUrl] = useState<string>("");
  const [applying, setApplying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Catalog browser
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogArea, setCatalogArea] = useState("входной зоне");
  const [selectedPreset, setSelectedPreset] = useState<ClientPreset | null>(null);

  const filteredPresets = CLIENT_PRESETS.filter((p) => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return true;
    if (String(p.id) === q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q)
    );
  });

  const presetFinalText = selectedPreset
    ? selectedPreset.prompt.replace(/\[ОБЛАСТЬ\]/g, catalogArea.trim() || "[ОБЛАСТЬ]")
    : "";

  const usePreset = (apply: boolean) => {
    if (!selectedPreset) return;
    setFinalPrompt(presetFinalText);
    setPreset(`${selectedPreset.id} — ${selectedPreset.name}`);
    setArea(catalogArea);
    setNegative("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `Каталог: пресет ${selectedPreset.id} (${selectedPreset.name}), область: ${catalogArea}` },
      { role: "assistant", content: `Готово — выбран пресет **${selectedPreset.id}. ${selectedPreset.name}**.\n\n\`\`\`\n${presetFinalText}\n\`\`\`` },
    ]);
    toast.success(`Пресет ${selectedPreset.id} применён`);
    setCatalogOpen(false);
    if (apply && imageDataUrl) {
      // run apply on next tick so finalPrompt state is set
      setTimeout(() => apply && void applyWithPrompt(presetFinalText), 0);
    }
  };

  const applyWithPrompt = async (prompt: string) => {
    if (!imageDataUrl) return;
    setApplying(true);
    setEditedUrl("");
    try {
      const { data, error } = await supabase.functions.invoke("decor-prompt-chat", {
        body: { mode: "apply", prompt, imageUrl: imageDataUrl },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setEditedUrl((data as any).imageUrl);
      toast.success("Готово");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Ошибка применения к фото");
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    const userMsg: Msg = { role: "user", content: userText };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("decor-prompt-chat", {
        body: { mode: "chat", messages: next.map((m) => ({ role: m.role, content: m.content })) },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const content: string = (data as any).content || "";
      setMessages((prev) => [...prev, { role: "assistant", content }]);
      setFinalPrompt((data as any).finalPrompt || content);
      setPreset((data as any).preset || "");
      setArea((data as any).area || "");
      setNegative((data as any).negative || "");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Ошибка генерации промта");
    } finally {
      setLoading(false);
    }
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Фото должно быть меньше 8 МБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const apply = async () => {
    if (!finalPrompt) {
      toast.error("Сначала сгенерируй промт");
      return;
    }
    if (!imageDataUrl) {
      toast.error("Загрузи фото");
      return;
    }
    setApplying(true);
    setEditedUrl("");
    try {
      const { data, error } = await supabase.functions.invoke("decor-prompt-chat", {
        body: { mode: "apply", prompt: finalPrompt, imageUrl: imageDataUrl },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setEditedUrl((data as any).imageUrl);
      toast.success("Готово");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Ошибка применения к фото");
    } finally {
      setApplying(false);
    }
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(finalPrompt);
    toast.success("Промт скопирован");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          <h2 className="text-2xl font-serif font-bold">Decor Prompt Generator PRO</h2>
        </div>
        <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <BookOpen size={14} className="mr-1" />
              Каталог промтов ({CLIENT_PRESETS.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <BookOpen size={18} /> Каталог декор-пресетов
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 border-b grid gap-2 md:grid-cols-2">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск: номер, название или ключевое слово…"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="pl-7"
                />
              </div>
              <Input
                placeholder="Область (например: входной зоне, банкетном столе, потолке)"
                value={catalogArea}
                onChange={(e) => setCatalogArea(e.target.value)}
              />
            </div>
            <div className="flex-1 grid md:grid-cols-2 overflow-hidden">
              <ScrollArea className="border-r h-full">
                <div className="p-2 space-y-1">
                  {filteredPresets.map((p) => {
                    const active = selectedPreset?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPreset(p)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition flex items-start gap-2 ${
                          active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <span className={`text-[11px] font-mono shrink-0 mt-0.5 ${active ? "opacity-80" : "text-muted-foreground"}`}>
                          #{String(p.id).padStart(3, "0")}
                        </span>
                        <span className="font-medium">{p.name}</span>
                        {active && <Check size={14} className="ml-auto shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                  {filteredPresets.length === 0 && (
                    <div className="text-sm text-muted-foreground p-4 text-center">Ничего не найдено</div>
                  )}
                </div>
              </ScrollArea>
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {selectedPreset ? (
                    <>
                      <div>
                        <div className="text-xs text-muted-foreground">Пресет #{selectedPreset.id}</div>
                        <div className="text-lg font-semibold">{selectedPreset.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">Превью с подставленной областью:</div>
                      <Textarea
                        readOnly
                        value={presetFinalText}
                        className="min-h-[200px] text-sm font-mono"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await navigator.clipboard.writeText(presetFinalText);
                            toast.success("Промт скопирован");
                          }}
                        >
                          <Copy size={14} className="mr-1" /> Копировать
                        </Button>
                        <Button size="sm" onClick={() => usePreset(false)}>
                          <Check size={14} className="mr-1" /> Использовать
                        </Button>
                        {imageDataUrl && (
                          <Button size="sm" variant="secondary" onClick={() => usePreset(true)}>
                            <Wand2 size={14} className="mr-1" /> Применить к фото
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center p-6">
                      Выбери пресет слева, чтобы увидеть полный промт.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter className="p-3 border-t">
              <div className="text-xs text-muted-foreground mr-auto">
                Всего пресетов: {CLIENT_PRESETS.length} · Найдено: {filteredPresets.length}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCatalogOpen(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground">
        Чат-ассистент строит финальный промт по {CLIENT_PRESETS.length} пресетам декора. Открой «Каталог промтов», чтобы посмотреть и выбрать вручную, или опиши задачу в чате.
      </p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* CHAT */}
        <Card className="p-4 flex flex-col h-[640px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-1 whitespace-pre-wrap">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="animate-spin" size={14} /> Думаю…
              </div>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              {PRESET_HINTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(`Сделай ${p.split(" — ")[0]}`)}
                  className="text-[11px] px-2 py-1 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground transition"
                  disabled={loading}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Например: микс 3 и 19, входная зона, шампань, дорого"
                className="min-h-[60px] resize-none"
                disabled={loading}
              />
              <Button onClick={() => send()} disabled={loading || !input.trim()} size="icon" className="self-end">
                <Send size={16} />
              </Button>
            </div>
          </div>
        </Card>

        {/* PROMPT + APPLY */}
        <Card className="p-4 flex flex-col gap-3 h-[640px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Финальный промт</h3>
            {finalPrompt && (
              <Button variant="outline" size="sm" onClick={copyPrompt}>
                <Copy size={14} className="mr-1" /> Копировать
              </Button>
            )}
          </div>

          {finalPrompt ? (
            <>
              <Textarea
                value={finalPrompt}
                onChange={(e) => setFinalPrompt(e.target.value)}
                className="min-h-[140px] text-sm font-mono"
              />
              <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                {preset && <div><span className="font-semibold text-foreground">Пресет:</span> {preset}</div>}
                {area && <div><span className="font-semibold text-foreground">Область:</span> {area}</div>}
                {negative && <div className="line-clamp-3"><span className="font-semibold text-foreground">Negative:</span> {negative}</div>}
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-primary" />
                  <h4 className="font-semibold text-sm">Применить к фото</h4>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] || null)}
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="flex-1">
                    <Upload size={14} className="mr-1" />
                    {imageDataUrl ? "Сменить фото" : "Загрузить фото"}
                  </Button>
                  <Button onClick={apply} disabled={applying || !imageDataUrl} size="sm" className="flex-1">
                    {applying ? <Loader2 size={14} className="animate-spin mr-1" /> : <Wand2 size={14} className="mr-1" />}
                    {applying ? "Генерирую…" : "Применить"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {imageDataUrl && (
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground">До</p>
                      <img src={imageDataUrl} alt="before" className="w-full rounded border" />
                    </div>
                  )}
                  {editedUrl && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">После</p>
                        <a href={editedUrl} download="decor.png" className="text-[11px] text-primary inline-flex items-center gap-1">
                          <Download size={11} /> Скачать
                        </a>
                      </div>
                      <img src={editedUrl} alt="after" className="w-full rounded border" />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground italic flex-1 flex items-center justify-center text-center">
              Опиши задачу в чате слева — финальный промт и кнопка «Применить к фото» появятся здесь.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}