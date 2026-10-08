import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import * as dashboardService from "../services/dashboard.service";
import type { DatosDashboard } from "../services/dashboard.service";

type Props = {
  userRole: "Administrador" | "Auxiliar";
};

// Formato corto para el monto sobre cada barra: 14,6 M · 850 mil
const formatoCorto = (valor: number) =>
  valor >= 1_000_000
    ? `${(valor / 1_000_000).toFixed(1).replace(".", ",")} M`
    : valor >= 1_000
      ? `${Math.round(valor / 1_000)} mil`
      : String(Math.round(valor));

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

        {/* GRÁFICA: facturación mensual (monto arriba, mes abajo) */}
        <section className="charts-section-container">
          <div className="chart-card-full">
            <h3 className="chart-title">Facturación Mensual</h3>
            {hayIngresos ? (
              <div className="bar-chart-container">
                {serie.map((punto) => (
                  <div
                    key={punto.periodo}
                    className="bar-item"
                    title={`${dashboardService.etiquetaMes(punto.periodo)}: ${dashboardService.formatoCOP(punto.total)}`}
                  >
                    <span className="bar-value">{formatoCorto(punto.total)}</span>
                    <div
                      className="bar-column"
                      style={{ height: `calc((100% - 48px) * ${(punto.total / maximo).toFixed(4)})` }}
                    ></div>
                    <span className="bar-label">{dashboardService.etiquetaMes(punto.periodo)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-container">
                {cargando ? "Cargando…" : "Todavía no hay facturas emitidas en los últimos meses."}
              </div>
            )}
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