"use client";

import { useState } from "react";
import { submitCheckinAction } from "@/lib/actions/checkin-actions";
import { ScalePicker } from "@/components/ui/scale-picker";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { computeFatigueZone } from "@/lib/calculations/fatigue";
import { ZoneBadge } from "@/components/dashboard/zone-badge";

const SLEEP_OPTIONS = [
  { value: "1", label: "1", hint: "Mal" },
  { value: "2", label: "2", hint: "Normal" },
  { value: "3", label: "3", hint: "Bien" },
];
const LEGS_OPTIONS = [
  { value: "1", label: "1", hint: "Pesadas" },
  { value: "2", label: "2", hint: "Normales" },
  { value: "3", label: "3", hint: "Frescas" },
];
const MOTIVATION_OPTIONS = [
  { value: "1", label: "1", hint: "Ninguna" },
  { value: "2", label: "2", hint: "Normales" },
  { value: "3", label: "3", hint: "Altas" },
];

export function CheckinForm({
  date,
  initial,
}: {
  date: string;
  initial?: { sleepScore: number; legsScore: number; motivationScore: number; notes: string | null };
}) {
  const [sleep, setSleep] = useState(initial ? String(initial.sleepScore) : "");
  const [legs, setLegs] = useState(initial ? String(initial.legsScore) : "");
  const [motivation, setMotivation] = useState(initial ? String(initial.motivationScore) : "");

  const preview =
    sleep && legs && motivation
      ? computeFatigueZone(Number(sleep), Number(legs), Number(motivation))
      : null;

  return (
    <form action={submitCheckinAction} className="flex flex-col gap-6">
      <input type="hidden" name="date" value={date} />

      <div className="flex flex-col gap-2">
        <Label>Sueño</Label>
        <ScalePicker name="sleepScore" options={SLEEP_OPTIONS} value={sleep} onValueChange={setSleep} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Piernas</Label>
        <ScalePicker name="legsScore" options={LEGS_OPTIONS} value={legs} onValueChange={setLegs} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Ganas de entrenar</Label>
        <ScalePicker name="motivationScore" options={MOTIVATION_OPTIONS} value={motivation} onValueChange={setMotivation} required />
      </div>

      {preview ? (
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
          <div>
            <p className="text-xs text-muted">Total {preview.total}/9</p>
            <p className="text-xs text-muted-2">{preview.actions.join(" · ")}</p>
          </div>
          <ZoneBadge zone={preview.zone} />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea id="notes" name="notes" defaultValue={initial?.notes ?? ""} placeholder="Algo a tener en cuenta hoy..." />
      </div>

      <Button type="submit" size="lg">
        Guardar check-in
      </Button>
    </form>
  );
}
