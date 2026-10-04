// ── CONFIGURACIÓN COMPARTIDA DE TODOS LOS SERVICIOS ──────────────────
export const BASE_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : "http://localhost:8080";