import React, { useState } from "react";
import "../styles/Dashboard.css";
import "../styles/Usuarios.css";
import "../styles/Estudiantes.css";
import Sidebar from "../components/Sidebar";
import {
  confirmarCarga,
  corregirFila,
  filaACampos,
  previsualizarMapeo,
} from "../services/cargaArchivo.service";
import { CAMPOS_MODELO } from "../types/cargaArchivo";
import type { FilaCarga, PrediccionMapeo } from "../types/cargaArchivo";

type Props = {
  userRole: "Administrador" | "Auxiliar";
};

type Fase = "carga" | "mapeo" | "resultados";

const Estudiantes: React.FC<Props> = ({ userRole }) => {
  const token = localStorage.getItem("token");
  const institucionNit = localStorage.getItem("institucionNit") || "";

  const [fase, setFase] = useState<Fase>("carga");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [prediccion, setPrediccion] = useState<PrediccionMapeo | null>(null);
  const [mapeoEditable, setMapeoEditable] = useState<Record<string, string>>({});
  const [filas, setFilas] = useState<FilaCarga[]>([]);
  const [filaGuardando, setFilaGuardando] = useState<number | null>(null);

  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ── PASO 1: seleccionar archivo -> pedir el mapeo predicho ─────────
  const handleArchivoSeleccionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a seleccionar el mismo archivo si hay que reintentar
    if (!file) return;

    if (!institucionNit) {
      setErrorMsg("No se encontró la institución activa. Vuelve a iniciar sesión.");
      return;
    }

    setArchivo(file);
    setErrorMsg("");
    setCargando(true);

    try {
      const resultado = await previsualizarMapeo(token, file, institucionNit);
      setPrediccion(resultado);

      const mapeoInicial: Record<string, string> = {};
      resultado.columnas.forEach((col) => {
        mapeoInicial[col.headerText] = col.predictedField ?? "";
      });
      setMapeoEditable(mapeoInicial);
      setFase("mapeo");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "No se pudo analizar el archivo");
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarMapeo = (headerText: string, campo: string) => {
    setMapeoEditable((prev) => ({ ...prev, [headerText]: campo }));
  };

  const cancelarMapeo = () => {
    setArchivo(null);
    setPrediccion(null);
    setMapeoEditable({});
    setFase("carga");
    setErrorMsg("");
  };

  // ── PASO 2: confirmar el mapeo -> procesar el archivo completo ─────
  const handleConfirmarMapeo = async () => {
    if (!archivo || !institucionNit) return;
    setCargando(true);
    setErrorMsg("");

    try {
      const resultado = await confirmarCarga(token, archivo, institucionNit, mapeoEditable);
      setFilas(resultado.filas);
      setFase("resultados");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "No se pudo procesar el archivo");
    } finally {
      setCargando(false);
    }
  };

  // ── PASO 3: corregir a mano una fila que quedó en error ─────────────
  const handleCambiarCampoFila = (index: number, campo: keyof FilaCarga, valor: string) => {
    setFilas((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const handleGuardarCorreccion = async (index: number) => {
    if (!institucionNit) return;
    setFilaGuardando(index);
    setErrorMsg("");

    try {
      const filaCorregida = await corregirFila(token, institucionNit, filaACampos(filas[index]));
      setFilas((prev) => {
        const copia = [...prev];
        copia[index] = { ...copia[index], estado: filaCorregida.estado, motivo: filaCorregida.motivo };
        return copia;
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "No se pudo guardar la corrección");
    } finally {
      setFilaGuardando(null);
    }
  };

  const nuevaCarga = () => {
    setArchivo(null);
    setPrediccion(null);
    setMapeoEditable({});
    setFilas([]);
    setFase("carga");
    setErrorMsg("");
  };

  // Errores primero, para que el usuario los corrija sin tener que buscarlos
  const filasOrdenadas = [...filas]
    .map((fila, index) => ({ fila, index }))
    .sort((a, b) => (a.fila.estado === b.fila.estado ? 0 : a.fila.estado === "ERROR" ? -1 : 1));

  const registrosProcesados = filas.filter((f) => f.estado === "OK").length;
  const registrosConError = filas.filter((f) => f.estado === "ERROR").length;

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={userRole} />

      <main className="main-content">
        <header className="content-header">
          <h1>Gestión de Estudiantes</h1>
          <p>
            {userRole === "Administrador"
              ? "Carga masiva y administración de alumnos"
              : "Portal de carga de archivos de alumnos"}
          </p>
        </header>

        {errorMsg && <p className="est-error-msg">⚠️ {errorMsg}</p>}

        {/* ── FASE 1: CARGA ──────────────────────────────────────────── */}
        {fase === "carga" && (
          <section className="upload-section">
            <div className="upload-card">
              <div className="upload-icon">📁</div>
              <h3>Cargar Archivos</h3>
              <p>Selecciona un Excel de estudiantes/acudientes para procesar</p>

              <label htmlFor="file-upload" className="btn-upload">
                {cargando ? "Analizando..." : "Seleccionar Archivo"}
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleArchivoSeleccionado}
                disabled={cargando}
                style={{ display: "none" }}
              />

              <span className="file-info">Formatos admitidos: .xlsx, .xls (Máx. 10MB)</span>
            </div>
          </section>
        )}

        {/* ── FASE 2: CONFIRMAR MAPEO DE COLUMNAS ───────────────────── */}
        {fase === "mapeo" && prediccion && (
          <section className="table-container">
            <div className="table-header-flex">
              <h2 className="table-title">Confirma el mapeo de columnas</h2>
              <span className="file-info">
                {prediccion.columnasNoIdentificadas > 0
                  ? `${prediccion.columnasNoIdentificadas} columna(s) necesitan revisión manual`
                  : "Todas las columnas se identificaron con buena confianza"}
              </span>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>ENCABEZADO EN EL EXCEL</th>
                  <th>CAMPO</th>
                  <th>CONFIANZA</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {prediccion.columnas.map((col) => (
                  <tr key={col.headerText}>
                    <td className="font-bold">{col.headerText}</td>
                    <td>
                      <select
                        value={mapeoEditable[col.headerText] ?? ""}
                        onChange={(e) => handleCambiarMapeo(col.headerText, e.target.value)}
                      >
                        <option value="">Ignorar esta columna</option>
                        {CAMPOS_MODELO.map((c) => (
                          <option key={c.valor} value={c.valor}>
                            {c.etiqueta}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{(col.confidence * 100).toFixed(0)}%</td>
                    <td>
                      {col.requiresManualReview ? (
                        <span className="status-pill vencida">Revisar</span>
                      ) : (
                        <span className="status-pill pagada">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-header-flex" style={{ marginTop: "20px" }}>
              <button className="btn-upload" onClick={cancelarMapeo} disabled={cargando}>
                Cancelar
              </button>
              <button className="btn-save-all" onClick={handleConfirmarMapeo} disabled={cargando}>
                {cargando ? "Procesando..." : "Confirmar y procesar archivo"}
              </button>
            </div>
          </section>
        )}

        {/* ── FASE 3: RESULTADOS (errores primero, corrección manual) ── */}
        {fase === "resultados" && (
          <section className="table-container">
            <div className="table-header-flex">
              <h2 className="table-title">Resultado de la carga</h2>
              <div>
                <span className="status-pill pagada" style={{ marginRight: "10px" }}>
                  {registrosProcesados} procesados
                </span>
                {registrosConError > 0 && (
                  <span className="status-pill vencida">{registrosConError} con error</span>
                )}
              </div>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>ESTADO</th>
                  <th>DOC. ESTUDIANTE</th>
                  <th>NOMBRE ESTUDIANTE</th>
                  <th>CURSO</th>
                  <th>DOC. ACUDIENTE</th>
                  <th>ACUDIENTE</th>
                  <th>TELÉFONO</th>
                  <th>VALOR FACTURA</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filasOrdenadas.length > 0 ? (
                  filasOrdenadas.map(({ fila, index }) => {
                    const esError = fila.estado === "ERROR";
                    return (
                      <tr key={fila.fila ?? index} className={esError ? "fila-con-error" : undefined}>
                        <td>
                          {esError ? (
                            <span className="status-pill vencida" title={fila.motivo ?? ""}>
                              Error
                            </span>
                          ) : (
                            <span className="status-pill pagada">OK</span>
                          )}
                        </td>
                        {esError ? (
                          <>
                            <td>
                              <input
                                value={fila.estudianteIdentificacion}
                                onChange={(e) =>
                                  handleCambiarCampoFila(index, "estudianteIdentificacion", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <input
                                value={fila.estudianteNombre}
                                onChange={(e) => handleCambiarCampoFila(index, "estudianteNombre", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                value={fila.curso}
                                onChange={(e) => handleCambiarCampoFila(index, "curso", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                value={fila.acudienteIdentificacion}
                                onChange={(e) =>
                                  handleCambiarCampoFila(index, "acudienteIdentificacion", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <input
                                value={fila.acudienteNombre}
                                onChange={(e) => handleCambiarCampoFila(index, "acudienteNombre", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                value={fila.telefono}
                                onChange={(e) => handleCambiarCampoFila(index, "telefono", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                value={fila.valorFactura}
                                onChange={(e) => handleCambiarCampoFila(index, "valorFactura", e.target.value)}
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="font-bold">{fila.estudianteIdentificacion}</td>
                            <td>{fila.estudianteNombre}</td>
                            <td>
                              <span className="grade-tag">{fila.curso || "—"}</span>
                            </td>
                            <td>{fila.acudienteIdentificacion}</td>
                            <td>{fila.acudienteNombre}</td>
                            <td>{fila.telefono}</td>
                            <td>{fila.valorFactura || "—"}</td>
                          </>
                        )}
                        <td className="actions-icons">
                          {esError && (
                            <button
                              className="btn-save-all"
                              style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                              onClick={() => handleGuardarCorreccion(index)}
                              disabled={filaGuardando === index}
                            >
                              {filaGuardando === index ? "Guardando..." : "Guardar"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="empty-table-msg">
                      No se encontraron filas con datos en el archivo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {filasOrdenadas.some(({ fila }) => fila.estado === "ERROR" && fila.motivo) && (
              <p className="file-info" style={{ marginTop: "10px" }}>
                Pasa el cursor sobre la etiqueta "Error" de cada fila para ver el motivo exacto.
              </p>
            )}

            <div className="table-header-flex" style={{ marginTop: "20px" }}>
              <button className="btn-upload" onClick={nuevaCarga}>
                Cargar otro archivo
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Estudiantes;