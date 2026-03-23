import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Loader2, Palette, Lightbulb, Flower2, UtensilsCrossed,
  Layers, Upload, Camera, Image as ImageIcon, Star, Armchair, Send,
  BookmarkPlus, Copy, RotateCcw, ChevronDown, Check, Grid3X3, FileDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sendTelegramMessage, getTelegramSettings } from "./admin/AdminTelegramSettings";
import { saveConcept } from "./admin/AdminSavedConcepts";
import ConceptChat from "./admin/ConceptChat";

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
    style: string; centerpiece: string; tableware: string; accents: string; runner?: string;
  };
  estimatedComplexity: string;
  venueSpecificNotes?: string;
  inspirationImages: string[];
};

const EVENT_TYPES = ["Свадьба", "День рождения", "Юбилей", "Корпоратив", "Предложение руки", "Детский праздник", "Выпускной"];
const VENUE_TYPES = ["Ресторан", "Банкетный зал", "Лофт", "На открытом воздухе", "Шатёр", "Загородный дом", "Яхта", "Отель"];
const DECOR_STYLES = ["Классический элегантный", "Романтический", "Минимализм", "Бохо", "Рустик", "Гламур", "Арт-деко", "Тропический", "Эко", "Современный люкс"];
const COLOR_PRESETS = [
  { name: "Лавандовый и золотой", value: "Лавандовый, золотой, белый" },
  { name: "Пудровый и розовый", value: "Пудровый, розовый, шампань" },
  { name: "Изумрудный и золотой", value: "Изумрудный, золотой, кремовый" },
  { name: "Белый и серебро", value: "Белый, серебряный, жемчужный" },
  { name: "Burgundy и Ivory", value: "Бургундский, слоновая кость, золотой" },
  { name: "Navy и Gold", value: "Тёмно-синий, золотой, белый" },
];

const COMPLEXITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: "Базовая", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  medium: { label: "Средняя", color: "bg-amber-50 text-amber-700 border-amber-200" },
  high: { label: "Высокая", color: "bg-orange-50 text-orange-700 border-orange-200" },
  ultra: { label: "Премиум", color: "bg-violet-50 text-violet-700 border-violet-200" },
};

const CATEGORY_ICONS: Record<string, typeof Layers> = {
  focal: Star, table: UtensilsCrossed, ambient: Lightbulb,
  entrance: Armchair, ceiling: Layers, wall: ImageIcon, floor: Layers,
};

const BUDGET_BY_COMPLEXITY: Record<string, string> = {
  low: "80 000 – 150 000 ₽",
  medium: "150 000 – 350 000 ₽",
  high: "350 000 – 700 000 ₽",
  ultra: "700 000 – 2 000 000+ ₽",
};

