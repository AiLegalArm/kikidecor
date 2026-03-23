import type jsPDFType from "jspdf";
import { savePDFCrossPlatform } from "./pdfSaveHelper";

type ConceptData = {
  conceptName: string;
  conceptDescription: string;
  colorPalette?: string[];
  colorHexCodes?: string[];
  decorElements?: { name: string; description: string; category: string }[];
  flowerArrangements?: { name: string; flowers: string[]; placement: string; style: string }[];
  lightingIdeas?: { element: string; placement: string; effect: string }[];
  backdropIdeas?: { name: string; description: string; purpose: string }[];
  tableDecoration?: { style: string; centerpiece: string; tableware: string; accents: string; runner?: string };
  estimatedComplexity?: string;
  estimatedBudget?: string;
  venueSpecificNotes?: string;
  inspirationImages?: string[];
  // Facade-specific
  facadeElements?: { name: string; description: string; placement: string; category: string }[];
  lightingPlan?: { element: string; placement: string; effect: string }[];
  floralInstallations?: { name: string; flowers: string[]; placement: string; scale?: string }[];
  architecturalNotes?: string;
  generatedImages?: string[];
};

const COMPLEXITY_LABELS: Record<string, string> = {
  low: "Базовая", medium: "Средняя", high: "Высокая", ultra: "Премиум",
};

const BUDGET_MAP: Record<string, string> = {
  low: "80 000 – 150 000 ₽", medium: "150 000 – 350 000 ₽",
  high: "350 000 – 700 000 ₽", ultra: "700 000 – 2 000 000+ ₽",
};

