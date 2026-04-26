import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Save, Trash2, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

type Doc = {
  id: string;
  title: string;
  source: string;
  language: "ru" | "en";
  status: "draft" | "published" | "archived";
  content: string;
  tags: string[];
  embedded_at: string | null;
  updated_at: string;
};

const SOURCES = ["faq", "service", "policy", "product", "pricing", "contact", "process", "other"] as const;

const empty = (): Doc => ({
  id: "",
  title: "",
  source: "faq",
  language: "ru",
  status: "draft",
  content: "",
  tags: [],
  embedded_at: null,
  updated_at: "",
});

const ConciergeKnowledge = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kb_documents")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    else setDocs((data as Doc[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.content.trim()) {
      toast.error("Заполните заголовок и содержимое");
      return;
    }
    setSaving(true);
    const payload = {
      title: editing.title,
      source: editing.source,
      language: editing.language,
      status: editing.status,
      content: editing.content,
      tags: editing.tags,
    };
    const op = editing.id
      ? supabase.from("kb_documents").update(payload).eq("id", editing.id)
      : supabase.from("kb_documents").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Сохранено");
      setEditing(null);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить документ?")) return;
    const { error } = await supabase.from("kb_documents").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Удалено"); load(); }
  };

  const rebuild = async () => {
    setRebuilding(true);
    try {
      const { data, error } = await supabase.functions.invoke("kb-rebuild");
      if (error) throw error;
      toast.success(`Переиндексировано: ${data?.documents ?? 0} док., ${data?.chunks ?? 0} чанков`);
      load();
    } catch (e: any) {
      toast.error(e.message || "Ошибка переиндексации");
    }
    setRebuilding(false);
  };

  if (editing) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{editing.id ? "Редактировать документ" : "Новый документ"}</h3>
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Отмена</Button>
        </div>
        <Input
          placeholder="Заголовок"
          value={editing.title}
          onChange={e => setEditing({ ...editing, title: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-2">
          <Select value={editing.source} onValueChange={v => setEditing({ ...editing, source: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={editing.language} onValueChange={(v: any) => setEditing({ ...editing, language: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="ru">RU</SelectItem><SelectItem value="en">EN</SelectItem></SelectContent>
          </Select>
          <Select value={editing.status} onValueChange={(v: any) => setEditing({ ...editing, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Черновик</SelectItem>
              <SelectItem value="published">Опубликован</SelectItem>
              <SelectItem value="archived">Архив</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Теги через запятую"
          value={editing.tags.join(", ")}
          onChange={e => setEditing({ ...editing, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
        />
        <Textarea
          placeholder="Контент (markdown поддерживается)"
          rows={14}
          value={editing.content}
          onChange={e => setEditing({ ...editing, content: e.target.value })}
        />
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1"/> : <Save className="w-4 h-4 mr-1"/>}
            Сохранить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold">База знаний</h3>
          <p className="text-xs text-muted-foreground">Только опубликованные документы видны агенту.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={rebuild} disabled={rebuilding}>
            {rebuilding ? <Loader2 className="w-4 h-4 animate-spin mr-1"/> : <RefreshCw className="w-4 h-4 mr-1"/>}
            Переиндексировать
          </Button>
          <Button size="sm" onClick={() => setEditing(empty())}>
            <Plus className="w-4 h-4 mr-1"/>Документ
          </Button>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Загрузка…</div>}
      {!loading && docs.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50"/>
          Пока нет документов. Создайте FAQ, прайс или политику, чтобы агент мог отвечать.
        </div>
      )}
      <div className="grid gap-2">
        {docs.map(d => (
          <div key={d.id} className="border border-border rounded-lg p-3 bg-card flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold truncate">{d.title}</span>
                <Badge variant="outline" className="text-[10px] uppercase">{d.source}</Badge>
                <Badge variant="outline" className="text-[10px] uppercase">{d.language}</Badge>
                <Badge variant={d.status === "published" ? "default" : "secondary"} className="text-[10px] uppercase">{d.status}</Badge>
                {!d.embedded_at && <Badge variant="destructive" className="text-[10px]">не индексирован</Badge>}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">{d.content.slice(0, 200)}</div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(d)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="w-4 h-4"/></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConciergeKnowledge;