import type { CobroPendiente, EmisorInstitucion, FacturaPreview, RespuestaEnvioFactura } from "../types/factura";
import { BASE_URL, MODO_PRUEBA_SIN_BACKEND } from "./config";

export { MODO_PRUEBA_SIN_BACKEND };

// ── DATOS DE EJEMPLO (solo para MODO_PRUEBA_SIN_BACKEND) ────────────
const cobrosEjemplo = (periodo: string): CobroPendiente[] => [
  {
    id: 1,
    documentoEstudiante: "1019876543",
    nombreEstudiante: "Juan Esteban Rodríguez",
    grado: "5°A",
    nombreAcudiente: "María Fernanda Rodríguez",
    documentoAcudiente: "52.334.221",
    telefonoAcudiente: "601 445 2231",
    direccionAcudiente: "Cra 45 #12-34, Bogotá",
    concepto: `Pensión ${periodo}`,
    valor: 420000,
    estado: "Pendiente",
  },
  {
    id: 2,
    documentoEstudiante: "1019876544",
    nombreEstudiante: "Valeria Gómez Torres",
    grado: "3°B",
    nombreAcudiente: "Carlos Gómez Peña",
    documentoAcudiente: "79.112.445",
    telefonoAcudiente: "601 778 9021",
    direccionAcudiente: "Calle 80 #34-10, Bogotá",
    concepto: `Pensión ${periodo}`,
    valor: 380000,
    estado: "Pendiente",
  },
  {
    id: 3,
    documentoEstudiante: "1019876545",
    nombreEstudiante: "Samuel Alexander Díaz",
    grado: "1°A",
    nombreAcudiente: "Diana Marcela Díaz",
    documentoAcudiente: "1.032.556.789",
    telefonoAcudiente: "601 220 4456",
    direccionAcudiente: "Av. Cota #5-20, Cota",
    concepto: `Pensión ${periodo}`,
    valor: 350000,
    estado: "Pendiente",
  },
  {
    id: 4,
    documentoEstudiante: "1019876546",
    nombreEstudiante: "Isabella Martínez Cruz",
    grado: "5°A",
    nombreAcudiente: "Andrés Martínez Ospina",
    documentoAcudiente: "80.221.334",
    telefonoAcudiente: "601 990 1122",
    direccionAcudiente: "Cra 15 #90-40, Bogotá",
    concepto: `Pensión ${periodo}`,
    valor: 420000,
    estado: "Pendiente",
  },
];

const emisorEjemplo: EmisorInstitucion = {
  nombre: "Institución educativa",
  nit: "900.111.222-3",
  direccion: "Calle 10 #20-30, Cota",
  telefono: "601 333 4444",
  resolucionDian: "Configurada en Siigo",
};

const generarCufeSimulado = () =>
  Array.from({ length: 4 })
    .map(() => Math.random().toString(36).substring(2, 10))
    .join("")
    .toUpperCase()
    .slice(0, 40);

export const formatearPeriodoLegible = (p: string) => {
  const [anio, mes] = p.split("-");
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${meses[parseInt(mes, 10) - 1]} ${anio}`;
};

// ── EMISOR (datos del colegio activo) ────────────────────────────────
// Reutiliza el mismo endpoint que ya usa SeleccionInstitucion.tsx.
// Lanza un error si falla y MODO_PRUEBA_SIN_BACKEND está en false,
// para que el componente pueda mostrar un mensaje real en pantalla.
export const obtenerEmisor = async (
  token: string | null,
  institucionActual: string
): Promise<EmisorInstitucion> => {
  try {
    const response = await fetch(`${BASE_URL}/api/colegios/get`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`El backend respondió ${response.status}`);
    const data: { nombre: string; nit: string; direccion: string; telefono: string }[] =
      await response.json();
    const colegio = data.find((c) => c.nombre === institucionActual);
    if (!colegio) throw new Error(`No se encontró la institución "${institucionActual}"`);
    return {
      nombre: colegio.nombre,
      nit: colegio.nit,
      direccion: colegio.direccion,
      telefono: colegio.telefono,
      resolucionDian: "Configurada en Siigo",
    };
  } catch (error) {
    console.error("Error al obtener el colegio activo:", error);
    // TODO ELIMINAR junto con MODO_PRUEBA_SIN_BACKEND
    if (MODO_PRUEBA_SIN_BACKEND) return emisorEjemplo;
    throw error;
  }
};

// ── COBROS PENDIENTES DEL PERIODO ────────────────────────────────────
export const obtenerCobros = async (
  token: string | null,
  institucionActual: string,
  periodo: string
): Promise<CobroPendiente[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/facturacion/pendientes?institucion=${encodeURIComponent(
        institucionActual
      )}&periodo=${periodo}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error(`El backend respondió ${response.status}`);
    return (await response.json()) as CobroPendiente[];
  } catch (error) {
    console.error("Error al obtener cobros pendientes:", error);
    // TODO ELIMINAR junto con MODO_PRUEBA_SIN_BACKEND
    if (MODO_PRUEBA_SIN_BACKEND) return cobrosEjemplo(formatearPeriodoLegible(periodo));
    throw error;
  }
};

// ── ENVÍO AL BACKEND (que a su vez habla con Siigo/DIAN) ────────────
export const enviarFactura = async (
  token: string | null,
  factura: FacturaPreview
): Promise<RespuestaEnvioFactura> => {
  try {
    const response = await fetch(`${BASE_URL}/api/facturacion/enviar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(factura),
    });
    if (!response.ok) throw new Error(`El backend respondió ${response.status}`);
    return (await response.json()) as RespuestaEnvioFactura;
  } catch (error) {
    console.error("Error al enviar la factura al backend:", error);
    // TODO ELIMINAR junto con MODO_PRUEBA_SIN_BACKEND
    if (MODO_PRUEBA_SIN_BACKEND) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const aceptada = Math.random() > 0.15;
      return aceptada
        ? { estado: "Aceptada", cufe: generarCufeSimulado() }
        : { estado: "Rechazada", motivoRechazo: "Datos del adquiriente incompletos (simulado)" };
    }
    throw error;
  }
};