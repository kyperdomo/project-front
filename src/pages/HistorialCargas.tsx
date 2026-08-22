// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../styles/Dashboard.css";
// import "../styles/HistorialCargas.css";

// type Props = {
//   userRole: "Administrador" | "Auxiliar";
// };

// type EstadoCarga = "Procesado" | "Con errores" | "Rechazado";

// type CargaHistorial = {
//   id: number;
//   archivo: string;
//   fecha: string; // formato ISO yyyy-mm-dd, para poder filtrar por rango
//   hora: string;
//   usuario: string;
//   institucion: string;
//   estado: EstadoCarga;
//   registrosProcesados: number;
//   registrosConError: number;
// };

// const BASE_URL = "http://localhost:8080";

// // ── DATOS DE EJEMPLO ──────────────────────────────────────────────
// // Se usan solo si el backend aún no responde el endpoint real.
// // Apenas exista GET /api/cargas/historial, estos datos dejan de usarse
// // automáticamente y no hay que tocar nada más en este archivo.
// const cargasEjemplo: CargaHistorial[] = [
//   {
//     id: 1,
//     archivo: "estudiantes_marzo.xlsx",
//     fecha: "2026-03-05",
//     hora: "09:14",
//     usuario: "auxiliar1",
//     institucion: "San José",
//     estado: "Procesado",
//     registrosProcesados: 1032,
//     registrosConError: 0,
//   },
//   {
//     id: 2,
//     archivo: "acudientes_marzo.xlsx",
//     fecha: "2026-03-05",
//     hora: "09:20",
//     usuario: "auxiliar1",
//     institucion: "San José",
//     estado: "Con errores",
//     registrosProcesados: 998,
//     registrosConError: 12,
//   },
//   {
//     id: 3,
//     archivo: "estudiantes_marzo.xlsx",
//     fecha: "2026-03-06",
//     hora: "14:02",
//     usuario: "auxiliar2",
//     institucion: "San Juan",
//     estado: "Rechazado",
//     registrosProcesados: 0,
//     registrosConError: 0,
//   },
//   {
//     id: 4,
//     archivo: "cobros_abril.xlsx",
//     fecha: "2026-04-02",
//     hora: "08:47",
//     usuario: "admin",
//     institucion: "San José",
//     estado: "Procesado",
//     registrosProcesados: 1050,
//     registrosConError: 0,
//   },
//   {
//     id: 5,
//     archivo: "estudiantes_abril.xlsx",
//     fecha: "2026-04-03",
//     hora: "11:35",
//     usuario: "auxiliar2",
//     institucion: "San Juan",
//     estado: "Con errores",
//     registrosProcesados: 1010,
//     registrosConError: 4,
//   },
// ];

// const HistorialCargas: React.FC<Props> = ({ userRole }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const token = localStorage.getItem("token");

//   const [cargas, setCargas] = useState<CargaHistorial[]>([]);
//   const [cargando, setCargando] = useState(true);
//   const [usandoDatosEjemplo, setUsandoDatosEjemplo] = useState(false);

//   // Filtros
//   const [filtroInstitucion, setFiltroInstitucion] = useState<string>("");
//   const [filtroDesde, setFiltroDesde] = useState<string>("");
//   const [filtroHasta, setFiltroHasta] = useState<string>("");

//   useEffect(() => {
//     obtenerHistorial();
//   }, []);

//   // ── LLAMADA AL BACKEND (con fallback a datos de ejemplo) ─────────
//   const obtenerHistorial = async () => {
//     setCargando(true);
//     try {
//       const response = await fetch(`${BASE_URL}/api/cargas/historial`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok) throw new Error("Error al obtener historial de cargas");
//       const data: CargaHistorial[] = await response.json();
//       setCargas(data);
//       setUsandoDatosEjemplo(false);
//     } catch (error) {
//       console.warn("No se pudo conectar con el backend, usando datos de ejemplo:", error);
//       setCargas(cargasEjemplo);
//       setUsandoDatosEjemplo(true);
//     } finally {
//       setCargando(false);
//     }
//   };

//   // ── LISTA DE INSTITUCIONES PARA EL FILTRO ─────────────────────────
//   const instituciones = useMemo(
//     () => Array.from(new Set(cargas.map((c) => c.institucion))).sort(),
//     [cargas]
//   );

//   // ── APLICAR FILTROS ────────────────────────────────────────────────
//   const cargasFiltradas = useMemo(() => {
//     return cargas.filter((c) => {
//       if (filtroInstitucion && c.institucion !== filtroInstitucion) return false;
//       if (filtroDesde && c.fecha < filtroDesde) return false;
//       if (filtroHasta && c.fecha > filtroHasta) return false;
//       return true;
//     });
//   }, [cargas, filtroInstitucion, filtroDesde, filtroHasta]);

//   const limpiarFiltros = () => {
//     setFiltroInstitucion("");
//     setFiltroDesde("");
//     setFiltroHasta("");
//   };

//   const formatearFecha = (iso: string) => {
//     const [anio, mes, dia] = iso.split("-");
//     return `${dia}/${mes}/${anio}`;
//   };

