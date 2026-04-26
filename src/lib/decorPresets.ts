export type DecorPreset = {
  id: string;
  name: string;
  mood: string;
  palette: string[];
  materials: string[];
  language: string;
  promptInfluence: string;
  swatch: string[]; // hex for chip preview
};

export const DECOR_PRESETS: DecorPreset[] = [
  {
    id: "modern-luxury",
    name: "Modern Luxury",
    mood: "confident, refined, glossy",
    palette: ["deep charcoal", "champagne", "polished bronze"],
    materials: ["lacquered wood", "brushed brass", "smoked glass"],
    language: "graphic, sculptural, contrast-driven",
    promptInfluence: "modern luxury interior, polished surfaces, dramatic key light, designer furniture, editorial composition",
    swatch: ["#1d1d1f", "#c9b27a", "#7a5a2b"],
  },
  {
    id: "quiet-luxury",
    name: "Quiet Luxury",
    mood: "calm, contemplative, restrained",
    palette: ["warm beige", "cream", "muted bronze"],
    materials: ["raw linen", "travertine", "matte oak"],
    language: "soft, restrained, sculptural",
    promptInfluence: "quiet luxury interior, tonal palette, no logos, soft window light, slow camera",
    swatch: ["#d9cdb6", "#efe7d6", "#a08866"],
  },
  {
    id: "minimalist-warm-beige",
    name: "Minimalist Warm Beige",
    mood: "serene, weightless, soft",
    palette: ["sand", "ivory", "warm grey"],
    materials: ["plaster walls", "bouclé textile", "pale ash wood"],
    language: "minimal lines, generous negative space",
    promptInfluence: "warm beige minimalism, soft diffused daylight, sparse decor, Kinfolk magazine aesthetic",
    swatch: ["#e8dcc6", "#f4ecdd", "#bfb5a4"],
  },
  {
    id: "sculptural-contemporary",
    name: "Sculptural Contemporary",
    mood: "bold, architectural, gallery-like",
    palette: ["off-white", "concrete grey", "ochre accent"],
    materials: ["cast concrete", "raw plaster", "blackened steel"],
    language: "monolithic forms, strong silhouettes",
    promptInfluence: "sculptural contemporary interior, monolithic shapes, museum lighting, bold negative space",
    swatch: ["#ece8e1", "#9a9690", "#c08a3a"],
  },
  {
    id: "soft-wabi-sabi",
    name: "Soft Wabi-Sabi",
    mood: "imperfect, organic, meditative",
    palette: ["clay", "stone grey", "moss"],
    materials: ["raku ceramics", "uneven plaster", "weathered wood"],
    language: "imperfect, handmade, breathing",
    promptInfluence: "wabi-sabi interior, hand-thrown ceramics, weathered surfaces, soft north light",
    swatch: ["#bfa593", "#8e8980", "#7d8a6a"],
  },
  {
    id: "premium-scandinavian",
    name: "Premium Scandinavian",
    mood: "bright, honest, calm",
    palette: ["snow white", "pale oak", "soft slate"],
    materials: ["white oak", "wool", "matte ceramic"],
    language: "honest materials, functional elegance",
    promptInfluence: "premium scandinavian interior, white oak floor, large window, hygge atmosphere",
    swatch: ["#f7f4ee", "#d6c2a4", "#8c919b"],
  },
  {
    id: "elegant-neoclassical",
    name: "Elegant Neoclassical",
    mood: "stately, balanced, timeless",
    palette: ["alabaster", "soft gold", "parchment"],
    materials: ["marble", "gilded mouldings", "silk velvet"],
    language: "symmetrical, ornamented yet restrained",
    promptInfluence: "neoclassical luxury interior, marble columns, soft gold accents, candle-like warm light",
    swatch: ["#f3ecdf", "#cfa962", "#e6dac0"],
  },
  {
    id: "dark-luxury",
    name: "Dark Luxury Interior",
    mood: "moody, opulent, cinematic",
    palette: ["onyx", "deep burgundy", "antique gold"],
    materials: ["dark walnut", "smoked mirror", "polished marble"],
    language: "low-key lighting, jewel-tone accents",
    promptInfluence: "dark luxury interior, low-key chiaroscuro lighting, deep shadows, antique gold reflections",
    swatch: ["#171515", "#5a1f23", "#a07a3a"],
  },
  {
    id: "organic-modern",
    name: "Organic Modern",
    mood: "grounded, natural, calm",
    palette: ["earth brown", "sage", "ivory"],
    materials: ["live-edge wood", "linen", "natural stone"],
    language: "curves, organic silhouettes",
    promptInfluence: "organic modern interior, curved furniture, living plants, warm sunlight raking across textures",
    swatch: ["#7a5a3c", "#a3b08c", "#f1ead7"],
  },
  {
    id: "high-end-mediterranean",
    name: "High-End Mediterranean",
    mood: "sun-soaked, breezy, soulful",
    palette: ["whitewashed lime", "terracotta", "sea blue"],
    materials: ["lime plaster", "rough wood beams", "handmade tile"],
    language: "rustic refinement, sunlit calm",
    promptInfluence: "high-end mediterranean villa interior, lime plaster walls, terracotta floor, golden hour light, gauzy curtains",
    swatch: ["#f1ebe1", "#c97c54", "#7ba3b5"],
  },
  {
    id: "japandi-premium",
    name: "Japandi Premium",
    mood: "tranquil, disciplined, warm-minimal",
    palette: ["paper white", "charcoal", "tea brown"],
    materials: ["paulownia wood", "rice paper", "matte black metal"],
    language: "low furniture, quiet rhythm",
    promptInfluence: "japandi premium interior, low wooden furniture, shoji screens, soft indirect light, zen calm",
    swatch: ["#f0ece4", "#2b2a28", "#8c6a4c"],
  },
  {
    id: "art-deco-revival",
    name: "Art Deco Revival",
    mood: "glamorous, geometric, bold",
    palette: ["emerald", "black lacquer", "champagne gold"],
    materials: ["fluted glass", "polished brass", "lacquered wood"],
    language: "geometric symmetry, jewel tones",
    promptInfluence: "art deco revival interior, fluted glass, brass inlays, geometric patterns, dramatic theatrical lighting",
    swatch: ["#1a3b32", "#0e0e0e", "#c9a560"],
  },
  {
    id: "boutique-hotel",
    name: "Boutique Hotel Style",
    mood: "considered, hospitable, refined",
    palette: ["taupe", "smoke", "warm brass"],
    materials: ["velvet upholstery", "smoked oak", "cast brass"],
    language: "layered textures, tailored geometry",
    promptInfluence: "boutique hotel lobby interior, layered textures, tailored upholstery, ambient lounge lighting",
    swatch: ["#a89886", "#6b6862", "#a8895a"],
  },
  {
    id: "soft-parisian-chic",
    name: "Soft Parisian Chic",
    mood: "romantic, effortless, lived-in",
    palette: ["bone white", "rosé", "muted gold"],
    materials: ["herringbone parquet", "linen", "antique brass"],
    language: "tall windows, vintage elegance",
    promptInfluence: "parisian chic apartment interior, herringbone parquet, tall windows, soft afternoon light, vintage mirrors",
    swatch: ["#f4ece2", "#d8b4a6", "#b29156"],
  },
  {
    id: "monochrome-stone",
    name: "Monochrome Stone Elegance",
    mood: "cool, architectural, precise",
    palette: ["warm white", "pale grey", "graphite"],
    materials: ["honed limestone", "concrete", "matte plaster"],
    language: "tonal monochrome, sharp lines",
    promptInfluence: "monochrome stone interior, honed limestone surfaces, tonal palette, soft overcast light",
    swatch: ["#eceae4", "#bdbab3", "#3d3b39"],
  },
  {
    id: "rich-earth-tones",
    name: "Rich Earth Tones",
    mood: "warm, grounded, sensual",
    palette: ["cinnamon", "rust", "deep ochre"],
    materials: ["oiled walnut", "leather", "raw clay"],
    language: "saturated warmth, layered earth",
    promptInfluence: "rich earth-tone interior, saturated warm palette, oiled walnut, leather, golden lamp light",
    swatch: ["#9a5a36", "#b8623b", "#c98e3a"],
  },
  {
    id: "gallery-contemporary",
    name: "Gallery-like Contemporary",
    mood: "clean, intellectual, curated",
    palette: ["pure white", "black", "single accent"],
    materials: ["polished concrete", "white plaster", "anodized metal"],
    language: "museum precision, generous white space",
    promptInfluence: "gallery-like contemporary interior, museum-grade white walls, precise spotlights, single bold artwork",
    swatch: ["#ffffff", "#0e0e0e", "#c75a3a"],
  },
  {
    id: "italian-luxury-living",
    name: "Italian Luxury Living",
    mood: "warm, sophisticated, dolce-vita",
    palette: ["cream", "olive", "amber"],
    materials: ["travertine", "boucle", "cognac leather"],
    language: "sculptural curves, sun-warmed",
    promptInfluence: "italian luxury living room, travertine floor, curved cognac leather sofa, warm golden Mediterranean light",
    swatch: ["#efe5cf", "#7d7a4a", "#c8893a"],
  },
  {
    id: "refined-bohemian",
    name: "Refined Bohemian Luxury",
    mood: "free-spirited, layered, soulful",
    palette: ["camel", "cinnabar", "ivory"],
    materials: ["vintage rugs", "rattan", "carved wood"],
    language: "rich layering, eclectic harmony",
    promptInfluence: "refined bohemian luxury interior, vintage rugs, rattan accents, layered textiles, warm dappled light",
    swatch: ["#b58a5b", "#a13e26", "#f1eadd"],
  },
  {
    id: "architectural-minimalism",
    name: "Architectural Minimalism",
    mood: "exact, silent, precise",
    palette: ["pale concrete", "shadow grey", "warm white"],
    materials: ["fair-faced concrete", "glass", "steel"],
    language: "pure geometry, voids and planes",
    promptInfluence: "architectural minimalism interior, fair-faced concrete, geometric voids, raking sunlight, Tadao Ando inspired",
    swatch: ["#d8d3c9", "#5e5c58", "#f3efe7"],
  },
];

