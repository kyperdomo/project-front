import type { CargaHistorial } from "../types/historialCargas";
import { BASE_URL, MODO_PRUEBA_SIN_BACKEND } from "./config";

export { MODO_PRUEBA_SIN_BACKEND };

// ── DATOS DE EJEMPLO (solo para MODO_PRUEBA_SIN_BACKEND) ────────────
const cargasEjemplo: CargaHistorial[] = [
  {
    id: 1,
    archivo: "estudiantes_marzo.xlsx",
    fecha: "2026-03-05",
    hora: "09:14",
    usuario: "auxiliar1",
    institucion: "San José",
    estado: "Procesado",
    registrosProcesados: 1032,
    registrosConError: 0,
  },
  {
    id: 2,
    archivo: "acudientes_marzo.xlsx",
    fecha: "2026-03-05",
    hora: "09:20",
    usuario: "auxiliar1",
    institucion: "San José",
    estado: "Con errores",
    registrosProcesados: 998,
    registrosConError: 12,
  },
  {
    id: 3,
    archivo: "estudiantes_marzo.xlsx",
    fecha: "2026-03-06",
    hora: "14:02",
    usuario: "auxiliar2",
    institucion: "San Juan",
    estado: "Rechazado",
    registrosProcesados: 0,
    registrosConError: 0,
  },
  {
    id: 4,
    archivo: "cobros_abril.xlsx",
    fecha: "2026-04-02",
    hora: "08:47",
    usuario: "admin",
    institucion: "San José",
    estado: "Procesado",
    registrosProcesados: 1050,
    registrosConError: 0,
  },
  {
    id: 5,
    archivo: "estudiantes_abril.xlsx",
    fecha: "2026-04-03",
    hora: "11:35",
    usuario: "auxiliar2",
    institucion: "San Juan",
    estado: "Con errores",
    registrosProcesados: 1010,
    registrosConError: 4,
  },
];

// ── HISTORIAL DE CARGAS ───────────────────────────────────────────
// Lanza un error si falla y MODO_PRUEBA_SIN_BACKEND está en false,
// para que el componente pueda mostrar un mensaje real en pantalla.
export const obtenerHistorial = async (token: string | null): Promise<CargaHistorial[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/cargas/historial`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`El backend respondió ${response.status}`);
    return (await response.json()) as CargaHistorial[];
  } catch (error) {
    console.error("Error al obtener el historial de cargas:", error);
    // TODO ELIMINAR junto con MODO_PRUEBA_SIN_BACKEND
    if (MODO_PRUEBA_SIN_BACKEND) return cargasEjemplo;
    throw error;
  }
};