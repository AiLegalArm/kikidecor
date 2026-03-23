import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import ConceptChat from "./ConceptChat";
import {
  Sparkles, Loader2, Upload, Camera, Lightbulb, Flower2,
  RotateCcw, Building2, Lamp, Paintbrush, FileDown,
} from "lucide-react";
import { exportConceptToPDF } from "@/lib/exportConceptPDF";
import { toast } from "sonner";

type FacadeConcept = {
  conceptName: string;
  conceptDescription: string;
  colorPalette: string[];
  colorHexCodes: string[];
  facadeElements: { name: string; description: string; placement: string; category: string }[];
  lightingPlan: { element: string; placement: string; effect: string }[];
  floralInstallations?: { name: string; flowers: string[]; placement: string; scale?: string }[];
  estimatedComplexity: string;
  estimatedBudget?: string;
  architecturalNotes?: string;
  generatedImages: string[];
};

const FACADE_STYLES = [
  "Классический", "Романтический", "Минимализм", "Гламур",
  "Рустик", "Арт-деко", "Тропический", "Современный люкс", "Сказочный",
];

const COMPLEXITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: "Базовая", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  medium: { label: "Средняя", color: "bg-amber-50 text-amber-700 border-amber-200" },
  high: { label: "Высокая", color: "bg-orange-50 text-orange-700 border-orange-200" },
  ultra: { label: "Премиум", color: "bg-violet-50 text-violet-700 border-violet-200" },
};

const CATEGORY_ICONS: Record<string, typeof Building2> = {
  entrance: Building2, walls: Paintbrush, windows: Building2,
  roof: Building2, columns: Building2, garden: Flower2,
  lighting: Lamp, drapery: Paintbrush,
};

const AdminFacadeGenerator = () => {
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [concept, setConcept] = useState<FacadeConcept | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"elements" | "lighting" | "floral">("elements");
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = description.trim().length >= 5;

  const handleExportPDF = async () => {
    if (!concept) return;
    setExporting(true);
    try {
      await exportConceptToPDF(concept, { decorStyle: style });
      toast.success("📄 PDF скачан!");
    } catch { toast.error("Ошибка экспорта PDF"); }
    finally { setExporting(false); }
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Загрузите изображение"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Макс. 10 МБ"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    const fileName = `facade-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("venue-photos").upload(fileName, file, { contentType: file.type });
    setUploading(false);
    if (error) { toast.error("Ошибка загрузки"); return; }
    const { data: urlData } = supabase.storage.from("venue-photos").getPublicUrl(data.path);
    setImageUrl(urlData.publicUrl);
    toast.success("✅ Фото загружено");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files?.[0]) uploadFile(e.dataTransfer.files[0]);
  };

  const generate = async () => {
    if (!canGenerate) return;
    setGenerating(true); setConcept(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-facade", {
        body: { description: description.trim(), imageUrl, style, colorPalette: colorPalette || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.message || data.error);
      setConcept(data);
      toast.success("🏛️ Концепция фасада сгенерирована!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка генерации");
    } finally { setGenerating(false); }
  };

  const reset = () => {
    setConcept(null); setDescription(""); setStyle("");
    setColorPalette(""); setImagePreview(null); setImageUrl(null);
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#000", margin: "0 0 4px", fontFamily: '"Cormorant Garamond", serif' }}>
            AI Генератор фасадов
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#666", margin: 0 }}>
            Генерация декора фасадов по описанию и фотографии здания
          </p>
        </div>
        {concept && (
          <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #E5E5E5", background: "#F5F5F5", color: "#555", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
            <RotateCcw size={14} /> Новая концепция
          </button>
        )}
      </div>

      {!concept && (
        <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #D97706, #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={16} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9375rem", color: "#000" }}>Параметры фасада</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Опишите желаемый декор и загрузите фото здания</p>
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            <div style={{ display: "grid", gap: "24px" }} className="grid-cols-1 md:grid-cols-[300px_1fr]">
              {/* Upload zone */}
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragOver ? "#D97706" : imagePreview ? "transparent" : "#E0E0E0"}`,
                  borderRadius: "14px", cursor: uploading ? "default" : "pointer",
                  position: "relative", overflow: "hidden", minHeight: "280px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: dragOver ? "#FEF3C7" : imagePreview ? "#000" : "#F9F9F9",
                  transition: "all 0.2s",
                }}
              >
                {uploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
                    <Loader2 size={28} style={{ color: "#D97706" }} className="animate-spin" />
                  </div>
                )}
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Building" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}>
                      <Camera size={28} color="white" style={{ marginBottom: "8px" }} />
                      <p style={{ color: "#fff", fontSize: "0.8125rem", fontWeight: 600 }}>Сменить фото</p>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                      <Upload size={24} style={{ color: "#D97706" }} />
                    </div>
                    <p style={{ fontWeight: 700, color: "#333", margin: "0 0 4px", fontSize: "0.9375rem" }}>Фото здания / фасада</p>
                    <p style={{ fontSize: "0.8125rem", color: "#888", margin: "0 0 6px" }}>Нажмите или перетащите</p>
                    <p style={{ fontSize: "0.75rem", color: "#BBB" }}>PNG, JPG до 10 МБ</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
              </div>

              {/* Parameters */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={labelSt}>Описание декора фасада *</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Опишите желаемый декор фасада: цветочные арки у входа, гирлянды огней по периметру, драпировка колонн тканью..."
                    rows={5}
                    style={{
                      width: "100%", padding: "12px", border: "1px solid #E5E5E5", borderRadius: "10px",
                      fontSize: "0.875rem", color: "#111", fontWeight: 500, outline: "none",
                      background: "#fff", resize: "vertical", fontFamily: "inherit",
                    }}
                  />
                  <p style={{ fontSize: "0.7rem", color: "#999", marginTop: "4px" }}>
                    Минимум 5 символов • Чем подробнее описание, тем точнее результат
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label style={labelSt}>Стиль декора</label>
                    <select value={style} onChange={e => setStyle(e.target.value)} style={sel}>
                      <option value="">Выберите...</option>
                      {FACADE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelSt}>Цветовая палитра</label>
                    <input
                      value={colorPalette}
                      onChange={e => setColorPalette(e.target.value)}
                      placeholder="Белый, золотой, зелень..."
                      style={{ ...sel, backgroundImage: "none" }}
                    />
                  </div>
                </div>

                <button
                  onClick={generate}
                  disabled={!canGenerate || generating}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                    background: canGenerate && !generating
                      ? "linear-gradient(135deg, #D97706, #F59E0B)"
                      : "#E5E5E5",
                    color: canGenerate && !generating ? "#fff" : "#999",
                    fontWeight: 700, fontSize: "0.9375rem", cursor: canGenerate && !generating ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "all 0.2s", marginTop: "8px",
                  }}
                >
                  {generating ? (
                    <><Loader2 size={18} className="animate-spin" /> Генерация фасада... (30-60 сек)</>
                  ) : (
                    <><Building2 size={18} /> Сгенерировать декор фасада</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {concept && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Header card */}
          <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#000", margin: "0 0 8px", fontFamily: '"Cormorant Garamond", serif' }}>
                  {concept.conceptName}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.6, margin: "0 0 16px" }}>
                  {concept.conceptDescription}
                </p>
                {concept.estimatedComplexity && (
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${COMPLEXITY_MAP[concept.estimatedComplexity]?.color || ""}`}>
                    {COMPLEXITY_MAP[concept.estimatedComplexity]?.label || concept.estimatedComplexity}
                  </span>
                )}
                {concept.estimatedBudget && (
                  <span style={{ marginLeft: "8px", fontSize: "0.8125rem", color: "#888" }}>
                    💰 {concept.estimatedBudget}
                  </span>
                )}
              </div>
              {/* Color palette */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {(concept.colorHexCodes || []).map((hex, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: hex, border: "2px solid #F0F0F0" }} />
                    <p style={{ fontSize: "0.625rem", color: "#888", marginTop: "4px" }}>
                      {concept.colorPalette?.[i] || hex}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {concept.architecturalNotes && (
              <div style={{ marginTop: "16px", padding: "12px 16px", background: "#FFFBEB", borderRadius: "10px", border: "1px solid #FDE68A" }}>
                <p style={{ fontSize: "0.8125rem", color: "#92400E", margin: 0 }}>
                  🏛️ <strong>Архитектурные заметки:</strong> {concept.architecturalNotes}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
              <button onClick={handleExportPDF} disabled={exporting} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #BFDBFE", background: "#EFF6FF", color: "#1D4ED8", fontWeight: 600, fontSize: "0.8125rem", cursor: exporting ? "default" : "pointer", opacity: exporting ? 0.7 : 1 }}>
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                {exporting ? "Экспорт..." : "Скачать PDF"}
              </button>
              <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #E5E5E5", background: "#F5F5F5", color: "#555", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
                <RotateCcw size={14} /> Новая концепция
              </button>
            </div>
          </div>

          {/* Generated images */}
          {concept.generatedImages?.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#000", margin: "0 0 16px" }}>
                🎨 AI-визуализации фасада ({concept.generatedImages.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {concept.generatedImages.map((img, i) => (
                  <div key={i} style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #F0F0F0", aspectRatio: "4/3" }}>
                    <img src={img} alt={`Facade ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #F0F0F0", overflowX: "auto" }}>
              {([
                { key: "elements", label: "Элементы декора", icon: Building2 },
                { key: "lighting", label: "Освещение", icon: Lightbulb },
                { key: "floral", label: "Флористика", icon: Flower2 },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "14px 20px", border: "none", cursor: "pointer",
                    background: activeTab === tab.key ? "#fff" : "transparent",
                    borderBottom: activeTab === tab.key ? "2px solid #D97706" : "2px solid transparent",
                    color: activeTab === tab.key ? "#000" : "#888",
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: "20px" }}>
              {activeTab === "elements" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(concept.facadeElements || []).map((el, i) => {
                    const Icon = CATEGORY_ICONS[el.category] || Building2;
                    return (
                      <div key={i} style={{ padding: "16px", border: "1px solid #F0F0F0", borderRadius: "12px", background: "#FAFAFA" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <Icon size={16} style={{ color: "#D97706" }} />
                          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#000" }}>{el.name}</span>
                          <span style={{ fontSize: "0.6875rem", color: "#999", background: "#F0F0F0", padding: "2px 8px", borderRadius: "6px" }}>{el.category}</span>
                        </div>
                        <p style={{ fontSize: "0.8125rem", color: "#555", margin: "0 0 6px", lineHeight: 1.5 }}>{el.description}</p>
                        <p style={{ fontSize: "0.75rem", color: "#888", margin: 0 }}>📍 {el.placement}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "lighting" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(concept.lightingPlan || []).map((l, i) => (
                    <div key={i} style={{ padding: "16px", border: "1px solid #F0F0F0", borderRadius: "12px", background: "#FAFAFA" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Lightbulb size={16} style={{ color: "#F59E0B" }} />
                        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#000" }}>{l.element}</span>
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "#555", margin: "0 0 6px" }}>📍 {l.placement}</p>
                      <p style={{ fontSize: "0.8125rem", color: "#D97706", margin: 0 }}>✨ {l.effect}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "floral" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(concept.floralInstallations || []).map((f, i) => (
                    <div key={i} style={{ padding: "16px", border: "1px solid #F0F0F0", borderRadius: "12px", background: "#FAFAFA" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Flower2 size={16} style={{ color: "#059669" }} />
                        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#000" }}>{f.name}</span>
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "#555", margin: "0 0 6px" }}>
                        🌸 {f.flowers.join(", ")}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#888", margin: 0 }}>📍 {f.placement}</p>
                      {f.scale && <p style={{ fontSize: "0.75rem", color: "#888", margin: "4px 0 0" }}>📏 {f.scale}</p>}
                    </div>
                  ))}
                  {(!concept.floralInstallations || concept.floralInstallations.length === 0) && (
                    <p style={{ color: "#999", fontSize: "0.875rem" }}>Флористические инсталляции не предусмотрены в данной концепции</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Chat for refining facade concept */}
      {concept && (
        <ConceptChat
          concept={concept}
          onConceptUpdate={(updated) => setConcept(updated)}
        />
      )}
    </div>
  );
};

export default AdminFacadeGenerator;