//   const claseEstado = (estado: EstadoCarga) => {
//     if (estado === "Procesado") return "hc-badge hc-badge-ok";
//     if (estado === "Con errores") return "hc-badge hc-badge-warning";
//     return "hc-badge hc-badge-error";
//   };

//   return (
//     <div className="dashboard-layout">
//       {/* SIDEBAR */}
//       <aside className="sidebar">
//         <div className="sidebar-header">
//           <h2>Sistema Educativo</h2>
//           <span>
//             {userRole === "Administrador" ? "Gestión Administrativa" : "Gestión Auxiliar"}
//           </span>
//         </div>
//         <nav className="sidebar-nav">
//           {userRole === "Administrador" && (
//             <div
//               className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
//               onClick={() => navigate("/dashboard")}
//             >
//               📊 Dashboard
//             </div>
//           )}
//           <div
//             className={`nav-item ${location.pathname === "/estudiantes" ? "active" : ""}`}
//             onClick={() => navigate("/estudiantes")}
//           >
//             🎓 Estudiantes
//           </div>
//           <div className={`nav-item ${location.pathname === "/facturacion" ? "active" : ""}`} onClick={() => navigate("/facturacion")}>📄 Facturación</div>
//           <div className="nav-item">💳 Pagos</div>
//           <div
//             className={`nav-item ${location.pathname === "/reportes" ? "active" : ""}`}
//             onClick={() => navigate("/reportes")}
//           >
//             📈 Reportes
//           </div>
//           {userRole === "Administrador" && (
//             <>
//               <div
//                 className={`nav-item ${location.pathname === "/historial-cargas" ? "active" : ""}`}
//                 onClick={() => navigate("/historial-cargas")}
//               >
//                 🗂 Historial de Cargas
//               </div>
//               <div
//                 className={`nav-item ${location.pathname === "/usuarios" ? "active" : ""}`}
//                 onClick={() => navigate("/usuarios")}
//               >
//                 👥 Usuarios
//               </div>
//             </>
//           )}
//         </nav>
//         <div className="sidebar-footer">
//           <button className="sidebar-logout" onClick={() => navigate("/home")}>
//             🚪 Cerrar Sesión
//           </button>
//         </div>
//       </aside>

//       {/* CONTENIDO */}
//       <main className="main-content">
//         <header className="content-header">
//           <h1>Historial de Cargas</h1>
//           <p>Auditoría de los archivos cargados al sistema</p>
//         </header>

//         {usandoDatosEjemplo && (
//           <p className="hc-aviso-demo">
//             ⚠️ Mostrando datos de ejemplo — el backend aún no expone{" "}
//             <code>/api/cargas/historial</code>.
//           </p>
//         )}

//         {/* FILTROS */}
//         <section className="hc-filtros">
//           <div className="hc-filtro-campo">
//             <label>Institución</label>
//             <select
//               value={filtroInstitucion}
//               onChange={(e) => setFiltroInstitucion(e.target.value)}
//             >
//               <option value="">Todas</option>
//               {instituciones.map((inst) => (
//                 <option key={inst} value={inst}>
//                   {inst}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="hc-filtro-campo">
//             <label>Desde</label>
//             <input
//               type="date"
//               value={filtroDesde}
//               onChange={(e) => setFiltroDesde(e.target.value)}
//             />
//           </div>

//           <div className="hc-filtro-campo">
//             <label>Hasta</label>
//             <input
//               type="date"
//               value={filtroHasta}
//               onChange={(e) => setFiltroHasta(e.target.value)}
//             />
//           </div>

//           <button className="hc-btn-limpiar" onClick={limpiarFiltros}>
//             Limpiar filtros
//           </button>
//         </section>

//         {/* TABLA */}
//         <section className="hc-tabla-container">
//           {cargando ? (
//             <p className="hc-vacio">Cargando historial...</p>
//           ) : cargasFiltradas.length === 0 ? (
//             <p className="hc-vacio">
//               No hay cargas registradas con los filtros seleccionados.
//             </p>
//           ) : (
//             <table className="hc-tabla">
//               <thead>
//                 <tr>
//                   <th>Archivo</th>
//                   <th>Fecha</th>
//                   <th>Hora</th>
//                   <th>Usuario</th>
//                   <th>Institución</th>
//                   <th>Estado</th>
//                   <th className="text-right">Registros</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {cargasFiltradas.map((c) => (
//                   <tr key={c.id}>
//                     <td className="hc-archivo">{c.archivo}</td>
//                     <td>{formatearFecha(c.fecha)}</td>
//                     <td>{c.hora}</td>
//                     <td>{c.usuario}</td>
//                     <td>{c.institucion}</td>
//                     <td>
//                       <span className={claseEstado(c.estado)}>{c.estado}</span>
//                     </td>
//                     <td className="text-right">
//                       {c.registrosProcesados}
//                       {c.registrosConError > 0 && (
//                         <span className="hc-registros-error">
//                           {" "}
//                           ({c.registrosConError} con error)
//                         </span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// };

