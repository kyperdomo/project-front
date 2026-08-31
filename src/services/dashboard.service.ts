import { BASE_URL } from "./config";

// Cifras de la pantalla principal. Todo viene de GET /api/reportes/dashboard,
// filtrado por el NIT de la institución activa.
export type PuntoSerie = { periodo: string; total: number };

export type FacturaReciente = {
  id: string;
  student: string;
  concept: string;
  amount: number;
  status: string;
  date: string;
};

export type DatosDashboard = {
  // Facturado, no "ingresos": el sistema emite facturas pero todavía no
  // registra pagos, así que no puede afirmar que ese dinero entró.
  facturadoDelMes: number;
  // Facturas cargadas y aún no emitidas. No es deuda del acudiente.
  pendientePorFacturar: number;
  estudiantesRegistrados: number;
  periodoActual: string;
  serieMensual: PuntoSerie[];
  facturasRecientes: FacturaReciente[];
};

export const obtenerDashboard = async (
  token: string | null,
  colegioNit: string
): Promise<DatosDashboard> => {
  const response = await fetch(
    `${BASE_URL}/api/reportes/dashboard?colegioNit=${encodeURIComponent(colegioNit)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? `El backend respondió ${response.status}`);
  }

  return (await response.json()) as DatosDashboard;
};

export const formatoCOP = (valor: number) =>
  valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

export const etiquetaMes = (periodo: string) => {
  const [anio, mes] = periodo.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
                 "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${meses[parseInt(mes, 10) - 1]} ${anio.slice(2)}`;
};
