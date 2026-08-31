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
  | "acudiente_direccion"
  | "acudiente_correo"
  | "factura_valor"
  | "factura_fecha_generacion";

export const CAMPOS_MODELO: { valor: CampoModelo; etiqueta: string }[] = [
  { valor: "estudiante_nombre", etiqueta: "Nombre del estudiante" },
  { valor: "estudiante_identificacion", etiqueta: "Identificación del estudiante" },
  { valor: "estudiante_curso", etiqueta: "Curso / grado" },
  { valor: "acudiente_nombre", etiqueta: "Nombre del acudiente" },
  { valor: "acudiente_identificacion", etiqueta: "Identificación del acudiente" },
  { valor: "acudiente_telefono", etiqueta: "Teléfono del acudiente" },
  // Siigo exige ambos para emitir la factura electrónica.
  { valor: "acudiente_direccion", etiqueta: "Dirección del acudiente" },
  { valor: "acudiente_correo", etiqueta: "Correo del acudiente" },
  { valor: "factura_valor", etiqueta: "Valor a facturar" },
  { valor: "factura_fecha_generacion", etiqueta: "Fecha de la factura" },
];

export const etiquetaCampo = (campo: string | null): string =>
  CAMPOS_MODELO.find((c) => c.valor === campo)?.etiqueta ?? "Sin identificar";

// Features de contenido que el microservicio calcula por columna.
// Deben viajar de vuelta al reentrenar: si se envían en ceros, el modelo
// aprende el encabezado pero pierde toda la evidencia del contenido.
export type FeaturesColumna = {
  pct_numeric: number;
  pct_date_like: number;
  pct_mobile_pattern: number;
  pct_email_pattern: number;
  avg_length: number;
  pct_unique: number;
};

// Refleja ColumnMappingDTO.java
export type ColumnaMapeada = {
  headerText: string;
  features: FeaturesColumna;
  predictedField: CampoModelo | null;
  confidence: number;
  requiresManualReview: boolean;
  topAlternatives: Record<string, unknown>[];
};

// Lo que se envía a /api/cargas/retrain cuando la usuaria corrige el
// campo asignado a una columna (ver RetrainDTOs.CorrectionItem en Java).
export type CorreccionMapeo = {
  header_text: string;
  pct_numeric: number;
  pct_date_like: number;
  pct_mobile_pattern: number;
  pct_email_pattern: number;
  avg_length: number;
  pct_unique: number;
  correct_field: CampoModelo;
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
  direccion: string;
  correo: string;
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