// export default HistorialCargas;

import React, { useEffect, useMemo, useState } from "react";
import "../styles/Dashboard.css";
import "../styles/HistorialCargas.css";
import type { CargaHistorial, EstadoCarga } from "../types/historialCargas";
import * as historialCargasService from "../services/historialCargas.service";
import Sidebar from "../components/Sidebar";

type Props = {
  userRole: "Administrador" | "Auxiliar";
};

const HistorialCargas: React.FC<Props> = ({ userRole }) => {
  const token = localStorage.getItem("token");

  const [cargas, setCargas] = useState<CargaHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  // Filtros
  const [filtroInstitucion, setFiltroInstitucion] = useState<string>("");
  const [filtroDesde, setFiltroDesde] = useState<string>("");
  const [filtroHasta, setFiltroHasta] = useState<string>("");

  useEffect(() => {
    obtenerHistorial();
  }, []);

  // ── LLAMADA AL BACKEND ────────────────────────────────────────────
  const obtenerHistorial = async () => {
    setCargando(true);
    setErrorHistorial(null);
    try {
      const data = await historialCargasService.obtenerHistorial(token);
      setCargas(data);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error desconocido";
      setCargas([]);
      setErrorHistorial(mensaje);
    } finally {
      setCargando(false);
    }
  };

  // ── LISTA DE INSTITUCIONES PARA EL FILTRO ─────────────────────────
  const instituciones = useMemo(
    () => Array.from(new Set(cargas.map((c) => c.institucion))).sort(),
    [cargas]
  );

  // ── APLICAR FILTROS ────────────────────────────────────────────────
  const cargasFiltradas = useMemo(() => {
    return cargas.filter((c) => {
      if (filtroInstitucion && c.institucion !== filtroInstitucion) return false;
      if (filtroDesde && c.fecha < filtroDesde) return false;
      if (filtroHasta && c.fecha > filtroHasta) return false;
      return true;
    });
  }, [cargas, filtroInstitucion, filtroDesde, filtroHasta]);

  const limpiarFiltros = () => {
    setFiltroInstitucion("");
    setFiltroDesde("");
    setFiltroHasta("");
  };

  const formatearFecha = (iso: string) => {
    const [anio, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  const claseEstado = (estado: EstadoCarga) => {
    if (estado === "Procesado") return "hc-badge hc-badge-ok";
    if (estado === "Con errores") return "hc-badge hc-badge-warning";
    return "hc-badge hc-badge-error";
  };

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={userRole} />

      {/* CONTENIDO */}
      <main className="main-content">
        <header className="content-header">
          <h1>Historial de Cargas</h1>
          <p>Auditoría de los archivos cargados al sistema</p>
        </header>

        {/* TODO ELIMINAR junto con MODO_PRUEBA_SIN_BACKEND (ver services/config.ts) */}
        {historialCargasService.MODO_PRUEBA_SIN_BACKEND && (
          <p className="hc-aviso-demo">
            🧪 Modo prueba activo — usando datos simulados mientras el backend de{" "}
            <code>/api/cargas/historial</code> no esté conectado. Recuerda desactivar{" "}
            <code>MODO_PRUEBA_SIN_BACKEND</code> en <code>services/config.ts</code> antes de
            entregar.
          </p>
        )}

        {errorHistorial && (
          <p className="hc-aviso-error">
            ⚠️ No se pudo cargar el historial de cargas: {errorHistorial}
          </p>
        )}

        {/* FILTROS */}
        <section className="hc-filtros">
          <div className="hc-filtro-campo">
            <label>Institución</label>
            <select
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

          <div className="hc-filtro-campo">
            <label>Desde</label>
            <input
              type="date"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
            />
          </div>

          <div className="hc-filtro-campo">
            <label>Hasta</label>
            <input
              type="date"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
            />
          </div>

          <button className="hc-btn-limpiar" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        </section>

        {/* TABLA */}
        <section className="hc-tabla-container">
          {cargando ? (
            <p className="hc-vacio">Cargando historial...</p>
          ) : cargasFiltradas.length === 0 ? (
            <p className="hc-vacio">
              No hay cargas registradas con los filtros seleccionados.
            </p>
          ) : (
            <table className="hc-tabla">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Usuario</th>
                  <th>Institución</th>
                  <th>Estado</th>
                  <th className="text-right">Registros</th>
                </tr>
              </thead>
              <tbody>
                {cargasFiltradas.map((c) => (
                  <tr key={c.id}>
                    <td className="hc-archivo">{c.archivo}</td>
                    <td>{formatearFecha(c.fecha)}</td>
                    <td>{c.hora}</td>
                    <td>{c.usuario}</td>
                    <td>{c.institucion}</td>
                    <td>
                      <span className={claseEstado(c.estado)}>{c.estado}</span>
                    </td>
                    <td className="text-right">
                      {c.registrosProcesados}
                      {c.registrosConError > 0 && (
                        <span className="hc-registros-error">
                          {" "}
                          ({c.registrosConError} con error)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

export default HistorialCargas;