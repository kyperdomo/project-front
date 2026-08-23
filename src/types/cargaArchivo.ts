// ── TIPOS DEL FLUJO DE CARGA CON DOCUMENT LEARNING ───────────────────
// Reflejan lo que retorna el backend (ReporteController usa el mismo
// estilo de Map<String,Object>, ver ColumnMappingDTO / PredictMappingResponseDTO
// del lado de Java) y lo que expone el microservicio Python.

// Campos del modelo de datos que el clasificador puede predecir
// (mismo vocabulario que app/data/training_data.csv del microservicio).
export type CampoModelo =
  | "estudiante_nombre"
  | "estudiante_identificacion"
  | "estudiante_curso"
  | "acudiente_nombre"
  | "acudiente_identificacion"
  | "acudiente_telefono"
  | "factura_valor"
  | "factura_fecha_generacion";

export const CAMPOS_MODELO: { valor: CampoModelo; etiqueta: string }[] = [
  { valor: "estudiante_nombre", etiqueta: "Nombre del estudiante" },
  { valor: "estudiante_identificacion", etiqueta: "Identificación del estudiante" },
  { valor: "estudiante_curso", etiqueta: "Curso / grado" },
  { valor: "acudiente_nombre", etiqueta: "Nombre del acudiente" },
  { valor: "acudiente_identificacion", etiqueta: "Identificación del acudiente" },
  { valor: "acudiente_telefono", etiqueta: "Teléfono del acudiente" },
  { valor: "factura_valor", etiqueta: "Valor a facturar" },
  { valor: "factura_fecha_generacion", etiqueta: "Fecha de la factura" },
];

export const etiquetaCampo = (campo: string | null): string =>
  CAMPOS_MODELO.find((c) => c.valor === campo)?.etiqueta ?? "Sin identificar";

// Refleja ColumnMappingDTO.java
export type ColumnaMapeada = {
  headerText: string;
  predictedField: CampoModelo | null;
  confidence: number;
  requiresManualReview: boolean;
  topAlternatives: Record<string, unknown>[];
};

// Refleja PredictMappingResponseDTO.java
export type PrediccionMapeo = {
  institucionId: number | null;
  archivoNombre: string | null;
  columnas: ColumnaMapeada[];
  columnasNoIdentificadas: number;
  tiempoProcesamientoMs: number;
};

// Refleja cada entrada de "filas" en la respuesta de /api/cargas/confirmar
// y /api/cargas/corregir-fila (ver CargaArchivoService.construirFilaBase)
export type FilaCarga = {
  fila: number | null;
  estudianteIdentificacion: string;
  estudianteNombre: string;
  curso: string;
  acudienteIdentificacion: string;
  acudienteNombre: string;
  telefono: string;
  valorFactura: string;
  fechaFactura: string;
  estado: "OK" | "ERROR";
  motivo: string | null;
};

// Refleja la respuesta completa de /api/cargas/confirmar
export type ResultadoCarga = {
  registrosProcesados: number;
  registrosConError: number;
  filas: FilaCarga[];
  logCargaId: number;
};
