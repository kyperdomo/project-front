import type {
  ColumnaMapeada,
  CorreccionMapeo,
  CampoModelo,
  FilaCarga,
  PrediccionMapeo,
  ResultadoCarga,
} from "../types/cargaArchivo";
import { BASE_URL } from "./config";

// Convierte una fila tal como se muestra en la tabla (campos en
// camelCase: estudianteNombre, curso, ...) al formato que espera el
// backend para guardarla (campo_modelo -> valor, ver
// CargaArchivoService.guardarFila del lado de Java).
export const filaACampos = (fila: FilaCarga): Record<string, string> => ({
  estudiante_identificacion: fila.estudianteIdentificacion,
  estudiante_nombre: fila.estudianteNombre,
  estudiante_curso: fila.curso,
  acudiente_identificacion: fila.acudienteIdentificacion,
  acudiente_nombre: fila.acudienteNombre,
  acudiente_telefono: fila.telefono,
  acudiente_direccion: fila.direccion,
  acudiente_correo: fila.correo,
  factura_valor: fila.valorFactura,
  factura_fecha_generacion: fila.fechaFactura,
});

// ── PASO 1: previsualizar el mapeo de columnas ───────────────────────
// Sube el Excel al backend, que a su vez lo manda al microservicio de
// Document Learning. No guarda nada todavía: solo retorna a qué campo
// del modelo corresponde (según el clasificador) cada columna.
export const previsualizarMapeo = async (
  token: string | null,
  archivo: File,
  colegioNit: string
): Promise<PrediccionMapeo> => {
  const formData = new FormData();
  formData.append("file", archivo);

  const response = await fetch(
    `${BASE_URL}/api/cargas/preview?colegioNit=${encodeURIComponent(colegioNit)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? "No se pudo obtener el mapeo de columnas del archivo");
  }

  return (await response.json()) as PrediccionMapeo;
};

// ── PASO 2: confirmar el mapeo y procesar el archivo completo ───────
// mapeoConfirmado: encabezado tal cual aparece en el Excel -> campo del
// modelo elegido/confirmado por el usuario (ver CargaArchivoController).
export const confirmarCarga = async (
  token: string | null,
  archivo: File,
  colegioNit: string,
  mapeoConfirmado: Record<string, string>
): Promise<ResultadoCarga> => {
  const formData = new FormData();
  formData.append("file", archivo);
  formData.append(
    "mapeo",
    new Blob([JSON.stringify(mapeoConfirmado)], { type: "application/json" })
  );

  const response = await fetch(
    `${BASE_URL}/api/cargas/confirmar?colegioNit=${encodeURIComponent(colegioNit)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? "No se pudo procesar el archivo");
  }

  return (await response.json()) as ResultadoCarga;
};

// ── PASO 3 (opcional): corregir una fila puntual que quedó en error ─
// No hace falta volver a subir el Excel: se envían los campos ya
// corregidos por el usuario y el backend intenta guardarla de nuevo.
export const corregirFila = async (
  token: string | null,
  colegioNit: string,
  campos: Record<string, string>
): Promise<FilaCarga> => {
  const response = await fetch(`${BASE_URL}/api/cargas/corregir-fila`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ colegioNit, campos }),
  });

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? "No se pudo guardar la corrección");
  }

  return (await response.json()) as FilaCarga;
};


// ── PASO 4: reentrenar el modelo con las correcciones de la usuaria ──
// Esto es lo que cierra el ciclo de aprendizaje: sin esta llamada, el
// clasificador vuelve a equivocarse en la misma columna el mes siguiente.
// Se envían las features que el propio backend devolvió en el preview,
// no ceros, para que el ejemplo aprendido sea completo.
export const construirCorreccion = (
  columna: ColumnaMapeada,
  campoCorrecto: CampoModelo
): CorreccionMapeo => ({
  header_text: columna.headerText,
  pct_numeric: columna.features?.pct_numeric ?? 0,
  pct_date_like: columna.features?.pct_date_like ?? 0,
  pct_mobile_pattern: columna.features?.pct_mobile_pattern ?? 0,
  pct_email_pattern: columna.features?.pct_email_pattern ?? 0,
  avg_length: columna.features?.avg_length ?? 0,
  pct_unique: columna.features?.pct_unique ?? 0,
  correct_field: campoCorrecto,
});

