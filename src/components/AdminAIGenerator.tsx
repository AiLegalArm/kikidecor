import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Palette, Lightbulb, Flower2, UtensilsCrossed, Layers } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DecorConcept = {
  conceptName: string;
  conceptDescription: string;
  colorPalette: string[];
  colorHexCodes: string[];
  decorElements: { name: string; description: string }[];
  tableDecor: string;
  lightingConcept: string;
  floralDesign: string;
  estimatedComplexity: string;
  inspirationImages: string[];
};

const EVENT_TYPES = ["Свадьба", "День рождения", "Юбилей", "Корпоратив", "Предложение руки", "Детский праздник", "Выпускной"];
const VENUE_TYPES = ["Ресторан", "Банкетный зал", "Лофт", "На открытом воздухе", "Шатёр", "Загородный дом", "Яхта", "Отель"];

const COMPLEXITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: "Базовая", color: "bg-green-100 text-green-800 border-green-200" },
  medium: { label: "Средняя", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  high: { label: "Высокая", color: "bg-orange-100 text-orange-800 border-orange-200" },
  ultra: { label: "Премиум", color: "bg-purple-100 text-purple-800 border-purple-200" },
};

const AdminAIGenerator = () => {
  const [eventType, setEventType] = useState("");
  const [venueType, setVenueType] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [generating, setGenerating] = useState(false);
  const [concept, setConcept] = useState<DecorConcept | null>(null);

  const canGenerate = eventType && venueType && colorPalette && guestCount;

  const generate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setConcept(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-decor-concept", {
        body: { eventType, venueType, colorPalette, guestCount },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setConcept(data);
      toast.success("Концепция сгенерирована!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка генерации";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-background border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles size={22} strokeWidth={1.5} className="text-primary" />
        <h2 className="font-display text-xl font-light">AI Генератор концепций</h2>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Тип мероприятия *</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full h-10 px-3 border border-border bg-transparent text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Выберите...</option>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Тип площадки *</label>
          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
            className="w-full h-10 px-3 border border-border bg-transparent text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Выберите...</option>
            {VENUE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Цветовая палитра *</label>
          <Input
            value={colorPalette}
            onChange={(e) => setColorPalette(e.target.value)}
            placeholder="Пудровый, золотой, белый..."
            className="h-10 rounded-none border-border"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Кол-во гостей *</label>
          <Input
            type="number"
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            placeholder="80"
            className="h-10 rounded-none border-border"
          />
        </div>
      </div>

      <Button
        onClick={generate}
        disabled={!canGenerate || generating}
        className="rounded-none gap-2 btn-glow mb-6"
      >
        {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {generating ? "Генерация концепции..." : "Сгенерировать концепцию"}
      </Button>

      {/* Result */}
      {concept && (
        <div className="space-y-6 border-t border-border pt-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-display text-2xl font-light">{concept.conceptName}</h3>
              {concept.estimatedComplexity && COMPLEXITY_MAP[concept.estimatedComplexity] && (
                <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", COMPLEXITY_MAP[concept.estimatedComplexity].color)}>
                  {COMPLEXITY_MAP[concept.estimatedComplexity].label}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{concept.conceptDescription}</p>
          </div>

          {/* Color Palette */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} className="text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Цветовая палитра</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {concept.colorHexCodes?.map((hex, i) => (
                <div key={i} className="flex items-center gap-2 border border-border px-3 py-2">
                  <div className="w-8 h-8 rounded-full border border-border/50 shadow-sm" style={{ backgroundColor: hex }} />
                  <div>
                    <p className="text-sm font-medium">{concept.colorPalette?.[i]}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decor Elements */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} className="text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Элементы декора</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {concept.decorElements?.map((el, i) => (
                <div key={i} className="border border-border p-4">
                  <p className="text-sm font-medium mb-1">{el.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{el.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed size={14} className="text-primary" />
                <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Сервировка</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{concept.tableDecor}</p>
            </div>
            <div className="border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-primary" />
                <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Освещение</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{concept.lightingConcept}</p>
            </div>
            <div className="border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flower2 size={14} className="text-primary" />
                <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Флористика</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{concept.floralDesign}</p>
            </div>
          </div>

          {/* Inspiration Images */}
          {concept.inspirationImages && concept.inspirationImages.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium block mb-3">Визуальная инспирация</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {concept.inspirationImages.map((img, i) => (
                  <div key={i} className="aspect-square border border-border overflow-hidden">
                    <img src={img} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAIGenerator;
