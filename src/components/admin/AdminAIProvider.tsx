import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Save, RotateCcw, Cpu, KeyRound, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";

type Provider = "lovable" | "openai" | "gemini" | "anthropic";

const PROVIDER_META: Record<Provider, { name: string; envName: string; supportsImage: boolean; defaults: { reasoning: string; fast: string; vision: string; image: string }; help: string }> = {
  lovable: {
    name: "Lovable AI Gateway",
    envName: "LOVABLE_API_KEY",
    supportsImage: true,
    defaults: {
      reasoning: "google/gemini-3.1-pro-preview",
      fast: "google/gemini-3-flash-preview",
      vision: "google/gemini-2.5-flash",
      image: "google/gemini-3.1-flash-image-preview",
    },
    help: "По умолчанию. Без отдельного API-ключа — используется встроенный LOVABLE_API_KEY.",
  },
  openai: {
    name: "OpenAI Direct",
    envName: "OPENAI_API_KEY",
    supportsImage: false,
    defaults: { reasoning: "gpt-5", fast: "gpt-5-mini", vision: "gpt-5-mini", image: "" },
    help: "Прямые вызовы к OpenAI. Image-генерация автоматически делегируется Lovable Gateway.",
  },
  gemini: {
    name: "Google Gemini Direct",
    envName: "GEMINI_API_KEY",
    supportsImage: true,
    defaults: {
      reasoning: "gemini-2.5-pro",
      fast: "gemini-2.5-flash",
      vision: "gemini-2.5-flash",
      image: "gemini-2.5-flash-image-preview",
    },
    help: "Прямые вызовы к Google AI Studio (Gemini). Поддерживает генерацию изображений.",
  },
  anthropic: {
    name: "Anthropic Claude",
    envName: "ANTHROPIC_API_KEY",
    supportsImage: false,
    defaults: { reasoning: "claude-opus-4", fast: "claude-sonnet-4", vision: "claude-sonnet-4", image: "" },
    help: "Прямые вызовы к Anthropic Claude. Image-генерация автоматически делегируется Lovable.",
  },
};

