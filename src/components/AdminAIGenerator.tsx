import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles, Loader2, Palette, Lightbulb, Flower2, UtensilsCrossed,
  Layers, Upload, Camera, Image as ImageIcon, Star, Armchair,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DecorConcept = {
  conceptName: string;
  conceptDescription: string;
  colorPalette: string[];
  colorHexCodes: string[];
  decorElements: { name: string; description: string; category: string }[];
  flowerArrangements: { name: string; flowers: string[]; placement: string; style: string }[];
  lightingIdeas: { element: string; placement: string; effect: string }[];
  backdropIdeas: { name: string; description: string; purpose: string }[];
  tableDecoration: {
    style: string;
    centerpiece: string;
    tableware: string;
    accents: string;
    runner?: string;
  };
  estimatedComplexity: string;
  venueSpecificNotes?: string;
  inspirationImages: string[];
};

const EVENT_TYPES = ["Свадьба", "День рождения", "Юбилей", "Корпоратив", "Предложение руки", "Детский праздник", "Выпускной"];
const VENUE_TYPES = ["Ресторан", "Банкетный зал", "Лофт", "На открытом воздухе", "Шатёр", "Загородный дом", "Яхта", "Отель"];
const DECOR_STYLES = [
  "Классический элегантный", "Романтический", "Минимализм", "Бохо", "Рустик",
  "Гламур", "Арт-деко", "Тропический", "Эко", "Современный люкс",
];

const COMPLEXITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: "Базовая", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  medium: { label: "Средняя", color: "bg-amber-50 text-amber-800 border-amber-200" },
  high: { label: "Высокая", color: "bg-orange-50 text-orange-800 border-orange-200" },
  ultra: { label: "Премиум", color: "bg-violet-50 text-violet-800 border-violet-200" },
};

const CATEGORY_ICONS: Record<string, typeof Layers> = {
  focal: Star,
  table: UtensilsCrossed,
  ambient: Lightbulb,
  entrance: Armchair,
  ceiling: Layers,
  wall: ImageIcon,
  floor: Layers,
};

const PURPOSE_LABELS: Record<string, string> = {
  photo_zone: "Фотозона",
  stage_backdrop: "Задник сцены",
  entrance: "Вход",
  head_table: "Президиум",
};

