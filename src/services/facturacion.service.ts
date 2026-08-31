import type {
  CobroPendiente,
  EmisorInstitucion,
  ResumenLote,
  RespuestaEnvioFactura,
} from "../types/factura";
import { BASE_URL } from "./config";

// ── EMISOR (datos del colegio activo) ────────────────────────────────
// Reutiliza el mismo endpoint que ya usa SeleccionInstitucion.tsx.
export const obtenerEmisor = async (
  token: string | null,
  institucionActual: string
): Promise<EmisorInstitucion> => {
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
    // La resolución de facturación electrónica se configura una sola vez
    // dentro de la cuenta Siigo del colegio; no viaja por cada factura.
    resolucionDian: "Configurada en Siigo",
  };
};

export const formatearPeriodoLegible = (p: string) => {
  const [anio, mes] = p.split("-");
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${meses[parseInt(mes, 10) - 1]} ${anio}`;
};

// ── MODO DE OPERACIÓN ────────────────────────────────────────────────
// "simulado" mientras no haya credenciales de Siigo, "real" cuando las
// haya. Lo decide el backend por configuración; el front solo lo muestra.
export const obtenerModoSiigo = async (token: string | null): Promise<string> => {
  const response = await fetch(`${BASE_URL}/api/facturacion/estado`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`El backend respondió ${response.status}`);
  const data = await response.json();
  return data.modo as string;
};

// ── PASO 1: PREVISUALIZAR LOS COBROS DEL PERIODO ────────────────────
// Devuelve además, por cobro, las advertencias de lo que Siigo va a
// rechazar (acudiente sin dirección, sin identificación, etc.), para
// verlas ANTES de emitir y no después del rechazo de la DIAN.
export const obtenerCobros = async (
  token: string | null,
  colegioNit: string,
  periodo: string
): Promise<{ cobros: CobroPendiente[]; modo: string; advertenciasConfiguracion: string[] }> => {
  const response = await fetch(
    `${BASE_URL}/api/facturacion/pendientes?colegioNit=${encodeURIComponent(
      colegioNit
    )}&periodo=${periodo}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? `El backend respondió ${response.status}`);
  }

  const data = await response.json();
  return {
    cobros: (data.cobros ?? []) as CobroPendiente[],
    modo: data.modo ?? "simulado",
    advertenciasConfiguracion: data.advertenciasConfiguracion ?? [],
  };
};

// ── PASO 2: EMITIR EL LOTE ──────────────────────────────────────────
// El envío ocurre en el backend, factura por factura. Si Siigo rechaza
// alguna, se registra el motivo y se continúa con las demás; al final
// llega el resumen completo. Un lote de mil facturas no puede detenerse
// en la número 40 porque un acudiente no tenía dirección.
export const emitirLote = async (
  token: string | null,
  colegioNit: string,
  periodo: string,
  facturaIds: number[]
): Promise<ResumenLote> => {
  const response = await fetch(`${BASE_URL}/api/facturacion/emitir-lote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ colegioNit, periodo, facturaIds }),
  });

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? `El backend respondió ${response.status}`);
  }

  return (await response.json()) as ResumenLote;
};

// ── Envío individual ────────────────────────────────────────────────
// Mismo camino que el lote, con una sola factura. Devuelve el estado ya
// resuelto por el backend (Aceptada / Enviada / Rechazada).
export const enviarFactura = async (
  token: string | null,
  facturaId: number,
  periodo: string
): Promise<RespuestaEnvioFactura> => {
  const response = await fetch(`${BASE_URL}/api/facturacion/enviar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ facturaId, periodo }),
  });

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? `El backend respondió ${response.status}`);
  }

  const resumen = (await response.json()) as ResumenLote;
  const fila = resumen.detalle[0];

  return {
    estado: (fila?.estado ?? "Rechazada") as RespuestaEnvioFactura["estado"],
    numeroFactura: fila?.numeroFactura || undefined,
    cufe: fila?.cufe || undefined,
    motivoRechazo: fila?.motivo || undefined,
  };
};