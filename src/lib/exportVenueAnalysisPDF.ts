import type jsPDFType from "jspdf";
import { savePDFCrossPlatform } from "./pdfSaveHelper";

type VenueData = {
  venue_type: string;
  estimated_area_sqm?: number;
  estimated_capacity?: number;
  ceiling_height_m?: number;
  architectural_features?: Array<{ feature: string; location: string; decor_potential: string }>;
  existing_elements?: Array<{ element: string; count?: number; condition?: string }>;
  decoration_zones: Array<{
    zone_name: string;
    zone_type: string;
    description: string;
    priority: string;
    estimated_budget_range?: string;
  }>;
  lighting_analysis: {
    natural_light: string;
    existing_fixtures: string;
    recommendations: string;
  };
  color_scheme_recommendation: {
    primary_colors: string[];
    accent_colors: string[];
    reasoning: string;
  };
  overall_recommendation: string;
  estimated_total_budget?: string;
};

export async function exportVenueAnalysisToPDF(
  analysis: VenueData,
  meta?: { eventType?: string; guestCount?: string; colorPalette?: string }
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const M = 18;
  const CW = W - M * 2;
  let y = 0;

  const check = (n: number) => { if (y + n > 280) { doc.addPage(); y = M; } };

  // Header
  doc.setFillColor("#7C3AED");
  doc.rect(0, 0, W, 44, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#FFFFFF");
  doc.text("KiKi Decor Studio", M, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Анализ площадки", M, 28);
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" }), M, 36);
  y = 52;

  // Venue type
  const boldLabel = (label: string, value: string) => {
    check(6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor("#111");
    const lbl = label + ": ";
    doc.text(lbl, M, y);
    const lw = doc.getTextWidth(lbl);
    doc.setFont("helvetica", "normal"); doc.setTextColor("#444");
    const lines = doc.splitTextToSize(value, CW - lw);
    doc.text(lines[0], M + lw, y); y += 4.5;
    for (let i = 1; i < lines.length; i++) { check(4); doc.text(lines[i], M, y); y += 4; }
  };

  const sectionTitle = (title: string) => {
    check(12); y += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor("#7C3AED");
    doc.text(title, M, y); y += 2;
    doc.setDrawColor("#E9D5FF"); doc.setLineWidth(0.3); doc.line(M, y, W - M, y); y += 5;
  };

  const bodyText = (text: string) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor("#333");
    const lines = doc.splitTextToSize(text, CW);
    for (const l of lines) { check(5); doc.text(l, M, y); y += 4.5; }
  };

  // Overview
  sectionTitle("Общая информация");
  boldLabel("Тип площадки", analysis.venue_type);
  if (analysis.estimated_area_sqm) boldLabel("Площадь", `${analysis.estimated_area_sqm} м²`);
  if (analysis.ceiling_height_m) boldLabel("Высота потолков", `${analysis.ceiling_height_m} м`);
  if (analysis.estimated_capacity) boldLabel("Вместимость", `~${analysis.estimated_capacity} чел.`);
  if (analysis.estimated_total_budget) boldLabel("Бюджет декора", analysis.estimated_total_budget);
  if (meta?.eventType) boldLabel("Тип мероприятия", meta.eventType);
  if (meta?.guestCount) boldLabel("Гостей", meta.guestCount);
  y += 2;

  // Decoration zones
  if (analysis.decoration_zones?.length) {
    sectionTitle("Зоны декорирования");
    for (const zone of analysis.decoration_zones) {
      check(16);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor("#111");
      doc.text(`${zone.zone_name} (${zone.priority})`, M, y); y += 4.5;
      bodyText(zone.description);
      if (zone.estimated_budget_range) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor("#888");
        check(4); doc.text(`Бюджет: ${zone.estimated_budget_range}`, M + 2, y); y += 4;
      }
      y += 2;
    }
  }

  // Architectural features
  if (analysis.architectural_features?.length) {
    sectionTitle("Архитектурные особенности");
    for (const f of analysis.architectural_features) {
      check(12);
      boldLabel(f.feature, f.decor_potential);
      doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor("#888");
      check(4); doc.text(`Расположение: ${f.location}`, M + 2, y); y += 4.5;
    }
  }

  // Lighting
  if (analysis.lighting_analysis) {
    sectionTitle("Освещение");
    boldLabel("Естественный свет", analysis.lighting_analysis.natural_light);
    boldLabel("Существующее", analysis.lighting_analysis.existing_fixtures);
    boldLabel("Рекомендации", analysis.lighting_analysis.recommendations);
  }

  // Color
  if (analysis.color_scheme_recommendation) {
    sectionTitle("Рекомендации по цвету");
    boldLabel("Основные", analysis.color_scheme_recommendation.primary_colors.join(", "));
    boldLabel("Акценты", analysis.color_scheme_recommendation.accent_colors.join(", "));
    bodyText(analysis.color_scheme_recommendation.reasoning);
  }

  // Overall
  if (analysis.overall_recommendation) {
    sectionTitle("Общая рекомендация");
    bodyText(analysis.overall_recommendation);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor("#BBB");
    doc.text("KiKi Decor Studio • kikidecor.ru", M, 290);
    doc.text(`${p} / ${pageCount}`, W - M, 290, { align: "right" });
  }

  savePDFCrossPlatform(doc, "KiKi_Venue_Analysis.pdf");
}
