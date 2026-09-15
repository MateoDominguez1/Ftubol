"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const CATEGORY_LABEL: Record<string, string> = {
  STRENGTH: "Fuerza",
  POWER: "Potencia",
  CORE: "Core",
  INJURY_PREVENTION: "Prevención",
  ACCESSORY: "Accesorio",
  CARDIO: "Cardio",
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export interface ExerciseListItem {
  id: string;
  name: string;
  category: string;
  isCustom: boolean;
  muscleGroups: { id: string; muscleGroup: string }[];
}

export function ExerciseLibraryList({ exercises }: { exercises: ExerciseListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return exercises;
    return exercises.filter((ex) => normalize(ex.name).includes(q) || normalize(CATEGORY_LABEL[ex.category] ?? ex.category).includes(q));
  }, [exercises, query]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biblioteca ({exercises.length})</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar ejercicio..." className="pl-9" />
        </div>
        <div className="flex flex-col gap-1">
          {filtered.length === 0 ? (
            <p className="py-2 text-sm text-muted-2">No hay ejercicios que coincidan con &quot;{query}&quot;.</p>
          ) : (
            filtered.map((ex) => (
              <div key={ex.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0">
                <div className="flex items-center gap-2">
                  <span>{ex.name}</span>
                  {ex.isCustom ? <Badge variant="secondary">custom</Badge> : null}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline">{CATEGORY_LABEL[ex.category] ?? ex.category}</Badge>
                  {ex.muscleGroups.map((mg) => (
                    <Badge key={mg.id}>{mg.muscleGroup}</Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
