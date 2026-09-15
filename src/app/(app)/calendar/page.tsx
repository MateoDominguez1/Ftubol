import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addDays, endOfWeek, formatDateShortEs, parseDateInput, startOfWeek, todayStart, toDateInputValue, WEEKDAY_LABELS_ES } from "@/lib/dates";
import { computeMDLabel, weekTemplate, weekMatchPatternLabel, type WeekMatchPattern } from "@/lib/calculations/matchDay";
import { getMatchContext } from "@/lib/data/match-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Trash2, Plus } from "lucide-react";
import { deleteCalendarEventAction } from "@/lib/actions/calendar-actions";

const TYPE_LABEL: Record<string, string> = {
  GYM: "Gimnasio", FOOTBALL: "Fútbol", MATCH: "Partido", REST: "Descanso", WALK: "Caminata", OTHER: "Otro",
};

const TYPE_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "secondary"> = {
  GYM: "default", FOOTBALL: "success", MATCH: "danger", REST: "secondary", WALK: "warning", OTHER: "secondary",
};

function determineWeekPattern(matchDates: Date[]): WeekMatchPattern {
  if (matchDates.length >= 2) return "DOUBLE";
  if (matchDates.length === 0) return "NONE";
  const weekday = matchDates[0].getDay();
  if (weekday === 5) return "FRIDAY";
  if (weekday === 6) return "SATURDAY";
  return "SUNDAY";
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekStart = week ? startOfWeek(parseDateInput(week)) : startOfWeek(todayStart());
  const weekEnd = endOfWeek(weekStart);

  const [events, matchContext, matchesInWeek] = await Promise.all([
    prisma.calendarEvent.findMany({ where: { date: { gte: weekStart, lte: weekEnd } }, orderBy: [{ date: "asc" }, { time: "asc" }] }),
    getMatchContext(weekStart, weekEnd),
    prisma.match.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
  ]);

  const matchDatesInWeek = [
    ...events.filter((e) => e.type === "MATCH").map((e) => e.date),
    ...matchesInWeek.map((m) => m.date),
  ];
  const pattern = determineWeekPattern(matchDatesInWeek);
  const template = weekTemplate(pattern);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const prevWeek = toDateInputValue(addDays(weekStart, -7));
  const nextWeek = toDateInputValue(addDays(weekStart, 7));
  const isCurrentWeek = weekStart.toDateString() === startOfWeek(todayStart()).toDateString();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Calendario</h1>
          <p className="text-sm text-muted">
            {formatDateShortEs(weekStart)} — {formatDateShortEs(weekEnd)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="outline" size="icon">
            <Link href={`/calendar?week=${prevWeek}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href={`/calendar?week=${nextWeek}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{weekMatchPatternLabel(pattern)}</CardTitle>
          <CardDescription>Plantilla orientativa — podés editar cada día libremente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted">
          {template.map((t) => (
            <div key={t.dayOfWeek} className="flex justify-between">
              <span>{WEEKDAY_LABELS_ES[t.dayOfWeek]}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {days.map((day) => {
          const dayEvents = events.filter((e) => e.date.toDateString() === day.toDateString());
          const md = computeMDLabel(day, matchContext.nextMatchDate, matchContext.lastMatchDate);
          const isToday = day.toDateString() === todayStart().toDateString();

          return (
            <Card key={day.toISOString()} className={isToday ? "border-brand/50" : undefined}>
              <CardContent className="flex flex-col gap-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{WEEKDAY_LABELS_ES[day.getDay()]}</span>
                    <span className="text-xs text-muted-2">{formatDateShortEs(day)}</span>
                    {md ? <Badge variant="outline">{md}</Badge> : null}
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/calendar/new?date=${toDateInputValue(day)}`}>
                      <Plus className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                {dayEvents.length === 0 ? (
                  <p className="text-xs text-muted-2">Sin eventos</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {dayEvents.map((e) => (
                      <div key={e.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={TYPE_VARIANT[e.type]}>{TYPE_LABEL[e.type]}</Badge>
                          {e.time ? <span className="text-muted-2">{e.time}</span> : null}
                          {e.notes ? <span className="text-muted-2">{e.notes}</span> : null}
                        </div>
                        <form action={deleteCalendarEventAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <button type="submit" className="text-muted-2 hover:text-danger">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isCurrentWeek ? (
        <div className="flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/calendar">Volver a esta semana</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
