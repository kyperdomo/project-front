export type EstadoCarga = "Procesado" | "Con errores" | "Rechazado";

export type CargaHistorial = {
  id: number;
  archivo: string;
  fecha: string; // formato ISO yyyy-mm-dd, para poder filtrar por rango
  hora: string;
  usuario: string;
  institucion: string;
  estado: EstadoCarga;
  registrosProcesados: number;
  registrosConError: number;
};