const CATEGORY_LABELS: Record<string, string> = {
  focal: "Фокусная точка", table: "Стол", ambient: "Атмосфера",
  entrance: "Вход", ceiling: "Потолок", wall: "Стены", floor: "Пол",
  windows: "Окна", roof: "Крыша", columns: "Колонны", garden: "Сад",
  lighting: "Освещение", drapery: "Драпировка",
};

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportConceptToPDF(
  concept: ConceptData,
  meta?: { eventType?: string; venueType?: string; guestCount?: string; decorStyle?: string }
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > 280) { doc.addPage(); y = margin; }
  };

  // ── Helpers ──
  const drawLine = (color = "#E0E0E0") => {
    doc.setDrawColor(color);
    doc.setLineWidth(0.3);
    doc.line(margin, y, W - margin, y);
    y += 4;
  };

  const sectionTitle = (title: string) => {
    checkPage(14);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor("#7C3AED");
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    drawLine("#E9D5FF");
    y += 2;
  };

  const bodyText = (text: string, maxW = contentW) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#333333");
    const lines = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      checkPage(5);
      doc.text(line, margin, y);
      y += 4.5;
    }
  };

  const boldLabel = (label: string, value: string, maxW = contentW) => {
    checkPage(6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor("#111111");
    doc.text(label + ": ", margin, y);
    const labelW = doc.getTextWidth(label + ": ");
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#444444");
    const valLines = doc.splitTextToSize(value, maxW - labelW);
    doc.text(valLines[0], margin + labelW, y);
    y += 4.5;
    for (let i = 1; i < valLines.length; i++) {
      checkPage(5);
      doc.text(valLines[i], margin, y);
      y += 4.5;
    }
  };

  // ── Cover / Header ──
  // Purple header bar
  doc.setFillColor("#7C3AED");
  doc.rect(0, 0, W, 50, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor("#FFFFFF");
  doc.text("KiKi Decor Studio", margin, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("rgba(255,255,255,0.85)");
  doc.text("Концепция оформления мероприятия", margin, 30);

  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" }), margin, 40);

  y = 60;

  // ── Concept Name ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor("#111111");
  const nameLines = doc.splitTextToSize(concept.conceptName, contentW);
  for (const line of nameLines) {
    doc.text(line, margin, y);
    y += 8;
  }
  y += 2;

  // Complexity + Budget badge
  if (concept.estimatedComplexity) {
    const complexity = COMPLEXITY_LABELS[concept.estimatedComplexity] || concept.estimatedComplexity;
    const budget = concept.estimatedBudget || BUDGET_MAP[concept.estimatedComplexity] || "";
    doc.setFillColor("#F0EDFF");
    doc.roundedRect(margin, y - 4, contentW, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor("#7C3AED");
    doc.text(`Сложность: ${complexity}`, margin + 4, y + 2);
    if (budget) {
      doc.text(`Бюджет: ${budget}`, margin + contentW / 2, y + 2);
    }
    y += 14;
  }

  // Meta info
  if (meta?.eventType || meta?.venueType) {
    const parts: string[] = [];
    if (meta.eventType) parts.push(`Мероприятие: ${meta.eventType}`);
    if (meta.venueType) parts.push(`Площадка: ${meta.venueType}`);
    if (meta.guestCount) parts.push(`Гостей: ${meta.guestCount}`);
    if (meta.decorStyle) parts.push(`Стиль: ${meta.decorStyle}`);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#888888");
    doc.text(parts.join("  •  "), margin, y);
    y += 8;
  }

  // Description
  bodyText(concept.conceptDescription);
  y += 4;

  // ── Color Palette ──
  if (concept.colorHexCodes?.length) {
    sectionTitle("Цветовая палитра");
    const swatchSize = 12;
    const gap = 4;
    let x = margin;
    concept.colorHexCodes.forEach((hex, i) => {
      checkPage(22);
      doc.setFillColor(hex);
      doc.roundedRect(x, y, swatchSize, swatchSize, 2, 2, "F");
      doc.setDrawColor("#E0E0E0");
      doc.roundedRect(x, y, swatchSize, swatchSize, 2, 2, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor("#555");
      const name = concept.colorPalette?.[i] || "";
      if (name) doc.text(name, x, y + swatchSize + 4, { maxWidth: swatchSize + 8 });
      doc.setFontSize(6);
      doc.setTextColor("#999");
      doc.text(hex, x, y + swatchSize + (name ? 8 : 4));

      x += swatchSize + gap + 14;
      if (x + swatchSize > W - margin) { x = margin; y += swatchSize + 14; }
    });
    y += swatchSize + 14;
  }

  // ── Decor Elements ──
  const elements = concept.decorElements || concept.facadeElements || [];
  if (elements.length) {
    sectionTitle(concept.facadeElements ? "Элементы фасада" : "Элементы декора");
    for (const el of elements) {
      checkPage(16);
      const cat = CATEGORY_LABELS[el.category] || el.category;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#111");
      doc.text(`${el.name}`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor("#999");
      doc.text(`[${cat}]`, margin + doc.getTextWidth(el.name + " ") + 2, y);
      y += 4.5;
      bodyText(el.description);
      if ("placement" in el && (el as any).placement) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor("#888");
        checkPage(5);
        doc.text(`Размещение: ${(el as any).placement}`, margin + 2, y);
        y += 4.5;
      }
      y += 2;
    }
  }

  // ── Flower Arrangements ──
  const flowers = concept.flowerArrangements || concept.floralInstallations || [];
  if (flowers.length) {
    sectionTitle("Флористика");
    for (const arr of flowers) {
      checkPage(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#111");
      doc.text(arr.name, margin, y);
      y += 4.5;
      const flowerList = arr.flowers.join(", ");
      boldLabel("Цветы", flowerList);
      boldLabel("Размещение", arr.placement);
      if ("style" in arr && (arr as any).style) boldLabel("Стиль", (arr as any).style);
      if ("scale" in arr && (arr as any).scale) boldLabel("Масштаб", (arr as any).scale);
      y += 2;
    }
  }

  // ── Lighting ──
  const lighting = concept.lightingIdeas || concept.lightingPlan || [];
  if (lighting.length) {
    sectionTitle("Освещение");
    for (const idea of lighting) {
      checkPage(14);
      boldLabel("Элемент", idea.element);
      boldLabel("Расположение", idea.placement);
      boldLabel("Эффект", idea.effect);
      y += 2;
    }
  }

  // ── Backdrops ──
  if (concept.backdropIdeas?.length) {
    sectionTitle("Фото-зоны и бэкдропы");
    for (const bd of concept.backdropIdeas) {
      checkPage(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#111");
      doc.text(`${bd.name} (${bd.purpose})`, margin, y);
      y += 4.5;
      bodyText(bd.description);
      y += 2;
    }
  }

  // ── Table Decoration ──
  if (concept.tableDecoration) {
    sectionTitle("Сервировка стола");
    const td = concept.tableDecoration;
    boldLabel("Стиль", td.style);
    boldLabel("Центральная композиция", td.centerpiece);
    boldLabel("Посуда и текстиль", td.tableware);
    boldLabel("Акценты", td.accents);
    if (td.runner) boldLabel("Дорожка", td.runner);
  }

  // ── Venue / Architectural Notes ──
  if (concept.venueSpecificNotes || concept.architecturalNotes) {
    sectionTitle("Заметки по площадке");
    bodyText(concept.venueSpecificNotes || concept.architecturalNotes || "");
  }

  // ── Inspiration Images ──
  const images = concept.inspirationImages || concept.generatedImages || [];
  if (images.length) {
    doc.addPage();
    y = margin;
    sectionTitle("AI-визуализации");

    for (let i = 0; i < images.length; i++) {
      const imgData = await loadImageAsDataUrl(images[i]);
      if (!imgData) continue;

      checkPage(80);
      try {
        const imgW = contentW;
        const imgH = imgW * 0.65;
        doc.addImage(imgData, "JPEG", margin, y, imgW, imgH);
        y += imgH + 6;
      } catch {
        // Skip invalid image
      }
    }
  }

  // ── Footer on each page ──
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor("#BBBBBB");
    doc.text("KiKi Decor Studio • kikidecor.ru", margin, 290);
    doc.text(`${p} / ${pageCount}`, W - margin, 290, { align: "right" });
  }

  // ── Save ──
  const safeName = concept.conceptName.replace(/[^a-zA-Zа-яА-Я0-9]/g, "_").slice(0, 40);
  savePDFCrossPlatform(doc, `KiKi_Concept_${safeName}.pdf`);
}
