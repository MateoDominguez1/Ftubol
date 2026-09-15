import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NumberField({
  name,
  label,
  min,
  max,
  step,
  placeholder,
}: {
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="number" min={min} max={max} step={step} placeholder={placeholder} />
    </div>
  );
}
