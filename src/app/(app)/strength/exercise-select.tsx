"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ExerciseSelect({ exercises, value }: { exercises: { id: string; name: string }[]; value: string }) {
  const router = useRouter();
  return (
    <Select value={value} onValueChange={(v) => router.push(`/strength?exercise=${v}`)}>
      <SelectTrigger className="w-full sm:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {exercises.map((ex) => (
          <SelectItem key={ex.id} value={ex.id}>
            {ex.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
