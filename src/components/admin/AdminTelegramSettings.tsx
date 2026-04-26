import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, CheckCircle2, XCircle, Loader2, Copy, Link2, Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type LinkRow = {
  id: string;
  username: string | null;
  chat_id: number | null;
  is_active: boolean;
  notifications_enabled: boolean;
  link_code: string | null;
  link_code_expires_at: string | null;
  linked_at: string | null;
  created_at: string;
};

const AdminTelegramSettings = () => {
  const [rows, setRows] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [settingWebhook, setSettingWebhook] = useState(false);
  const [botInfo, setBotInfo] = useState<{ username?: string; first_name?: string } | null>(null);
  const [activeCode, setActiveCode] = useState<{ code: string; expires_at: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("telegram_admins")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Ошибка загрузки: " + error.message);
    else setRows((data as LinkRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generateCode = async () => {
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("telegram-link");
    setGenerating(false);
    if (error || !data?.code) {
      toast.error("Не удалось сгенерировать код: " + (error?.message || data?.error || ""));
      return;
    }
    setActiveCode({ code: data.code, expires_at: data.expires_at });
    toast.success("Код создан. Действует 15 минут.");
    load();
  };

  const setupWebhook = async () => {
    setSettingWebhook(true);
    const { data, error } = await supabase.functions.invoke("telegram-setup-webhook");
    setSettingWebhook(false);
    if (error) {
      toast.error("Ошибка: " + error.message);
      return;
    }
    if (data?.webhook?.ok) {
      toast.success("Webhook установлен");
      setBotInfo(data.bot);
    } else {
      toast.error("Webhook не установлен: " + JSON.stringify(data?.webhook));
    }
  };

  const removeRow = async (id: string) => {
    if (!confirm("Удалить эту привязку?")) return;
    const { error } = await supabase.from("telegram_admins").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Удалено"); load(); }
  };

  const toggleNotifications = async (row: LinkRow) => {
    const { error } = await supabase
      .from("telegram_admins")
      .update({ notifications_enabled: !row.notifications_enabled })
      .eq("id", row.id);
    if (error) toast.error(error.message);
    else load();
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Скопировано");
  };

  const activeAdmins = rows.filter((r) => r.is_active);
  const pending = rows.filter((r) => !r.is_active && r.link_code);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bot className="text-primary" /> Telegram-бот
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление генератором, статус, уведомления о лидах через Telegram
        </p>
      </div>

      {/* Bot Setup */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Link2 size={16} /> Настройка webhook</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Один раз нажмите, чтобы Telegram начал отправлять сообщения боту в нашу систему.
        </p>
        <Button onClick={setupWebhook} disabled={settingWebhook}>
          {settingWebhook && <Loader2 className="animate-spin mr-2" size={14} />}
          Установить webhook
        </Button>
        {botInfo && (
          <div className="mt-3 text-sm text-foreground">
            ✅ Подключено: <a href={`https://t.me/${botInfo.username}`} target="_blank" className="text-primary underline">@{botInfo.username}</a>
          </div>
        )}
      </div>

      {/* Link new admin */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Send size={16} /> Привязка вашего Telegram</h3>
        <p className="text-sm text-muted-foreground mb-4">
          1. Сгенерируйте код. 2. Откройте бота и отправьте <code className="bg-muted px-1.5 py-0.5 rounded">/link КОД</code>
        </p>
        <Button onClick={generateCode} disabled={generating}>
          {generating && <Loader2 className="animate-spin mr-2" size={14} />}
          Сгенерировать код привязки
        </Button>

        {activeCode && (
          <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Отправьте боту:</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold text-foreground bg-background px-3 py-2 rounded border border-border flex-1">
                /link {activeCode.code}
              </code>
              <Button size="sm" variant="outline" onClick={() => copy(`/link ${activeCode.code}`)}>
                <Copy size={14} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Действителен до: {new Date(activeCode.expires_at).toLocaleString("ru-RU")}
            </p>
          </div>
        )}
      </div>

      {/* Linked admins */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-500" /> Привязанные администраторы ({activeAdmins.length})
        </h3>
        {loading ? (
          <Loader2 className="animate-spin text-muted-foreground" />
        ) : activeAdmins.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Пока никто не привязан</p>
        ) : (
          <div className="space-y-2">
            {activeAdmins.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <div className="font-medium text-foreground">{r.username ? `@${r.username}` : `chat ${r.chat_id}`}</div>
                  <div className="text-xs text-muted-foreground">
                    Привязан: {r.linked_at ? new Date(r.linked_at).toLocaleString("ru-RU") : "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.notifications_enabled ? "default" : "secondary"}>
                    <Bell size={10} className="mr-1" />
                    {r.notifications_enabled ? "Уведомления вкл" : "Выкл"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleNotifications(r)}>
                    Переключить
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => removeRow(r.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div className="border border-border rounded-xl p-5 bg-card">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <XCircle size={16} className="text-yellow-500" /> Ожидающие привязки ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <code className="text-sm font-mono">{r.link_code}</code>
                  <div className="text-xs text-muted-foreground">
                    Истекает: {r.link_code_expires_at ? new Date(r.link_code_expires_at).toLocaleString("ru-RU") : "—"}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => removeRow(r.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commands cheatsheet */}
      <div className="border border-border rounded-xl p-5 bg-muted/30">
        <h3 className="font-semibold text-foreground mb-3">Команды бота</h3>
        <div className="space-y-1.5 text-sm font-mono">
          <div><code className="text-primary">/status</code> — статус системы и последние запуски</div>
          <div><code className="text-primary">/start_gen &lt;тип&gt;</code> — запустить генератор (decor, facade, video, moodboard)</div>
          <div><code className="text-primary">/stop_gen</code> — остановить активные запуски</div>
          <div><code className="text-primary">/restart_gen</code> — перезапустить</div>
          <div><code className="text-primary">/help</code> — справка</div>
        </div>
      </div>
    </div>
  );
};

export default AdminTelegramSettings;

// ─── Backward-compat shims for legacy imports ───
// Old code imported getTelegramSettings/sendTelegramMessage from this file.
// Now we send via the server (notify-new-lead / telegram-bot). These shims
// keep the build green and route through the supabase function.

export const getTelegramSettings = () => ({
  botToken: "",
  chatId: "",
  autoSend: false,
  connected: true,
});

export const sendTelegramMessage = async (text: string, imageUrl?: string): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke("notify-new-lead", {
      body: { broadcast: true, text, imageUrl },
    });
    return !error;
  } catch {
    return false;
  }
};
