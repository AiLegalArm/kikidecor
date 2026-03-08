import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, Shirt, Search, Eye, ShoppingBag, Palette, BarChart3, Users } from "lucide-react";
import { format } from "date-fns";

type AIInteraction = {
  id: string;
  session_id: string;
  interaction_type: string;
  input_data: any;
  output_data: any;
  selected_product_ids: string[];
  photo_url: string | null;
  created_at: string;
};

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  stylist_preferences: { label: "AI Стилист", icon: Sparkles, color: "bg-purple-100 text-purple-800 border-purple-200" },
  stylist_photo: { label: "Стилист по фото", icon: Camera, color: "bg-pink-100 text-pink-800 border-pink-200" },
  outfit_generator: { label: "Генератор образов", icon: Shirt, color: "bg-blue-100 text-blue-800 border-blue-200" },
  find_similar: { label: "Поиск похожих", icon: Search, color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  virtual_tryon: { label: "Виртуальная примерка", icon: Eye, color: "bg-green-100 text-green-800 border-green-200" },
  venue_analysis: { label: "Анализ площадки", icon: BarChart3, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  decor_concept: { label: "Концепция декора", icon: Palette, color: "bg-orange-100 text-orange-800 border-orange-200" },
  consultation_request: { label: "Заявка на консультацию", icon: Users, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const AdminAIInsights = () => {
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_interactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      setInteractions(data as AIInteraction[]);
    }
    setLoading(false);
  };

  const filtered = filterType === "all"
    ? interactions
    : interactions.filter(i => i.interaction_type === filterType);

  // Stats
  const totalInteractions = interactions.length;
  const uniqueSessions = new Set(interactions.map(i => i.session_id)).size;
  const totalProducts = interactions.reduce((acc, i) => acc + (i.selected_product_ids?.length || 0), 0);
  const typeCounts = interactions.reduce((acc, i) => {
    acc[i.interaction_type] = (acc[i.interaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Взаимодействия
        </h2>
        <button onClick={fetchInteractions} className="text-xs text-muted-foreground hover:text-foreground">
          Обновить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalInteractions}</p>
          <p className="text-xs text-muted-foreground">Всего запросов</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{uniqueSessions}</p>
          <p className="text-xs text-muted-foreground">Уникальных сессий</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalProducts}</p>
          <p className="text-xs text-muted-foreground">Товаров подобрано</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{topTypes[0]?.[1] || 0}</p>
          <p className="text-xs text-muted-foreground truncate">Топ: {TYPE_CONFIG[topTypes[0]?.[0]]?.label || "—"}</p>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="border rounded-lg p-4">
        <p className="text-sm font-medium mb-3">По типам AI</p>
        <div className="space-y-2">
          {topTypes.map(([type, count]) => {
            const config = TYPE_CONFIG[type];
            const pct = totalInteractions > 0 ? (count / totalInteractions * 100) : 0;
            return (
              <div key={type} className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${config?.color || "bg-gray-100 text-gray-800"}`}>
                  {config?.icon && <config.icon className="w-3 h-3" />}
                  {config?.label || type}
                </span>
                <div className="flex-1 bg-secondary/50 rounded-full h-2">
                  <div className="bg-primary/60 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1 text-[10px] rounded-full border transition-colors ${
            filterType === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Все
        </button>
        {Object.entries(TYPE_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={`px-3 py-1 text-[10px] rounded-full border transition-colors ${
              filterType === key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Interaction list */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.map(interaction => {
            const config = TYPE_CONFIG[interaction.interaction_type];
            const isExpanded = expanded === interaction.id;
            return (
              <div
                key={interaction.id}
                className="border rounded-lg p-3 hover:bg-secondary/20 transition-colors cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : interaction.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0 ${config?.color || "bg-gray-100"}`}>
                      {config?.icon && <config.icon className="w-3 h-3" />}
                      {config?.label || interaction.interaction_type}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      Сессия: {interaction.session_id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {interaction.selected_product_ids?.length > 0 && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        {interaction.selected_product_ids.length}
                      </Badge>
                    )}
                    {interaction.photo_url && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Camera className="w-3 h-3" />
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(interaction.created_at), "dd.MM HH:mm")}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    {/* Photo preview */}
                    {interaction.photo_url && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase">Фото</p>
                        <img
                          src={interaction.photo_url}
                          alt="Uploaded"
                          className="w-20 h-24 object-cover rounded border"
                        />
                      </div>
                    )}

                    {/* Input data */}
                    {interaction.input_data && Object.keys(interaction.input_data).length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase">Входные данные</p>
                        <pre className="text-[11px] bg-secondary/30 p-2 rounded overflow-x-auto max-h-32">
                          {JSON.stringify(interaction.input_data, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Output data */}
                    {interaction.output_data && Object.keys(interaction.output_data).length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase">Результат</p>
                        <pre className="text-[11px] bg-secondary/30 p-2 rounded overflow-x-auto max-h-32">
                          {JSON.stringify(interaction.output_data, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Product IDs */}
                    {interaction.selected_product_ids?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase">Подобранные товары ({interaction.selected_product_ids.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {interaction.selected_product_ids.map(pid => (
                            <code key={pid} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{pid.slice(0, 8)}...</code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAIInsights;
