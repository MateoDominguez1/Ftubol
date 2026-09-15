import { NextRequest, NextResponse } from "next/server";
import { isTuduuConfigured } from "@/lib/tuduu";

const TUDUU_BASE_URL = "https://tuduu-prd-apim-we.azure-api.net";

/**
 * Diagnóstico temporal: pega la respuesta cruda de Tuduu para poder ver por qué
 * la búsqueda no trae resultados externos en un entorno dado. Borrar cuando ya
 * no haga falta.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "nutella";
  const configured = isTuduuConfigured();
  const key = process.env.TUDUU_SUBSCRIPTION_KEY;

  if (!configured) {
    return NextResponse.json({ configured: false, message: "TUDUU_SUBSCRIPTION_KEY no está definida en este entorno." });
  }

  try {
    const res = await fetch(`${TUDUU_BASE_URL}/foods/search`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key!,
        "Content-Type": "application/json",
        "Accept-Language": "it",
      },
      body: JSON.stringify({ searchText: query }),
    });
    const bodyText = await res.text();
    let bodyJson: unknown = null;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      // no era JSON válido, dejamos bodyText
    }

    return NextResponse.json({
      configured: true,
      keyPrefix: key!.slice(0, 6) + "...",
      keyLength: key!.length,
      query,
      httpStatus: res.status,
      ok: res.ok,
      body: bodyJson ?? bodyText.slice(0, 2000),
    });
  } catch (err) {
    return NextResponse.json({
      configured: true,
      keyPrefix: key!.slice(0, 6) + "...",
      query,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
