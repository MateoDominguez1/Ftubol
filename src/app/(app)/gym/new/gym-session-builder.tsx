"use client";

import { useMemo, useState } from "react";
import { createWorkoutAction } from "@/lib/actions/gym-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export interface ExerciseOption {
  id: string;
  name: string;
}

interface SetRow {
  weightKg: string;
  reps: string;
  rir: string;
  difficulty: string;
  restSeconds: string;
  tempo: string;
  notes: string;
  painFlag: boolean;
}

interface ExerciseBlock {
  key: string;
  exerciseId: string;
  notes: string;
  painFlag: boolean;
  sets: SetRow[];
}

const WORKOUT_TYPES = [
  { value: "STRENGTH", label: "Fuerza" },
  { value: "POWER", label: "Potencia" },
  { value: "UPPER_BODY", label: "Tren superior" },
  { value: "FULL_BODY", label: "Cuerpo completo" },
  { value: "REDUCED", label: "Reducida" },
  { value: "DELOAD", label: "Descarga" },
  { value: "OTHER", label: "Otra" },
];

function emptySet(): SetRow {
  return { weightKg: "", reps: "", rir: "", difficulty: "", restSeconds: "", tempo: "", notes: "", painFlag: false };
}

function newBlock(exerciseId: string): ExerciseBlock {
  return { key: crypto.randomUUID(), exerciseId, notes: "", painFlag: false, sets: [emptySet()] };
}

export function GymSessionBuilder({ exercises, date }: { exercises: ExerciseOption[]; date: string }) {
  const [type, setType] = useState("STRENGTH");
  const [label, setLabel] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [sessionRPE, setSessionRPE] = useState("");
  const [notes, setNotes] = useState("");
  const [blocks, setBlocks] = useState<ExerciseBlock[]>([]);
  const [pickerValue, setPickerValue] = useState("");

  const exerciseName = useMemo(() => {
    const map = new Map(exercises.map((e) => [e.id, e.name]));
    return (id: string) => map.get(id) ?? "Ejercicio";
  }, [exercises]);

  function addExercise(exerciseId: string) {
    if (!exerciseId) return;
    setBlocks((prev) => [...prev, newBlock(exerciseId)]);
    setPickerValue("");
  }

  function removeBlock(key: string) {
    setBlocks((prev) => prev.filter((b) => b.key !== key));
  }

  function updateBlock(key: string, patch: Partial<ExerciseBlock>) {
    setBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  }

  function addSet(key: string) {
    setBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, sets: [...b.sets, emptySet()] } : b)));
  }

  function updateSet(key: string, idx: number, patch: Partial<SetRow>) {
    setBlocks((prev) =>
      prev.map((b) => (b.key === key ? { ...b, sets: b.sets.map((s, i) => (i === idx ? { ...s, ...patch } : s)) } : b)),
    );
  }

  function removeSet(key: string, idx: number) {
    setBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, sets: b.sets.filter((_, i) => i !== idx) } : b)));
  }

  function buildPayload() {
    return JSON.stringify({
      date,
      type,
      label: label || null,
      durationMin: durationMin ? Number(durationMin) : null,
      sessionRPE: sessionRPE ? Number(sessionRPE) : null,
      notes: notes || null,
      exercises: blocks.map((b) => ({
        exerciseId: b.exerciseId,
        notes: b.notes || null,
        painFlag: b.painFlag,
        sets: b.sets.map((s) => ({
          weightKg: s.weightKg ? Number(s.weightKg) : null,
          reps: s.reps ? Number(s.reps) : null,
          rir: s.rir ? Number(s.rir) : null,
          difficulty: s.difficulty ? Number(s.difficulty) : null,
          restSeconds: s.restSeconds ? Number(s.restSeconds) : null,
          tempo: s.tempo || null,
          notes: s.notes || null,
          painFlag: s.painFlag,
        })),
      })),
    });
  }

  return (
    <form action={createWorkoutAction} className="flex flex-col gap-5">
      <input type="hidden" name="payload" value={blocks.length > 0 ? buildPayload() : ""} />

      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Tipo de sesión</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="label">Etiqueta (opcional)</Label>
              <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Tren inferior" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="durationMin">Duración (min)</Label>
              <Input id="durationMin" type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sessionRPE">RPE de la sesión (1-10)</Label>
              <Input id="sessionRPE" type="number" min={1} max={10} value={sessionRPE} onChange={(e) => setSessionRPE(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {blocks.map((block) => (
          <Card key={block.key}>
            <CardContent className="flex flex-col gap-3 pt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{exerciseName(block.exerciseId)}</p>
                <button type="button" onClick={() => removeBlock(block.key)} className="text-muted-2 hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {block.sets.map((set, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-1.5">
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="kg"
                      value={set.weightKg}
                      onChange={(e) => updateSet(block.key, idx, { weightKg: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="reps"
                      value={set.reps}
                      onChange={(e) => updateSet(block.key, idx, { reps: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="RIR"
                      value={set.rir}
                      onChange={(e) => updateSet(block.key, idx, { rir: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      placeholder="Dif. 1-5"
                      value={set.difficulty}
                      onChange={(e) => updateSet(block.key, idx, { difficulty: e.target.value })}
                    />
                    <button type="button" onClick={() => removeSet(block.key, idx)} className="text-muted-2 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" size="sm" onClick={() => addSet(block.key)}>
                <Plus className="h-3.5 w-3.5" /> Agregar serie
              </Button>

              <Textarea
                placeholder="Notas del ejercicio (opcional)"
                value={block.notes}
                onChange={(e) => updateBlock(block.key, { notes: e.target.value })}
              />

              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={block.painFlag}
                  onChange={(e) => updateBlock(block.key, { painFlag: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                Sentí molestia en este ejercicio
              </label>
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
        <Label htmlFor="notes">Notas de la sesión (opcional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <Button type="submit" size="lg" disabled={blocks.length === 0}>
        Guardar sesión
      </Button>
    </form>
  );
}