export const MOTION_OPTIONS = [
  { id: "static", label: "Static", camera: "locked camera, no movement" },
  { id: "slow-pan", label: "Slow Pan", camera: "slow horizontal pan" },
  { id: "dolly-in", label: "Dolly In", camera: "smooth dolly-in towards subject" },
  { id: "dolly-out", label: "Dolly Out", camera: "smooth dolly-out revealing space" },
  { id: "orbit", label: "Orbit", camera: "gentle orbit around the subject" },
  { id: "tilt-up", label: "Tilt Up", camera: "slow tilt up revealing height" },
  { id: "crane-down", label: "Crane Down", camera: "crane down from above into the scene" },
  { id: "handheld", label: "Subtle Handheld", camera: "subtle organic handheld motion" },
] as const;

export const SPEED_OPTIONS = ["very slow", "slow", "moderate"] as const;

export const MOOD_OPTIONS = [
  { id: "serene", label: "Serene", tone: "serene and calm" },
  { id: "cinematic", label: "Cinematic", tone: "cinematic and dramatic" },
  { id: "romantic", label: "Romantic", tone: "romantic and intimate" },
  { id: "editorial", label: "Editorial", tone: "editorial and refined" },
  { id: "festive", label: "Festive", tone: "festive and celebratory" },
  { id: "moody", label: "Moody", tone: "moody and atmospheric" },
] as const;

