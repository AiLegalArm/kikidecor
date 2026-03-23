import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Upload, Loader2, MapPin, Ruler, Users, Lightbulb, Palette,
  Star, ChevronDown, ChevronUp, Camera, Sparkles, Target, Layers, FileDown,
} from "lucide-react";
import { exportVenueAnalysisToPDF } from "@/lib/exportVenueAnalysisPDF";

interface VenueAnalysis {
  venue_type: string;
  estimated_area_sqm?: number;
  estimated_capacity?: number;
  ceiling_height_m?: number;
  architectural_features?: Array<{ feature: string; location: string; decor_potential: string }>;
  existing_elements?: Array<{ element: string; count?: number; condition?: string }>;
  decoration_zones: Array<{
    zone_name: string;
    zone_type: string;
    description: string;
    priority: string;
    estimated_budget_range?: string;
  }>;
  lighting_analysis: {
    natural_light: string;
    existing_fixtures: string;
    recommendations: string;
  };
  color_scheme_recommendation: {
    primary_colors: string[];
    accent_colors: string[];
    reasoning: string;
  };
  overall_recommendation: string;
  estimated_total_budget?: string;
}

const EVENT_TYPES = [
  { value: "wedding", label: "Свадьба" },
  { value: "birthday", label: "День рождения" },
  { value: "corporate", label: "Корпоратив" },
  { value: "proposal", label: "Предложение" },
  { value: "baby_shower", label: "Baby Shower" },
  { value: "anniversary", label: "Юбилей" },
  { value: "graduation", label: "Выпускной" },
  { value: "other", label: "Другое" },
];

