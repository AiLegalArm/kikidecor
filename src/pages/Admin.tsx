import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Instagram, Download, RefreshCw, CheckCircle2, AlertCircle, Loader2, LogOut, LayoutGrid, List, Phone as PhoneIcon, MessageSquare, Mail as MailIcon, GripVertical } from "lucide-react";
import AdminCalendar from "@/components/AdminCalendar";
import AdminLogin from "@/components/AdminLogin";
import AdminAIGenerator from "@/components/AdminAIGenerator";
import type { Session } from "@supabase/supabase-js";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  event_type: string;
  event_date: string | null;
  location: string | null;
  guests: number | null;
  message: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

const STATUSES = [
  { value: "new", label: "Новая", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "contacted", label: "Связались", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "consultation", label: "Консультация", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { value: "proposal", label: "КП отправлено", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "booked", label: "Забронировано", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "order", label: "Заказ оформлен", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "completed", label: "Завершено", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "lost", label: "Потеряно", color: "bg-red-100 text-red-800 border-red-200" },
];

const getStatusBadge = (status: string) => {
  const s = STATUSES.find((st) => st.value === status);
  return s ? <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span> : <Badge variant="outline">{status}</Badge>;
};

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(0);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 20;

  // Instagram import state
  const [igImporting, setIgImporting] = useState(false);
  const [igSyncing, setIgSyncing] = useState(false);
  const [igResult, setIgResult] = useState<{ success: boolean; synced?: number; error?: string } | null>(null);
  const [igPostCount, setIgPostCount] = useState<number | null>(null);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const fetchLeads = async () => {
    setLoading(true);
    // For pipeline: fetch all leads (up to 1000)
    const { data: all, error: allErr } = await supabase
      .from("event_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (!allErr) setAllLeads(all || []);

    // For table view with filters
    let query = supabase
      .from("event_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }
    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, error } = await query;
    if (error) {
      toast.error("Ошибка загрузки заявок");
      console.error(error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const fetchIgCount = async () => {
    const { count, error } = await supabase
      .from("instagram_posts")
      .select("*", { count: "exact", head: true });
    if (!error && count !== null) setIgPostCount(count);
  };

  useEffect(() => {
    if (session) {
      fetchLeads();
      fetchIgCount();
    }
  }, [filterStatus, page, session]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={() => {}} />;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchLeads();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("event_leads").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error("Ошибка обновления статуса");
    } else {
      toast.success("Статус обновлён");
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      if (selectedLead?.id === id) setSelectedLead((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    const { error } = await supabase.from("event_leads").update({ notes: editNotes }).eq("id", selectedLead.id);
    if (error) {
      toast.error("Ошибка сохранения заметок");
    } else {
      toast.success("Заметки сохранены");
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: editNotes } : l)));
      setSelectedLead((prev) => prev ? { ...prev, notes: editNotes } : null);
    }
  };

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || "");
  };

  const triggerInstagramSync = async (importAll: boolean) => {
    const setter = importAll ? setIgImporting : setIgSyncing;
    setter(true);
    setIgResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("sync-instagram", {
        body: { import_all: importAll },
      });

      if (error) throw error;

      setIgResult(data);
      if (data?.success) {
        toast.success(`${importAll ? "Импорт" : "Синхронизация"} завершена: ${data.synced} постов`);
        fetchIgCount();
      } else {
        toast.error(data?.error || "Ошибка синхронизации");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка подключения";
      setIgResult({ success: false, error: msg });
      toast.error(msg);
    } finally {
      setter(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <title>CRM — Ki Ki Decor</title>

      {/* Header */}
      <div className="bg-background border-b border-border px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-light">
            CRM <span className="text-primary">Панель</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Управление заявками Ki Ki Decor</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-none gap-2 text-xs uppercase tracking-wider">
          <LogOut size={14} />
          Выйти
        </Button>
      </div>

      {/* Instagram Import Section */}
      <div className="px-6 py-6">
        <div className="bg-background border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Instagram size={22} strokeWidth={1.5} className="text-primary" />
            <h2 className="font-display text-xl font-light">Instagram Контент</h2>
            {igPostCount !== null && (
              <span className="text-xs text-muted-foreground border border-border px-2 py-0.5">
                {igPostCount} постов в базе
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-5 max-w-xl">
            Импортируйте все исторические посты из Instagram или запустите быструю синхронизацию последних публикаций. Посты автоматически появятся в галерее.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => triggerInstagramSync(true)}
              disabled={igImporting || igSyncing}
              className="rounded-none gap-2 btn-glow"
            >
              {igImporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {igImporting ? "Импорт..." : "Импортировать весь контент"}
            </Button>

            <Button
              variant="outline"
              onClick={() => triggerInstagramSync(false)}
              disabled={igImporting || igSyncing}
              className="rounded-none gap-2"
            >
              {igSyncing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {igSyncing ? "Синхронизация..." : "Быстрая синхронизация"}
            </Button>
          </div>

          {/* Result feedback */}
          {igResult && (
            <div className={`mt-4 flex items-start gap-2 text-sm p-3 border ${
              igResult.success
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {igResult.success ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
              )}
              <span>
                {igResult.success
                  ? `Успешно синхронизировано ${igResult.synced} постов`
                  : `Ошибка: ${igResult.error}`
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AI Concept Generator */}
      <div className="px-6 pb-6">
        <AdminAIGenerator />
      </div>

      {/* Admin Calendar */}
      <div className="px-6 pb-6">
        <AdminCalendar onLeadUpdated={fetchLeads} />
      </div>

      {/* View Toggle + Toolbar */}
      <div className="px-6 py-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="flex items-center gap-0 border border-border">
          <button onClick={() => setViewMode("pipeline")} className={`px-3 py-2 text-xs transition-colors ${viewMode === "pipeline" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
            <LayoutGrid size={14} />
          </button>
          <button onClick={() => setViewMode("table")} className={`px-3 py-2 text-xs transition-colors ${viewMode === "table" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
            <List size={14} />
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по имени, email, телефону..." className="pl-9 rounded-none border-border" />
          </div>
          <Button type="submit" variant="outline" className="rounded-none"><Search size={16} /></Button>
        </form>

        {viewMode === "table" && (
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(0); }}>
              <SelectTrigger className="w-[180px] rounded-none border-border"><SelectValue placeholder="Все статусы" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {STATUSES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Pipeline View */}
      {viewMode === "pipeline" && (
        <div className="px-6 pb-6">
          <div ref={pipelineRef} className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin" }}>
            {STATUSES.map((stage) => {
              const stageLeads = allLeads.filter((l) => l.status === stage.value);
              return (
                <div key={stage.value} className="min-w-[260px] w-[260px] flex-shrink-0 bg-background border border-border flex flex-col max-h-[70vh]">
                  <div className="px-3 py-3 border-b border-border flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stage.color}`}>{stage.label}</span>
                    <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5">{stageLeads.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading && stageLeads.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs">Загрузка...</div>
                    ) : stageLeads.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground/40 text-[10px] uppercase tracking-wider">Пусто</div>
                    ) : (
                      stageLeads.map((lead) => (
                        <button key={lead.id} onClick={() => openDetail(lead)} className="w-full text-left p-3 border border-border/60 bg-card hover:border-primary/40 transition-colors group">
                          <p className="text-sm font-medium truncate">{lead.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{lead.event_type}</p>
                          {lead.event_date && <p className="text-[10px] text-muted-foreground mt-1.5">{new Date(lead.event_date).toLocaleDateString("ru-RU")}</p>}
                          <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="p-1 border border-border hover:border-primary hover:text-primary transition-colors rounded-sm"><PhoneIcon size={11} /></a>
                            <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Здравствуйте, ${lead.name}! Это KiKi.`)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 border border-border hover:border-green-500 hover:text-green-600 transition-colors rounded-sm"><MessageSquare size={11} /></a>
                            <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="p-1 border border-border hover:border-primary hover:text-primary transition-colors rounded-sm"><MailIcon size={11} /></a>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="px-6">
          <div className="bg-background border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Имя</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Телефон</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden lg:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Тип</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Дата</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Статус</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Загрузка...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Заявок не найдено</td></tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{lead.phone}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{lead.email}</td>
                      <td className="px-4 py-3">{lead.event_type}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{lead.event_date ? new Date(lead.event_date).toLocaleDateString("ru-RU") : "—"}</td>
                      <td className="px-4 py-3">{getStatusBadge(lead.status)}</td>
                      <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={() => openDetail(lead)}><Eye size={16} /></Button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between py-4">
            <Button variant="outline" size="sm" className="rounded-none" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Назад</Button>
            <span className="text-sm text-muted-foreground">Страница {page + 1}</span>
            <Button variant="outline" size="sm" className="rounded-none" disabled={leads.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>Вперёд <ChevronRight size={16} /></Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">Детали заявки</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Имя</span>
                  <p className="font-medium mt-0.5">{selectedLead.name}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Телефон</span>
                  <p className="mt-0.5">{selectedLead.phone}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
                  <p className="mt-0.5">{selectedLead.email}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Тип</span>
                  <p className="mt-0.5">{selectedLead.event_type}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Дата</span>
                  <p className="mt-0.5">{selectedLead.event_date ? new Date(selectedLead.event_date).toLocaleDateString("ru-RU") : "—"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Локация</span>
                  <p className="mt-0.5">{selectedLead.location || "—"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Гостей</span>
                  <p className="mt-0.5">{selectedLead.guests || "—"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Создана</span>
                  <p className="mt-0.5">{new Date(selectedLead.created_at).toLocaleDateString("ru-RU")}</p>
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Сообщение</span>
                  <p className="mt-1 text-sm bg-muted/50 p-3 border border-border">{selectedLead.message}</p>
                </div>
              )}

              {/* Status update */}
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Статус</span>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateStatus(selectedLead.id, s.value)}
                      className={`px-3 py-1.5 text-xs border transition-all ${
                        selectedLead.status === s.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Заметки</span>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Добавьте заметки по заявке..."
                  className="rounded-none border-border resize-none"
                />
                <Button onClick={saveNotes} className="mt-2 rounded-none text-xs uppercase tracking-wider" size="sm">
                  Сохранить заметки
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