export const reentrenarModelo = async (
  token: string | null,
  correcciones: CorreccionMapeo[]
): Promise<{ status: string; n_total_examples: number; new_train_accuracy: number }> => {
  const response = await fetch(`${BASE_URL}/api/cargas/retrain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ corrections: correcciones }),
  });

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? "No se pudo reentrenar el modelo con las correcciones");
  }

  return await response.json();
};

// ── CARGA DESDE DOS ARCHIVOS SEPARADOS ──────────────────────────────
// Para los colegios que mandan un Excel con los estudiantes y otro con
// los acudientes. NO hay que indicar cuál es la llave: el backend prueba
// las columnas candidatas de ambos archivos y se queda con la que
// produce más coincidencias reales, normalizando las identificaciones
// (puntos, guiones, ceros a la izquierda). Funciona igual si el colegio
// los relaciona por el documento del niño o por la cédula del acudiente.

export type CruceDeArchivos = {
  filas: FilaCarga[];
  llaveDetectada: {
    student_column: string;
    guardian_column: string;
    match_rate: number;
  } | null;
  totalEstudiantes: number;
  totalAcudientes: number;
  cruzados: number;
  estudiantesSinAcudiente: number;
  acudientesSinEstudiante: number;
  identificacionesDuplicadasEstudiantes: number;
  identificacionesDuplicadasAcudientes: number;
};

export const previsualizarDosArchivos = async (
  token: string | null,
  archivoEstudiantes: File,
  archivoAcudientes: File,
  colegioNit: string
): Promise<CruceDeArchivos> => {
  const formData = new FormData();
  formData.append("archivoEstudiantes", archivoEstudiantes);
  formData.append("archivoAcudientes", archivoAcudientes);
  formData.append("colegioNit", colegioNit);

  const response = await fetch(`${BASE_URL}/api/cargas/preview-dos-archivos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? "No se pudieron cruzar los dos archivos");
  }

  return (await response.json()) as CruceDeArchivos;
};

// Guarda las filas ya revisadas. Los datos ya vienen cruzados, así que
// no hay que volver a subir los Excel.
export const confirmarFilas = async (
  token: string | null,
  filas: FilaCarga[],
  colegioNit: string,
  nombreArchivo: string
): Promise<ResultadoCarga> => {
  const response = await fetch(`${BASE_URL}/api/cargas/confirmar-filas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      colegioNit,
      nombreArchivo,
      // Solo se mandan las filas que se pueden guardar: las huérfanas se
      // quedan en pantalla para que la usuaria las corrija primero.
      filas: filas.filter((f) => f.estado !== "ERROR").map(filaACampos),
    }),
  });

  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? "No se pudieron guardar las filas");
  }

  return (await response.json()) as ResultadoCarga;
};

// ── REGISTROS PENDIENTES DE CORRECCIÓN ──────────────────────────────
// Las filas que no se pudieron guardar quedan almacenadas en el backend.
// Antes vivían solo en la pantalla: al cerrarla se perdían, y como el
// colegio tarda días en mandar la corrección, tocaba volver a cargar
// todo el archivo. Ahora se retoman cuando la institución responda.

export type FilaPendiente = FilaCarga & {
  pendienteId: number;
  origenArchivo: string;
};

export const obtenerPendientes = async (
  token: string | null,
  colegioNit: string
): Promise<FilaPendiente[]> => {
  const response = await fetch(
    `${BASE_URL}/api/cargas/pendientes?colegioNit=${encodeURIComponent(colegioNit)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new Error("No se pudieron cargar los registros pendientes");
  return (await response.json()) as FilaPendiente[];
};

export const resolverPendiente = async (
  token: string | null,
  pendienteId: number,
  fila: FilaCarga,
  colegioNit: string
): Promise<FilaCarga> => {
  const response = await fetch(`${BASE_URL}/api/cargas/pendientes/${pendienteId}/resolver`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ colegioNit, campos: filaACampos(fila) }),
  });
  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error ?? "No se pudo guardar la corrección");
  }
  return (await response.json()) as FilaCarga;
};

// Para estudiantes que ya no aplican (se retiraron del colegio).
export const descartarPendiente = async (
  token: string | null,
  pendienteId: number
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/cargas/pendientes/${pendienteId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("No se pudo descartar el registro");
};