// ── CONFIGURACIÓN COMPARTIDA DE TODOS LOS SERVICIOS ──────────────────
// Un solo lugar para la URL base del backend y el interruptor de modo
// prueba. Cualquier servicio nuevo (facturación, historial de cargas,
// reportes, etc.) debe importar de aquí en vez de definir su propia
// copia de estas constantes.

export const BASE_URL = "http://localhost:8080";

// Ya no existe un modo de prueba en el front: todos los endpoints están
// conectados (facturación, historial de cargas y reportes) y no queda
// ningún dato de ejemplo.
//
// La simulación que hacía falta se movió al backend
// (SiigoSimuladorClient), donde aplica las validaciones reales de Siigo
// en lugar de inventar rechazos al azar. Se controla con la propiedad
// solvia.siigo.modo en application.properties.