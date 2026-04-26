import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, Star } from "lucide-react";

type Pkg = {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  price_from: number;
  price_to: number | null;
  currency: string;
  features: string[];
  features_en: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  cta_label: string | null;
  cta_label_en: string | null;
};

const empty: Omit<Pkg, "id"> = {
  slug: "",
  name: "",
  name_en: "",
  subtitle: "",
  subtitle_en: "",
  price_from: 0,
  price_to: null,
  currency: "RUB",
  features: [],
  features_en: [],
  is_featured: false,
  is_active: true,
  sort_order: 0,
  cta_label: "",
  cta_label_en: "",
};

const AdminPackages = () => {
  const [items, setItems] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data as unknown as Pkg[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<Pkg>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const save = async (pkg: Pkg) => {
    setSavingId(pkg.id);
    const { id, ...rest } = pkg;
    const { error } = await supabase.from("packages").update(rest).eq("id", id);
    setSavingId(null);
    if (error) toast.error(error.message);
    else toast.success(`Пакет «${pkg.name}» сохранён`);
  };

  const remove = async (pkg: Pkg) => {
    if (!confirm(`Удалить пакет «${pkg.name}»?`)) return;
    const { error } = await supabase.from("packages").delete().eq("id", pkg.id);
    if (error) toast.error(error.message);
    else { toast.success("Удалено"); load(); }
  };

  const create = async () => {
    const slug = `package-${Date.now()}`;
    const { error } = await supabase.from("packages").insert({
      ...empty,
      slug,
      name: "Новый пакет",
      sort_order: items.length + 1,
    });
    if (error) toast.error(error.message);
    else { toast.success("Создан"); load(); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display">Пакеты услуг</h2>
          <p className="text-sm text-muted-foreground">Цены, состав и порядок отображения на странице /packages.</p>
        </div>
        <Button onClick={create}><Plus size={16} className="mr-2" /> Добавить пакет</Button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground border border-dashed rounded-lg">
          Пакетов пока нет. Создайте первый.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {items.map((pkg) => (
          <div key={pkg.id} className="border rounded-lg p-5 bg-card space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {pkg.is_featured && <Star size={14} className="text-primary fill-primary" />}
                  <h3 className="font-semibold text-lg">{pkg.name || "—"}</h3>
                  {!pkg.is_active && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-muted rounded">скрыт</span>}
                </div>
                <p className="text-xs text-muted-foreground font-mono">{pkg.slug}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(pkg)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Название (RU)</Label>
                <Input value={pkg.name} onChange={(e) => update(pkg.id, { name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Название (EN)</Label>
                <Input value={pkg.name_en || ""} onChange={(e) => update(pkg.id, { name_en: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Подзаголовок (RU)</Label>
                <Input value={pkg.subtitle || ""} onChange={(e) => update(pkg.id, { subtitle: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Подзаголовок (EN)</Label>
                <Input value={pkg.subtitle_en || ""} onChange={(e) => update(pkg.id, { subtitle_en: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Цена от</Label>
                <Input type="number" value={pkg.price_from} onChange={(e) => update(pkg.id, { price_from: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="text-xs">Валюта</Label>
                <Input value={pkg.currency} onChange={(e) => update(pkg.id, { currency: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label className="text-xs">Порядок</Label>
                <Input type="number" value={pkg.sort_order} onChange={(e) => update(pkg.id, { sort_order: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="text-xs">Slug</Label>
                <Input value={pkg.slug} onChange={(e) => update(pkg.id, { slug: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Состав (RU) — по строке</Label>
                <Textarea
                  rows={5}
                  value={pkg.features.join("\n")}
                  onChange={(e) => update(pkg.id, { features: e.target.value.split("\n").filter(Boolean) })}
                />
              </div>
              <div>
                <Label className="text-xs">Состав (EN) — по строке</Label>
                <Textarea
                  rows={5}
                  value={pkg.features_en.join("\n")}
                  onChange={(e) => update(pkg.id, { features_en: e.target.value.split("\n").filter(Boolean) })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <Switch checked={pkg.is_active} onCheckedChange={(v) => update(pkg.id, { is_active: v })} />
                  <Label className="text-sm">Активен</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={pkg.is_featured} onCheckedChange={(v) => update(pkg.id, { is_featured: v })} />
                  <Label className="text-sm">Featured</Label>
                </div>
              </div>
              <Button onClick={() => save(pkg)} disabled={savingId === pkg.id}>
                {savingId === pkg.id ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                Сохранить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPackages;