import { useState, useEffect } from "react";
import { Sparkles, Trash2, Send, Download, Eye, Calendar, Users, Palette, Clock, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendTelegramMessage } from "./AdminTelegramSettings";
import { exportConceptToPDF } from "@/lib/exportConceptPDF";

export type SavedConcept = {
    id: string;
    eventType: string;
    venueType: string;
    guestCount: string;
    colorPalette: string;
    decorStyle: string;
    conceptName: string;
    conceptDescription: string;
    colorHexCodes: string[];
    colorNames: string[];
    decorElements: { name: string; description: string }[];
    venuePhotoUrl?: string;
    savedAt: string;
};

const LS_KEY = "kiki_saved_concepts";

export const saveConcept = (concept: Omit<SavedConcept, "id" | "savedAt">) => {
    const all = getSavedConcepts();
    const newConcept: SavedConcept = { ...concept, id: Date.now().toString(), savedAt: new Date().toISOString() };
    localStorage.setItem(LS_KEY, JSON.stringify([newConcept, ...all]));
    return newConcept;
};

export const getSavedConcepts = (): SavedConcept[] => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
    catch { return []; }
};

const AdminSavedConcepts = () => {
    const [concepts, setConcepts] = useState<SavedConcept[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [sending, setSending] = useState<string | null>(null);
    const [exportingId, setExportingId] = useState<string | null>(null);

    const handleExportPDF = async (c: SavedConcept) => {
        setExportingId(c.id);
        try {
            await exportConceptToPDF({
                conceptName: c.conceptName,
                conceptDescription: c.conceptDescription,
                colorPalette: c.colorNames,
                colorHexCodes: c.colorHexCodes,
                decorElements: c.decorElements?.map(el => ({ ...el, category: "focal" })),
                estimatedComplexity: undefined,
            }, { eventType: c.eventType, venueType: c.venueType, guestCount: c.guestCount, decorStyle: c.decorStyle });
            toast.success("📄 PDF скачан!");
        } catch { toast.error("Ошибка экспорта PDF"); }
        finally { setExportingId(null); }
    };

    useEffect(() => { setConcepts(getSavedConcepts()); }, []);

    const deleteConcept = (id: string) => {
        if (!confirm("Удалить эту концепцию?")) return;
        const updated = concepts.filter(c => c.id !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(updated));
        setConcepts(updated);
        toast.success("Удалено");
        if (expanded === id) setExpanded(null);
    };

    const exportAll = () => {
        const blob = new Blob([JSON.stringify(concepts, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "kiki-concepts.json"; a.click();
        URL.revokeObjectURL(url);
    };

    const sendToTelegram = async (c: SavedConcept) => {
        setSending(c.id);
        const text = `🎨 <b>Новая концепция декора — KiKi Admin</b>\n\n` +
            `📋 <b>${c.conceptName}</b>\n\n` +
            `🎉 Тип: ${c.eventType}\n` +
            `🏛 Площадка: ${c.venueType}\n` +
            `👥 Гостей: ${c.guestCount}\n` +
            `🎨 Стиль: ${c.decorStyle}\n` +
            `🌸 Палитра: ${c.colorPalette}\n\n` +
            `📝 ${c.conceptDescription}\n\n` +
            `🕐 ${new Date(c.savedAt).toLocaleString("ru-RU")}`;
        const ok = await sendTelegramMessage(text, c.venuePhotoUrl);
        setSending(null);
        if (ok) toast.success("Отправлено в Telegram!");
        else toast.error("Ошибка отправки. Проверьте Telegram настройки.");
    };

    if (concepts.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <Sparkles size={48} style={{ color: "#D1D5DB", margin: "0 auto 16px", display: "block" }} />
                <h3 style={{ fontWeight: 700, color: "#555", marginBottom: "8px" }}>Нет сохранённых концепций</h3>
                <p style={{ color: "#888", fontSize: "0.875rem" }}>Сгенерируйте концепцию в AI Генераторе и нажмите «Сохранить»</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#000", margin: "0 0 4px" }}>AI Концепции</h2>
                    <p style={{ fontSize: "0.875rem", color: "#666", margin: 0 }}>{concepts.length} сохранённых концепций</p>
                </div>
                <button onClick={exportAll} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", background: "#F3F4F6", border: "1px solid #E5E5E5", color: "#555", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
                    <Download size={14} /> Экспорт JSON
                </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {concepts.map(c => (
                    <div key={c.id} style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                        {/* Header */}
                        <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                            {c.venuePhotoUrl && (
                                <img src={c.venuePhotoUrl} alt="" style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid #F0F0F0" }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "1rem", color: "#000" }}>{c.conceptName}</p>
                                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#666" }}><Calendar size={11} />{c.eventType}</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#666" }}><Users size={11} />{c.guestCount} гостей</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#666" }}><Palette size={11} />{c.colorPalette}</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#999" }}><Clock size={11} />{new Date(c.savedAt).toLocaleDateString("ru-RU")}</span>
                                </div>
                            </div>

                            {/* Color dots */}
                            <div style={{ display: "flex", gap: "4px" }}>
                                {c.colorHexCodes?.slice(0, 5).map((hex, i) => (
                                    <div key={i} style={{ width: "18px", height: "18px", borderRadius: "50%", background: hex, border: "1px solid rgba(0,0,0,0.1)" }} title={c.colorNames?.[i]} />
                                ))}
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                                <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} style={{ padding: "7px 12px", borderRadius: "7px", border: "1px solid #E5E5E5", background: expanded === c.id ? "#F0EDFF" : "#F5F5F5", color: expanded === c.id ? "#7C3AED" : "#555", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Eye size={13} /> {expanded === c.id ? "Скрыть" : "Открыть"}
                                </button>
                                <button onClick={() => sendToTelegram(c)} disabled={sending === c.id} style={{ padding: "7px 12px", borderRadius: "7px", border: "1px solid #BBF7D0", background: "#F0FDF4", color: "#15803D", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", opacity: sending === c.id ? 0.6 : 1 }}>
                                    <Send size={13} /> TG
                                </button>
                                <button onClick={() => deleteConcept(c.id)} style={{ padding: "7px 12px", borderRadius: "7px", border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Expanded */}
                        {expanded === c.id && (
                            <div style={{ borderTop: "1px solid #F5F5F5", padding: "16px 18px", background: "#FAFAFA" }}>
                                <p style={{ fontSize: "0.875rem", color: "#333", lineHeight: 1.6, marginBottom: "16px" }}>{c.conceptDescription}</p>
                                {c.decorElements?.length > 0 && (
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#000", marginBottom: "8px" }}>Элементы декора:</p>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                                            {c.decorElements.slice(0, 6).map((el, i) => (
                                                <div key={i} style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "8px", padding: "10px 12px" }}>
                                                    <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: "0.8125rem", color: "#000" }}>{el.name}</p>
                                                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#666", lineHeight: 1.5 }}>{el.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSavedConcepts;
