import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Clock, RefreshCw, Copy, Check, X, Loader2, AlertCircle, Eye, Film,
  Calendar, Sparkles, Camera, Sun, Image as ImageIcon, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export type WanRun = {
  id: string;
  created_at: string;
  status: string;
  user_prompt: string;
  compiled_prompt: string;
  preset_id: string | null;
  preset_name: string | null;
  first_frame_url: string | null;
  last_frame_url: string | null;
  last_frame_description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  motion: any;
  mood: any;
  output: any;
  negative_prompt: string | null;
  style_strength: number;
  error_message: string | null;
};

export type WanSetup = {
  userPrompt: string;
  presetId: string;
  motion: any;
  mood: any;
  output: any;
  negativePrompt: string;
  styleStrength: number;
};

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  queued: { label: "В очереди", color: "bg-muted text-muted-foreground", icon: Clock },
  processing: { label: "Генерируется", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400", icon: Loader2 },
  awaiting_video: { label: "Бриф готов", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: Sparkles },
  completed: { label: "Готово", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: Check },
  failed: { label: "Ошибка", color: "bg-destructive/15 text-destructive", icon: AlertCircle },
};

const formatRelative = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
  return new Date(iso).toLocaleDateString();
};

const groupByDay = (runs: WanRun[]) => {
  const groups: Record<string, WanRun[]> = {};
  runs.forEach((r) => {
    const d = new Date(r.created_at);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yest = new Date(today); yest.setDate(yest.getDate() - 1);
    const rd = new Date(d); rd.setHours(0, 0, 0, 0);
    let key: string;
    if (rd.getTime() === today.getTime()) key = "Сегодня";
    else if (rd.getTime() === yest.getTime()) key = "Вчера";
    else key = d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    (groups[key] ||= []).push(r);
  });
  return groups;
};

const StatusBadge = ({ status }: { status: string }) => {
  const meta = STATUS_META[status] || STATUS_META.queued;
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider", meta.color)}>
      <Icon size={10} className={status === "processing" ? "animate-spin" : ""} />
      {meta.label}
    </span>
  );
};

