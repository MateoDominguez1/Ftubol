"use client";

import { useState } from "react";
import { submitPainEntryAction } from "@/lib/actions/quick-log-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toDateInputValue, todayStart } from "@/lib/dates";

const ZONES = [
  { value: "PUBIS", label: "Pubis" },
  { value: "HAMSTRING", label: "Isquiotibial" },
  { value: "ADDUCTOR", label: "Aductor" },
  { value: "KNEE", label: "Rodilla" },
  { value: "ANKLE", label: "Tobillo" },
  { value: "ACHILLES", label: "Aquiles" },
  { value: "SOLEUS", label: "Sóleo" },
  { value: "SHOULDER", label: "Hombro" },
  { value: "BACK", label: "Espalda" },
  { value: "OTHER", label: "Otra" },
];

export function PainCheckForm() {
  const [zone, setZone] = useState("PUBIS");
  const [level, setLevel] = useState(0);

  const showAlert =
    (zone === "PUBIS" || zone === "ADDUCTOR") && level >= 4
      ? "Reducí o eliminá el trabajo de aductores (Copenhagen) hasta que baje la molestia."
      : zone === "HAMSTRING" && level >= 4
        ? "Eliminá el trabajo excéntrico intenso (nórdicos) hasta que baje la molestia."
        : null;

  return (
    <form action={submitPainEntryAction} className="flex flex-col gap-4">
      <input type="hidden" name="date" value={toDateInputValue(todayStart())} />

      <div className="flex flex-col gap-1.5">
        <Label>Zona</Label>
        <Select name="zone" value={zone} onValueChange={setZone}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ZONES.map((z) => (
              <SelectItem key={z.value} value={z.value}>
                {z.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="painLevel">Dolor</Label>
          <span className="text-sm font-semibold">{level}/10</span>
        </div>
        <input
          id="painLevel"
          name="painLevel"
          type="range"
          min={0}
          max={10}
          step={1}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full accent-[var(--brand)]"
        />
      </div>

      {showAlert ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{showAlert}</div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea id="notes" name="notes" placeholder="Cuándo aparece, qué lo provoca..." />
      </div>

      <Button type="submit" size="lg">
        Guardar
      </Button>
    </form>
  );
}
