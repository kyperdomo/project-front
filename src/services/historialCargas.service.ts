import type { CargaHistorial } from "../types/historialCargas";
import { BASE_URL } from "./config";

// ── HISTORIAL DE CARGAS ───────────────────────────────────────────
// Consume GET /api/cargas/historial, que antes no existía en el backend
// (por eso esta pantalla venía mostrando datos de ejemplo).
// Se filtra por el NIT del colegio activo: cada sesión solo ve las
// cargas de la institución con la que se inició sesión.
export const obtenerHistorial = async (
  token: string | null,
  colegioNit: string
): Promise<CargaHistorial[]> => {
  const response = await fetch(
    `${BASE_URL}/api/cargas/historial?colegioNit=${encodeURIComponent(colegioNit)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? `El backend respondió ${response.status}`);
  }

  return (await response.json()) as CargaHistorial[];
};