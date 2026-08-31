import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import * as dashboardService from "../services/dashboard.service";
import type { DatosDashboard } from "../services/dashboard.service";

type Props = {
  userRole: "Administrador" | "Auxiliar";
};

const Dashboard: React.FC<Props> = ({ userRole }) => {
  const token = localStorage.getItem("token");
  const institucionNit = localStorage.getItem("institucionNit") || "";

  const [datos, setDatos] = useState<DatosDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!institucionNit) {
        setError("No hay una institución seleccionada.");
        setCargando(false);
        return;
      }
      try {
        setDatos(await dashboardService.obtenerDashboard(token, institucionNit));
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudieron cargar los datos");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [token, institucionNit]);

  const serie = datos?.serieMensual ?? [];
  // Las barras se dibujan en porcentaje relativo al mes más alto del
  // periodo mostrado, no sobre un máximo fijo.
  const maximo = Math.max(...serie.map((p) => p.total), 0);
  const hayIngresos = maximo > 0;

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={userRole} />

      <main className="main-content">
        <header className="content-header">
          <h1>Dashboard</h1>
          <p>Bienvenido al sistema de gestión administrativa</p>
        </header>

        {error && <div className="empty-state-container">{error}</div>}

        {/* TARJETAS DE ESTADÍSTICAS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-data">
              {/* "Facturado" y no "Ingresos": el sistema emite facturas,
                  pero no registra pagos. */}
              <span className="label">Facturado del Mes</span>
              <h2 className="value">
                {cargando ? "…" : dashboardService.formatoCOP(datos?.facturadoDelMes ?? 0)}
              </h2>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-data">
              {/* Facturas cargadas y aún no emitidas, no deuda del acudiente. */}
              <span className="label">Pendiente por Facturar</span>
              <h2 className="value">
                {cargando ? "…" : dashboardService.formatoCOP(datos?.pendientePorFacturar ?? 0)}
              </h2>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-data">
              <span className="label">Estudiantes Registrados</span>
              <h2 className="value">{cargando ? "…" : datos?.estudiantesRegistrados ?? 0}</h2>
            </div>
          </div>
        </section>

        {/* GRÁFICAS */}
        <section className="charts-section-container">
          <div className="chart-card-full">
            <h3 className="chart-title">Facturación Mensual</h3>
            {hayIngresos ? (
              <div className="bar-chart-container">
                {serie.map((punto) => (
                  <div
                    key={punto.periodo}
                    className="bar-column"
                    style={{ height: `${(punto.total / maximo) * 100}%` }}
                    title={`${dashboardService.etiquetaMes(punto.periodo)}: ${dashboardService.formatoCOP(punto.total)}`}
                  ></div>
                ))}
              </div>
            ) : (
              <div className="empty-state-container">
                {cargando ? "Cargando…" : "Todavía no hay facturas emitidas en los últimos meses."}
              </div>
            )}
          </div>

          <div className="chart-card-full">
            <h3 className="chart-title">Pagos por Método</h3>
            {/* El sistema no registra pagos todavía: no hay forma de saber
                con qué medio pagó cada acudiente. Se deja el estado vacío
                explícito en lugar de dibujar una gráfica sin datos. */}
            <div className="empty-state-container">
              El sistema aún no registra pagos, solo la emisión de facturas.
            </div>
          </div>
        </section>

        {/* FACTURAS RECIENTES */}
        <section className="recent-invoices-container">
          <h2>Facturas Recientes</h2>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>NÚMERO</th>
                <th>ESTUDIANTE</th>
                <th>CONCEPTO</th>
                <th>MONTO</th>
                <th>ESTADO</th>
                <th>FECHA</th>
              </tr>
            </thead>
            <tbody>
              {(datos?.facturasRecientes ?? []).length > 0 ? (
                datos!.facturasRecientes.map((inv, index) => (
                  <tr key={index}>
                    <td className="font-bold">{inv.id}</td>
                    <td>{inv.student}</td>
                    <td>{inv.concept}</td>
                    <td className="invoice-amount">{dashboardService.formatoCOP(inv.amount)}</td>
                    <td>
                      <span className={`status-pill ${(inv.status || "").toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>{inv.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-table-msg">
                    {cargando ? "Cargando…" : "No hay facturas disponibles."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;