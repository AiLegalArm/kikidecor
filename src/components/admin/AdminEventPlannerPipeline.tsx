import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Loader2, Workflow } from "lucide-react";
import { toast } from "sonner";
import { exportEventPipelineToPDF } from "@/lib/exportEventPipelinePDF";

const MODULE_OPTIONS = [
  { value: "module_1", label: "Module 1 · Orchestrator", description: "Анализ брифа, определение типа события и запуск цепочки модулей" },
  { value: "module_2", label: "Module 2 · Feasibility + Market", description: "Оценка реализуемости, анализ рынка и конкурентов" },
  { value: "module_3", label: "Module 3 · Concept + Decor + Spatial", description: "Генерация концепции, декор-решений и пространственного плана" },
  { value: "module_4", label: "Module 4 · Program + Timeline + Team", description: "Программа мероприятия, тайминг и распределение команды" },
  { value: "module_5", label: "Module 5 · Budget + Vendors", description: "Расчёт бюджета и подбор подрядчиков" },
  { value: "module_6", label: "Module 6 · Commercial + Visuals", description: "Коммерческое предложение и визуальные материалы" },
];

const AdminEventPlannerPipeline = () => {
  const [brief, setBrief] = useState("");
  const [regenerateFrom, setRegenerateFrom] = useState<string>("module_1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);
  const [exporting, setExporting] = useState(false);

  const canRun = useMemo(() => brief.trim().length > 20, [brief]);

  const runPipeline = async () => {
    if (!canRun) {
      toast.error("Добавьте более подробный бриф (минимум 20 символов)");
      return;
    }
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("event-planner-pipeline", {
        body: { brief, regenerate_from: regenerateFrom, existing_data: regenerateFrom !== "module_1" ? result : undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.message || data.error);
      setResult(data);
      toast.success("Pipeline успешно выполнен");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка запуска pipeline");
    } finally {
      setRunning(false);
    }
  };

  const copyJson = async (value: unknown, label: string) => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    toast.success(`${label} скопирован`);
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setExporting(true);
    try {
      await exportEventPipelineToPDF(result, brief);
      toast.success("PDF экспортирован");
    } catch (err) {
      toast.error("Ошибка экспорта PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-light mb-1">AI Event Planner Pipeline</h2>
        <p className="text-sm text-muted-foreground">Модульная генерация структуры события (M1 → M6) с частичной регенерацией блоков.</p>
      </div>

      {/* Input card */}
      <Card className="rounded-none border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Workflow size={16} /> Входные данные</CardTitle>
          <CardDescription>Добавьте клиентский бриф и выберите модуль, с которого нужно пересчитать результат.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Client Brief</p>
            <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={7} className="rounded-none border-border" placeholder="Например: Корпоратив на 120 гостей в Москве, бюджет 2.5 млн ₽, стиль modern luxury..." />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Regenerate from module</p>
            <Select value={regenerateFrom} onValueChange={setRegenerateFrom}>
              <SelectTrigger className="rounded-none border-border max-w-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MODULE_OPTIONS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 mt-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Описание модулей</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODULE_OPTIONS.map((m) => (
                <div key={m.value} className={`p-2.5 border rounded text-xs ${regenerateFrom === m.value ? "border-primary bg-primary/5" : "border-border"}`}>
                  <p className="font-semibold text-foreground mb-0.5">{m.label}</p>
                  <p className="text-muted-foreground leading-snug">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button className="rounded-none" onClick={runPipeline} disabled={running || !canRun}>
              {running ? <><Loader2 size={14} className="mr-2 animate-spin" /> Генерация...</> : "Запустить pipeline"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-none" onClick={handleExportPDF} disabled={exporting}>
              {exporting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Download size={14} className="mr-2" />}
              Экспорт PDF
            </Button>
            <Button variant="outline" className="rounded-none" onClick={() => copyJson(result, "Pipeline JSON")}>
              <Copy size={14} className="mr-2" /> Copy JSON
            </Button>
          </div>

          {/* Analysis */}
          <ResultSection title="📋 Анализ брифа" data={result.analysis} />

          {/* Market Research */}
          <ResultSection title="📊 Анализ рынка" data={result.market_research} />

          {/* Concept */}
          <ResultSection title="🎨 Концепция" data={result.concept} />

          {/* Decor */}
          <ResultSection title="🌸 Декор" data={result.decor} />

          {/* Spatial Plan */}
          <ResultSection title="📐 Пространственный план" data={result.spatial_plan} />

          {/* Program */}
          <ResultSection title="🎤 Программа" data={result.program} />

          {/* Timeline */}
          {Array.isArray(result.timeline) && (result.timeline as any[]).length > 0 && (
            <Card className="rounded-none border-border">
              <CardHeader><CardTitle className="text-base">⏱ Тайминг</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(result.timeline as any[]).map((item, i) => (
                    <div key={i} className="border border-border rounded p-3 text-sm">
                      <div className="font-semibold text-foreground">{item.start_time} — {item.end_time}</div>
                      <div className="text-foreground mt-1">{item.activity}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {item.responsible_team && <span>Команда: {item.responsible_team}</span>}
                        {item.resources_required && <span> · Ресурсы: {item.resources_required}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team */}
          {Array.isArray(result.team) && (result.team as any[]).length > 0 && (
            <Card className="rounded-none border-border">
              <CardHeader><CardTitle className="text-base">👥 Команда</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(result.team as any[]).map((member, i) => (
                    <div key={i} className="border border-border rounded p-3 text-sm">
                      <div className="font-semibold text-foreground">{member.role} <Badge variant="outline" className="ml-2 rounded-none text-xs">{member.quantity} чел.</Badge></div>
                      <div className="text-foreground mt-1">{member.responsibility}</div>
                      <div className="text-muted-foreground text-xs mt-1">Этап: {member.event_phase} · Приоритет: {member.priority}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vendors */}
          {Array.isArray(result.vendors) && (result.vendors as any[]).length > 0 && (
            <Card className="rounded-none border-border">
              <CardHeader><CardTitle className="text-base">🏢 Подрядчики</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(result.vendors as any[]).map((v, i) => (
                    <div key={i} className="border border-border rounded p-3 text-sm">
                      <div className="font-semibold text-foreground">{v.category}</div>
                      <div className="text-foreground mt-1">{v.purpose}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Уровень: {v.vendor_level} · Стоимость: {v.estimated_cost_range}
                      </div>
                      {v.selection_notes && <div className="text-muted-foreground text-xs mt-1 italic">{v.selection_notes}</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget */}
          <BudgetSection data={result.budget} />

          {/* Commercial */}
          <ResultSection title="📄 Коммерческое предложение" data={result.commercial} />

          {/* Visuals */}
          <ResultSection title="🖼 Визуальные материалы" data={result.visuals} />
        </div>
      )}
    </div>
  );
};

/* Generic section for object data */
function ResultSection({ title, data }: { title: string; data: unknown }) {
  if (!data || typeof data !== "object" || Object.keys(data as object).length === 0) return null;

  return (
    <Card className="rounded-none border-border">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
            <FieldRenderer key={key} label={humanizeKey(key)} value={value} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FieldRenderer({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) return null;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return (
      <div className="text-sm">
        <span className="font-medium text-foreground">{label}: </span>
        <span className="text-muted-foreground">{String(value)}</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (typeof value[0] === "string") {
      return (
        <div className="text-sm">
          <span className="font-medium text-foreground">{label}: </span>
          <span className="text-muted-foreground">{value.join(", ")}</span>
        </div>
      );
    }
    // Array of objects
    return (
      <div className="text-sm">
        <p className="font-medium text-foreground mb-1">{label}:</p>
        <div className="pl-3 border-l-2 border-border space-y-2">
          {value.map((item, i) => (
            <div key={i} className="space-y-1">
              {typeof item === "object" && item !== null
                ? Object.entries(item).map(([k, v]) => (
                    <div key={k} className="text-xs">
                      <span className="font-medium text-foreground">{humanizeKey(k)}: </span>
                      <span className="text-muted-foreground">{String(v)}</span>
                    </div>
                  ))
                : <span className="text-muted-foreground">{String(item)}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="text-sm">
        <p className="font-medium text-foreground mb-1">{label}:</p>
        <div className="pl-3 border-l-2 border-border space-y-1">
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
            <FieldRenderer key={k} label={humanizeKey(k)} value={v} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function BudgetSection({ data }: { data: unknown }) {
  if (!data || typeof data !== "object") return null;
  const budget = data as any;

  return (
    <Card className="rounded-none border-border">
      <CardHeader><CardTitle className="text-base">💰 Бюджет</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {budget.items && Array.isArray(budget.items) && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-3 font-medium text-foreground">Статья</th>
                  <th className="py-2 pr-3 font-medium text-foreground">Мин.</th>
                  <th className="py-2 pr-3 font-medium text-foreground">Опт.</th>
                  <th className="py-2 pr-3 font-medium text-foreground">Прем.</th>
                  <th className="py-2 font-medium text-foreground">Примечание</th>
                </tr>
              </thead>
              <tbody>
                {budget.items.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-3 text-foreground">{item.budget_item}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{item.min_estimate}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{item.optimal_estimate}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{item.premium_estimate}</td>
                    <td className="py-2 text-muted-foreground text-xs">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {budget.summary && (
          <div className="bg-muted/30 border border-border rounded p-3 text-sm space-y-1">
            <div><span className="font-medium">Итого:</span> {budget.summary.total_estimate}</div>
            <div><span className="font-medium">Резерв:</span> {budget.summary.contingency_reserve}</div>
            <div><span className="font-medium">Вписывается в бюджет:</span> {budget.summary.fit_to_client_budget ? "✅ Да" : "❌ Нет"}</div>
          </div>
        )}
        {budget.optimization_options && Array.isArray(budget.optimization_options) && budget.optimization_options.length > 0 && (
          <div>
            <p className="font-medium text-sm text-foreground mb-1">Варианты оптимизации:</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-0.5">
              {budget.optimization_options.map((opt: string, i: number) => <li key={i}>{opt}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function humanizeKey(key: string): string {
  const map: Record<string, string> = {
    event_type: "Тип события", event_goal: "Цель", location: "Локация", venue: "Площадка",
    guests: "Гости", style: "Стиль", budget: "Бюджет", requirements: "Требования",
    constraints: "Ограничения", missing_information: "Недостающая информация",
    assumptions: "Допущения", risk_flags: "Риски", event_scale: "Масштаб",
    budget_fit: "Соответствие бюджету", price_ranges: "Ценовые диапазоны",
    critical_budget_areas: "Критические статьи", feasible_event_level: "Уровень события",
    strategic_notes: "Стратегические заметки", concept_name: "Название концепции",
    concept_core: "Суть концепции", emotional_direction: "Эмоциональное направление",
    guest_experience: "Опыт гостей", visual_language: "Визуальный язык",
    dress_code: "Дресс-код", entrance_zone: "Входная зона", welcome_zone: "Зона приветствия",
    stage_design: "Сцена", guest_area: "Гостевая зона", table_styling: "Сервировка",
    floral_design: "Флористика", lighting_design: "Освещение", photo_zone: "Фото-зона",
    branding: "Брендинг", must_have: "Обязательно", optional: "Опционально",
    premium_upgrades: "Премиум", zoning_logic: "Логика зонирования",
    stage_location: "Расположение сцены", guest_seating: "Рассадка гостей",
    photo_zone_location: "Расположение фото-зоны", bar_location: "Бар",
    lounge_zones: "Лаунж-зоны", pre_event: "Подготовка", guest_arrival: "Приход гостей",
    official_opening: "Открытие", main_program: "Основная программа",
    food_networking: "Фуршет/нетворкинг", entertainment_block: "Развлечения",
    finale: "Финал", guest_exit: "Завершение", executive_summary: "Резюме",
    concept_pitch: "Питч концепции", included_services: "Включённые услуги",
    expected_result: "Ожидаемый результат", budget_frame: "Бюджетная рамка",
    implementation_stages: "Этапы реализации", next_step: "Следующий шаг",
    moodboard: "Мудборд", render_prompt: "Промпт для рендера",
    photo_prompts: "Промпты для фото", palette: "Палитра", textures: "Текстуры",
    furniture_style: "Стиль мебели", floral_language: "Флористический язык",
    lighting_mood: "Настроение освещения", visual_keywords: "Визуальные ключевые слова",
    avoid_list: "Избегать", city: "Город", region: "Регион", name: "Название",
    type: "Тип", indoor_or_outdoor: "В помещении/на улице", guest_count: "Кол-во гостей",
    audience_profile: "Профиль аудитории", vip: "VIP", event_style: "Стиль",
    mood: "Настроение", color_palette: "Цветовая палитра", total_budget: "Общий бюджет",
    currency: "Валюта", realistic: "Реалистичный", expected_market_cost: "Рыночная стоимость",
    budget_gap: "Разрыв бюджета", explanation: "Пояснение",
    decor_priority: "Приоритеты декора",
  };
  return map[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default AdminEventPlannerPipeline;
