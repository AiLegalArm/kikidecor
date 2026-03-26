import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Play, Pause, SkipForward, SkipBack, Upload, X, Download, Film, ImageIcon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STYLES = [
  { value: "elegant", label: "Элегантный" },
  { value: "modern", label: "Современный" },
  { value: "romantic", label: "Романтичный" },
  { value: "classic", label: "Классический" },
  { value: "boho", label: "Бохо" },
];

const FRAME_COUNTS = [
  { value: 2, label: "2 кадра (быстро)" },
  { value: 4, label: "4 кадра (стандарт)" },
  { value: 6, label: "6 кадров (детально)" },
];

const AdminVideoGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("elegant");
  const [frameCount, setFrameCount] = useState(4);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [frames, setFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [transitionSpeed, setTransitionSpeed] = useState(2500);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Slideshow playback
  useEffect(() => {
    if (playing && frames.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
      }, transitionSpeed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, frames.length, transitionSpeed]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Загрузите изображение");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPhotoToStorage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `video-refs/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("venue-photos").upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data: urlData } = supabase.storage.from("venue-photos").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const generate = async () => {
    if (!prompt.trim() || prompt.trim().length < 5) {
      toast.error("Введите описание декора (минимум 5 символов)");
      return;
    }

    setLoading(true);
    setFrames([]);
    setCurrentFrame(0);
    setPlaying(false);
    setProgress("Подготовка...");

    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        setProgress("Загрузка фото...");
        photoUrl = (await uploadPhotoToStorage(photoFile)) || undefined;
      }

      setProgress(`Генерация ${frameCount} кадров декора... Это займёт 1-3 минуты`);

      const { data, error } = await supabase.functions.invoke("generate-decor-video", {
        body: { prompt: prompt.trim(), photoUrl, frameCount, style },
      });

      if (error) throw new Error(error.message);
      if (!data?.success || !data.frames?.length) {
        throw new Error(data?.message || "Не удалось сгенерировать кадры");
      }

      setFrames(data.frames);
      setCurrentFrame(0);
      toast.success(`Сгенерировано ${data.frames.length} кадров декора!`);

      // Auto-play
      setTimeout(() => setPlaying(true), 500);
    } catch (e: any) {
      console.error("Video gen error:", e);
      toast.error(e.message || "Ошибка генерации");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const downloadFrame = useCallback((index: number) => {
    const src = frames[index];
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `decor-frame-${index + 1}.png`;
    a.click();
  }, [frames]);

  const downloadAll = useCallback(() => {
    frames.forEach((_, i) => {
      setTimeout(() => downloadFrame(i), i * 300);
    });
  }, [frames, downloadFrame]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Film className="text-primary" size={24} />
        <h2 className="font-display text-2xl font-light">AI Видео Декора</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Генерируйте серию AI-визуализаций декора с разных ракурсов. Опишите концепцию или загрузите фото площадки.
      </p>

      {/* Input form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Описание декора *
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Свадебный декор в стиле прованс: лавандовые композиции, белые драпировки, свечи в стеклянных подсвечниках, арка из живых цветов..."
              rows={4}
              className="rounded-none border-border resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Стиль</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="rounded-none border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Кадры</label>
              <Select value={String(frameCount)} onValueChange={(v) => setFrameCount(Number(v))}>
                <SelectTrigger className="rounded-none border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRAME_COUNTS.map((f) => (
                    <SelectItem key={f.value} value={String(f.value)}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Фото площадки (опционально)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative border border-border p-2">
                <img src={photoPreview} alt="Reference" className="w-full h-32 object-cover" />
                <button onClick={removePhoto} className="absolute top-3 right-3 bg-background/80 p-1 border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <Button variant="outline" className="rounded-none w-full border-dashed" onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} className="mr-2" /> Загрузить фото площадки
              </Button>
            )}
          </div>

          <Button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="rounded-none w-full uppercase tracking-wider"
          >
            {loading ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Генерация...</>
            ) : (
              <><Sparkles size={16} className="mr-2" /> Сгенерировать видео-концепт</>
            )}
          </Button>

          {progress && (
            <div className="text-sm text-muted-foreground text-center animate-pulse">{progress}</div>
          )}
        </div>

        {/* Preview / Player */}
        <div className="space-y-3">
          {frames.length > 0 ? (
            <>
              <div className="relative border border-border bg-black aspect-video overflow-hidden">
                {frames.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Frame ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      opacity: currentFrame === i ? 1 : 0,
                      transition: "opacity 0.8s ease-in-out",
                    }}
                  />
                ))}
                {/* Frame counter */}
                <div className="absolute top-2 right-2 bg-background/70 text-foreground text-xs px-2 py-1 border border-border">
                  {currentFrame + 1} / {frames.length}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" className="rounded-none" onClick={() => setCurrentFrame((p) => (p - 1 + frames.length) % frames.length)}>
                  <SkipBack size={14} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-none" onClick={() => setPlaying(!playing)}>
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                <Button variant="outline" size="icon" className="rounded-none" onClick={() => setCurrentFrame((p) => (p + 1) % frames.length)}>
                  <SkipForward size={14} />
                </Button>
                <Select value={String(transitionSpeed)} onValueChange={(v) => setTransitionSpeed(Number(v))}>
                  <SelectTrigger className="rounded-none border-border w-28 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1500">Быстро</SelectItem>
                    <SelectItem value="2500">Стандарт</SelectItem>
                    <SelectItem value="4000">Медленно</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                {frames.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentFrame(i); setPlaying(false); }}
                    className={`border-2 aspect-video overflow-hidden transition-all ${currentFrame === i ? "border-primary" : "border-border opacity-60 hover:opacity-100"}`}
                  >
                    <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-none flex-1 text-xs" onClick={() => downloadFrame(currentFrame)}>
                  <Download size={14} className="mr-1" /> Скачать кадр
                </Button>
                <Button variant="outline" className="rounded-none flex-1 text-xs" onClick={downloadAll}>
                  <ImageIcon size={14} className="mr-1" /> Скачать все
                </Button>
              </div>
            </>
          ) : (
            <div className="border border-dashed border-border aspect-video flex flex-col items-center justify-center text-muted-foreground">
              <Film size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Здесь появится видео-презентация декора</p>
              <p className="text-xs mt-1">Опишите концепцию и нажмите «Сгенерировать»</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVideoGenerator;
