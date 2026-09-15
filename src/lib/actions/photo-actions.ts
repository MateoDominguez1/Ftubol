"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, getStorageBucket, isSupabaseConfigured } from "@/lib/supabase";
import { parseDateInput, todayStart } from "@/lib/dates";

export async function uploadProgressPhotoAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/body/photos?error=supabase-not-configured");
  }

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) {
    redirect("/body/photos?error=missing-file");
  }

  const dateStr = String(formData.get("date") ?? "");
  const date = dateStr ? parseDateInput(dateStr) : todayStart();
  const angle = String(formData.get("angle") ?? "FRONT");
  const lighting = String(formData.get("lighting") ?? "").trim() || null;
  const position = String(formData.get("position") ?? "").trim() || null;
  const distance = String(formData.get("distance") ?? "").trim() || null;
  const timeOfDay = String(formData.get("timeOfDay") ?? "").trim() || null;

  const supabase = getSupabaseAdmin();
  const bucket = getStorageBucket();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${date.toISOString().slice(0, 10)}-${angle.toLowerCase()}-${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, Buffer.from(arrayBuffer), { contentType: file.type, upsert: false });

  if (uploadError) {
    redirect(`/body/photos?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

  await prisma.progressPhoto.create({
    data: {
      date,
      angle: angle as never,
      url: publicUrlData.publicUrl,
      lighting,
      position,
      distance,
      timeOfDay,
    },
  });

  revalidatePath("/body/photos");
  redirect("/body/photos?saved=1");
}