export const LIGHTING_OPTIONS = [
  { id: "golden-hour", label: "Golden Hour", desc: "warm golden hour sunlight" },
  { id: "soft-daylight", label: "Soft Daylight", desc: "soft diffused daylight from a large window" },
  { id: "candle", label: "Candlelit", desc: "warm candlelight, low key" },
  { id: "studio", label: "Studio", desc: "controlled studio lighting" },
  { id: "blue-hour", label: "Blue Hour", desc: "cool blue hour ambient light" },
  { id: "spotlight", label: "Spotlight", desc: "directional spotlight, gallery style" },
] as const;

export type MotionState = {
  cameraId: string;
  speed: typeof SPEED_OPTIONS[number];
};

export type MoodState = {
  toneId: string;
  lightingId: string;
};

export type OutputState = {
  resolution: "480p" | "1080p";
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9";
  duration: 5 | 10;
  cameraFixed: boolean;
};

export type WanGenerateInput = {
  userPrompt: string;
  presetId: string;
  motion: MotionState;
  mood: MoodState;
  output: OutputState;
  negativePrompt?: string;
  styleStrength: number; // 0-100
  firstFrameUrl?: string | null;
  lastFrameUrl?: string | null;
  lastFrameDescription?: string | null;
};

/**
 * Build the final Wan video prompt.
 *
 * Rules (in strict order):
 *  1. Subject: user prompt (always first, verbatim — it sets intent).
 *  2. First Frame: anchor instruction — animate FROM this frame.
 *  3. Last Frame: target composition — analyzed via vision and used as the END goal.
 *  4. Style block: preset name, language, palette, materials.
 *  5. Mood + Lighting block.
 *  6. Motion block: camera move + speed (+ "locked camera" if cameraFixed).
 *  7. Style emphasis: repeat preset.promptInfluence weighted by styleStrength (0–100).
 *       0–19   → omit (style barely applied)
 *       20–49  → 1× emphasis
 *       50–74  → 2× emphasis
 *       75–89  → 3× emphasis
 *       90–100 → 4× emphasis + "strongly enforce style"
 *  8. Output hints: aspect ratio + duration + resolution.
 *  9. Quality baseline (always appended).
 * 10. Negative prompt: ALWAYS as a separate "Negative prompt:" line at the end
 *      (merged with default safety negatives).
 */
