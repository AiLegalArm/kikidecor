import { useState, useEffect } from "react";
import { Palette, Type, RotateCcw, Check, Monitor } from "lucide-react";
import { toast } from "sonner";

const LS_KEY = "kiki_brand_settings";

type BrandSettings = {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    bgColor: string;
    headingFont: string;
    bodyFont: string;
    headingSize: number;    // rem
    bodySize: number;       // rem
    menuSize: number;       // rem
    borderRadius: number;   // px
};

const DEFAULTS: BrandSettings = {
    primaryColor: "#9B87D4",
    secondaryColor: "#C9B99A",
    textColor: "#111111",
    bgColor: "#FAF9F7",
    headingFont: "Cormorant Garamond",
    bodyFont: "Montserrat",
    headingSize: 2.25,
    bodySize: 1.0,
    menuSize: 0.875,
    borderRadius: 10,
};

const FONT_OPTIONS = [
    "Cormorant Garamond", "Montserrat", "Inter", "Playfair Display",
    "Lato", "Raleway", "Roboto", "Open Sans", "Nunito", "Poppins",
];

export const getBrandSettings = (): BrandSettings => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "null") ?? DEFAULTS; }
    catch { return DEFAULTS; }
};

export const applyBrandSettings = (s: BrandSettings) => {
    const r = document.documentElement;
    // Convert hex to HSL for CSS vars
    const hex2hsl = (hex: string): string => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                default: h = ((r - g) / d + 4) / 6;
            }
        }
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    r.style.setProperty("--primary", hex2hsl(s.primaryColor));
    r.style.setProperty("--foreground", hex2hsl(s.textColor));
    r.style.setProperty("--background", hex2hsl(s.bgColor));
    r.style.setProperty("--radius", `${s.borderRadius / 16}rem`);
    // Font
    const link = document.getElementById("kiki-google-font") as HTMLLinkElement || (() => {
        const el = document.createElement("link");
        el.id = "kiki-google-font"; el.rel = "stylesheet";
        document.head.appendChild(el); return el;
    })();
    const fonts = [s.headingFont, s.bodyFont].filter((v, i, a) => a.indexOf(v) === i);
    link.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&")}&display=swap`;
    r.style.setProperty("--font-display", `"${s.headingFont}", Georgia, serif`);
    r.style.setProperty("--font-body", `"${s.bodyFont}", system-ui, sans-serif`);
    document.documentElement.style.setProperty("--heading-size", `${s.headingSize}rem`);
    document.documentElement.style.setProperty("--body-size", `${s.bodySize}rem`);
};

