import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, LogIn, Sparkles } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Введите email и пароль");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error("Неверный email или пароль");
    } else {
      onLogin();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #fafafa 0%, #f5f0ff 50%, #fafafa 100%)" }}
    >
      <title>Вход в CRM — Ki Ki Decor</title>

      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #EAEAEA",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        padding: "40px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "52px", height: "52px",
            background: "linear-gradient(135deg, #7C3AED, #9F6FE8)",
            borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: "1.75rem", fontWeight: 700, color: "#000000", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Ki Ki Admin
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#666666", fontWeight: 500, margin: 0 }}>
            Панель управления
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111111" }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={15}
                style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#999999", pointerEvents: "none" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kikidecor.ru"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 38px",
                  border: "1px solid #E5E5E5",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  color: "#111111",
                  fontWeight: 500,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#000000"; e.target.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E5E5"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111111" }}>
              Пароль
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#999999", pointerEvents: "none" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 38px",
                  border: "1px solid #E5E5E5",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  color: "#111111",
                  fontWeight: 500,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#000000"; e.target.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.05)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E5E5"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "13px 20px",
              background: loading ? "#999999" : "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.15s, transform 0.1s, box-shadow 0.15s",
              boxShadow: loading ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) => { if (!loading) { (e.target as HTMLElement).style.background = "#1a1a1a"; (e.target as HTMLElement).style.transform = "translateY(-1px)"; } }}
            onMouseLeave={(e) => { if (!loading) { (e.target as HTMLElement).style.background = "#000000"; (e.target as HTMLElement).style.transform = "translateY(0)"; } }}
          >
            <LogIn size={16} />
            {loading ? "Вхожу..." : "Войти"}
          </button>
        </form>

        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "0.75rem", color: "#999999", fontWeight: 400 }}>
          Ki Ki Decor · Панель управления
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
