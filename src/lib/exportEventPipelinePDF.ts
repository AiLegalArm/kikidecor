import jsPDF from "jspdf";

const LABEL_MAP: Record<string, string> = {
  event_type: "Тип события", event_goal: "Цель", location: "Локация", venue: "Площадка",
  guests: "Гости", style: "Стиль", budget: "Бюджет", requirements: "Требования",
  constraints: "Ограничения", missing_information: "Недостающая информация",
  assumptions: "Допущения", risk_flags: "Риски", event_scale: "Масштаб",
  budget_fit: "Соответствие бюджету", price_ranges: "Ценовые диапазоны",
  critical_budget_areas: "Критические статьи", feasible_event_level: "Уровень события",
  strategic_notes: "Стратегические заметки", concept_name: "Название концепции",
  concept_core: "Суть концепции", emotional_direction: "Эмоциональное направление",
  guest_experience: "Опыт гостей", visual_language: "Визуальный язык",
  dress_code: "Дресс-код", entrance_zone: "Входная зона", welcome_zone: "Зона приветствия",
  stage_design: "Сцена", guest_area: "Гостевая зона", table_styling: "Сервировка",
  floral_design: "Флористика", lighting_design: "Освещение", photo_zone: "Фото-зона",
  branding: "Брендинг", must_have: "Обязательно", optional: "Опционально",
  premium_upgrades: "Премиум", zoning_logic: "Логика зонирования",
  stage_location: "Расположение сцены", guest_seating: "Рассадка гостей",
  photo_zone_location: "Расположение фото-зоны", bar_location: "Бар",
  lounge_zones: "Лаунж-зоны", pre_event: "Подготовка", guest_arrival: "Приход гостей",
  official_opening: "Открытие", main_program: "Основная программа",
  food_networking: "Фуршет/нетворкинг", entertainment_block: "Развлечения",
  finale: "Финал", guest_exit: "Завершение", executive_summary: "Резюме",
  concept_pitch: "Питч концепции", included_services: "Включённые услуги",
  expected_result: "Ожидаемый результат", budget_frame: "Бюджетная рамка",
  implementation_stages: "Этапы реализации", next_step: "Следующий шаг",
  moodboard: "Мудборд", render_prompt: "Промпт для рендера", photo_prompts: "Промпты для фото",
  palette: "Палитра", textures: "Текстуры", furniture_style: "Стиль мебели",
  floral_language: "Флористический язык", lighting_mood: "Настроение освещения",
  visual_keywords: "Визуальные ключевые слова", avoid_list: "Избегать",
  decor_priority: "Приоритеты декора",
};

