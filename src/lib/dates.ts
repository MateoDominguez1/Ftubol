export function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function endOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

export function todayStart(): Date {
  return startOfDay(new Date());
}

export function startOfWeek(d: Date): Date {
  const c = startOfDay(d);
  const dow = (c.getDay() + 6) % 7; // lunes = 0
  c.setDate(c.getDate() - dow);
  return c;
}

export function endOfWeek(d: Date): Date {
  const c = startOfWeek(d);
  c.setDate(c.getDate() + 6);
  return endOfDay(c);
}

export function addDays(d: Date, days: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + days);
  return c;
}

export function toDateInputValue(d: Date): string {
  const c = new Date(d);
  c.setMinutes(c.getMinutes() - c.getTimezoneOffset());
  return c.toISOString().slice(0, 10);
}

/**
 * Parsea un <input type="date"> (yyyy-mm-dd) como medianoche local — mismo criterio
 * que startOfDay/todayStart, para que los campos `date` únicos (check-in, sueño,
 * nutrición, hidratación) se puedan buscar de forma consistente sin importar si el
 * valor vino de un formulario o de `todayStart()`.
 */
export function parseDateInput(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0);
}

export const WEEKDAY_LABELS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function formatDateEs(d: Date): string {
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateShortEs(d: Date): string {
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}
