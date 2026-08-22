// ── CONFIGURACIÓN COMPARTIDA DE TODOS LOS SERVICIOS ──────────────────
// Un solo lugar para la URL base del backend y el interruptor de modo
// prueba. Cualquier servicio nuevo (facturación, historial de cargas,
// reportes, etc.) debe importar de aquí en vez de definir su propia
// copia de estas constantes.

export const BASE_URL = "http://localhost:8080";

// ═══════════════════════════════════════════════════════════════════
// 🧪 MODO PRUEBA SIN BACKEND
// ═══════════════════════════════════════════════════════════════════
// Mientras esté en `true`, los servicios usan datos de ejemplo y
// simulan respuestas cuando el backend real falla o no existe todavía,
// para poder probar el front de forma independiente.
//
// TODO ELIMINAR: cuando TODOS los endpoints reales estén conectados y
// verificados, cambiar esto a `false`. Cada servicio que use este flag
// tiene marcado con "TODO ELIMINAR junto con MODO_PRUEBA_SIN_BACKEND"
// el bloque de datos de ejemplo que se puede borrar en ese momento.
// ═══════════════════════════════════════════════════════════════════
export const MODO_PRUEBA_SIN_BACKEND = true;