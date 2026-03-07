import { useState, useEffect } from "react";
import { Send, Bot, CheckCircle2, XCircle, Eye, EyeOff, Bell, BellOff, TestTube } from "lucide-react";
import { toast } from "sonner";

const LS_KEY = "kiki_telegram_settings";

type TelegramSettings = {
    botToken: string;
    chatId: string;
    autoSend: boolean;
    connected: boolean;
};

const DEFAULT: TelegramSettings = { botToken: "", chatId: "", autoSend: false, connected: false };

export const getTelegramSettings = (): TelegramSettings => {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || "null") ?? DEFAULT;
    } catch {
        return DEFAULT;
    }
};

export const sendTelegramMessage = async (text: string, imageUrl?: string): Promise<boolean> => {
    const { botToken, chatId } = getTelegramSettings();
    if (!botToken || !chatId) return false;
    try {
        if (imageUrl) {
            const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, photo: imageUrl, caption: text, parse_mode: "HTML" }),
            });
            return res.ok;
        } else {
            const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
            });
            return res.ok;
        }
    } catch {
        return false;
    }
};

const AdminTelegramSettings = () => {
    const [settings, setSettings] = useState<TelegramSettings>(DEFAULT);
    const [showToken, setShowToken] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => { setSettings(getTelegramSettings()); }, []);

    const save = () => {
        localStorage.setItem(LS_KEY, JSON.stringify(settings));
        toast.success("Настройки Telegram сохранены");
    };

    const testConnection = async () => {
        if (!settings.botToken || !settings.chatId) { toast.error("Введите Bot Token и Chat ID"); return; }
        setTesting(true);
        const ok = await sendTelegramMessage("✅ <b>KiKi Admin</b>\n\nТест соединения прошёл успешно!\nВаш Telegram подключён к KiKi Admin Panel.");
        setTesting(false);
        if (ok) {
            setSettings(prev => ({ ...prev, connected: true }));
            localStorage.setItem(LS_KEY, JSON.stringify({ ...settings, connected: true }));
            toast.success("✅ Сообщение отправлено! Telegram подключён.");
        } else {
            setSettings(prev => ({ ...prev, connected: false }));
            toast.error("❌ Ошибка. Проверьте Bot Token и Chat ID.");
        }
    };

    const field: React.CSSProperties = {
        width: "100%", padding: "11px 14px", border: "1px solid #E5E5E5", borderRadius: "10px",
        fontSize: "0.875rem", color: "#111", fontWeight: 500, outline: "none",
        boxSizing: "border-box", background: "#fff", transition: "border-color 0.15s",
    };
    const label: React.CSSProperties = { fontSize: "0.8125rem", fontWeight: 600, color: "#111", display: "block", marginBottom: "6px" };
    const hint: React.CSSProperties = { fontSize: "0.75rem", color: "#888", marginTop: "4px" };

    return (
        <div style={{ maxWidth: "600px" }}>
            <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#000", margin: "0 0 4px" }}>Telegram Integration</h2>
                <p style={{ fontSize: "0.875rem", color: "#666", margin: 0 }}>
                    Настройте Telegram-бота для получения уведомлений и AI-концепций.
                </p>
            </div>

            {/* Status */}
            <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 16px", borderRadius: "10px", marginBottom: "24px",
                background: settings.connected ? "#F0FDF4" : "#FFF7ED",
                border: `1px solid ${settings.connected ? "#BBF7D0" : "#FED7AA"}`,
            }}>
                {settings.connected
                    ? <CheckCircle2 size={18} style={{ color: "#16A34A" }} />
                    : <XCircle size={18} style={{ color: "#EA580C" }} />
                }
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: settings.connected ? "#15803D" : "#C2410C" }}>
                    {settings.connected ? "Telegram подключён" : "Telegram не настроен"}
                </span>
            </div>

            {/* Settings card */}
            <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "14px", padding: "24px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                    <Bot size={18} style={{ color: "#7C3AED" }} />
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "#000" }}>Bot Configuration</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Bot Token */}
                    <div>
                        <label style={label}>Bot Token</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showToken ? "text" : "password"}
                                value={settings.botToken}
                                onChange={e => setSettings(prev => ({ ...prev, botToken: e.target.value, connected: false }))}
                                placeholder="1234567890:ABCdef..."
                                style={{ ...field, paddingRight: "42px" }}
                                onFocus={e => { e.target.style.borderColor = "#7C3AED"; }}
                                onBlur={e => { e.target.style.borderColor = "#E5E5E5"; }}
                            />
                            <button
                                onClick={() => setShowToken(v => !v)}
                                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "#888", display: "flex" }}
                            >
                                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p style={hint}>Получите в @BotFather → /newbot или /token</p>
                    </div>

                    {/* Chat ID */}
                    <div>
                        <label style={label}>Chat ID</label>
                        <input
                            type="text"
                            value={settings.chatId}
                            onChange={e => setSettings(prev => ({ ...prev, chatId: e.target.value, connected: false }))}
                            placeholder="-1001234567890"
                            style={field}
                            onFocus={e => { e.target.style.borderColor = "#7C3AED"; }}
                            onBlur={e => { e.target.style.borderColor = "#E5E5E5"; }}
                        />
                        <p style={hint}>ID вашего канала/группы. Узнать: @userinfobot или @getmyid_bot</p>
                    </div>
                </div>
            </div>

            {/* Auto-send toggle */}
            <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "14px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {settings.autoSend ? <Bell size={18} style={{ color: "#7C3AED" }} /> : <BellOff size={18} style={{ color: "#999" }} />}
                        <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "#111" }}>Авто-отправка AI концепций</p>
                            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#888" }}>Отправлять каждую новую концепцию в Telegram</p>
                        </div>
                    </div>
                    {/* Toggle */}
                    <button
                        onClick={() => setSettings(prev => ({ ...prev, autoSend: !prev.autoSend }))}
                        style={{
                            width: "48px", height: "26px", borderRadius: "13px",
                            background: settings.autoSend ? "#7C3AED" : "#D1D5DB",
                            border: "none", cursor: "pointer", position: "relative",
                            transition: "background 0.2s",
                            flexShrink: 0,
                        }}
                    >
                        <span style={{
                            position: "absolute", top: "3px",
                            left: settings.autoSend ? "25px" : "3px",
                            width: "20px", height: "20px", borderRadius: "50%",
                            background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            transition: "left 0.2s",
                        }} />
                    </button>
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                    onClick={testConnection}
                    disabled={testing}
                    style={{
                        display: "flex", alignItems: "center", gap: "7px",
                        padding: "11px 18px", borderRadius: "10px",
                        background: "#F3F4F6", border: "1px solid #E5E5E5",
                        color: "#111", fontWeight: 600, fontSize: "0.875rem",
                        cursor: testing ? "not-allowed" : "pointer",
                        opacity: testing ? 0.7 : 1,
                        transition: "all 0.15s",
                    }}
                >
                    <TestTube size={15} />
                    {testing ? "Тестирую..." : "Тест соединения"}
                </button>

                <button
                    onClick={save}
                    style={{
                        display: "flex", alignItems: "center", gap: "7px",
                        padding: "11px 20px", borderRadius: "10px",
                        background: "#000", border: "none",
                        color: "#fff", fontWeight: 600, fontSize: "0.875rem",
                        cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#222"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#000"; }}
                >
                    <Send size={15} />
                    Сохранить настройки
                </button>
            </div>

            {/* How to get */}
            <div style={{ background: "#F8F7FF", border: "1px solid #E9D5FF", borderRadius: "12px", padding: "16px", marginTop: "24px" }}>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: "0.875rem", color: "#5B21B6" }}>Как настроить?</p>
                <ol style={{ margin: 0, paddingLeft: "20px", fontSize: "0.8125rem", color: "#6B21A8", lineHeight: 1.7 }}>
                    <li>Найдите <b>@BotFather</b> в Telegram и создайте нового бота</li>
                    <li>Скопируйте Bot Token и вставьте выше</li>
                    <li>Добавьте бота в ваш канал/группу как администратора</li>
                    <li>Напишите сообщение в группу, затем получите Chat ID через <b>@getmyid_bot</b></li>
                    <li>Нажмите «Тест соединения»</li>
                </ol>
            </div>
        </div>
    );
};

export default AdminTelegramSettings;