const RunCard = ({
  run, onRerun, onView,
}: {
  run: WanRun;
  onRerun: (r: WanRun) => void;
  onView: (r: WanRun) => void;
}) => {
  const motionLabel = run.motion?.cameraId || "—";
  const moodLabel = run.mood?.toneId || "—";
  return (
    <div className="group relative rounded-xl border bg-card hover:border-primary/40 transition overflow-hidden">
      {/* Frames strip */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {run.video_url ? (
          <video src={run.video_url} className="w-full h-full object-cover" muted loop playsInline
            onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
        ) : (
          <div className="absolute inset-0 grid grid-cols-2 gap-px bg-border/50">
            <div className="relative bg-emerald-500/10 flex items-center justify-center">
              {run.first_frame_url
                ? <img src={run.first_frame_url} className="absolute inset-0 w-full h-full object-cover" alt="first" />
                : <ImageIcon size={20} className="text-emerald-600/40" />}
              <span className="absolute top-1 left-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white px-1.5 py-0.5 rounded">Start</span>
            </div>
            <div className="relative bg-amber-500/10 flex items-center justify-center">
              {run.last_frame_url
                ? <img src={run.last_frame_url} className="absolute inset-0 w-full h-full object-cover" alt="last" />
                : <ImageIcon size={20} className="text-amber-600/40" />}
              <span className="absolute top-1 right-1 text-[9px] font-bold uppercase tracking-wider bg-amber-600/90 text-white px-1.5 py-0.5 rounded">End</span>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2"><StatusBadge status={run.status} /></div>
        {run.video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition">
            <Film size={28} className="text-white drop-shadow" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-semibold leading-snug line-clamp-2 min-h-[2.25rem]">
          {run.user_prompt || <span className="text-muted-foreground italic">без промпта</span>}
        </p>

        <div className="flex flex-wrap gap-1">
          {run.preset_name && <Badge variant="secondary" className="text-[9px] font-normal px-1.5 py-0 h-4">{run.preset_name}</Badge>}
          <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 h-4 gap-1"><Camera size={9} />{motionLabel}</Badge>
          <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 h-4 gap-1"><Sun size={9} />{moodLabel}</Badge>
          {run.output?.duration && <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 h-4">{run.output.duration}s · {run.output.aspectRatio}</Badge>}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock size={10} />{formatRelative(run.created_at)}
          </span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => onView(run)}>
              <Eye size={11} className="mr-1" />Детали
            </Button>
            <Button size="sm" variant="default" className="h-7 px-2 text-[10px]" onClick={() => onRerun(run)}>
              <RefreshCw size={11} className="mr-1" />Re-run
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WanHistory = ({
  runs, loading, onRerun, onRefresh,
}: {
  runs: WanRun[];
  loading?: boolean;
  onRerun: (setup: WanSetup, run: WanRun) => void;
  onRefresh: () => void;
}) => {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<WanRun | null>(null);

  const filtered = useMemo(() => {
    return runs.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (query && !r.user_prompt?.toLowerCase().includes(query.toLowerCase()) && !r.preset_name?.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [runs, filter, query]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: runs.length };
    runs.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [runs]);

  const handleRerun = (run: WanRun) => {
    onRerun({
      userPrompt: run.user_prompt,
      presetId: run.preset_id || "quiet-luxury",
      motion: run.motion || { cameraId: "slow-pan", speed: "slow" },
      mood: run.mood || { toneId: "editorial", lightingId: "soft-daylight" },
      output: run.output || { resolution: "1080p", aspectRatio: "16:9", duration: 5, cameraFixed: false },
      negativePrompt: run.negative_prompt || "",
      styleStrength: run.style_strength ?? 60,
    }, run);
    toast.success("Сетап восстановлен в форме выше");
  };

  const filterTabs: Array<{ id: string; label: string }> = [
    { id: "all", label: "Все" },
    { id: "completed", label: "Готово" },
    { id: "awaiting_video", label: "Брифы" },
    { id: "processing", label: "В работе" },
    { id: "failed", label: "Ошибки" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-xl font-light flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            Generation History
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {runs.length} {runs.length === 1 ? "генерация" : "генераций"} · повторите любой сетап в один клик
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={12} className={cn("mr-2", loading && "animate-spin")} />Обновить
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5",
                filter === t.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span className={cn("text-[9px] px-1.5 rounded-full", filter === t.id ? "bg-primary/15 text-primary" : "bg-muted")}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по промпту или пресету"
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Film size={32} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            {runs.length === 0 ? "История пуста — создайте первый бриф выше" : "Ничего не найдено по фильтру"}
          </p>
        </div>
      )}

      {/* Timeline groups */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-muted-foreground">
                <Calendar size={11} />{day}
              </div>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground">{items.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((run) => (
                <RunCard key={run.id} run={run} onRerun={handleRerun} onView={setDetail} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Sparkles size={16} className="text-primary" />
                  Детали генерации
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={detail.status} />
                  <span className="text-xs text-muted-foreground">{new Date(detail.created_at).toLocaleString("ru-RU")}</span>
                </div>

                {detail.error_message && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
                    <strong>Ошибка:</strong> {detail.error_message}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">First Frame</p>
                    {detail.first_frame_url
                      ? <img src={detail.first_frame_url} className="aspect-video w-full object-cover rounded border" alt="" />
                      : <div className="aspect-video w-full bg-muted rounded border flex items-center justify-center text-[10px] text-muted-foreground">Нет</div>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Last Frame</p>
                    {detail.last_frame_url
                      ? <img src={detail.last_frame_url} className="aspect-video w-full object-cover rounded border" alt="" />
                      : <div className="aspect-video w-full bg-muted rounded border flex items-center justify-center text-[10px] text-muted-foreground">Нет</div>}
                  </div>
                </div>

                {detail.last_frame_description && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Vision Analysis</p>
                    <p className="text-xs leading-relaxed bg-muted/40 p-3 rounded">{detail.last_frame_description}</p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">User Prompt</p>
                  <p className="text-sm bg-muted/40 p-3 rounded">{detail.user_prompt}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 border rounded"><div className="text-muted-foreground">Preset</div><div className="font-semibold truncate">{detail.preset_name || "—"}</div></div>
                  <div className="p-2 border rounded"><div className="text-muted-foreground">Camera</div><div className="font-semibold truncate">{detail.motion?.cameraId || "—"}</div></div>
                  <div className="p-2 border rounded"><div className="text-muted-foreground">Mood</div><div className="font-semibold truncate">{detail.mood?.toneId || "—"}</div></div>
                  <div className="p-2 border rounded"><div className="text-muted-foreground">Output</div><div className="font-semibold truncate">{detail.output?.duration}s · {detail.output?.aspectRatio}</div></div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Compiled Prompt</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(detail.compiled_prompt); toast.success("Скопировано"); }}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Copy size={10} />Копировать
                    </button>
                  </div>
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono bg-muted/40 p-3 rounded max-h-48 overflow-y-auto">
                    {detail.compiled_prompt}
                  </pre>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button onClick={() => { handleRerun(detail); setDetail(null); }} className="flex-1">
                    <RefreshCw size={13} className="mr-2" />Restore setup & edit
                  </Button>
                  <Button variant="outline" onClick={() => setDetail(null)}>
                    <X size={13} className="mr-1" />Закрыть
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WanHistory;
