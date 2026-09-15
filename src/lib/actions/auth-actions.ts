"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkPin, createSessionToken, SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/lib/auth";

export async function loginAction(_prevState: { error: string | null }, formData: FormData) {
  const pin = String(formData.get("pin") ?? "");
  const next = String(formData.get("next") ?? "/");

  let valid: boolean;
  try {
    valid = checkPin(pin);
  } catch {
    return { error: "La app no tiene un PIN configurado (APP_PIN). Revisá las variables de entorno." };
  }

  if (!valid) {
    return { error: "PIN incorrecto." };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });

  redirect(next && next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