function label(key: string): string {
  return LABEL_MAP[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function exportEventPipelineToPDF(data: Record<string, unknown>, brief: string): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const M = 16;
  const CW = W - M * 2;
  let y = 0;

  const check = (need: number) => { if (y + need > 280) { doc.addPage(); y = M; } };

  // Header
  doc.setFillColor("#7C3AED");
  doc.rect(0, 0, W, 44, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#FFFFFF");
  doc.text("KiKi Decor Studio", M, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Event Pipeline — структура мероприятия", M, 28);
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" }), M, 36);
  y = 52;

  // Brief
  sectionTitle("Клиентский бриф");
  bodyText(brief);
  y += 4;

  // Sections
  const SECTIONS: { key: string; title: string }[] = [
    { key: "analysis", title: "📋 Анализ брифа" },
    { key: "market_research", title: "📊 Анализ рынка" },
    { key: "concept", title: "🎨 Концепция" },
    { key: "decor", title: "🌸 Декор" },
    { key: "spatial_plan", title: "📐 Пространственный план" },
    { key: "program", title: "🎤 Программа" },
  ];

  for (const sec of SECTIONS) {
    const val = data[sec.key];
    if (val && typeof val === "object" && Object.keys(val as object).length > 0) {
      sectionTitle(sec.title);
      renderObject(val as Record<string, unknown>, 0);
      y += 2;
    }
  }

  // Timeline
  if (Array.isArray(data.timeline) && data.timeline.length > 0) {
    sectionTitle("⏱ Тайминг");
    for (const item of data.timeline as any[]) {
      check(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#111");
      doc.text(`${item.start_time} — ${item.end_time}: ${item.activity}`, M, y);
      y += 4.5;
      if (item.responsible_team) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor("#666");
        doc.text(`Команда: ${item.responsible_team}`, M + 2, y);
        y += 4;
      }
    }
    y += 2;
  }

  // Team
  if (Array.isArray(data.team) && data.team.length > 0) {
    sectionTitle("👥 Команда");
    for (const m of data.team as any[]) {
      check(12);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor("#111");
      doc.text(`${m.role} (${m.quantity} чел.)`, M, y); y += 4.5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor("#555");
      const lines = doc.splitTextToSize(m.responsibility, CW - 4);
      for (const l of lines) { check(4); doc.text(l, M + 2, y); y += 4; }
    }
    y += 2;
  }

  // Vendors
  if (Array.isArray(data.vendors) && data.vendors.length > 0) {
    sectionTitle("🏢 Подрядчики");
    for (const v of data.vendors as any[]) {
      check(14);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor("#111");
      doc.text(`${v.category} — ${v.estimated_cost_range}`, M, y); y += 4.5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor("#555");
      doc.text(v.purpose, M + 2, y); y += 4;
    }
    y += 2;
  }

  // Budget
  const budget = data.budget as any;
  if (budget && typeof budget === "object") {
    sectionTitle("💰 Бюджет");
    if (budget.items && Array.isArray(budget.items)) {
      for (const item of budget.items) {
        check(10);
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor("#111");
        doc.text(item.budget_item, M, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor("#555");
        doc.text(`Мин: ${item.min_estimate} / Опт: ${item.optimal_estimate} / Прем: ${item.premium_estimate}`, M + 2, y + 4);
        y += 9;
      }
    }
    if (budget.summary) {
      check(16);
      y += 2;
      doc.setFillColor("#F0EDFF");
      doc.roundedRect(M, y - 3, CW, 14, 2, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor("#7C3AED");
      doc.text(`Итого: ${budget.summary.total_estimate}  |  Резерв: ${budget.summary.contingency_reserve}  |  В бюджете: ${budget.summary.fit_to_client_budget ? "Да" : "Нет"}`, M + 3, y + 4);
      y += 16;
    }
  }

  // Commercial
  const commercial = data.commercial;
  if (commercial && typeof commercial === "object" && Object.keys(commercial as object).length > 0) {
    sectionTitle("📄 Коммерческое предложение");
    renderObject(commercial as Record<string, unknown>, 0);
    y += 2;
  }

  // Visuals
  const visuals = data.visuals;
  if (visuals && typeof visuals === "object" && Object.keys(visuals as object).length > 0) {
    sectionTitle("🖼 Визуальные материалы");
    renderObject(visuals as Record<string, unknown>, 0);
  }

  // Footers
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor("#BBB");
    doc.text("KiKi Decor Studio • kikidecor.ru", M, 290);
    doc.text(`${p} / ${pageCount}`, W - M, 290, { align: "right" });
  }

  doc.save("KiKi_Event_Pipeline.pdf");

  // --- helpers ---
  function sectionTitle(title: string) {
    check(12);
    y += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor("#7C3AED");
    doc.text(title, M, y);
    y += 2;
    doc.setDrawColor("#E9D5FF"); doc.setLineWidth(0.3); doc.line(M, y, W - M, y);
    y += 5;
  }

  function bodyText(text: string) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor("#333");
    const lines = doc.splitTextToSize(text, CW);
    for (const l of lines) { check(5); doc.text(l, M, y); y += 4.5; }
  }

  function renderObject(obj: Record<string, unknown>, depth: number) {
    const indent = M + depth * 4;
    const maxW = CW - depth * 4;
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        check(5);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor("#111");
        const lbl = label(key) + ": ";
        doc.text(lbl, indent, y);
        const lw = doc.getTextWidth(lbl);
        doc.setFont("helvetica", "normal"); doc.setTextColor("#444");
        const valLines = doc.splitTextToSize(String(value), maxW - lw);
        doc.text(valLines[0], indent + lw, y);
        y += 4.5;
        for (let i = 1; i < valLines.length; i++) { check(4); doc.text(valLines[i], indent, y); y += 4; }
      } else if (Array.isArray(value)) {
        if (value.length === 0) continue;
        check(5);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor("#111");
        doc.text(label(key) + ":", indent, y); y += 4.5;
        if (typeof value[0] === "string") {
          doc.setFont("helvetica", "normal"); doc.setTextColor("#444");
          const joined = value.join(", ");
          const lines = doc.splitTextToSize(joined, maxW - 4);
          for (const l of lines) { check(4); doc.text(l, indent + 2, y); y += 4; }
        } else {
          for (const item of value) {
            if (typeof item === "object" && item !== null) {
              renderObject(item as Record<string, unknown>, depth + 1);
              y += 1;
            }
          }
        }
      } else if (typeof value === "object") {
        check(5);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor("#111");
        doc.text(label(key) + ":", indent, y); y += 4.5;
        renderObject(value as Record<string, unknown>, depth + 1);
      }
    }
  }
}
