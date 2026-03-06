import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Save, X } from "lucide-react";

type Product = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  colors: string[] | null;
  sizes: string[] | null;
  images: string[] | null;
  inventory: number;
  is_published: boolean | null;
};

const emptyProduct: Omit<Product, "id"> = {
  name: "", name_en: null, description: null, description_en: null,
  price: 0, compare_at_price: null, category: "clothing",
  colors: [], sizes: [], images: [], inventory: 0, is_published: true,
};

const AdminProducts = () => {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.name_en || "").toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditProduct({ id: "", ...emptyProduct } as Product);
    setIsNew(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct({ ...p });
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editProduct) return;
    setSaving(true);
    try {
      if (isNew) {
        const { id, ...rest } = editProduct;
        const { error } = await supabase.from("products").insert(rest);
        if (error) throw error;
        toast.success("Товар создан");
      } else {
        const { id, ...rest } = editProduct;
        const { error } = await supabase.from("products").update(rest).eq("id", id);
        if (error) throw error;
        toast.success("Товар обновлён");
      }
      setEditProduct(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить товар?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else { toast.success("Удалён"); refetch(); }
  };

  const updateField = (field: string, value: any) => {
    setEditProduct((prev) => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-light">Товары</h2>
        <Button onClick={openNew} className="rounded-none gap-2 text-xs uppercase tracking-wider">
          <Plus size={14} /> Добавить
        </Button>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск товаров..."
        className="rounded-none border-border mb-4 max-w-md"
      />

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>
      ) : (
        <div className="bg-background border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Фото</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Название</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Цена</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Категория</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Склад</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Статус</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-10 h-10 object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-muted flex items-center justify-center"><ImageIcon size={14} className="text-muted-foreground/40" /></div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2">{Number(p.price).toLocaleString()} ₽</td>
                  <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">{p.category || "—"}</td>
                  <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">{p.inventory}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] uppercase tracking-wider ${p.is_published ? "text-green-600" : "text-muted-foreground"}`}>
                      {p.is_published ? "Активен" : "Скрыт"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="max-w-2xl rounded-none max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              {isNew ? "Новый товар" : "Редактировать товар"}
            </DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Название (RU)</label>
                  <Input value={editProduct.name} onChange={(e) => updateField("name", e.target.value)} className="rounded-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Название (EN)</label>
                  <Input value={editProduct.name_en || ""} onChange={(e) => updateField("name_en", e.target.value)} className="rounded-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Описание (RU)</label>
                <Textarea value={editProduct.description || ""} onChange={(e) => updateField("description", e.target.value)} className="rounded-none resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Цена (₽)</label>
                  <Input type="number" value={editProduct.price} onChange={(e) => updateField("price", Number(e.target.value))} className="rounded-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Старая цена</label>
                  <Input type="number" value={editProduct.compare_at_price || ""} onChange={(e) => updateField("compare_at_price", e.target.value ? Number(e.target.value) : null)} className="rounded-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Склад</label>
                  <Input type="number" value={editProduct.inventory} onChange={(e) => updateField("inventory", Number(e.target.value))} className="rounded-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Категория</label>
                  <Select value={editProduct.category || "clothing"} onValueChange={(v) => updateField("category", v)}>
                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clothing">Одежда</SelectItem>
                      <SelectItem value="accessories">Аксессуары</SelectItem>
                      <SelectItem value="shoes">Обувь</SelectItem>
                      <SelectItem value="bags">Сумки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-3">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Опубликован</label>
                  <Switch checked={editProduct.is_published ?? true} onCheckedChange={(v) => updateField("is_published", v)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Изображения (URL через запятую)</label>
                <Textarea
                  value={(editProduct.images || []).join(", ")}
                  onChange={(e) => updateField("images", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  className="rounded-none resize-none" rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Размеры (через запятую)</label>
                  <Input value={(editProduct.sizes || []).join(", ")} onChange={(e) => updateField("sizes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="rounded-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Цвета (через запятую)</label>
                  <Input value={(editProduct.colors || []).join(", ")} onChange={(e) => updateField("colors", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="rounded-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" className="rounded-none" onClick={() => setEditProduct(null)}>Отмена</Button>
                <Button onClick={handleSave} disabled={saving} className="rounded-none gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
