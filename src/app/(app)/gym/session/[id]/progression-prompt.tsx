"use client";

import { setProgressionDecisionAction } from "@/lib/actions/gym-actions";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { value: "INCREASE_WEIGHT", label: "Subir peso" },
  { value: "MAINTAIN", label: "Mantener" },
  { value: "DECREASE_WEIGHT", label: "Bajar peso" },
  { value: "INCREASE_REPS", label: "Subir reps" },
  { value: "MAINTAIN_REPS", label: "Mantener reps" },
];

export function ProgressionPrompt({ workoutId, workoutExerciseId }: { workoutId: string; workoutExerciseId: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2 p-3">
      <p className="text-xs font-medium text-muted">¿Qué hacés la próxima vez?</p>
      <div className="flex flex-wrap gap-1.5">
        {OPTIONS.map((opt) => (
          <form key={opt.value} action={setProgressionDecisionAction}>
            <input type="hidden" name="workoutId" value={workoutId} />
            <input type="hidden" name="workoutExerciseId" value={workoutExerciseId} />
            <input type="hidden" name="decision" value={opt.value} />
            <Button type="submit" size="sm" variant="outline">
              {opt.label}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
