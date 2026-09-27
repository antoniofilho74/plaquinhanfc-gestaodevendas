const DEFAULT_LATITUDE = -9.3891;
const DEFAULT_LONGITUDE = -40.503;
const SEARCH_RADIUS = 40000;
const MAX_RESULTS = 60;
const PAGE_SIZE = 20;
const GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PlaceResult = {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry: { location: { lat: number; lng: number } };
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now?: boolean };
};

type PlacesResponse = {
  status?: string;
  error_message?: string;
  results?: PlaceResult[];
  next_page_token?: string;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function translateGoogleError(status: string, detail?: string): string {
  switch (status) {
    case "REQUEST_DENIED":
      return "A chave da Google Places API é inválida ou não tem permissão para esta consulta.";
    case "OVER_QUERY_LIMIT":
    case "RESOURCE_EXHAUSTED":
      return "A cota da Google Places API foi excedida. Tente novamente mais tarde.";
    case "ZERO_RESULTS":
      return "Nenhum estabelecimento foi encontrado nesta região.";
    case "INVALID_REQUEST":
      return "A Google Places API rejeitou os parâmetros da consulta.";
    default:
      return detail
        ? `A Google Places API retornou um erro: ${detail}`
        : `Não foi possível buscar estabelecimentos. Status da API: ${status || "desconhecido"}.`;
  }
}

async function fetchPage(url: URL): Promise<PlacesResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha HTTP ${response.status} ao consultar a Google Places API.`);
  }
  return (await response.json()) as PlacesResponse;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ erro: "Método não permitido. Use POST." }, 405);
  }

  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    return jsonResponse({ erro: "A chave da Google Places API não está configurada no servidor." }, 500);
  }

  let input: { latitude?: unknown; longitude?: unknown };
  try {
    input = (await request.json()) as { latitude?: unknown; longitude?: unknown };
  } catch {
    return jsonResponse({ erro: "O corpo da solicitação deve ser um JSON válido." }, 400);
  }

  const latitude = input.latitude === undefined ? DEFAULT_LATITUDE : Number(input.latitude);
  const longitude = input.longitude === undefined ? DEFAULT_LONGITUDE : Number(input.longitude);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return jsonResponse({ erro: "Informe latitude e longitude válidas." }, 400);
  }

  const results: PlaceResult[] = [];
  let pageToken: string | undefined;

  try {
    while (results.length < MAX_RESULTS) {
      const url = new URL(GOOGLE_PLACES_URL);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("location", `${latitude},${longitude}`);
      url.searchParams.set("radius", String(SEARCH_RADIUS));
      if (pageToken) {
        // A API precisa de um breve intervalo antes de liberar o próximo token.
        await new Promise((resolve) => setTimeout(resolve, 2000));
        url.searchParams.set("pagetoken", pageToken);
      }

      let page = await fetchPage(url);
      if (page.status === "INVALID_REQUEST" && pageToken) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        page = await fetchPage(url);
      }
      if (page.status === "ZERO_RESULTS") break;
      if (page.status !== "OK") {
        return jsonResponse({ erro: translateGoogleError(page.status ?? "", page.error_message) }, 502);
      }

      results.push(...(page.results ?? []));
      pageToken = page.next_page_token;
      if (!pageToken) break;
    }

    return jsonResponse(results.slice(0, MAX_RESULTS));
  } catch (error) {
    console.error("Erro ao buscar estabelecimentos:", error);
    return jsonResponse({ erro: "Não foi possível conectar à Google Places API. Tente novamente." }, 502);
  }
});