const DEFAULT_NEGATIVES = [
  "text", "captions", "subtitles", "watermark", "logo", "brand names",
  "distorted geometry", "warped furniture", "extra limbs", "deformed hands",
  "low quality", "blurry", "compression artifacts", "oversaturated",
];

function styleEmphasisCount(strength: number): number {
  const s = Math.max(0, Math.min(100, strength));
  if (s < 20) return 0;
  if (s < 50) return 1;
  if (s < 75) return 2;
  if (s < 90) return 3;
  return 4;
}

export function buildWanPrompt(input: WanGenerateInput): string {
  const preset = DECOR_PRESETS.find((p) => p.id === input.presetId);
  const motion = MOTION_OPTIONS.find((m) => m.id === input.motion.cameraId);
  const mood = MOOD_OPTIONS.find((m) => m.id === input.mood.toneId);
  const lighting = LIGHTING_OPTIONS.find((l) => l.id === input.mood.lightingId);

  const lines: string[] = [];

  // 1. Subject
  const subject = input.userPrompt.trim();
  if (subject) lines.push(`Subject: ${subject}`);

  // 2. First frame anchor
  if (input.firstFrameUrl) {
    lines.push(
      "First frame: animate starting from the provided reference image; preserve its composition, framing, color and lighting in frame 1.",
    );
  }

  // 3. Last frame target
  if (input.lastFrameDescription) {
    lines.push(
      `Last frame target: end the shot on a composition that resembles — ${input.lastFrameDescription.trim()}. Smoothly evolve toward this ending.`,
    );
  } else if (input.lastFrameUrl) {
    lines.push(
      "Last frame target: end the shot on a composition matching the provided ending reference image.",
    );
  }

  // 4. Style block
  if (preset) {
    lines.push(
      `Style: ${preset.name} — ${preset.mood}; visual language is ${preset.language}.`,
    );
    lines.push(`Palette: ${preset.palette.join(", ")}.`);
    lines.push(`Materials & textures: ${preset.materials.join(", ")}.`);
  }

  // 5. Mood + lighting
  if (mood && lighting) {
    lines.push(`Mood: ${mood.tone}. Lighting: ${lighting.desc}.`);
  } else if (mood) {
    lines.push(`Mood: ${mood.tone}.`);
  } else if (lighting) {
    lines.push(`Lighting: ${lighting.desc}.`);
  }

  // 6. Motion
  if (motion) {
    const speed = input.motion.speed;
    const fixed = input.output.cameraFixed ? " The camera frame is locked and stable, no shake." : "";
    lines.push(`Camera: ${motion.camera}, ${speed} pace.${fixed}`);
  }

  // 7. Style emphasis (weighted by styleStrength)
  if (preset) {
    const reps = styleEmphasisCount(input.styleStrength);
    if (reps > 0) {
      const emphasis = Array(reps).fill(preset.promptInfluence).join(" ");
      lines.push(
        reps >= 4
          ? `Style emphasis (strongly enforce): ${emphasis}`
          : `Style emphasis: ${emphasis}`,
      );
    }
  }

  // 8. Output hints
  lines.push(
    `Output: ${input.output.aspectRatio} aspect ratio, ${input.output.duration}s duration, ${input.output.resolution} resolution.`,
  );

  // 9. Quality baseline
  lines.push(
    "Quality: photorealistic, premium interior cinematography, natural physics, smooth motion, consistent lighting, no flicker.",
  );

  // 10. Negative prompt — always last, on its own line
  const userNeg = input.negativePrompt?.trim();
  const negatives = userNeg
    ? [userNeg, ...DEFAULT_NEGATIVES].join(", ")
    : DEFAULT_NEGATIVES.join(", ");
  lines.push(`Negative prompt: ${negatives}.`);

  return lines.join("\n");
}