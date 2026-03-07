import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, Workflow } from "lucide-react";
import { toast } from "sonner";

const MODULE_OPTIONS = [
  { value: "module_1", label: "Module 1 · Orchestrator" },
  { value: "module_2", label: "Module 2 · Feasibility + Market" },
  { value: "module_3", label: "Module 3 · Concept + Decor + Spatial" },
  { value: "module_4", label: "Module 4 · Program + Timeline + Team" },
  { value: "module_5", label: "Module 5 · Budget + Vendors" },
  { value: "module_6", label: "Module 6 · Commercial + Visuals" },
];

const GLOBAL_SCHEMA = {
  event_input: {},
  analysis: {},
  market_research: {},
  concept: {},
  decor: {},
  spatial_plan: {},
  program: {},
  timeline: [],
  team: [],
  vendors: [],
  budget: {},
  commercial: {},
  visuals: {},
};

const AdminEventPlannerPipeline = () => {
  const [brief, setBrief] = useState("");
  const [regenerateFrom, setRegenerateFrom] = useState<string>("module_1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);

  const canRun = useMemo(() => brief.trim().length > 20, [brief]);

  const runPipeline = async () => {
    if (!canRun) {
      toast.error("Добавьте более подробный бриф (минимум 20 символов)");
      return;
    }

    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("event-planner-pipeline", {
        body: {
          brief,
          regenerate_from: regenerateFrom,
          existing_data: regenerateFrom !== "module_1" ? result : undefined,
        },
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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-light mb-1">AI Event Planner Pipeline</h2>
        <p className="text-sm text-muted-foreground">Модульная генерация структуры события (M1 → M6) с частичной регенерацией блоков.</p>
      </div>

      <Card className="rounded-none border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Workflow size={16} /> Входные данные</CardTitle>
          <CardDescription>Добавьте клиентский бриф и выберите модуль, с которого нужно пересчитать результат.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Client Brief</p>
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={7}
              className="rounded-none border-border"
              placeholder="Например: Корпоратив на 120 гостей в Москве, бюджет 2.5 млн ₽, стиль modern luxury..."
            />
          </div>

          <div className="max-w-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Regenerate from module</p>
            <Select value={regenerateFrom} onValueChange={setRegenerateFrom}>
              <SelectTrigger className="rounded-none border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MODULE_OPTIONS.map((module) => (
                  <SelectItem key={module.value} value={module.value}>{module.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button className="rounded-none" onClick={runPipeline} disabled={running || !canRun}>
              {running ? <><Loader2 size={14} className="mr-2 animate-spin" /> Генерация...</> : "Запустить pipeline"}
            </Button>
            <Button type="button" variant="outline" className="rounded-none" onClick={() => copyJson(GLOBAL_SCHEMA, "Global schema")}>
              <Copy size={14} className="mr-2" /> Copy schema
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="rounded-none border-border">
          <CardHeader>
            <CardTitle className="text-base">Результат pipeline (JSON)</CardTitle>
            <CardDescription>Строгий JSON для backend / n8n / API workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {Object.keys(result).map((key) => <Badge key={key} variant="outline" className="rounded-none">{key}</Badge>)}
            </div>
            <Button type="button" variant="outline" className="rounded-none" onClick={() => copyJson(result, "Pipeline JSON")}>
              <Copy size={14} className="mr-2" /> Copy output JSON
            </Button>
            <pre className="text-xs bg-muted/40 border border-border p-3 whitespace-pre-wrap overflow-x-auto max-h-[560px]">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEventPlannerPipeline;