const AdminAIGenerator = () => {
  const [eventType, setEventType] = useState("");
  const [venueType, setVenueType] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [decorStyle, setDecorStyle] = useState("");
  const [venuePhotoUrl, setVenuePhotoUrl] = useState<string | null>(null);
  const [venuePreview, setVenuePreview] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [concept, setConcept] = useState<DecorConcept | null>(null);
  const [activeTab, setActiveTab] = useState<"elements" | "flowers" | "lighting" | "backdrops" | "table">("elements");
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [moodboardImages, setMoodboardImages] = useState<{ label: string; url: string }[]>([]);
  const [generatingMoodboard, setGeneratingMoodboard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = !!(eventType && venueType && colorPalette && guestCount) || textDescription.trim().length >= 10;

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Загрузите изображение"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Макс. 10 МБ"); return; }
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (ev) => setVenuePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    const fileName = `concept-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("venue-photos").upload(fileName, file, { contentType: file.type });
    setUploadingPhoto(false);
    if (error) { toast.error("Ошибка загрузки"); return; }
    const { data: urlData } = supabase.storage.from("venue-photos").getPublicUrl(data.path);
    setVenuePhotoUrl(urlData.publicUrl);
    toast.success("✅ Фото загружено");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files?.[0]) uploadFile(e.dataTransfer.files[0]);
  };

  const generate = async () => {
    if (!canGenerate) return;
    setGenerating(true); setConcept(null); setSaved(false);

    try {
      const { data, error } = await supabase.functions.invoke("generate-decor-concept", {
        body: { eventType, venueType, colorPalette, guestCount, decorStyle, venuePhotoUrl, textDescription: textDescription.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setConcept(data);
      toast.success("✨ Концепция сгенерирована!");

      // Auto-send to Telegram if enabled
      const { autoSend } = getTelegramSettings();
      if (autoSend) {
        const text = buildTelegramMessage(data);
        await sendTelegramMessage(text, venuePhotoUrl || undefined);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка генерации");
    } finally { setGenerating(false); }
  };

  const buildTelegramMessage = (c: DecorConcept) =>
    `🎨 <b>${c.conceptName}</b>\n\n` +
    `🎉 ${eventType} • ${venueType}\n👥 ${guestCount} гостей • 🎨 ${colorPalette}\n\n` +
    `📝 ${c.conceptDescription}\n\n` +
    `🌸 Стиль: ${decorStyle || "Не указан"}\n` +
    `💰 Бюджет: ${BUDGET_BY_COMPLEXITY[c.estimatedComplexity] || "По запросу"}`;

  const handleSave = () => {
    if (!concept) return;
    saveConcept({
      eventType, venueType, guestCount, colorPalette, decorStyle,
      conceptName: concept.conceptName,
      conceptDescription: concept.conceptDescription,
      colorHexCodes: concept.colorHexCodes || [],
      colorNames: concept.colorPalette || [],
      decorElements: concept.decorElements || [],
      venuePhotoUrl: venuePhotoUrl || undefined,
    });
    setSaved(true);
    toast.success("Концепция сохранена в AI Концепции");
  };

  const handleCopy = () => {
    if (!concept) return;
    navigator.clipboard.writeText(buildTelegramMessage(concept).replace(/<[^>]+>/g, ""));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success("Скопировано");
  };

  const handleSendTelegram = async () => {
    if (!concept) return;
    setSending(true);
    const ok = await sendTelegramMessage(buildTelegramMessage(concept), venuePhotoUrl || undefined);
    setSending(false);
    if (ok) toast.success("✅ Отправлено в Telegram!");
    else toast.error("Ошибка. Настройте Telegram в разделе «Telegram»");
  };

  const reset = () => { setConcept(null); setSaved(false); setEventType(""); setVenueType(""); setColorPalette(""); setGuestCount(""); setDecorStyle(""); setVenuePreview(null); setVenuePhotoUrl(null); setMoodboardImages([]); setTextDescription(""); };

  const generateMoodboard = async () => {
    if (!concept) return;
    setGeneratingMoodboard(true);
    setMoodboardImages([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-moodboard", {
        body: {
          theme: concept.conceptName,
          style: decorStyle || "Elegant luxury",
          colorPalette,
          eventType,
          venuePhotoUrl: venuePhotoUrl || undefined,
          imageCount: 4,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.message || data.error);
      const imgs: { label: string; url: string }[] = (data.images || []).map((url: string, i: number) => ({
        label: data.labels?.[i] || `Изображение ${i + 1}`,
        url,
      }));
      setMoodboardImages(imgs);
      toast.success(`🎨 Moodboard готов (${imgs.length} изображений)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка генерации moodboard");
    } finally {
      setGeneratingMoodboard(false);
    }
  };

  const sel: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "10px",
    fontSize: "0.875rem", color: "#111", fontWeight: 500, outline: "none",
    background: "#fff", appearance: "none", cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "34px",
  };
  const labelSt: React.CSSProperties = { fontSize: "0.75rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#000", margin: "0 0 4px", fontFamily: '"Cormorant Garamond", serif' }}>AI Concept Generator</h2>
          <p style={{ fontSize: "0.875rem", color: "#666", margin: 0 }}>Создавайте профессиональные концепции декора с помощью AI</p>
        </div>
        {concept && (
          <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #E5E5E5", background: "#F5F5F5", color: "#555", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
            <RotateCcw size={14} /> Новая концепция
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: concept ? "1fr" : "1fr", gap: "20px" }}>

        {/* Form card */}
        {!concept && (
          <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #7C3AED, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9375rem", color: "#000" }}>Параметры концепции</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Заполните поля для генерации AI концепции декора</p>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gap: "24px" }} className="grid-cols-1 md:grid-cols-[300px_1fr]">

                {/* Upload zone */}
                <div
                  onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragOver ? "#7C3AED" : venuePreview ? "transparent" : "#E0E0E0"}`,
                    borderRadius: "14px",
                    cursor: uploadingPhoto ? "default" : "pointer",
                    position: "relative",
                    overflow: "hidden",
                    minHeight: "280px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: dragOver ? "#F0EDFF" : venuePreview ? "#000" : "#F9F9F9",
                    transition: "all 0.2s",
                  }}
                >
                  {uploadingPhoto && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
                      <Loader2 size={28} style={{ color: "#7C3AED" }} className="animate-spin" />
                    </div>
                  )}
                  {venuePreview ? (
                    <>
                      <img src={venuePreview} alt="Venue" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}>
                        <Camera size={28} color="white" style={{ marginBottom: "8px" }} />
                        <p style={{ color: "#fff", fontSize: "0.8125rem", fontWeight: 600 }}>Сменить фото</p>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "24px" }}>
                      <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#F0EDFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                        <Upload size={24} style={{ color: "#7C3AED" }} />
                      </div>
                      <p style={{ fontWeight: 700, color: "#333", margin: "0 0 4px", fontSize: "0.9375rem" }}>Фото площадки</p>
                      <p style={{ fontSize: "0.8125rem", color: "#888", margin: "0 0 6px" }}>Нажмите или перетащите</p>
                      <p style={{ fontSize: "0.75rem", color: "#BBB" }}>PNG, JPG до 10 МБ (опционально)</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                </div>

                {/* Parameters */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label style={labelSt}>Тип мероприятия *</label>
                      <select value={eventType} onChange={e => setEventType(e.target.value)} style={sel}>
                        <option value="">Выберите...</option>
                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelSt}>Тип площадки *</label>
                      <select value={venueType} onChange={e => setVenueType(e.target.value)} style={sel}>
                        <option value="">Выберите...</option>
                        {VENUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label style={labelSt}>Стиль декора</label>
                      <select value={decorStyle} onChange={e => setDecorStyle(e.target.value)} style={sel}>
                        <option value="">Выберите...</option>
                        {DECOR_STYLES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelSt}>Кол-во гостей *</label>
                      <input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="80"
                        style={{ ...sel, backgroundImage: "none" }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelSt}>Цветовая палитра *</label>
                    <input value={colorPalette} onChange={e => setColorPalette(e.target.value)}
                      placeholder="Пудровый, золотой, слоновая кость..."
                      style={{ ...sel, backgroundImage: "none" }} />
                    {/* Presets */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                      {COLOR_PRESETS.map(p => (
                        <button key={p.name} onClick={() => setColorPalette(p.value)}
                          style={{ padding: "4px 10px", borderRadius: "20px", border: `1px solid ${colorPalette === p.value ? "#7C3AED" : "#E5E5E5"}`, background: colorPalette === p.value ? "#F0EDFF" : "#fff", color: colorPalette === p.value ? "#7C3AED" : "#555", fontSize: "0.7375rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text description */}
                  <div>
                    <label style={labelSt}>Текстовое описание</label>
                    <textarea
                      value={textDescription}
                      onChange={e => setTextDescription(e.target.value)}
                      placeholder="Опишите свою идею декора... Например: «Хочу романтическую свадьбу в стиле Прованс с лавандой, белыми свечами и винтажной мебелью на 80 гостей в загородном поместье»"
                      rows={3}
                      style={{
                        ...sel,
                        backgroundImage: "none",
                        resize: "vertical",
                        minHeight: "72px",
                        fontFamily: "inherit",
                        lineHeight: "1.5",
                      }}
                    />
                    <p style={{ fontSize: "0.6875rem", color: "#999", margin: "4px 0 0" }}>
                      💡 Можно генерировать только по описанию — без заполнения полей выше (мин. 10 символов)
                    </p>
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={generate}
                    disabled={!canGenerate || generating}
                    style={{
                      marginTop: "4px",
                      padding: "15px 24px",
                      borderRadius: "12px",
                      border: "none",
                      background: !canGenerate ? "#D1D5DB" : "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      cursor: !canGenerate || generating ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                      transition: "all 0.2s",
                      boxShadow: canGenerate ? "0 4px 16px rgba(124,58,237,0.35)" : "none",
                    }}
                    onMouseEnter={e => { if (canGenerate && !generating) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                  >
                    {generating ? (
                      <><Loader2 size={18} className="animate-spin" /> Генерирую концепцию...</>
                    ) : (
                      <><Sparkles size={18} /> Сгенерировать концепцию</>
                    )}
                  </button>

                  {generating && (
                    <div style={{ background: "#F0EDFF", borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <Loader2 size={16} style={{ color: "#7C3AED", flexShrink: 0 }} className="animate-spin" />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8125rem", color: "#5B21B6" }}>AI анализирует данные...</p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#7C3AED" }}>Обычно занимает 10–20 секунд</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {concept && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Concept header + actions */}
            <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "24px", display: "grid", gridTemplateColumns: venuePreview ? "200px 1fr" : "1fr", gap: "20px" }} className="max-sm:grid-cols-1">
                {venuePreview && (
                  <div style={{ borderRadius: "12px", overflow: "hidden", height: "160px" }}>
                    <img src={venuePreview} alt="Venue" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <div>
                      <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.75rem", fontWeight: 700, color: "#000", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                        {concept.conceptName}
                      </h2>
                      {concept.estimatedComplexity && COMPLEXITY_MAP[concept.estimatedComplexity] && (
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: "20px", border: "1px solid", fontSize: "0.75rem", fontWeight: 700 }} className={COMPLEXITY_MAP[concept.estimatedComplexity].color}>
                          {COMPLEXITY_MAP[concept.estimatedComplexity].label}
                        </span>
                      )}
                    </div>
                    {/* Budget */}
                    <div style={{ background: "#FAFAFA", border: "1px solid #EAEAEA", borderRadius: "10px", padding: "10px 16px", textAlign: "center", flexShrink: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: "0.625rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Бюджет</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "#000" }}>
                        {BUDGET_BY_COMPLEXITY[concept.estimatedComplexity] || "По запросу"}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#444", lineHeight: 1.65, margin: "0 0 16px" }}>{concept.conceptDescription}</p>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={handleSave}
                      disabled={saved}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "none", background: saved ? "#F0FDF4" : "#000", color: saved ? "#16A34A" : "#fff", fontWeight: 600, fontSize: "0.8125rem", cursor: saved ? "default" : "pointer", transition: "all 0.15s" }}
                    >
                      {saved ? <><Check size={14} /> Сохранено</> : <><BookmarkPlus size={14} /> Сохранить</>}
                    </button>
                    <button
                      onClick={generateMoodboard}
                      disabled={generatingMoodboard}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "none", background: generatingMoodboard ? "#E9D5FF" : "linear-gradient(135deg, #7C3AED, #A78BFA)", color: "#fff", fontWeight: 600, fontSize: "0.8125rem", cursor: generatingMoodboard ? "default" : "pointer", opacity: generatingMoodboard ? 0.8 : 1, transition: "all 0.15s" }}
                    >
                      {generatingMoodboard ? <Loader2 size={14} className="animate-spin" /> : <Grid3X3 size={14} />}
                      {generatingMoodboard ? "Генерация..." : "Moodboard"}
                    </button>
                    <button onClick={handleSendTelegram} disabled={sending} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #BBF7D0", background: "#F0FDF4", color: "#15803D", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", opacity: sending ? 0.7 : 1 }}>
                      {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Telegram
                    </button>
                    <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #E5E5E5", background: "#F5F5F5", color: "#555", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Скопировано" : "Копировать"}
                    </button>
                    <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #E5E5E5", background: "#fff", color: "#555", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
                      <RotateCcw size={14} /> Новая
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Color palette */}
            <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Palette size={16} style={{ color: "#7C3AED" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Цветовая палитра</span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {concept.colorHexCodes?.map((hex, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: "1px solid #F0F0F0", background: "#FAFAFA" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: hex, border: "2px solid rgba(255,255,255,0.8)", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "#111" }}>{concept.colorPalette?.[i]}</p>
                      <p style={{ margin: 0, fontSize: "0.7rem", color: "#888", fontFamily: "monospace", textTransform: "uppercase" }}>{hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabbed content */}
            <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", borderBottom: "1px solid #F0F0F0", overflowX: "auto" }}>
                {([
                  { key: "elements", label: "Декор", icon: Layers },
                  { key: "flowers", label: "Флористика", icon: Flower2 },
                  { key: "lighting", label: "Свет", icon: Lightbulb },
                  { key: "backdrops", label: "Зоны", icon: ImageIcon },
                  { key: "table", label: "Стол", icon: UtensilsCrossed },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "12px 16px", border: "none", cursor: "pointer",
                      background: "transparent", fontSize: "0.8125rem", fontWeight: activeTab === tab.key ? 700 : 500,
                      color: activeTab === tab.key ? "#7C3AED" : "#666",
                      borderBottom: `2px solid ${activeTab === tab.key ? "#7C3AED" : "transparent"}`,
                      marginBottom: "-1px", whiteSpace: "nowrap", transition: "all 0.15s",
                    }}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: "20px" }}>
                {activeTab === "elements" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
                    {concept.decorElements?.map((el, i) => {
                      const Icon = CATEGORY_ICONS[el.category] || Layers;
                      return (
                        <div key={i} style={{ border: "1px solid #F0F0F0", borderRadius: "10px", padding: "14px", background: "#FAFAFA", transition: "all 0.15s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E0D9FF"; (e.currentTarget as HTMLElement).style.background = "#F8F7FF"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#F0F0F0"; (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <Icon size={14} style={{ color: "#7C3AED", flexShrink: 0 }} />
                            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "#000" }}>{el.name}</p>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.8125rem", color: "#555", lineHeight: 1.55 }}>{el.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === "flowers" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {concept.flowerArrangements?.map((arr, i) => (
                      <div key={i} style={{ border: "1px solid #F0F0F0", borderRadius: "10px", padding: "14px", background: "#FAFAFA" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <Flower2 size={14} style={{ color: "#7C3AED" }} />
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "#000" }}>{arr.name}</p>
                          <span style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: "6px", background: "#F0EDFF", color: "#7C3AED", fontSize: "0.6875rem", fontWeight: 700 }}>{arr.style}</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "6px" }}>
                          {arr.flowers.map((f, j) => <span key={j} style={{ padding: "3px 9px", borderRadius: "6px", background: "#fff", border: "1px solid #E5E5E5", fontSize: "0.75rem", color: "#555" }}>{f}</span>)}
                        </div>
                        <p style={{ margin: 0, fontSize: "0.8125rem", color: "#666" }}><span style={{ fontWeight: 600 }}>Размещение:</span> {arr.placement}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "lighting" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {concept.lightingIdeas?.map((idea, i) => (
                      <div key={i} style={{ border: "1px solid #F0F0F0", borderRadius: "10px", padding: "14px", background: "#FAFAFA" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <Lightbulb size={14} style={{ color: "#F59E0B" }} />
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "#000" }}>{idea.element}</p>
                        </div>
                        <p style={{ margin: "0 0 4px", fontSize: "0.8125rem", color: "#666" }}><span style={{ fontWeight: 600 }}>Расположение:</span> {idea.placement}</p>
                        <p style={{ margin: 0, fontSize: "0.8125rem", color: "#666" }}><span style={{ fontWeight: 600 }}>Эффект:</span> {idea.effect}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "backdrops" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
                    {concept.backdropIdeas?.map((bd, i) => (
                      <div key={i} style={{ border: "1px solid #F0F0F0", borderRadius: "10px", padding: "14px", background: "#FAFAFA" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "#000" }}>{bd.name}</p>
                          <span style={{ padding: "2px 8px", borderRadius: "6px", background: "#F0F0F0", fontSize: "0.6875rem", fontWeight: 600, color: "#555", flexShrink: 0 }}>{bd.purpose}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.8125rem", color: "#555", lineHeight: 1.55 }}>{bd.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "table" && concept.tableDecoration && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                    {[
                      { label: "Стиль", value: concept.tableDecoration.style, icon: UtensilsCrossed },
                      { label: "Центральная композиция", value: concept.tableDecoration.centerpiece, icon: Flower2 },
                      { label: "Посуда и текстиль", value: concept.tableDecoration.tableware, icon: Layers },
                      { label: "Акценты", value: concept.tableDecoration.accents, icon: Star },
                      ...(concept.tableDecoration.runner ? [{ label: "Дорожка / скатерть", value: concept.tableDecoration.runner, icon: Layers }] : []),
                    ].map((item, i) => (
                      <div key={i} style={{ border: "1px solid #F0F0F0", borderRadius: "10px", padding: "14px", background: "#FAFAFA" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
                          <item.icon size={13} style={{ color: "#7C3AED", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "#111", lineHeight: 1.55 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inspiration images (from concept generation) */}
            {concept.inspirationImages?.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <ImageIcon size={16} style={{ color: "#7C3AED" }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Визуальная инспирация · Gemini AI</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                  {concept.inspirationImages.map((img, i) => (
                    <div key={i} style={{ aspectRatio: "4/3", borderRadius: "10px", overflow: "hidden", background: "#F5F5F5", cursor: "pointer" }}
                      onClick={() => window.open(img, "_blank")}
                    >
                      <img src={img} alt={`Inspiration ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.06)"; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moodboard section */}
            {(generatingMoodboard || moodboardImages.length > 0) && (
              <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Grid3X3 size={16} style={{ color: "#7C3AED" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Moodboard · Gemini Image Gen</span>
                  </div>
                  {generatingMoodboard && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#7C3AED", fontWeight: 600 }}>
                      <Loader2 size={13} className="animate-spin" /> Генерация изображений...
                    </div>
                  )}
                </div>

                {/* Skeleton while loading */}
                {generatingMoodboard && moodboardImages.length === 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{ aspectRatio: "4/3", borderRadius: "10px", background: "linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                    ))}
                  </div>
                )}

                {/* Loaded images */}
                {moodboardImages.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                    {moodboardImages.map((img, i) => (
                      <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: "10px", overflow: "hidden", background: "#F5F5F5", cursor: "pointer" }}
                        onClick={() => window.open(img.url, "_blank")}
                      >
                        <img
                          src={img.url}
                          alt={img.label}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                          onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.06)"; }}
                          onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
                        />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.6))", padding: "20px 10px 8px", pointerEvents: "none" }}>
                          <p style={{ margin: 0, color: "#fff", fontSize: "0.6875rem", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{img.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

            {/* Venue notes */}
            {concept.venueSpecificNotes && (
              <div style={{ background: "#F8F7FF", border: "1px solid #E9D5FF", borderRadius: "12px", padding: "16px 20px" }}>
                <p style={{ margin: "0 0 6px", fontSize: "0.75rem", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em" }}>Заметки по площадке</p>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#5B21B6", lineHeight: 1.6 }}>{concept.venueSpecificNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* AI Chat for refining concept */}
        {concept && (
          <ConceptChat
            concept={concept}
            onConceptUpdate={(updated) => setConcept(updated)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminAIGenerator;
