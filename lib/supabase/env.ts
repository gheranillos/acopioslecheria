/** Valores placeholder usados en local antes de conectar Supabase real. */
const PLACEHOLDER_MARKERS = ["placeholder", "tu-proyecto", "tu-anon-key"];

export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;

  const looksPlaceholder = PLACEHOLDER_MARKERS.some(
    (marker) =>
      url.toLowerCase().includes(marker) ||
      anonKey.toLowerCase().includes(marker),
  );
  if (looksPlaceholder) return null;

  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null;
}
