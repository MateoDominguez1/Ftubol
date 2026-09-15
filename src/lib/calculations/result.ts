/**
 * Toda función de cálculo que puede no tener datos suficientes devuelve este tipo
 * en vez de inventar un valor. La UI debe manejar explícitamente el caso "insufficient".
 */
export type Result<T> =
  | { status: "ok"; data: T }
  | { status: "insufficient_data"; reason: string };

export function ok<T>(data: T): Result<T> {
  return { status: "ok", data };
}

export function insufficient<T>(reason: string): Result<T> {
  return { status: "insufficient_data", reason };
}

export function isOk<T>(r: Result<T>): r is { status: "ok"; data: T } {
  return r.status === "ok";
}
