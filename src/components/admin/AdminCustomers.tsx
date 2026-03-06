import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Loader2, Save, User, Phone, Mail,
  MessageSquare, Calendar, ShoppingBag, Tag, X, Send,
} from "lucide-react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferences: Record<string, any>;
  tags: string[] | null;
  notes: string | null;
  source: string | null;
  created_at: string;
};

type CommLog = {
  id: string;
  customer_id: string;
  type: string;
  summary: string;
  created_at: string;
};

type LinkedBooking = {
  id: string;
  event_type: string;
  event_date: string | null;
  status: string;
  created_at: string;
};

type LinkedOrder = {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: { name: string; price: number; images: string[] | null };
};

const COMM_TYPES = [
  { value: "call", label: "Звонок", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "meeting", label: "Встреча", icon: Calendar },
  { value: "note", label: "Заметка", icon: Tag },
];

const emptyCustomer: Omit<Customer, "id" | "created_at"> = {
  name: "", email: "", phone: "", preferences: {}, tags: [], notes: null, source: "manual",
};

const AdminCustomers = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Comms
  const [commType, setCommType] = useState("note");
  const [commSummary, setCommSummary] = useState("");

  // Preferences
  const [prefKey, setPrefKey] = useState("");
  const [prefVal, setPrefVal] = useState("");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });

  const { data: commLogs = [] } = useQuery({
    queryKey: ["admin-comms", selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communication_log")
        .select("*")
        .eq("customer_id", selected!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CommLog[];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-customer-bookings", selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_leads")
        .select("id, event_type, event_date, status, created_at")
        .eq("customer_id", selected!.id)
        .order("created_at", { ascending: false });
      if (error) return [];
      return data as LinkedBooking[];
    },
  });

  // Find orders by matching email/phone in cart_items via session
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-customer-orders", selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      // Simple approach: match cart items — in production would use proper order table
      return [] as LinkedOrder[];
    },
  });

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const openNew = () => {
    setEditCustomer({ id: "", created_at: "", ...emptyCustomer } as Customer);
    setIsNew(true);
  };

  const openEdit = (c: Customer) => {
    setEditCustomer({ ...c });
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editCustomer) return;
    setSaving(true);
    try {
      const payload = {
        name: editCustomer.name,
        email: editCustomer.email,
        phone: editCustomer.phone,
        preferences: editCustomer.preferences,
        tags: editCustomer.tags,
        notes: editCustomer.notes,
        source: editCustomer.source,
      };
      if (isNew) {
        const { error } = await supabase.from("customer_profiles").insert(payload);
        if (error) throw error;
        toast.success("Клиент создан");
      } else {
        const { error } = await supabase.from("customer_profiles").update(payload).eq("id", editCustomer.id);
        if (error) throw error;
        toast.success("Клиент обновлён");
      }
      setEditCustomer(null);
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
    } catch (e: any) {
      toast.error(e.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить клиента?")) return;
    const { error } = await supabase.from("customer_profiles").delete().eq("id", id);
    if (error) toast.error("Ошибка");
    else { toast.success("Удалён"); qc.invalidateQueries({ queryKey: ["admin-customers"] }); }
  };

  const addComm = async () => {
    if (!selected || !commSummary.trim()) return;
    const { error } = await supabase.from("communication_log").insert({
      customer_id: selected.id,
      type: commType,
      summary: commSummary.trim(),
    });
    if (error) { toast.error("Ошибка"); return; }
    toast.success("Запись добавлена");
    setCommSummary("");
    qc.invalidateQueries({ queryKey: ["admin-comms", selected.id] });
  };

  const addTag = () => {
    if (!editCustomer || !newTag.trim()) return;
    const tags = [...(editCustomer.tags || []), newTag.trim()];
    setEditCustomer({ ...editCustomer, tags });
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    if (!editCustomer) return;
    setEditCustomer({ ...editCustomer, tags: (editCustomer.tags || []).filter((t) => t !== tag) });
  };

  const addPref = () => {
    if (!editCustomer || !prefKey.trim()) return;
    setEditCustomer({
      ...editCustomer,
      preferences: { ...editCustomer.preferences, [prefKey.trim()]: prefVal.trim() },
    });
    setPrefKey("");
    setPrefVal("");
  };

  const removePref = (key: string) => {
    if (!editCustomer) return;
    const prefs = { ...editCustomer.preferences };
    delete prefs[key];
    setEditCustomer({ ...editCustomer, preferences: prefs });
  };

  const updateField = (field: string, value: any) => {
    setEditCustomer((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800", contacted: "bg-yellow-100 text-yellow-800",
    consultation: "bg-cyan-100 text-cyan-800", proposal: "bg-indigo-100 text-indigo-800",
    booked: "bg-green-100 text-green-800", completed: "bg-purple-100 text-purple-800",
    lost: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-light">Клиенты</h2>
        <Button onClick={openNew} className="rounded-none gap-2 text-xs uppercase tracking-wider">
          <Plus size={14} /> Добавить
        </Button>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по имени, email, телефону..."
        className="rounded-none border-border mb-4 max-w-md"
      />

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <User size={40} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
          <p>Клиентов пока нет</p>
        </div>
      ) : (
        <div className="bg-background border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Имя</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Телефон</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden lg:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Теги</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Источник</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {(c.tags || []).slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] border border-border px-1.5 py-0.5">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{c.source || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(c); }}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl rounded-none max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light flex items-center gap-2">
              <User size={18} /> {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <Tabs defaultValue="info" className="mt-2">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0 gap-0">
                {[
                  { value: "info", label: "Профиль" },
                  { value: "bookings", label: "Бронирования" },
                  { value: "comms", label: "Коммуникации" },
                ].map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-xs uppercase tracking-wider">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Телефон</span>
                    <p>{selected.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</span>
                    <p>{selected.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Источник</span>
                    <p>{selected.source || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Создан</span>
                    <p>{new Date(selected.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5">Теги</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {(selected.tags || []).map((t) => (
                      <span key={t} className="text-xs border border-border px-2 py-1">{t}</span>
                    ))}
                    {!(selected.tags || []).length && <span className="text-xs text-muted-foreground">Нет тегов</span>}
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5">Предпочтения</span>
                  {Object.keys(selected.preferences || {}).length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selected.preferences).map(([k, v]) => (
                        <div key={k} className="border border-border px-3 py-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</span>
                          <p className="text-sm">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Не указаны</span>
                  )}
                </div>

                {selected.notes && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Заметки</span>
                    <p className="text-sm bg-muted/50 p-3 border border-border">{selected.notes}</p>
                  </div>
                )}

                {/* Quick actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <a href={`tel:${selected.phone}`} className="flex-1 text-center py-2 text-xs border border-border hover:border-primary hover:text-primary transition-colors"><Phone size={12} className="inline mr-1" />Позвонить</a>
                  <a href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Здравствуйте, ${selected.name}! Это KiKi.`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 text-xs border border-border hover:border-green-500 hover:text-green-600 transition-colors"><MessageSquare size={12} className="inline mr-1" />WhatsApp</a>
                  <a href={`mailto:${selected.email}`} className="flex-1 text-center py-2 text-xs border border-border hover:border-primary hover:text-primary transition-colors"><Mail size={12} className="inline mr-1" />Email</a>
                </div>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="mt-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar size={32} strokeWidth={1} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Нет привязанных бронирований</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookings.map((b) => (
                      <div key={b.id} className="border border-border p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{b.event_type}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {b.event_date ? new Date(b.event_date).toLocaleDateString("ru-RU") : "Дата не указана"}
                          </p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${statusColors[b.status] || "bg-muted text-muted-foreground"}`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Communications Tab */}
              <TabsContent value="comms" className="mt-4 space-y-4">
                {/* Add new entry */}
                <div className="border border-border p-4 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {COMM_TYPES.map((ct) => (
                      <button
                        key={ct.value}
                        onClick={() => setCommType(ct.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors ${
                          commType === ct.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ct.icon size={12} /> {ct.label}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={commSummary}
                    onChange={(e) => setCommSummary(e.target.value)}
                    placeholder="Описание..."
                    rows={2}
                    className="rounded-none resize-none"
                  />
                  <Button onClick={addComm} size="sm" className="rounded-none gap-2 text-xs" disabled={!commSummary.trim()}>
                    <Send size={12} /> Добавить запись
                  </Button>
                </div>

                {/* History */}
                {commLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Нет записей</p>
                ) : (
                  <div className="space-y-2">
                    {commLogs.map((log) => {
                      const ct = COMM_TYPES.find((c) => c.value === log.type);
                      const Icon = ct?.icon || Tag;
                      return (
                        <div key={log.id} className="border border-border/60 p-3 flex gap-3">
                          <div className="w-8 h-8 border border-border flex items-center justify-center shrink-0 mt-0.5">
                            <Icon size={14} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{ct?.label || log.type}</span>
                              <span className="text-[10px] text-muted-foreground/60">{new Date(log.created_at).toLocaleString("ru-RU")}</span>
                            </div>
                            <p className="text-sm">{log.summary}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
        <DialogContent className="max-w-2xl rounded-none max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              {isNew ? "Новый клиент" : "Редактировать клиента"}
            </DialogTitle>
          </DialogHeader>
          {editCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Имя</label>
                  <Input value={editCustomer.name} onChange={(e) => updateField("name", e.target.value)} className="rounded-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Телефон</label>
                  <Input value={editCustomer.phone} onChange={(e) => updateField("phone", e.target.value)} className="rounded-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
                  <Input value={editCustomer.email} onChange={(e) => updateField("email", e.target.value)} className="rounded-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Заметки</label>
                <Textarea value={editCustomer.notes || ""} onChange={(e) => updateField("notes", e.target.value)} className="rounded-none resize-none" rows={2} />
              </div>

              {/* Tags */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Теги</label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {(editCustomer.tags || []).map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs border border-border px-2 py-1">
                      {t}
                      <button onClick={() => removeTag(t)} className="hover:text-destructive"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Новый тег" className="rounded-none max-w-[200px]" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                  <Button variant="outline" size="sm" onClick={addTag} className="rounded-none">Добавить</Button>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Предпочтения</label>
                <div className="space-y-1 mb-2">
                  {Object.entries(editCustomer.preferences || {}).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{k}:</span>
                      <span className="text-muted-foreground">{String(v)}</span>
                      <button onClick={() => removePref(k)} className="text-destructive hover:text-destructive/80 ml-auto"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={prefKey} onChange={(e) => setPrefKey(e.target.value)} placeholder="Ключ" className="rounded-none max-w-[140px]" />
                  <Input value={prefVal} onChange={(e) => setPrefVal(e.target.value)} placeholder="Значение" className="rounded-none max-w-[180px]" />
                  <Button variant="outline" size="sm" onClick={addPref} className="rounded-none">+</Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" className="rounded-none" onClick={() => setEditCustomer(null)}>Отмена</Button>
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

export default AdminCustomers;
