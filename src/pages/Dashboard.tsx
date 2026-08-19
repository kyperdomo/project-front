import React, { useState } from "react";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";

// Mantenemos las props para que TypeScript esté feliz
type Props = {
  userRole: "Administrador" | "Auxiliar";
};

const Dashboard: React.FC<Props> = ({ userRole }) => {
  // --- ESTADOS ORIGINALES ---
  const [invoices] = useState<any[]>([]); // Se queda vacío para el diseño inicial
  const [stats] = useState({
    ingresos: "0",
    pendientes: "0",
    estudiantes: 0
  });

  const [chartData] = useState<number[]>([]);

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={userRole} />

      <main className="main-content">
        <header className="content-header">
          <h1>Dashboard</h1>
          <p>Bienvenido al sistema de gestión administrativa</p>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-data">
              <span className="label">Ingresos del Mes</span>
              <h2 className="value">${stats.ingresos}</h2>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-data">
              <span className="label">Pagos Pendientes</span>
              <h2 className="value">${stats.pendientes}</h2>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-data">
              <span className="label">Estudiantes Activos</span>
              <h2 className="value">{stats.estudiantes}</h2>
            </div>
          </div>
        </section>

        {/* SECCIÓN DE GRÁFICAS RESTAURADA */}
        <section className="charts-section-container">
          <div className="chart-card-full">
            <h3 className="chart-title">Ingresos Mensuales</h3>
            {chartData.length > 0 ? (
              <div className="bar-chart-container">
                {chartData.map((h, i) => (
                  <div key={i} className="bar-column" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            ) : (
              <div className="empty-state-container">Esperando datos de ingresos...</div>
            )}
          </div>

          <div className="chart-card-full">
            <h3 className="chart-title">Pagos por Método</h3>
            {stats.ingresos !== "0" ? (
              <div className="pie-chart-circle"></div>
            ) : (
              <div className="empty-state-container">Sin registros de pago</div>
            )}
          </div>
        </section>

        {/* TABLA DE FACTURAS RESTAURADA */}
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
                <th>VENCIMIENTO</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((inv, index) => (
                  <tr key={index}>
                    <td className="font-bold">{inv.id}</td>
                    <td>{inv.student}</td>
                    <td>{inv.concept}</td>
                    <td className="invoice-amount">{inv.amount}</td>
                    <td>
                      <span className={`status-pill ${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>{inv.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-table-msg">
                    No hay facturas disponibles.
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