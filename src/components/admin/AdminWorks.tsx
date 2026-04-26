import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2, X, Star, Film } from "lucide-react";

type Category = { id: string; name: string; slug: string };
type Work = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string;
  gallery: string[];
  video_url: string | null;
  category_id: string | null;
  status: "draft" | "published" | "archived";
  featured: boolean;
  tags: string[];
  materials: string[];
  price_range: string | null;
  event_date: string | null;
  sort_order: number;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Черновик" },
  { value: "published", label: "Опубликовано" },
  { value: "archived", label: "В архиве" },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

const emptyForm = (): Partial<Work> => ({
  title: "",
  slug: "",
  description: "",
  cover_image_url: "",
  gallery: [],
  video_url: null,
  category_id: null,
  status: "draft",
  featured: false,
  tags: [],
  materials: [],
  price_range: "",
  event_date: "",
  sort_order: 0,
});

export default function AdminWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Work> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const load = async () => {
    setLoading(true);
    const [worksRes, catRes] = await Promise.all([
      supabase.from("works").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, slug").order("sort_order", { ascending: true }),
    ]);
    if (worksRes.error) toast.error("Не удалось загрузить работы");
    else setWorks((worksRes.data || []).map((w) => ({ ...w, gallery: Array.isArray(w.gallery) ? (w.gallery as string[]) : [] })) as Work[]);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => setEditing(emptyForm());
  const openEdit = (w: Work) => setEditing({ ...w });

  const handleCoverUpload = async (file: File) => {
    if (!editing) return;
    setUploadingCover(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("work-covers").upload(path, file, { upsert: false });
    if (error) {
      toast.error("Ошибка загрузки: " + error.message);
      setUploadingCover(false);
      return;
    }
    const { data } = supabase.storage.from("work-covers").getPublicUrl(path);
    setEditing({ ...editing, cover_image_url: data.publicUrl });
    setUploadingCover(false);
    toast.success("Обложка загружена");
  };

  const handleGalleryUpload = async (files: FileList) => {
    if (!editing) return;
    setUploadingGallery(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("work-gallery").upload(path, file, { upsert: false });
      if (error) {
        toast.error("Ошибка: " + error.message);
        continue;
      }
      const { data } = supabase.storage.from("work-gallery").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setEditing({ ...editing, gallery: [...(editing.gallery || []), ...urls] });
    setUploadingGallery(false);
    toast.success(`Загружено ${urls.length} фото`);
  };

  const removeGalleryItem = (url: string) => {
    if (!editing) return;
    setEditing({ ...editing, gallery: (editing.gallery || []).filter((u) => u !== url) });
  };

  const handleVideoUpload = async (file: File) => {
    if (!editing) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Файл больше 100 МБ");
      return;
    }
    setUploadingVideo(true);
    const ext = file.name.split(".").pop() || "mp4";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("work-videos").upload(path, file, {
      contentType: file.type, upsert: false,
    });
    if (error) {
      toast.error("Ошибка загрузки видео: " + error.message);
      setUploadingVideo(false);
      return;
    }
    const { data } = supabase.storage.from("work-videos").getPublicUrl(path);
    setEditing({ ...editing, video_url: data.publicUrl });
    setUploadingVideo(false);
    toast.success("Видео загружено");
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) return toast.error("Введите название");
    if (!editing.cover_image_url) return toast.error("Загрузите обложку");

    setSaving(true);
    const slug = editing.slug?.trim() || slugify(editing.title);
    const payload = {
      title: editing.title.trim(),
      slug,
      description: editing.description || null,
      cover_image_url: editing.cover_image_url,
      gallery: editing.gallery || [],
      video_url: editing.video_url || null,
      category_id: editing.category_id || null,
      status: editing.status || "draft",
      featured: !!editing.featured,
      tags: editing.tags || [],
      materials: editing.materials || [],
      price_range: editing.price_range || null,
      event_date: editing.event_date || null,
      sort_order: editing.sort_order ?? 0,
    };

    let error;
    if (editing.id) {
      ({ error } = await supabase.from("works").update(payload).eq("id", editing.id));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      ({ error } = await supabase.from("works").insert({ ...payload, created_by: user?.id }));
    }
    setSaving(false);
    if (error) {
      toast.error("Ошибка сохранения: " + error.message);
      return;
    }
    toast.success(editing.id ? "Работа обновлена" : "Работа создана");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить работу безвозвратно?")) return;
    const { error } = await supabase.from("works").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Удалено");
    load();
  };

  const toggleStatus = async (w: Work) => {
    const next = w.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("works").update({ status: next }).eq("id", w.id);
    if (error) return toast.error(error.message);
    toast.success(next === "published" ? "Опубликовано" : "Снято с публикации");
    load();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Работы</h2>
          <p className="text-sm text-muted-foreground mt-1">Управление портфолио — обложки, галерея, категории, теги</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} /> Добавить работу
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : works.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <ImageIcon className="mx-auto mb-4 text-muted-foreground" size={48} />
          <p className="text-muted-foreground">Пока нет ни одной работы</p>
          <Button onClick={openCreate} className="mt-4 gap-2"><Plus size={16} /> Добавить первую</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {works.map((w) => (
            <div key={w.id} className="border border-border rounded-xl overflow-hidden bg-card group">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {w.cover_image_url ? (
                  <img src={w.cover_image_url} alt={w.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex items-center justify-center h-full"><ImageIcon className="text-muted-foreground" /></div>
                )}
                {w.featured && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-white border-0"><Star size={12} className="mr-1" />Избранное</Badge>
                )}
                <Badge variant={w.status === "published" ? "default" : "secondary"} className="absolute top-2 right-2">
                  {STATUS_OPTIONS.find((s) => s.value === w.status)?.label}
                </Badge>
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-sm text-foreground line-clamp-1">{w.title}</h3>
                <div className="flex flex-wrap gap-1">
                  {(w.tags || []).slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                </div>
                <div className="flex gap-1 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => openEdit(w)}><Pencil size={12} /></Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => toggleStatus(w)}>
                    {w.status === "published" ? "Скрыть" : "Опубл."}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => remove(w.id)}><Trash2 size={12} /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Редактировать работу" : "Новая работа"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Название *</Label>
                  <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
                </div>
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Категория</Label>
                  <Select value={editing.category_id || "none"} onValueChange={(v) => setEditing({ ...editing, category_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без категории</SelectItem>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Статус</Label>
                  <Select value={editing.status || "draft"} onValueChange={(v) => setEditing({ ...editing, status: v as Work["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Дата события</Label>
                  <Input type="date" value={editing.event_date || ""} onChange={(e) => setEditing({ ...editing, event_date: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Теги (через запятую)</Label>
                  <Input value={(editing.tags || []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
                </div>
                <div>
                  <Label>Материалы (через запятую)</Label>
                  <Input value={(editing.materials || []).join(", ")} onChange={(e) => setEditing({ ...editing, materials: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <Label>Бюджет (диапазон)</Label>
                  <Input placeholder="напр. 200 000–500 000 ₽" value={editing.price_range || ""} onChange={(e) => setEditing({ ...editing, price_range: e.target.value })} />
                </div>
                <div>
                  <Label>Порядок сортировки</Label>
                  <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch checked={!!editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} />
                  <Label>Избранное</Label>
                </div>
              </div>

              <div>
                <Label>Обложка *</Label>
                <div className="mt-2 flex items-start gap-3">
                  {editing.cover_image_url && (
                    <img src={editing.cover_image_url} alt="cover" className="w-32 h-32 object-cover rounded-lg border border-border" />
                  )}
                  <label className="flex-1">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30">
                      {uploadingCover ? <Loader2 className="mx-auto animate-spin" /> : <><ImageIcon className="mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Загрузить обложку</p></>}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <Label>Галерея</Label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {(editing.gallery || []).map((url) => (
                    <div key={url} className="relative group aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-border" />
                      <button onClick={() => removeGalleryItem(url)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X size={12} /></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/30">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)} />
                    {uploadingGallery ? <Loader2 className="animate-spin text-muted-foreground" size={20} /> : <Plus className="text-muted-foreground" size={20} />}
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Отмена</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin mr-2" size={14} />}Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}