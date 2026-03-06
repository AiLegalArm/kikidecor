import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search, Filter, Eye, ChevronLeft, ChevronRight, Instagram,
  LogOut, LayoutGrid, List,
  Phone as PhoneIcon, MessageSquare, Mail as MailIcon,
  ShoppingBag, Users, CalendarDays, BarChart3, Palette, Sparkles, Loader2, Menu, X, Camera,
} from "lucide-react";
import AdminCalendar from "@/components/AdminCalendar";
import AdminAIGenerator from "@/components/AdminAIGenerator";
import AdminLogin from "@/components/AdminLogin";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminInstagramCommerce from "@/components/admin/AdminInstagramCommerce";
import AdminInstagramAnalytics from "@/components/admin/AdminInstagramAnalytics";
import AdminVenueAnalyzer from "@/components/admin/AdminVenueAnalyzer";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminCustomers from "@/components/admin/AdminCustomers";
import type { Session } from "@supabase/supabase-js";

type Lead = {
  id: string; name: string; phone: string; email: string; event_type: string;
  event_date: string | null; location: string | null; guests: number | null;
  message: string | null; status: string; notes: string | null; created_at: string;
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

type Section = "leads" | "customers" | "products" | "calendar" | "orders" | "instagram" | "ig-analytics" | "ai" | "analytics";

const NAV_ITEMS: { key: Section; label: string; icon: any }[] = [
  { key: "leads", label: "Лиды", icon: Users },
  { key: "customers", label: "Клиенты", icon: Users },
  { key: "products", label: "Товары", icon: ShoppingBag },
  { key: "orders", label: "Заказы", icon: ShoppingBag },
  { key: "calendar", label: "Календарь", icon: CalendarDays },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "ig-analytics", label: "IG Аналитика", icon: Instagram },
  { key: "ai", label: "AI Генератор", icon: Sparkles },
  { key: "analytics", label: "Аналитика", icon: BarChart3 },
];

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [section, setSection] = useState<Section>("leads");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [page, setPage] = useState(0);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 20;


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

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); };

  const fetchLeads = async () => {
    setLoading(true);
    const { data: all } = await supabase.from("event_leads").select("*").order("created_at", { ascending: false });
    if (all) setAllLeads(all);

    let query = supabase.from("event_leads").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (search.trim()) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    const { data } = await query;
    setLeads(data || []);
    setLoading(false);
  };

  const fetchIgCount = () => {};

  useEffect(() => { if (session) { fetchLeads(); } }, [filterStatus, page, session]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!session) return <AdminLogin onLogin={() => {}} />;

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); fetchLeads(); };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("event_leads").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error("Ошибка"); return; }
    toast.success("Статус обновлён");
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    setAllLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    if (selectedLead?.id === id) setSelectedLead((prev) => prev ? { ...prev, status: newStatus } : null);
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    const { error } = await supabase.from("event_leads").update({ notes: editNotes }).eq("id", selectedLead.id);
    if (error) { toast.error("Ошибка"); return; }
    toast.success("Заметки сохранены");
    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: editNotes } : l)));
    setSelectedLead((prev) => prev ? { ...prev, notes: editNotes } : null);
  };

  const openDetail = (lead: Lead) => { setSelectedLead(lead); setEditNotes(lead.notes || ""); };



  const navigateTo = (s: Section) => { setSection(s); setSidebarOpen(false); };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <title>Admin — KiKi</title>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-background border-r border-border flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-border">
          <h1 className="font-display text-xl font-light">KiKi <span className="text-primary">Admin</span></h1>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => navigateTo(item.key)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                section === item.key
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-none gap-2 text-xs uppercase tracking-wider w-full">
            <LogOut size={14} /> Выйти
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-foreground/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-background border-b border-border px-4 py-3 flex items-center gap-3 md:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <span className="font-display text-lg font-light">KiKi <span className="text-primary">Admin</span></span>
        </div>

        <div className="p-6">
          {/* ═══ LEADS ═══ */}
          {section === "leads" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-light">CRM Pipeline</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
                <div className="flex items-center gap-0 border border-border">
                  <button onClick={() => setViewMode("pipeline")} className={`px-3 py-2 text-xs transition-colors ${viewMode === "pipeline" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid size={14} /></button>
                  <button onClick={() => setViewMode("table")} className={`px-3 py-2 text-xs transition-colors ${viewMode === "table" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}><List size={14} /></button>
                </div>
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9 rounded-none border-border" />
                  </div>
                  <Button type="submit" variant="outline" className="rounded-none"><Search size={16} /></Button>
                </form>
                {viewMode === "table" && (
                  <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(0); }}>
                    <SelectTrigger className="w-[160px] rounded-none border-border"><SelectValue placeholder="Все" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {viewMode === "pipeline" && (
                <div ref={pipelineRef} className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin" }}>
                  {STATUSES.map((stage) => {
                    const sl = allLeads.filter((l) => l.status === stage.value);
                    return (
                      <div key={stage.value} className="min-w-[240px] w-[240px] flex-shrink-0 bg-background border border-border flex flex-col max-h-[65vh]">
                        <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stage.color}`}>{stage.label}</span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5">{sl.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                          {sl.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground/40 text-[10px] uppercase tracking-wider">Пусто</div>
                          ) : sl.map((lead) => (
                            <button key={lead.id} onClick={() => openDetail(lead)} className="w-full text-left p-2.5 border border-border/60 bg-card hover:border-primary/40 transition-colors group">
                              <p className="text-sm font-medium truncate">{lead.name}</p>
                              <p className="text-[11px] text-muted-foreground">{lead.event_type}</p>
                              {lead.event_date && <p className="text-[10px] text-muted-foreground mt-1">{new Date(lead.event_date).toLocaleDateString("ru-RU")}</p>}
                              <div className="flex gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="p-1 border border-border hover:border-primary hover:text-primary transition-colors rounded-sm"><PhoneIcon size={10} /></a>
                                <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Здравствуйте, ${lead.name}! Это KiKi.`)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 border border-border hover:border-green-500 hover:text-green-600 transition-colors rounded-sm"><MessageSquare size={10} /></a>
                                <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="p-1 border border-border hover:border-primary hover:text-primary transition-colors rounded-sm"><MailIcon size={10} /></a>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === "table" && (
                <>
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
                          <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Загрузка...</td></tr>
                        ) : leads.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Заявок нет</td></tr>
                        ) : leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{lead.name}</td>
                            <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{lead.phone}</td>
                            <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{lead.email}</td>
                            <td className="px-4 py-3">{lead.event_type}</td>
                            <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{lead.event_date ? new Date(lead.event_date).toLocaleDateString("ru-RU") : "—"}</td>
                            <td className="px-4 py-3">{getStatusBadge(lead.status)}</td>
                            <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={() => openDetail(lead)}><Eye size={16} /></Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <Button variant="outline" size="sm" className="rounded-none" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Назад</Button>
                    <span className="text-sm text-muted-foreground">Стр. {page + 1}</span>
                    <Button variant="outline" size="sm" className="rounded-none" disabled={leads.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>Далее <ChevronRight size={16} /></Button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ═══ CUSTOMERS ═══ */}
          {section === "customers" && <AdminCustomers />}

          {/* ═══ PRODUCTS ═══ */}
          {section === "products" && <AdminProducts />}

          {/* ═══ ORDERS ═══ */}
          {section === "orders" && <AdminOrders />}

          {/* ═══ CALENDAR ═══ */}
          {section === "calendar" && (
            <>
              <h2 className="font-display text-2xl font-light mb-6">Календарь бронирований</h2>
              <AdminCalendar onLeadUpdated={fetchLeads} />
            </>
          )}

          {/* ═══ INSTAGRAM COMMERCE ═══ */}
          {section === "instagram" && <AdminInstagramCommerce />}

          {/* ═══ INSTAGRAM ANALYTICS ═══ */}
          {section === "ig-analytics" && <AdminInstagramAnalytics />}

          {/* ═══ AI GENERATOR ═══ */}
          {section === "ai" && (
            <>
              <h2 className="font-display text-2xl font-light mb-6">AI Генератор концепций</h2>
              <AdminAIGenerator />
            </>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {section === "analytics" && <AdminAnalytics />}
        </div>
      </main>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-lg rounded-none max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">Детали заявки</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Имя", selectedLead.name],
                  ["Телефон", selectedLead.phone],
                  ["Email", selectedLead.email],
                  ["Тип", selectedLead.event_type],
                  ["Дата", selectedLead.event_date ? new Date(selectedLead.event_date).toLocaleDateString("ru-RU") : "—"],
                  ["Локация", selectedLead.location || "—"],
                  ["Гостей", selectedLead.guests || "—"],
                  ["Создана", new Date(selectedLead.created_at).toLocaleDateString("ru-RU")],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
                    <p className="mt-0.5">{String(value)}</p>
                  </div>
                ))}
              </div>

              {selectedLead.message && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Сообщение</span>
                  <p className="mt-1 text-sm bg-muted/50 p-3 border border-border">{selectedLead.message}</p>
                </div>
              )}

              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Статус</span>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button key={s.value} onClick={() => updateStatus(selectedLead.id, s.value)} className={`px-3 py-1.5 text-xs border transition-all ${selectedLead.status === s.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary text-muted-foreground hover:text-foreground"}`}>{s.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Заметки</span>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} placeholder="Заметки..." className="rounded-none border-border resize-none" />
                <Button onClick={saveNotes} className="mt-2 rounded-none text-xs uppercase tracking-wider" size="sm">Сохранить</Button>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <a href={`tel:${selectedLead.phone}`} className="flex-1 text-center py-2 text-xs border border-border hover:border-primary hover:text-primary transition-colors"><PhoneIcon size={12} className="inline mr-1" />Позвонить</a>
                <a href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Здравствуйте, ${selectedLead.name}! Это KiKi.`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 text-xs border border-border hover:border-green-500 hover:text-green-600 transition-colors"><MessageSquare size={12} className="inline mr-1" />WhatsApp</a>
                <a href={`mailto:${selectedLead.email}`} className="flex-1 text-center py-2 text-xs border border-border hover:border-primary hover:text-primary transition-colors"><MailIcon size={12} className="inline mr-1" />Email</a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
