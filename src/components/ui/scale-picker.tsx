"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

export interface ScaleOption {
  value: string;
  label: string;
  hint?: string;
}

interface ScalePickerProps {
  name: string;
  options: ScaleOption[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  required?: boolean;
}

export function ScalePicker({ name, options, defaultValue, value, onValueChange, className, required }: ScalePickerProps) {
  return (
    <RadioGroupPrimitive.Root
      name={name}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      required={required}
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => (
        <RadioGroupPrimitive.Item
          key={opt.value}
          value={opt.value}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl border border-border bg-surface-2 px-2 py-3 text-center transition-colors",
            "data-[state=checked]:border-brand data-[state=checked]:bg-brand/15 data-[state=checked]:text-brand",
          )}
        >
          <span className="text-sm font-semibold">{opt.label}</span>
          {opt.hint ? <span className="text-[11px] text-muted-2">{opt.hint}</span> : null}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
