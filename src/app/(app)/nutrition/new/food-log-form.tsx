"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchFoodsAction, addFoodLogEntryAction, type FoodOption } from "@/lib/actions/food-actions";
import { computeFoodMacros } from "@/lib/calculations/nutrition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

export function FoodLogForm({ date }: { date: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodOption[]>([]);
  const [selected, setSelected] = useState<FoodOption | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [searching, startSearch] = useTransition();
  const [adding, startAdd] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onQueryChange(value: string) {
    setQuery(value);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        const res = await searchFoodsAction(value);
        setResults(res);
      });
    }, 350);
  }

  function pickFood(food: FoodOption) {
    setSelected(food);
    setResults([]);
    setQuery(food.name);
  }

  const preview = selected ? computeFoodMacros(selected, Number(quantity) || 0) : null;

  function handleAdd() {
    if (!selected) return;
    const formData = new FormData();
    formData.set("date", date);
    formData.set("foodId", selected.id);
    formData.set("quantityGrams", quantity);
    startAdd(async () => {
      await addFoodLogEntryAction(formData);
      setSelected(null);
      setQuery("");
      setQuantity("100");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar alimento (ej: pechuga de pollo)"
          className="pl-9"
        />
      </div>

      {searching ? <p className="text-xs text-muted-2">Buscando...</p> : null}

      {results.length > 0 ? (
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-2 p-1">
          {results.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => pickFood(food)}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-surface"
            >
              <span>
                {food.name}
                {food.brand ? <span className="text-muted-2"> · {food.brand}</span> : null}
              </span>
              <span className="text-xs text-muted-2">{Math.round(food.caloriesPer100g)} kcal/100g</span>
            </button>
          ))}
        </div>
      ) : null}

      {selected ? (
        <div className="flex flex-col gap-3 rounded-xl border border-brand/30 bg-brand/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{selected.name}</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20"
              />
              <span className="text-xs text-muted-2">g</span>
            </div>
          </div>
          {preview ? (
            <p className="text-xs text-muted">
              {preview.calories} kcal · {preview.proteinG}g prot. · {preview.carbsG}g carb. · {preview.fatG}g grasa
            </p>
          ) : null}
          <Button type="button" size="sm" onClick={handleAdd} disabled={adding}>
            <Plus className="h-3.5 w-3.5" /> Agregar al día
          </Button>
        </div>
      ) : null}
    </div>
  );
}
