"use client";

import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExercisePickerOption {
  id: string;
  name: string;
  category?: string;
}

interface ExercisePickerProps {
  exercises: ExercisePickerOption[];
  onPick: (exercise: ExercisePickerOption) => void;
  placeholder?: string;
  className?: string;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Buscador de ejercicios con filtro en vivo, en vez de un <select> con toda la lista. */
export function ExercisePicker({ exercises, onPick, placeholder = "Buscar ejercicio...", className }: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return exercises.slice(0, 20);
    return exercises.filter((e) => normalize(e.name).includes(q)).slice(0, 20);
  }, [exercises, query]);

  function handlePick(exercise: ExercisePickerOption) {
    onPick(exercise);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {open && results.length > 0 ? (
        <div className="absolute z-20 mt-1 flex max-h-64 w-full flex-col gap-0.5 overflow-y-auto rounded-xl border border-border bg-surface-2 p-1 shadow-lg">
          {results.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePick(ex)}
              className="rounded-lg px-2.5 py-2 text-left text-sm hover:bg-surface"
            >
              {ex.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
