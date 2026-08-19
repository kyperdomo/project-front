import React, { useEffect, useMemo, useState } from "react";
import "../styles/Dashboard.css";
import "../styles/Usuarios.css";
import "../styles/Estudiantes.css";
import "../styles/HistorialCargas.css";
import Sidebar from "../components/Sidebar";

type UserRole = "Administrador" | "Auxiliar";

type EstadoCarga = "Procesado" | "Con errores" | "Rechazado";

type CargaRecord = {
  id: string;
  fecha: string; // ISO string, ej: "2025-08-14T09:30:00"
  usuario: string;
  institucion: string;
  estado: EstadoCarga;
  archivo: string;
};

type Props = {
  userRole: UserRole;
};

const estadoClase: Record<EstadoCarga, string> = {
  Procesado: "hc-badge-procesado",
  "Con errores": "hc-badge-errores",
  Rechazado: "hc-badge-rechazado",
};

const formatearFecha = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const HistorialCargas: React.FC<Props> = ({ userRole }) => {
  const [registros, setRegistros] = useState<CargaRecord[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroInstitucion, setFiltroInstitucion] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    obtenerHistorial();
  }, []);

const obtenerHistorial = async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8080/api/cargas/historial", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener historial de cargas");
      }

      const data: CargaRecord[] = await response.json();
      setRegistros(data);
    } catch (err) {
      console.error("Error al obtener historial de cargas:", err);
      // Mensaje actualizado
      setError("no hay registros de historial de cargas");
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  const instituciones = useMemo(() => {
    const unicas = new Set(registros.map((r) => r.institucion));
    return Array.from(unicas);
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      if (filtroInstitucion && r.institucion !== filtroInstitucion) return false;

      const fechaRegistro = new Date(r.fecha);

      if (fechaDesde) {
        const desde = new Date(fechaDesde + "T00:00:00");
        if (fechaRegistro < desde) return false;
      }

      if (fechaHasta) {
        const hasta = new Date(fechaHasta + "T23:59:59");
        if (fechaRegistro > hasta) return false;
      }

      return true;
    });
  }, [registros, filtroInstitucion, fechaDesde, fechaHasta]);

  const limpiarFiltros = () => {
    setFiltroInstitucion("");
    setFechaDesde("");
    setFechaHasta("");
  };

  // Guard extra además del que ya hace AppRoutes/sidebar
  if (userRole !== "Administrador") {
    return (
      <div className="dashboard-layout">
        <main className="main-content">
          <p>No tienes permisos para ver esta sección.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={userRole} />

      <main className="main-content">
        <header className="content-header">
          <h1>Historial de cargas</h1>
          <p>Auditoría de los procesos de carga de archivos realizados en el sistema</p>
        </header>

        <section className="table-container">
          <div className="hc-filtros">
            <div className="hc-campo-filtro">
              <label className="hc-label">Institución</label>
              <select
                className="hc-select"
                value={filtroInstitucion}
                onChange={(e) => setFiltroInstitucion(e.target.value)}
              >
                <option value="">Todas</option>
                {instituciones.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            <div className="hc-campo-filtro">
              <label className="hc-label">Desde</label>
              <input
                className="hc-input"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>

            <div className="hc-campo-filtro">
              <label className="hc-label">Hasta</label>
              <input
                className="hc-input"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>

            <button className="hc-btn-limpiar" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>

          {cargando ? (
            <p className="hc-cargando">Cargando historial...</p>
          ) : error ? (
            <p className="hc-error">{error}</p>
          ) : (
            <table className="hc-tabla">
              <thead>
                <tr>
                  <th>FECHA</th>
                  <th>USUARIO</th>
                  <th>INSTITUCIÓN</th>
                  <th>ARCHIVO</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="hc-tabla-vacia">
                      No hay registros que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  registrosFiltrados.map((r) => (
                    <tr key={r.id}>
                      <td>{formatearFecha(r.fecha)}</td>
                      <td>{r.usuario}</td>
                      <td>{r.institucion}</td>
                      <td>{r.archivo}</td>
                      <td>
                        <span className={`hc-badge ${estadoClase[r.estado]}`}>
                          {r.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

export default HistorialCargas;