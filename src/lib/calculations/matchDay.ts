/**
 * Lógica de Match Day (secciones 7 y 27): etiquetar la semana en relación al próximo/último partido
 * y sugerir el tipo de carga apropiada según la proximidad.
 */

export type MDLabel =
  | "MD-6" | "MD-5" | "MD-4" | "MD-3" | "MD-2" | "MD-1" | "MD" | "MD+1" | null;

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000);
}

/**
 * Dado "hoy" y la fecha del próximo partido (o del último si ya pasó), devuelve la etiqueta MD.
 * Si no hay partido de referencia devuelve null.
 */
export function computeMDLabel(today: Date, nextMatchDate: Date | null, lastMatchDate: Date | null): MDLabel {
  if (nextMatchDate) {
    const diff = diffDays(nextMatchDate, today); // días que faltan
    if (diff === 0) return "MD";
    if (diff >= 1 && diff <= 6) return (`MD-${diff}` as MDLabel);
  }
  if (lastMatchDate) {
    const diffPast = diffDays(today, lastMatchDate);
    if (diffPast === 1) return "MD+1";
  }
  return null;
}

export const MD_LOAD_GUIDANCE: Record<Exclude<MDLabel, null>, string> = {
  "MD-6": "Fuerza — margen suficiente para cargar volumen e intensidad.",
  "MD-5": "Fuerza — buen día para el estímulo más pesado de la semana.",
  "MD-4": "Potencia / fútbol — trabajo de velocidad y transferencia, bajar el volumen de fuerza pesada.",
  "MD-3": "Carga moderada — técnica y volumen medio, sin fatiga residual alta.",
  "MD-2": "Tren superior corto — evitar carga pesada de piernas.",
  "MD-1": "Descanso o activación muy suave — nada de piernas pesadas.",
  MD: "Partido.",
  "MD+1": "Recuperación — caminata suave, movilidad, nada de carga.",
};

export type WeekMatchPattern = "FRIDAY" | "SATURDAY" | "SUNDAY" | "NONE" | "DOUBLE";

export interface WeekTemplateDay {
  dayOfWeek: number; // 0 = domingo ... 6 = sábado
  label: string;
}

/**
 * Plantilla orientativa de la semana según el día del partido (sección 7).
 * Es una sugerencia para el calendario, no una regla rígida: el usuario puede editar cada evento.
 */
export function weekTemplate(pattern: WeekMatchPattern): WeekTemplateDay[] {
  switch (pattern) {
    case "SUNDAY":
      return [
        { dayOfWeek: 1, label: "Gimnasio — fuerza" },
        { dayOfWeek: 3, label: "Gimnasio — potencia + tren superior" },
        { dayOfWeek: 5, label: "Gimnasio — tren superior corto" },
        { dayOfWeek: 0, label: "Partido" },
      ];
    case "SATURDAY":
      return [
        { dayOfWeek: 1, label: "Gimnasio completo" },
        { dayOfWeek: 3, label: "Gimnasio + fútbol" },
        { dayOfWeek: 5, label: "Fútbol" },
        { dayOfWeek: 6, label: "Partido" },
      ];
    case "FRIDAY":
      return [
        { dayOfWeek: 1, label: "Gimnasio completo" },
        { dayOfWeek: 3, label: "Gimnasio + fútbol" },
        { dayOfWeek: 5, label: "Partido" },
      ];
    case "NONE":
      return [
        { dayOfWeek: 1, label: "Gimnasio completo" },
        { dayOfWeek: 3, label: "Gimnasio + fútbol" },
        { dayOfWeek: 5, label: "Gimnasio adicional — más trabajo de piernas" },
      ];
    case "DOUBLE":
      return [
        { dayOfWeek: 1, label: "Gimnasio reducido — mantenimiento" },
        { dayOfWeek: 3, label: "Tren superior corto" },
      ];
  }
}

export function weekMatchPatternLabel(pattern: WeekMatchPattern): string {
  switch (pattern) {
    case "FRIDAY": return "Partido el viernes";
    case "SATURDAY": return "Partido el sábado";
    case "SUNDAY": return "Partido el domingo";
    case "NONE": return "Sin partido esta semana";
    case "DOUBLE": return "Dos partidos esta semana — modo fatiga/reducido";
  }
}