const PRIORITY_STYLES: Record<string, string> = {
  must_have: "bg-red-50 border-red-200 text-red-800",
  recommended: "bg-amber-50 border-amber-200 text-amber-800",
  optional: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

const PRIORITY_LABELS: Record<string, string> = {
  must_have: "Обязательно",
  recommended: "Рекомендуется",
  optional: "По желанию",
};

const ZONE_TYPE_ICONS: Record<string, typeof Target> = {
  focal_point: Target,
  accent: Star,
  ambient: Lightbulb,
  functional: Layers,
};

const AdminVenueAnalyzer = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [analysis, setAnalysis] = useState<VenueAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedZone, setExpandedZone] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPDF = async () => {
    if (!analysis) return;
    setExporting(true);
    try {
      await exportVenueAnalysisToPDF(analysis, { eventType, guestCount, colorPalette });
      toast.success("📄 PDF скачан!");
    } catch { toast.error("Ошибка экспорта PDF"); }
    finally { setExporting(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, загрузите изображение");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Файл слишком большой (макс. 10 МБ)");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("venue-photos")
      .upload(fileName, file, { contentType: file.type });

    if (error) {
      toast.error("Ошибка загрузки фото");
      console.error(error);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("venue-photos")
      .getPublicUrl(data.path);

    setImageUrl(urlData.publicUrl);
    toast.success("Фото загружено");
  };

  const analyzeVenue = async () => {
    if (!imageUrl) {
      toast.error("Сначала загрузите фото площадки");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-venue", {
        body: {
          imageUrl,
          eventType: EVENT_TYPES.find(t => t.value === eventType)?.label || eventType,
          guestCount: guestCount || undefined,
          colorPalette: colorPalette || undefined,
        },
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysis(data.analysis);
        toast.success("Анализ площадки завершён");
      } else {
        toast.error("Не удалось получить структурированный анализ");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ошибка анализа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Camera size={20} className="text-primary" />
        <h2 className="font-display text-2xl font-light">AI Анализ площадки</h2>
      </div>

      {/* ── Input Form ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Photo upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer relative overflow-hidden flex items-center justify-center",
            imagePreview ? "aspect-video" : "aspect-video bg-muted/30"
          )}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Venue" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-8">
              <Upload size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Загрузите фото площадки</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">JPG, PNG до 10 МБ</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Тип мероприятия
            </label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="rounded-none border-border">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Количество гостей
            </label>
            <Input
              type="number"
              value={guestCount}
              onChange={e => setGuestCount(e.target.value)}
              placeholder="50"
              className="rounded-none border-border"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Цветовая палитра (опционально)
            </label>
            <Input
              value={colorPalette}
              onChange={e => setColorPalette(e.target.value)}
              placeholder="Белый, золотой, зелёный"
              className="rounded-none border-border"
            />
          </div>

          <Button
            onClick={analyzeVenue}
            disabled={loading || !imageUrl}
            className="w-full rounded-none gap-2 text-xs uppercase tracking-wider h-12"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Анализирую...</>
            ) : (
              <><Sparkles size={16} /> Анализировать площадку</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Analysis Results ── */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Overview cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-background border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Тип площадки</span>
              </div>
              <p className="text-sm font-medium">{analysis.venue_type}</p>
            </div>

            {analysis.estimated_area_sqm && (
              <div className="bg-background border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler size={14} className="text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Площадь</span>
                </div>
                <p className="text-sm font-medium">{analysis.estimated_area_sqm} м²</p>
                {analysis.ceiling_height_m && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">Потолки ~{analysis.ceiling_height_m} м</p>
                )}
              </div>
            )}

            {analysis.estimated_capacity && (
              <div className="bg-background border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Вместимость</span>
                </div>
                <p className="text-sm font-medium">~{analysis.estimated_capacity} чел.</p>
              </div>
            )}

            {analysis.estimated_total_budget && (
              <div className="bg-background border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Бюджет декора</span>
                </div>
                <p className="text-sm font-medium">{analysis.estimated_total_budget}</p>
              </div>
            )}
          </div>

          {/* Overall recommendation */}
          <div className="bg-primary/5 border border-primary/20 p-5">
            <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-2">Рекомендация</p>
            <p className="text-sm font-light leading-relaxed">{analysis.overall_recommendation}</p>
          </div>

          {/* Decoration zones */}
          <div className="bg-background border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-primary" />
              <h3 className="text-sm font-medium">Зоны декорирования</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">{analysis.decoration_zones.length} зон</span>
            </div>
            <div className="space-y-2">
              {analysis.decoration_zones.map((zone, i) => {
                const ZoneIcon = ZONE_TYPE_ICONS[zone.zone_type] || Target;
                const isExpanded = expandedZone === i;
                return (
                  <div key={i} className="border border-border/60">
                    <button
                      onClick={() => setExpandedZone(isExpanded ? null : i)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      <ZoneIcon size={14} className="text-primary shrink-0" />
                      <span className="text-sm font-medium flex-1">{zone.zone_name}</span>
                      <span className={cn(
                        "text-[8px] uppercase tracking-wider px-2 py-0.5 border rounded-sm shrink-0",
                        PRIORITY_STYLES[zone.priority] || "bg-muted"
                      )}>
                        {PRIORITY_LABELS[zone.priority] || zone.priority}
                      </span>
                      {zone.estimated_budget_range && (
                        <span className="text-[10px] text-muted-foreground shrink-0">{zone.estimated_budget_range}</span>
                      )}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0">
                        <p className="text-xs font-light text-muted-foreground leading-relaxed pl-7">
                          {zone.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lighting + Colors side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Lighting */}
            <div className="bg-background border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={16} className="text-primary" />
                <h3 className="text-sm font-medium">Освещение</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Естественный свет:</span>{" "}
                  <span className="font-medium capitalize">{analysis.lighting_analysis.natural_light}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Существующее:</span>{" "}
                  <span className="font-light">{analysis.lighting_analysis.existing_fixtures}</span>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <span className="text-primary text-[10px] uppercase tracking-wider font-medium">Рекомендации</span>
                  <p className="font-light mt-1 leading-relaxed">{analysis.lighting_analysis.recommendations}</p>
                </div>
              </div>
            </div>

            {/* Color scheme */}
            <div className="bg-background border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Palette size={16} className="text-primary" />
                <h3 className="text-sm font-medium">Цветовая схема</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Основные</span>
                  <div className="flex gap-2 mt-1.5">
                    {analysis.color_scheme_recommendation.primary_colors.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-muted/50 border border-border text-xs">{c}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Акценты</span>
                  <div className="flex gap-2 mt-1.5">
                    {analysis.color_scheme_recommendation.accent_colors.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-xs">{c}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs font-light text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
                  {analysis.color_scheme_recommendation.reasoning}
                </p>
              </div>
            </div>
          </div>

          {/* Architectural features */}
          {analysis.architectural_features && analysis.architectural_features.length > 0 && (
            <div className="bg-background border border-border p-5">
              <h3 className="text-sm font-medium mb-3">Архитектурные особенности</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.architectural_features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 border border-border/40">
                    <span className={cn(
                      "w-2 h-2 rounded-full mt-1 shrink-0",
                      f.decor_potential === "high" ? "bg-emerald-500" : f.decor_potential === "medium" ? "bg-amber-500" : "bg-muted-foreground/30"
                    )} />
                    <div>
                      <p className="text-xs font-medium">{f.feature}</p>
                      <p className="text-[10px] text-muted-foreground">{f.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing elements */}
          {analysis.existing_elements && analysis.existing_elements.length > 0 && (
            <div className="bg-background border border-border p-5">
              <h3 className="text-sm font-medium mb-3">Существующие элементы</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.existing_elements.map((el, i) => (
                  <span key={i} className="px-3 py-1.5 bg-muted/50 border border-border text-xs">
                    {el.element}
                    {el.count ? ` (×${el.count})` : ""}
                    {el.condition ? ` — ${el.condition}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminVenueAnalyzer;
