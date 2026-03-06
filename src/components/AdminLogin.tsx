import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <title>Вход в CRM — Ki Ki Decor</title>
      <div className="w-full max-w-sm bg-background border border-border p-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-light">
            Ki Ki<span className="text-primary">.</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Вход в панель управления</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kikidecor.ru"
                className="pl-9 rounded-none border-border bg-transparent focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block">Пароль</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 rounded-none border-border bg-transparent focus:border-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-none text-xs uppercase tracking-[0.15em] py-5 gap-2 btn-glow"
          >
            {loading ? "Вход..." : <><LogIn size={14} /> Войти</>}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
