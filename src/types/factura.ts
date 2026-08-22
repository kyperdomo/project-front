// ── TIPOS DEL MÓDULO DE FACTURACIÓN ─────────────────────────────────
// Centralizados aquí para que tanto Facturacion.tsx como el servicio
// (facturacion.service.ts) usen exactamente la misma forma de datos,
// y para que el día que el backend defina su propio contrato, solo
// haya que tocar este archivo.

// ── ESTADOS DEL CICLO DE VIDA DE UNA FACTURA ─────────────────────
// Pendiente   -> aún no se ha generado la representación de la factura
// Generada    -> ya se armó la factura en el front, no se ha enviado
// Enviada     -> se envió al backend y este ya llamó a Siigo, pero la
//                validación DIAN puede seguir en curso (es asíncrona)
// Aceptada    -> Siigo/DIAN la validó (llega CUFE)
// Rechazada   -> Siigo/DIAN la rechazó (llega motivo)
export type EstadoFactura = "Pendiente" | "Generada" | "Enviada" | "Aceptada" | "Rechazada";

export type CobroPendiente = {
  id: number;
  documentoEstudiante: string;
  nombreEstudiante: string;
  grado: string;
  nombreAcudiente: string;
  documentoAcudiente: string;
  telefonoAcudiente: string;
  direccionAcudiente: string;
  concepto: string;
  valor: number;
  estado: EstadoFactura;
  numeroFactura?: string;
  cufe?: string;
  motivoRechazo?: string;
};

export type EmisorInstitucion = {
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  // La resolución de facturación electrónica se configura una sola vez
  // dentro de la cuenta Siigo del colegio; no viaja por cada factura.
  resolucionDian: string;
};

// Estructura de la representación de la factura que se muestra en la
// vista previa. OJO: esto NO es el payload que se le envía a Siigo
// (ver services/facturacion.service.ts) — es solo para mostrarle a la
// gestora el documento antes de confirmar el envío. El backend es quien
// traduce estos datos al esquema exacto que pide la API de Siigo
// (customer.person_type, items.code de un producto existente en Siigo,
// payments.id de una forma de pago existente en Siigo, etc.).
export type FacturaPreview = {
  cobroId: number;
  numeroFactura: string;
  fechaGeneracion: string;
  fechaVencimiento: string;
  emisor: EmisorInstitucion;
  adquiriente: {
    nombre: string;
    documento: string;
    direccion: string;
    telefono: string;
  };
  estudiante: {
    nombre: string;
    documento: string;
    grado: string;
  };
  items: {
    concepto: string;
    cantidad: number;
    valorUnitario: number;
    subtotal: number;
  }[];
  subtotal: number;
  iva: number;
  total: number;
  formaPago: "Contado" | "Crédito";
  medioPago: string;
  estado: EstadoFactura;
  cufe?: string;
  motivoRechazo?: string;
};

// Respuesta esperada del backend al enviar una factura.
export type RespuestaEnvioFactura = {
  estado: EstadoFactura;
  cufe?: string;
  motivoRechazo?: string;
};