import { useState, useEffect, useMemo, useCallback } from "react";
import { format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CalendarDays, Ban, CheckCircle2, Edit, Trash2, User, Phone, Mail, MapPin, Users, X, MessageCircle,
} from "lucide-react";
import type { DayContentProps } from "react-day-picker";

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
  booking_type: string;
};

type BlockedDate = {
  id: string;
  blocked_date: string;
  reason: string | null;
};

const STATUSES = [
  { value: "new", label: "Новая", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "contacted", label: "Связались", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "booked", label: "Забронировано", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "completed", label: "Завершено", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "cancelled", label: "Отменено", color: "bg-red-100 text-red-800 border-red-200" },
];

const statusColor = (s: string) => STATUSES.find((st) => st.value === s)?.color || "";
const statusLabel = (s: string) => STATUSES.find((st) => st.value === s)?.label || s;

interface AdminCalendarProps {
  onLeadUpdated?: () => void;
}

const AdminCalendar = ({ onLeadUpdated }: AdminCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", event_type: "", location: "", guests: "", notes: "" });
  const [blockReason, setBlockReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "decor" | "showroom">("all");

  const fetchData = async () => {
    setLoading(true);
    const [leadsRes, blockedRes] = await Promise.all([
      supabase.from("event_leads").select("*").not("event_date", "is", null).order("event_date"),
      supabase.from("blocked_dates").select("*"),
    ]);
    if (leadsRes.data) setLeads(leadsRes.data);
    if (blockedRes.data) setBlockedDates(blockedRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Group leads by date (filtered by type)
  const filteredLeads = useMemo(() =>
    typeFilter === "all" ? leads : leads.filter((l) => l.booking_type === typeFilter),
    [leads, typeFilter]
  );

  const leadsByDate = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    filteredLeads.forEach((l) => {
      if (l.event_date) {
        if (!map[l.event_date]) map[l.event_date] = [];
        map[l.event_date].push(l);
      }
    });
    return map;
  }, [filteredLeads]);

  const blockedDateSet = useMemo(
    () => new Set(blockedDates.map((b) => b.blocked_date)),
    [blockedDates]
  );

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedLeads = selectedDateStr ? leadsByDate[selectedDateStr] || [] : [];
  const isSelectedBlocked = selectedDateStr ? blockedDateSet.has(selectedDateStr) : false;
  const selectedBlockedEntry = blockedDates.find((b) => b.blocked_date === selectedDateStr);

  // Calendar modifiers
  const bookedDays = useMemo(
    () => Object.keys(leadsByDate).map((d) => new Date(d + "T00:00:00")),
    [leadsByDate]
  );
  const blockedDays = useMemo(
    () => blockedDates.map((b) => new Date(b.blocked_date + "T00:00:00")),
    [blockedDates]
  );

  const toggleBlock = async () => {
    if (!selectedDateStr) return;
    if (isSelectedBlocked && selectedBlockedEntry) {
      const { error } = await supabase.from("blocked_dates").delete().eq("id", selectedBlockedEntry.id);
      if (error) { toast.error("Ошибка разблокировки"); return; }
      toast.success("Дата разблокирована");
    } else {
      const { error } = await supabase.from("blocked_dates").insert({
        blocked_date: selectedDateStr,
        reason: blockReason || null,
      });
      if (error) { toast.error("Ошибка блокировки"); return; }
      toast.success("Дата заблокирована");
      setBlockReason("");
    }
    fetchData();
  };

  const updateLeadStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("event_leads").update({ status }).eq("id", id);
    if (error) { toast.error("Ошибка обновления"); return; }
    toast.success(`Статус: ${statusLabel(status)}`);
    fetchData();
    onLeadUpdated?.();
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      event_type: lead.event_type,
      location: lead.location || "",
      guests: lead.guests?.toString() || "",
      notes: lead.notes || "",
    });
  };

  const saveEdit = async () => {
    if (!editingLead) return;
    const { error } = await supabase.from("event_leads").update({
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email,
      event_type: editForm.event_type,
      location: editForm.location || null,
      guests: editForm.guests ? parseInt(editForm.guests) : null,
      notes: editForm.notes || null,
    }).eq("id", editingLead.id);
    if (error) { toast.error("Ошибка сохранения"); return; }
    toast.success("Заявка обновлена");
    setEditingLead(null);
    fetchData();
    onLeadUpdated?.();
  };

  const DayWithTooltip = useCallback(
    (dayProps: DayContentProps) => {
      const dateStr = format(dayProps.date, "yyyy-MM-dd");
      const dayLeads = leadsByDate[dateStr];
      const isBlocked = blockedDateSet.has(dateStr);
      const blockedEntry = blockedDates.find((b) => b.blocked_date === dateStr);

      if (!dayLeads?.length && !isBlocked) {
        return <span>{dayProps.date.getDate()}</span>;
      }

      return (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <span className="relative flex items-center justify-center w-full h-full">
              {dayProps.date.getDate()}
              {dayLeads?.length ? (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayLeads.slice(0, 3).map((_, i) => (
                    <span key={i} className="w-1 h-1 rounded-full bg-primary" />
                  ))}
                </span>
              ) : null}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs p-3 space-y-2">
            {isBlocked && (
              <div className="text-xs font-medium text-destructive flex items-center gap-1">
                <Ban size={11} /> Заблокировано{blockedEntry?.reason ? `: ${blockedEntry.reason}` : ""}
              </div>
            )}
            {dayLeads?.map((lead) => (
              <div key={lead.id} className="text-xs space-y-0.5 border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                <div className="font-medium text-foreground">{lead.name}</div>
                <div className="text-muted-foreground">{lead.event_type}</div>
                <div className="flex gap-3 text-muted-foreground/70">
                  {lead.guests && <span>{lead.guests} гостей</span>}
                  {lead.location && <span>{lead.location}</span>}
                </div>
                <span className={`inline-block rounded-full border px-1.5 py-0 text-[9px] font-semibold ${statusColor(lead.status)}`}>
                  {statusLabel(lead.status)}
                </span>
              </div>
            ))}
          </TooltipContent>
        </Tooltip>
      );
    },
    [leadsByDate, blockedDateSet, blockedDates]
  );

  return (
    <div className="bg-background border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays size={22} strokeWidth={1.5} className="text-primary" />
        <h2 className="font-display text-xl font-light">Календарь мероприятий</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="shrink-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              booked: bookedDays,
              blocked: blockedDays,
            }}
            modifiersClassNames={{
              booked: "bg-green-100 text-green-800 font-semibold",
              blocked: "bg-red-100 text-red-800 line-through",
            }}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
            components={{
              DayContent: DayWithTooltip,
            }}
          />
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground px-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-200 border border-green-400" />
              Есть бронь
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-200 border border-red-400" />
              Заблокировано
            </span>
          </div>
        </div>

        {/* Side panel */}
        <div className="flex-1 min-w-0">
          {!selectedDate ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-light">
              Выберите дату для просмотра деталей
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-light">
                  {format(selectedDate, "d MMMM yyyy, EEEE", { locale: ru })}
                </h3>
                {isSelectedBlocked && (
                  <span className="text-xs bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-full">
                    Заблокировано
                  </span>
                )}
              </div>

              {/* Block / Unblock */}
              <div className="border border-border p-4 space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Управление датой</p>
                {!isSelectedBlocked && (
                  <Input
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Причина блокировки (опционально)"
                    className="rounded-none border-border text-sm"
                  />
                )}
                <Button
                  variant={isSelectedBlocked ? "outline" : "destructive"}
                  size="sm"
                  onClick={toggleBlock}
                  className="rounded-none gap-2 text-xs uppercase tracking-wider"
                >
                  {isSelectedBlocked ? (
                    <>
                      <CheckCircle2 size={14} />
                      Разблокировать
                    </>
                  ) : (
                    <>
                      <Ban size={14} />
                      Заблокировать дату
                    </>
                  )}
                </Button>
                {selectedBlockedEntry?.reason && (
                  <p className="text-xs text-muted-foreground">Причина: {selectedBlockedEntry.reason}</p>
                )}
              </div>

              {/* Bookings for this date */}
              {selectedLeads.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Бронирования ({selectedLeads.length})
                  </p>
                  {selectedLeads.map((lead) => (
                    <div key={lead.id} className="border border-border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.event_type}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColor(lead.status)}`}>
                            {statusLabel(lead.status)}
                          </span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(lead)}>
                            <Edit size={13} />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Phone size={11} />{lead.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={11} />{lead.email}</span>
                        {lead.location && <span className="flex items-center gap-1"><MapPin size={11} />{lead.location}</span>}
                        {lead.guests && <span className="flex items-center gap-1"><Users size={11} />{lead.guests} гостей</span>}
                      </div>

                      {/* WhatsApp quick link */}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Здравствуйте, ${lead.name}! Спасибо за заявку на ${lead.event_type}${lead.event_date ? ` (${format(new Date(lead.event_date + "T00:00:00"), "d MMMM yyyy", { locale: ru })})` : ""}. Давайте обсудим детали! — Ki Ki Decor`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] text-green-700 hover:text-green-900 bg-green-50 border border-green-200 px-2.5 py-1 transition-colors w-fit"
                        >
                          <MessageCircle size={12} />
                          Написать в WhatsApp
                        </a>
                      )}

                      {lead.message && (
                        <p className="text-xs text-muted-foreground/70 bg-muted/50 p-2 border border-border/50">{lead.message}</p>
                      )}

                      {/* Quick status actions */}
                      <div className="flex flex-wrap gap-1.5">
                        {STATUSES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => updateLeadStatus(lead.id, s.value)}
                            className={cn(
                              "px-2 py-1 text-[10px] border transition-all",
                              lead.status === s.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:border-primary text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-light">Нет бронирований на эту дату</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
        <DialogContent className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">Редактировать заявку</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Имя</label>
              <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="rounded-none border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Телефон</label>
                <Input value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-none border-border" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
                <Input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} className="rounded-none border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Тип</label>
                <Input value={editForm.event_type} onChange={(e) => setEditForm((p) => ({ ...p, event_type: e.target.value }))} className="rounded-none border-border" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Локация</label>
                <Input value={editForm.location} onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))} className="rounded-none border-border" />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Гостей</label>
              <Input value={editForm.guests} onChange={(e) => setEditForm((p) => ({ ...p, guests: e.target.value }))} className="rounded-none border-border" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Заметки</label>
              <Textarea value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className="rounded-none border-border resize-none" />
            </div>
            <Button onClick={saveEdit} className="w-full rounded-none text-xs uppercase tracking-wider">
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCalendar;