const AdminBrandDesign = () => {
    const [settings, setSettings] = useState<BrandSettings>(DEFAULTS);
    const [preview, setPreview] = useState(false);

    useEffect(() => { setSettings(getBrandSettings()); }, []);

    const update = (key: keyof BrandSettings, value: string | number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        if (preview) {
            const next = { ...settings, [key]: value };
            applyBrandSettings(next);
        }
    };

    const saveAndApply = () => {
        localStorage.setItem(LS_KEY, JSON.stringify(settings));
        applyBrandSettings(settings);
        toast.success("✅ Дизайн обновлён и применён к сайту!");
    };

    const reset = () => {
        setSettings(DEFAULTS);
        localStorage.setItem(LS_KEY, JSON.stringify(DEFAULTS));
        applyBrandSettings(DEFAULTS);
        toast.success("Сброшено к дефолтным настройкам");
    };

    const card: React.CSSProperties = {
        background: "#fff", border: "1px solid #EAEAEA", borderRadius: "14px",
        padding: "20px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    };
    const label: React.CSSProperties = { fontSize: "0.8125rem", fontWeight: 600, color: "#111", display: "block", marginBottom: "6px" };
    const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };
    const hint: React.CSSProperties = { fontSize: "0.75rem", color: "#888", marginTop: "4px" };

    const ColorPicker = ({ label: lbl, value, field }: { label: string; value: string; field: keyof BrandSettings }) => (
        <div>
            <label style={label}>{lbl}</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="color" value={value as string} onChange={e => update(field, e.target.value)}
                    style={{ width: "44px", height: "36px", border: "1px solid #E5E5E5", borderRadius: "8px", cursor: "pointer", padding: "2px" }} />
                <input type="text" value={value as string} onChange={e => update(field, e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "0.875rem", color: "#111", fontFamily: "monospace", outline: "none" }} />
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: value as string, border: "1px solid #E5E5E5", flexShrink: 0 }} />
            </div>
        </div>
    );

    const RangeInput = ({ label: lbl, value, field, min, max, step, unit }: { label: string; value: number; field: keyof BrandSettings; min: number; max: number; step: number; unit: string }) => (
        <div>
            <label style={label}>{lbl} — <b>{value}{unit}</b></label>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => update(field, parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#7C3AED" }} />
            <div style={{ display: "flex", justifyContent: "space-between", ...hint }}>
                <span>{min}{unit}</span><span>{max}{unit}</span>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: "720px" }}>
            <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#000", margin: "0 0 4px" }}>Brand Design</h2>
                    <p style={{ fontSize: "0.875rem", color: "#666", margin: 0 }}>Управление визуальным стилем сайта KiKi</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Live preview toggle */}
                    <button
                        onClick={() => { setPreview(v => !v); if (!preview) applyBrandSettings(settings); }}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid #E5E5E5", background: preview ? "#F0EDFF" : "#F5F5F5", color: preview ? "#7C3AED" : "#555", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}
                    >
                        <Monitor size={14} />
                        {preview ? "Live Preview ВКЛ" : "Live Preview"}
                    </button>
                    <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid #E5E5E5", background: "#FFF", color: "#666", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
                        <RotateCcw size={14} />
                        Сброс
                    </button>
                </div>
            </div>

            {/* Colors */}
            <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                    <Palette size={18} style={{ color: "#7C3AED" }} />
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "#000" }}>Цветовая схема</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={row}>
                        <ColorPicker label="Основной цвет (лавандовый)" value={settings.primaryColor} field="primaryColor" />
                        <ColorPicker label="Второстепенный (шампань)" value={settings.secondaryColor} field="secondaryColor" />
                    </div>
                    <div style={row}>
                        <ColorPicker label="Цвет текста" value={settings.textColor} field="textColor" />
                        <ColorPicker label="Цвет фона" value={settings.bgColor} field="bgColor" />
                    </div>
                </div>
            </div>

            {/* Typography */}
            <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                    <Type size={18} style={{ color: "#7C3AED" }} />
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "#000" }}>Типографика</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={row}>
                        <div>
                            <label style={label}>Шрифт заголовков</label>
                            <select value={settings.headingFont} onChange={e => update("headingFont", e.target.value)}
                                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "10px", fontSize: "0.875rem", color: "#111", outline: "none", background: "#fff", cursor: "pointer" }}>
                                {FONT_OPTIONS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                            </select>
                            <p style={{ ...hint, fontFamily: settings.headingFont }}>Пример: {settings.headingFont}</p>
                        </div>
                        <div>
                            <label style={label}>Шрифт текста</label>
                            <select value={settings.bodyFont} onChange={e => update("bodyFont", e.target.value)}
                                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E5E5", borderRadius: "10px", fontSize: "0.875rem", color: "#111", outline: "none", background: "#fff", cursor: "pointer" }}>
                                {FONT_OPTIONS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                            </select>
                            <p style={{ ...hint, fontFamily: settings.bodyFont }}>Пример: {settings.bodyFont}</p>
                        </div>
                    </div>

                    <RangeInput label="Размер заголовков" value={settings.headingSize} field="headingSize" min={1.5} max={4} step={0.125} unit="rem" />
                    <RangeInput label="Размер текста" value={settings.bodySize} field="bodySize" min={0.75} max={1.25} step={0.0625} unit="rem" />
                    <RangeInput label="Размер меню" value={settings.menuSize} field="menuSize" min={0.75} max={1.125} step={0.0625} unit="rem" />
                    <RangeInput label="Скругление углов" value={settings.borderRadius} field="borderRadius" min={0} max={24} step={2} unit="px" />
                </div>
            </div>

            {/* Live preview card */}
            {preview && (
                <div style={{ background: settings.bgColor, border: "2px solid #7C3AED", borderRadius: "14px", padding: "24px", marginBottom: "16px" }}>
                    <p style={{ fontFamily: settings.headingFont, fontSize: `${settings.headingSize}rem`, fontWeight: 700, color: settings.textColor, margin: "0 0 8px" }}>KiKi — Luxury Events</p>
                    <p style={{ fontFamily: settings.bodyFont, fontSize: `${settings.bodySize}rem`, color: settings.textColor, opacity: 0.75, margin: "0 0 16px" }}>
                        Студия декора свадеб, праздников и мероприятий
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button style={{ padding: "10px 20px", borderRadius: `${settings.borderRadius}px`, background: settings.primaryColor, color: "#fff", border: "none", fontWeight: 600, fontFamily: settings.bodyFont }}>
                            Заказать
                        </button>
                        <button style={{ padding: "10px 20px", borderRadius: `${settings.borderRadius}px`, background: "transparent", border: `1px solid ${settings.primaryColor}`, color: settings.primaryColor, fontWeight: 600, fontFamily: settings.bodyFont }}>
                            Портфолио
                        </button>
                    </div>
                </div>
            )}

            {/* Save */}
            <button
                onClick={saveAndApply}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 24px", borderRadius: "10px", background: "#000", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", border: "none", cursor: "pointer", width: "100%", justifyContent: "center", transition: "background 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#222"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#000"; }}
            >
                <Check size={16} />
                Применить изменения к сайту
            </button>
        </div>
    );
};

export default AdminBrandDesign;
