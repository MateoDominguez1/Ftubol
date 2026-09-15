"use client";

import { useMemo, useState } from "react";
import { createRoutineAction } from "@/lib/actions/routine-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export interface ExerciseOption {
  id: string;
  name: string;
}

interface RoutineExerciseRow {
  key: string;
  exerciseId: string;
  targetSets: string;
  targetReps: string;
  targetRIR: string;
  notes: string;
}

function newRow(exerciseId: string): RoutineExerciseRow {
  return { key: crypto.randomUUID(), exerciseId, targetSets: "3", targetReps: "", targetRIR: "", notes: "" };
}

export function RoutineBuilder({ exercises }: { exercises: ExerciseOption[] }) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<RoutineExerciseRow[]>([]);
  const [pickerValue, setPickerValue] = useState("");

  const exerciseName = useMemo(() => {
    const map = new Map(exercises.map((e) => [e.id, e.name]));
    return (id: string) => map.get(id) ?? "Ejercicio";
  }, [exercises]);

  function addExercise(exerciseId: string) {
    if (!exerciseId) return;
    setRows((prev) => [...prev, newRow(exerciseId)]);
    setPickerValue("");
  }

  function updateRow(key: string, patch: Partial<RoutineExerciseRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function buildPayload() {
    return JSON.stringify({
      name,
      notes: notes || null,
      exercises: rows.map((r) => ({
        exerciseId: r.exerciseId,
        targetSets: r.targetSets ? Number(r.targetSets) : null,
        targetReps: r.targetReps || null,
        targetRIR: r.targetRIR ? Number(r.targetRIR) : null,
        notes: r.notes || null,
      })),
    });
  }

  return (
    <form action={createRoutineAction} className="flex flex-col gap-5">
      <input type="hidden" name="payload" value={rows.length > 0 && name ? buildPayload() : ""} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="routine-name">Nombre de la rutina</Label>
        <Input id="routine-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rutina A — Tren inferior" required />
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <Card key={row.key}>
            <CardContent className="flex flex-col gap-3 pt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{exerciseName(row.exerciseId)}</p>
                <button type="button" onClick={() => removeRow(row.key)} className="text-muted-2 hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Series"
                  value={row.targetSets}
                  onChange={(e) => updateRow(row.key, { targetSets: e.target.value })}
                />
                <Input
                  placeholder="Reps (ej: 8-10)"
                  value={row.targetReps}
                  onChange={(e) => updateRow(row.key, { targetReps: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="RIR objetivo"
                  value={row.targetRIR}
                  onChange={(e) => updateRow(row.key, { targetRIR: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Notas (opcional)"
                value={row.notes}
                onChange={(e) => updateRow(row.key, { notes: e.target.value })}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center gap-2 pt-4">
          <Select value={pickerValue} onValueChange={addExercise}>
            <SelectTrigger>
              <SelectValue placeholder="Agregar ejercicio..." />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((ex) => (
                <SelectItem key={ex.id} value={ex.id}>
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="routine-notes">Notas de la rutina (opcional)</Label>
        <Textarea id="routine-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <Button type="submit" size="lg" disabled={rows.length === 0 || !name}>
        Guardar rutina
      </Button>
    </form>
  );
}