const AdminAIGenerator = () => {
  const [eventType, setEventType] = useState("");
  const [venueType, setVenueType] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [decorStyle, setDecorStyle] = useState("");
  const [venuePhotoUrl, setVenuePhotoUrl] = useState<string | null>(null);
  const [venuePreview, setVenuePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [concept, setConcept] = useState<DecorConcept | null>(null);
  const [activeTab, setActiveTab] = useState<"elements" | "flowers" | "lighting" | "backdrops" | "table">("elements");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = eventType && venueType && colorPalette && guestCount;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Загрузите изображение"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Макс. 10 МБ"); return; }

    const reader = new FileReader();
    reader.onload = (ev) => setVenuePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    const fileName = `concept-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("venue-photos").upload(fileName, file, { contentType: file.type });
    if (error) { toast.error("Ошибка загрузки"); return; }

    const { data: urlData } = supabase.storage.from("venue-photos").getPublicUrl(data.path);
    setVenuePhotoUrl(urlData.publicUrl);
    toast.success("Фото загружено");
  };

  const generate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setConcept(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-decor-concept", {
        body: { eventType, venueType, colorPalette, guestCount, decorStyle, venuePhotoUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setConcept(data);
      toast.success("Концепция сгенерирована!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка генерации");
    } finally {
      setGenerating(false);
    }
  };

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">{label} *</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 border border-border bg-transparent text-sm focus:outline-none focus:border-primary transition-colors"
      >
        <option value="">Выберите...</option>
        {options.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      {/* Input form */}
      <div className="bg-background border border-border p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles size={20} strokeWidth={1.5} className="text-primary" />
          <h3 className="font-display text-lg font-light">Параметры концепции</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Venue photo */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer relative overflow-hidden flex items-center justify-center aspect-[4/3] lg:row-span-2",
            )}
          >
            {venuePreview ? (
              <>
                <img src={venuePreview} alt="Venue" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <Upload size={28} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">Фото площадки</p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">(опционально)</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>

          {/* Parameters */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Тип мероприятия" value={eventType} onChange={setEventType} options={EVENT_TYPES} />
            <SelectField label="Тип площадки" value={venueType} onChange={setVenueType} options={VENUE_TYPES} />
            <SelectField label="Стиль декора" value={decorStyle} onChange={setDecorStyle} options={DECOR_STYLES} />
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Кол-во гостей *</label>
              <Input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="80" className="h-10 rounded-none border-border" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Цветовая палитра *</label>
              <Input value={colorPalette} onChange={e => setColorPalette(e.target.value)} placeholder="Пудровый, золотой, слоновая кость, зелёный..." className="h-10 rounded-none border-border" />
            </div>
          </div>
        </div>

        <Button onClick={generate} disabled={!canGenerate || generating} className="rounded-none gap-2 mt-6 h-12 px-8 text-xs uppercase tracking-wider">
          {generating ? <><Loader2 size={16} className="animate-spin" /> Генерирую концепцию...</> : <><Sparkles size={16} /> Сгенерировать концепцию</>}
        </Button>
      </div>

      {/* ═══ Results ═══ */}
      {concept && (
        <div className="space-y-6 animate-in fade-in duration-700">
          {/* Header + concept name */}
          <div className="bg-background border border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-2xl md:text-3xl font-light">{concept.conceptName}</h3>
                  {concept.estimatedComplexity && COMPLEXITY_MAP[concept.estimatedComplexity] && (
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", COMPLEXITY_MAP[concept.estimatedComplexity].color)}>
                      {COMPLEXITY_MAP[concept.estimatedComplexity].label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{concept.conceptDescription}</p>
              </div>
            </div>

            {/* Venue-specific notes */}
            {concept.venueSpecificNotes && (
              <div className="mt-4 bg-primary/5 border border-primary/20 p-4">
                <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-1">Заметки по площадке</p>
                <p className="text-xs font-light leading-relaxed">{concept.venueSpecificNotes}</p>
              </div>
            )}
          </div>

          {/* Color Palette */}
          <div className="bg-background border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={16} className="text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Цветовая палитра</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {concept.colorHexCodes?.map((hex, i) => (
                <div key={i} className="flex items-center gap-3 border border-border px-4 py-3">
                  <div className="w-10 h-10 rounded-full border border-border/50 shadow-sm" style={{ backgroundColor: hex }} />
                  <div>
                    <p className="text-sm font-medium">{concept.colorPalette?.[i]}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabbed content: Elements / Flowers / Lighting / Backdrops / Table */}
          <div className="bg-background border border-border">
            <div className="flex border-b border-border overflow-x-auto">
              {([
                { key: "elements", label: "Элементы декора", icon: Layers },
                { key: "flowers", label: "Флористика", icon: Flower2 },
                { key: "lighting", label: "Освещение", icon: Lightbulb },
                { key: "backdrops", label: "Задники и зоны", icon: ImageIcon },
                { key: "table", label: "Сервировка", icon: UtensilsCrossed },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px",
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Decor Elements */}
              {activeTab === "elements" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {concept.decorElements?.map((el, i) => {
                    const Icon = CATEGORY_ICONS[el.category] || Layers;
                    return (
                      <div key={i} className="border border-border p-4 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={14} className="text-primary shrink-0" />
                          <p className="text-sm font-medium">{el.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{el.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Flower Arrangements */}
              {activeTab === "flowers" && (
                <div className="space-y-4">
                  {concept.flowerArrangements?.map((arr, i) => (
                    <div key={i} className="border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flower2 size={14} className="text-primary" />
                        <p className="text-sm font-medium">{arr.name}</p>
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary ml-auto">{arr.style}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {arr.flowers.map((f, j) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 bg-muted/50 border border-border">{f}</span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground"><span className="font-medium">Размещение:</span> {arr.placement}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Lighting Ideas */}
              {activeTab === "lighting" && (
                <div className="space-y-3">
                  {concept.lightingIdeas?.map((idea, i) => (
                    <div key={i} className="border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={14} className="text-primary" />
                        <p className="text-sm font-medium">{idea.element}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Расположение:</span> {idea.placement}</p>
                      <p className="text-xs text-muted-foreground"><span className="font-medium">Эффект:</span> {idea.effect}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Backdrop Ideas */}
              {activeTab === "backdrops" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {concept.backdropIdeas?.map((bd, i) => (
                    <div key={i} className="border border-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{bd.name}</p>
                        <span className="text-[8px] uppercase tracking-wider px-2 py-0.5 bg-muted/50 border border-border">
                          {PURPOSE_LABELS[bd.purpose] || bd.purpose}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{bd.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Table Decoration */}
              {activeTab === "table" && concept.tableDecoration && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Стиль", value: concept.tableDecoration.style, icon: UtensilsCrossed },
                      { label: "Центральная композиция", value: concept.tableDecoration.centerpiece, icon: Flower2 },
                      { label: "Посуда и текстиль", value: concept.tableDecoration.tableware, icon: Layers },
                      { label: "Акценты", value: concept.tableDecoration.accents, icon: Star },
                    ].map((item, i) => (
                      <div key={i} className="border border-border p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon size={14} className="text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</span>
                        </div>
                        <p className="text-sm font-light leading-relaxed">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {concept.tableDecoration.runner && (
                    <div className="border border-border p-4">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Дорожка / скатерть</span>
                      <p className="text-sm font-light mt-1">{concept.tableDecoration.runner}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Inspiration Images */}
          {concept.inspirationImages && concept.inspirationImages.length > 0 && (
            <div className="bg-background border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={16} className="text-primary" />
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Визуальная инспирация</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {concept.inspirationImages.map((img, i) => (
                  <div key={i} className="aspect-square border border-border overflow-hidden group">
                    <img
                      src={img}
                      alt={`Inspiration ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
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
