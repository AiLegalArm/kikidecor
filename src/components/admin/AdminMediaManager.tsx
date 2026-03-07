import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Upload, Trash2, Copy, Search, Grid3X3, List, ImageIcon, Loader2, FolderOpen, ExternalLink, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

type MediaFile = {
    name: string;
    publicUrl: string;
    size?: number;
    created_at?: string;
};

const BUCKETS = ["venue-photos", "products", "ai-generated"];
const BUCKET_LABELS: Record<string, string> = {
    "venue-photos": "Фото площадок",
    "products": "Товары",
    "ai-generated": "AI Генерации",
};

const AdminMediaManager = () => {
    const [activeBucket, setActiveBucket] = useState("venue-photos");
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const [dragging, setDragging] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadFiles = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.storage.from(activeBucket).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
            if (error) throw error;
            const mapped: MediaFile[] = (data || [])
                .filter(f => f.name && !f.name.startsWith("."))
                .map(f => {
                    const { data: urlData } = supabase.storage.from(activeBucket).getPublicUrl(f.name);
                    return { name: f.name, publicUrl: urlData.publicUrl, size: f.metadata?.size, created_at: f.created_at };
                });
            setFiles(mapped);
        } catch (e: any) {
            if (e?.message?.includes("The resource was not found")) {
                setFiles([]);
            } else {
                toast.error("Ошибка загрузки файлов");
            }
        }
        setLoading(false);
    }, [activeBucket]);

    useEffect(() => { loadFiles(); setSelected(new Set()); }, [loadFiles]);

    const handleUpload = async (fileList: FileList | null) => {
        if (!fileList?.length) return;
        setUploading(true);
        let ok = 0;
        for (const file of Array.from(fileList)) {
            if (!file.type.startsWith("image/")) continue;
            const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
            const { error } = await supabase.storage.from(activeBucket).upload(name, file, { contentType: file.type });
            if (!error) ok++;
        }
        setUploading(false);
        if (ok > 0) { toast.success(`Загружено ${ok} файл(ов)`); loadFiles(); }
        else toast.error("Ошибка загрузки");
    };

    const deleteSelected = async () => {
        if (!selected.size) return;
        if (!confirm(`Удалить ${selected.size} файл(ов)?`)) return;
        const { error } = await supabase.storage.from(activeBucket).remove(Array.from(selected));
        if (error) { toast.error("Ошибка удаления"); return; }
        toast.success("Удалено");
        setSelected(new Set());
        loadFiles();
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("URL скопирован");
    };

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    const formatSize = (bytes?: number) => {
        if (!bytes) return "";
        if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
        return `${(bytes / 1024).toFixed(0)} KB`;
    };

    const toggleSelect = (name: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    };

    return (
        <div>
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "#000", margin: "0 0 4px" }}>Media Manager</h2>
                    <p style={{ fontSize: "0.875rem", color: "#666", margin: 0 }}>{files.length} файлов в хранилище</p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {selected.size > 0 && (
                        <button onClick={deleteSelected} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
                            <Trash2 size={14} /> Удалить ({selected.size})
                        </button>
                    )}
                    <button onClick={loadFiles} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "8px", background: "#F3F4F6", border: "1px solid #E5E5E5", color: "#555", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}>
                        <RefreshCw size={14} />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "8px", background: "#000", color: "#fff", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", border: "none" }}
                    >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploading ? "Загрузка..." : "Загрузить"}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleUpload(e.target.files)} hidden />
                </div>
            </div>

            {/* Buckets tabs */}
            <div style={{ display: "flex", gap: "4px", background: "#F5F5F5", borderRadius: "10px", padding: "4px", marginBottom: "16px", width: "fit-content" }}>
                {BUCKETS.map(b => (
                    <button key={b} onClick={() => setActiveBucket(b)} style={{ padding: "7px 14px", borderRadius: "7px", border: "none", cursor: "pointer", fontWeight: activeBucket === b ? 600 : 500, fontSize: "0.8125rem", background: activeBucket === b ? "#000" : "transparent", color: activeBucket === b ? "#fff" : "#555", transition: "all 0.15s" }}>
                        {BUCKET_LABELS[b] || b}
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
                    <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени..." style={{ width: "100%", padding: "9px 12px 9px 32px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "0.875rem", color: "#111", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: "2px", background: "#F5F5F5", borderRadius: "8px", padding: "3px" }}>
                    <button onClick={() => setViewMode("grid")} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", cursor: "pointer", background: viewMode === "grid" ? "#fff" : "transparent", color: viewMode === "grid" ? "#000" : "#888", boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><Grid3X3 size={14} /></button>
                    <button onClick={() => setViewMode("list")} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", cursor: "pointer", background: viewMode === "list" ? "#fff" : "transparent", color: viewMode === "list" ? "#000" : "#888", boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><List size={14} /></button>
                </div>
            </div>

            {/* Drop zone (full area) */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files); }}
                style={{ minHeight: "200px", position: "relative" }}
            >
                {dragging && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(124,58,237,0.08)", border: "2px dashed #7C3AED", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p style={{ fontWeight: 700, color: "#7C3AED" }}>Отпустите файлы</p>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
                        <Loader2 size={28} style={{ color: "#7C3AED" }} className="animate-spin" />
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", border: "2px dashed #E5E5E5", borderRadius: "12px", cursor: "pointer", background: "#FAFAFA" }}
                    >
                        <FolderOpen size={40} style={{ color: "#D1D5DB", marginBottom: "12px" }} />
                        <p style={{ fontWeight: 600, color: "#888", margin: "0 0 4px" }}>Нет файлов</p>
                        <p style={{ fontSize: "0.8125rem", color: "#AAA" }}>Нажмите или перетащите изображения</p>
                    </div>
                ) : viewMode === "grid" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                        {filteredFiles.map(f => (
                            <div key={f.name}
                                style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: selected.has(f.name) ? "2px solid #7C3AED" : "2px solid transparent", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer" }}
                                onClick={() => toggleSelect(f.name)}
                            >
                                <div style={{ height: "140px", overflow: "hidden", background: "#F5F5F5" }}>
                                    <img src={f.publicUrl} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                </div>
                                <div style={{ padding: "8px 10px" }}>
                                    <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                                    {f.size && <p style={{ margin: "2px 0 0", fontSize: "0.6875rem", color: "#888" }}>{formatSize(f.size)}</p>}
                                </div>
                                {/* Actions */}
                                <div style={{ position: "absolute", top: "6px", right: "6px", display: "flex", gap: "4px" }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => copyUrl(f.publicUrl)} style={{ padding: "5px", borderRadius: "6px", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex" }}><Copy size={12} /></button>
                                    <a href={f.publicUrl} target="_blank" rel="noreferrer" style={{ padding: "5px", borderRadius: "6px", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", textDecoration: "none", color: "#333" }}><ExternalLink size={12} /></a>
                                </div>
                                {selected.has(f.name) && (
                                    <div style={{ position: "absolute", top: "6px", left: "6px", width: "20px", height: "20px", borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: "12px", overflow: "hidden" }}>
                        {filteredFiles.map((f, i) => (
                            <div key={f.name}
                                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderBottom: i < filteredFiles.length - 1 ? "1px solid #F5F5F5" : "none", cursor: "pointer", background: selected.has(f.name) ? "#F0EDFF" : "transparent" }}
                                onClick={() => toggleSelect(f.name)}
                            >
                                <div style={{ width: "44px", height: "44px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#F5F5F5" }}>
                                    <img src={f.publicUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).src = ""; }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#888" }}>{formatSize(f.size)}</p>
                                </div>
                                <div style={{ display: "flex", gap: "4px" }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => copyUrl(f.publicUrl)} style={{ padding: "6px 10px", borderRadius: "6px", background: "#F5F5F5", border: "none", cursor: "pointer", display: "flex", gap: "4px", alignItems: "center", fontSize: "0.75rem", color: "#555" }}><Copy size={12} /> URL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMediaManager;
