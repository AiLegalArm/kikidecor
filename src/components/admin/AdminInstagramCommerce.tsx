import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Instagram, Download, RefreshCw, Loader2, CheckCircle2, AlertCircle,
  Link2, ShoppingBag, Palette, Image as ImageIcon, Star, X, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InstaPost {
  id: string;
  instagram_id: string;
  media_type: string;
  media_url: string;
  cached_image_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  permalink: string;
  like_count: number | null;
  timestamp: string;
  account: string;
  link_type: string | null;
  linked_product_ids: string[] | null;
  linked_service_index: number | null;
  linked_portfolio_index: number | null;
  is_featured: boolean;
  utm_clicks: number;
}

interface Product {
  id: string;
  name: string;
  name_en: string | null;
  category: string | null;
  images: string[] | null;
  price: number;
}

const SERVICE_NAMES = [
  "Декор фасадов",
  "Свадебный декор",
  "Оформление праздников",
  "Фотозоны",
  "Декор входных групп",
  "Корпоративные мероприятия",
];

const PORTFOLIO_NAMES = [
  "Garden Romance",
  "Noir & Gold Gala",
  "Sunset Whisper",
  "Golden Jubilee",
  "Unicorn Fantasia",
  "Villa Serena",
];

const AdminInstagramCommerce = () => {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<InstaPost | null>(null);
  const [igImporting, setIgImporting] = useState(false);
  const [igSyncing, setIgSyncing] = useState(false);
  const [igResult, setIgResult] = useState<{ success: boolean; synced?: number; error?: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "linked" | "unlinked" | "featured">("all");
  const [accountFilter, setAccountFilter] = useState<"all" | "decor" | "showroom">("all");

  // Link editing state
  const [editLinkType, setEditLinkType] = useState<string>("");
  const [editProductIds, setEditProductIds] = useState<string[]>([]);
  const [editServiceIndex, setEditServiceIndex] = useState<number | null>(null);
  const [editPortfolioIndex, setEditPortfolioIndex] = useState<number | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("instagram_posts")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(200);
    if (!error && data) setPosts(data as unknown as InstaPost[]);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, name_en, category, images, price");
    if (data) setProducts(data);
  };

  useEffect(() => { fetchPosts(); fetchProducts(); }, []);

  const triggerSync = async (importAll: boolean) => {
    const setter = importAll ? setIgImporting : setIgSyncing;
    setter(true); setIgResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("sync-instagram", { body: { import_all: importAll } });
      if (error) throw error;
      setIgResult(data);
      if (data?.success) { toast.success(`${importAll ? "Импорт" : "Синхронизация"}: ${data.synced} постов`); fetchPosts(); }
      else toast.error(data?.error || "Ошибка");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setIgResult({ success: false, error: msg }); toast.error(msg);
    } finally { setter(false); }
  };

  const openLinkDialog = (post: InstaPost) => {
    setSelectedPost(post);
    setEditLinkType(post.link_type || "");
    setEditProductIds(post.linked_product_ids || []);
    setEditServiceIndex(post.linked_service_index);
    setEditPortfolioIndex(post.linked_portfolio_index);
  };

  const saveLinks = async () => {
    if (!selectedPost) return;
    const { error } = await supabase.from("instagram_posts").update({
      link_type: editLinkType || null,
      linked_product_ids: editProductIds.length > 0 ? editProductIds : [],
      linked_service_index: editServiceIndex,
      linked_portfolio_index: editPortfolioIndex,
      account: selectedPost.account,
    }).eq("id", selectedPost.id);

    if (error) { toast.error("Ошибка сохранения"); return; }
    toast.success("Связи обновлены");
    setPosts(prev => prev.map(p => p.id === selectedPost.id ? {
      ...p, link_type: editLinkType || null, linked_product_ids: editProductIds,
      linked_service_index: editServiceIndex, linked_portfolio_index: editPortfolioIndex,
    } : p));
    setSelectedPost(null);
  };

  const toggleFeatured = async (post: InstaPost) => {
    const { error } = await supabase.from("instagram_posts").update({ is_featured: !post.is_featured }).eq("id", post.id);
    if (error) { toast.error("Ошибка"); return; }
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_featured: !p.is_featured } : p));
  };

  const updateAccount = async (post: InstaPost, account: string) => {
    const { error } = await supabase.from("instagram_posts").update({ account }).eq("id", post.id);
    if (error) { toast.error("Ошибка"); return; }
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, account } : p));
    if (selectedPost?.id === post.id) setSelectedPost(prev => prev ? { ...prev, account } : null);
  };

  const toggleProductLink = (productId: string) => {
    setEditProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const filteredPosts = posts.filter(p => {
    if (accountFilter !== "all" && p.account !== accountFilter) return false;
    if (filter === "linked" && !p.link_type) return false;
    if (filter === "unlinked" && p.link_type) return false;
    if (filter === "featured" && !p.is_featured) return false;
    return true;
  });

  const imgSrc = (post: InstaPost) => post.cached_image_url || post.thumbnail_url || post.media_url;
  const linkedCount = posts.filter(p => p.link_type).length;
  const featuredCount = posts.filter(p => p.is_featured).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Instagram size={22} strokeWidth={1.5} className="text-primary" />
        <h2 className="font-display text-2xl font-light">Instagram Commerce</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
        Привяжите посты к товарам, услугам или проектам портфолио. Связанные посты автоматически появятся в шоппабл-галерее с CTA.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Всего постов", value: posts.length, icon: ImageIcon },
          { label: "Привязано", value: linkedCount, icon: Link2 },
          { label: "Избранное", value: featuredCount, icon: Star },
          { label: "Кликов", value: posts.reduce((s, p) => s + (p.utm_clicks || 0), 0), icon: ExternalLink },
        ].map(s => (
          <div key={s.label} className="border border-border p-4 bg-background">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className="text-primary" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-display font-light">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sync buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => triggerSync(true)} disabled={igImporting || igSyncing} className="rounded-none gap-2" size="sm">
          {igImporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {igImporting ? "Импорт..." : "Импорт всего"}
        </Button>
        <Button variant="outline" onClick={() => triggerSync(false)} disabled={igImporting || igSyncing} className="rounded-none gap-2" size="sm">
          {igSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {igSyncing ? "Синхронизация..." : "Быстрая синхронизация"}
        </Button>
      </div>

      {igResult && (
        <div className={`mb-4 flex items-start gap-2 text-sm p-3 border ${igResult.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {igResult.success ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          <span>{igResult.success ? `Синхронизировано ${igResult.synced} постов` : `Ошибка: ${igResult.error}`}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "linked", "unlinked", "featured"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn(
            "px-3 py-1.5 text-xs border transition-colors",
            filter === f ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"
          )}>
            {f === "all" ? "Все" : f === "linked" ? "Привязано" : f === "unlinked" ? "Не привязано" : "Избранное"}
          </button>
        ))}
        <div className="w-px h-6 bg-border self-center mx-1" />
        {(["all", "decor", "showroom"] as const).map(a => (
          <button key={a} onClick={() => setAccountFilter(a)} className={cn(
            "px-3 py-1.5 text-xs border transition-colors",
            accountFilter === a ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
          )}>
            {a === "all" ? "Все аккаунты" : a === "decor" ? "KiKi Decor" : "KiKi Showroom"}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredPosts.map(post => (
            <div key={post.id} className="relative group">
              <button onClick={() => openLinkDialog(post)} className="w-full aspect-square overflow-hidden bg-muted relative">
                <img src={imgSrc(post)} alt="" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-center justify-center">
                  <Link2 size={20} className="text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Badges */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                  {post.link_type && (
                    <span className="bg-primary text-primary-foreground text-[8px] uppercase tracking-wider px-1.5 py-0.5">
                      {post.link_type === "product" ? "Товар" : post.link_type === "service" ? "Услуга" : "Портфолио"}
                    </span>
                  )}
                  {post.is_featured && (
                    <span className="bg-yellow-500 text-white text-[8px] uppercase tracking-wider px-1.5 py-0.5">★</span>
                  )}
                </div>
                <div className="absolute top-1.5 right-1.5">
                  <span className={cn("text-[8px] uppercase tracking-wider px-1.5 py-0.5", post.account === "decor" ? "bg-primary/80 text-white" : "bg-foreground/80 text-background")}>
                    {post.account === "decor" ? "D" : "S"}
                  </span>
                </div>
              </button>
              <button onClick={() => toggleFeatured(post)} className="absolute bottom-1.5 right-1.5 p-1 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" title="Избранное">
                <Star size={12} className={post.is_featured ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Link Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-2xl rounded-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">Привязка контента</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-5">
              {/* Preview */}
              <div className="flex gap-4">
                <img src={imgSrc(selectedPost)} alt="" className="w-28 h-28 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{selectedPost.caption || "Без описания"}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Аккаунт:</span>
                    <div className="flex gap-1">
                      {(["decor", "showroom"] as const).map(a => (
                        <button key={a} onClick={() => updateAccount(selectedPost, a)}
                          className={cn("px-2 py-0.5 text-[10px] border transition-colors",
                            selectedPost.account === a ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                          )}>
                          {a === "decor" ? "Decor" : "Showroom"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <a href={selectedPost.permalink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                    Instagram <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Link type */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">Тип привязки</label>
                <div className="flex gap-2">
                  {[
                    { value: "", label: "Нет", icon: X },
                    { value: "product", label: "Товары", icon: ShoppingBag },
                    { value: "service", label: "Услуга", icon: Palette },
                    { value: "portfolio", label: "Портфолио", icon: ImageIcon },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => { setEditLinkType(opt.value); if (opt.value !== "product") setEditProductIds([]); if (opt.value !== "service") setEditServiceIndex(null); if (opt.value !== "portfolio") setEditPortfolioIndex(null); }}
                      className={cn("flex items-center gap-1.5 px-3 py-2 text-xs border transition-colors",
                        editLinkType === opt.value ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"
                      )}>
                      <opt.icon size={13} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product selection */}
              {editLinkType === "product" && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">Выберите товары</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-border p-2">
                    {products.map(product => (
                      <button key={product.id} onClick={() => toggleProductLink(product.id)}
                        className={cn("flex items-center gap-2 p-2 text-left text-xs border transition-colors",
                          editProductIds.includes(product.id) ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/40"
                        )}>
                        {product.images?.[0] && <img src={product.images[0]} alt="" className="w-8 h-8 object-cover shrink-0" />}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="text-muted-foreground">{product.price.toLocaleString()} ₽</p>
                        </div>
                      </button>
                    ))}
                    {products.length === 0 && <p className="text-muted-foreground text-xs col-span-3 text-center py-4">Нет товаров</p>}
                  </div>
                </div>
              )}

              {/* Service selection */}
              {editLinkType === "service" && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">Выберите услугу</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICE_NAMES.map((name, i) => (
                      <button key={i} onClick={() => setEditServiceIndex(editServiceIndex === i ? null : i)}
                        className={cn("p-2.5 text-xs text-left border transition-colors",
                          editServiceIndex === i ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/40"
                        )}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio selection */}
              {editLinkType === "portfolio" && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">Выберите проект</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PORTFOLIO_NAMES.map((name, i) => (
                      <button key={i} onClick={() => setEditPortfolioIndex(editPortfolioIndex === i ? null : i)}
                        className={cn("p-2.5 text-xs text-left border transition-colors",
                          editPortfolioIndex === i ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/40"
                        )}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Save */}
              <div className="flex gap-3 pt-2">
                <Button onClick={saveLinks} className="rounded-none flex-1 gap-2">
                  <CheckCircle2 size={14} /> Сохранить
                </Button>
                <Button variant="outline" onClick={() => setSelectedPost(null)} className="rounded-none">
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInstagramCommerce;