const AdminAIProvider = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ hasKey: boolean; provider: Provider } | null>(null);

  const [provider, setProvider] = useState<Provider>("lovable");
  const [reasoning, setReasoning] = useState("");
  const [fast, setFast] = useState("");
  const [vision, setVision] = useState("");
  const [image, setImage] = useState("");
  const [rowId, setRowId] = useState<string | null>(null);

  const useLovable = provider === "lovable";

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_provider_settings")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();
    if (error) toast.error("Не удалось загрузить настройки");
    if (data) {
      setRowId(data.id);
      setProvider(data.provider as Provider);
      setReasoning(data.model_reasoning || "");
      setFast(data.model_fast || "");
      setVision(data.model_vision || "");
      setImage(data.model_image || "");
    }
    setLoading(false);
    void checkKey();
  };

  const checkKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-provider-status");
      if (error) throw error;
      if (data) setKeyStatus({ hasKey: !!data.hasKey, provider: data.provider });
    } catch (e) {
      console.warn("ai-provider-status failed", e);
    }
  };

  useEffect(() => { load(); }, []);

  // Apply defaults when switching provider (only if fields are empty or matched the previous defaults)
  useEffect(() => {
    const def = PROVIDER_META[provider].defaults;
    setReasoning(prev => (prev && !Object.values(PROVIDER_META).some(p => p.defaults.reasoning === prev)) ? prev : def.reasoning);
    setFast(prev => (prev && !Object.values(PROVIDER_META).some(p => p.defaults.fast === prev)) ? prev : def.fast);
    setVision(prev => (prev && !Object.values(PROVIDER_META).some(p => p.defaults.vision === prev)) ? prev : def.vision);
    setImage(prev => (prev && !Object.values(PROVIDER_META).some(p => p.defaults.image === prev)) ? prev : def.image);
    // re-check key for the new provider
    void checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const resetDefaults = () => {
    const d = PROVIDER_META[provider].defaults;
    setReasoning(d.reasoning); setFast(d.fast); setVision(d.vision); setImage(d.image);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      provider,
      model_reasoning: reasoning || null,
      model_fast: fast || null,
      model_vision: vision || null,
      model_image: image || null,
      is_active: true,
    };
    const { error } = rowId
      ? await supabase.from("ai_provider_settings").update(payload).eq("id", rowId)
      : await supabase.from("ai_provider_settings").insert(payload);
    if (error) toast.error("Не удалось сохранить: " + error.message);
    else { toast.success("Настройки сохранены. Применение в течение 30 секунд."); void checkKey(); }
    setSaving(false);
  };

  const test = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-provider-test");
      if (error) throw error;
      if (data?.ok) toast.success(`OK · ${data.provider} · ${data.latencyMs}ms · «${data.preview}»`);
      else toast.error(`Ошибка теста: ${data?.error || "unknown"}`);
    } catch (e: any) {
      toast.error("Тест не выполнен: " + (e.message || "unknown"));
    }
    setTesting(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin"/></div>;

  const meta = PROVIDER_META[provider];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2"><Cpu className="w-5 h-5"/>AI Провайдер</h2>
        <p className="text-sm text-muted-foreground mt-1">Управление маршрутизацией AI-вызовов: Lovable Gateway или собственный провайдер.</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary"/> Lovable AI Gateway
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Когда включено — все AI-функции используют встроенный Lovable Gateway без своего ключа.
            </p>
          </div>
          <Switch
            checked={useLovable}
            onCheckedChange={(v) => setProvider(v ? "lovable" : "openai")}
          />
        </div>
      </Card>

      {!useLovable && (
        <Card className="p-4 space-y-2">
          <Label className="text-xs uppercase tracking-wider">Провайдер</Label>
          <Select value={provider} onValueChange={(v: Provider) => setProvider(v)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="gemini">Google Gemini Direct</SelectItem>
              <SelectItem value="anthropic">Anthropic Claude</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{meta.help}</p>
        </Card>
      )}

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2"><KeyRound className="w-4 h-4"/> API-ключ</Label>
          {keyStatus && (
            keyStatus.hasKey
              ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1"/>Настроен</Badge>
              : <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1"/>Не настроен</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Имя секрета: <code className="bg-muted px-1.5 py-0.5 rounded">{meta.envName}</code>.
          {useLovable
            ? " Ключ Lovable Gateway уже настроен платформой — ничего делать не нужно."
            : " Чтобы добавить или обновить ключ, попросите ассистента: «Добавь секрет " + meta.envName + "»."}
        </p>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Модели по задачам</Label>
          <Button variant="ghost" size="sm" onClick={resetDefaults}><RotateCcw className="w-3 h-3 mr-1"/>Сброс</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Reasoning (сложные задачи)</Label>
            <Input value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder={meta.defaults.reasoning}/>
          </div>
          <div>
            <Label className="text-xs">Fast (быстрые ответы)</Label>
            <Input value={fast} onChange={e => setFast(e.target.value)} placeholder={meta.defaults.fast}/>
          </div>
          <div>
            <Label className="text-xs">Vision (анализ изображений)</Label>
            <Input value={vision} onChange={e => setVision(e.target.value)} placeholder={meta.defaults.vision}/>
          </div>
          <div>
            <Label className="text-xs">Image gen (генерация картинок)</Label>
            <Input value={image} onChange={e => setImage(e.target.value)} placeholder={meta.defaults.image} disabled={!meta.supportsImage}/>
            {!meta.supportsImage && (
              <p className="text-[10px] text-muted-foreground mt-1">{meta.name} не генерирует изображения — используется Lovable Gateway автоматически.</p>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : <Save className="w-4 h-4 mr-1"/>}
          Сохранить
        </Button>
        <Button variant="outline" onClick={test} disabled={testing}>
          {testing ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : <Zap className="w-4 h-4 mr-1"/>}
          Тест соединения
        </Button>
      </div>

      <div className="text-xs text-muted-foreground border-t pt-3">
        <strong>Примечание:</strong> переключение провайдера применяется ко всем edge-функциям (concierge, генератор концепций, мудбордов, фасадов, анализ площадок и т.д.). Видео-генерация (AI Видео / WAN) использует отдельный провайдер DashScope и не зависит от этих настроек.
      </div>
    </div>
  );
};

export default AdminAIProvider;