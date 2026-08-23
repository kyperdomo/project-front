import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../styles/Dashboard.css";
import "../styles/Reportes.css";
import Sidebar from "../components/Sidebar";

type Props = {
  userRole: "Administrador" | "Auxiliar";
};

type TipoReporte = "errores" | "cartera" | "pagos" | "deudores" | "ingresos";
type FormatoReporte = "pdf" | "xlsx";

type ReporteHistorial = {
  id: number;
  tipo: TipoReporte;
  fecha: string;
  hora: string;
  institucion: string;
  datos: any;
};

const tiposReporte = [
  {
    id: "errores" as TipoReporte,
    label: "Errores",
    descripcion: "Errores del sistema",
    emoji: "⚠️",
  },
  {
    id: "cartera" as TipoReporte,
    label: "Cartera",
    descripcion: "Cuentas por cobrar",
    emoji: "📋",
  },
  {
    id: "pagos" as TipoReporte,
    label: "Pagos",
    descripcion: "Pagos realizados y pendientes",
    emoji: "💳",
  },
  {
    id: "deudores" as TipoReporte,
    label: "Deudores",
    descripcion: "Clientes morosos",
    emoji: "📌",
  },
  {
    id: "ingresos" as TipoReporte,
    label: "Ingresos",
    descripcion: "Ingresos por cliente y periodo",
    emoji: "💰",
  },
];

const BASE_URL = "http://localhost:8080";

const Reportes: React.FC<Props> = ({ userRole }) => {
  const institucionActual = localStorage.getItem("institucion") || "Institución";
  const institucionNit = localStorage.getItem("institucionNit") || "";
  const usuarioActual = localStorage.getItem("userName") || "Usuario";
  const token = localStorage.getItem("token");

  const [seleccionado, setSeleccionado] = useState<TipoReporte | null>(null);
  const [formato, setFormato] = useState<FormatoReporte>("pdf");
  const [historial, setHistorial] = useState<ReporteHistorial[]>([]);
  const [generando, setGenerando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const ahora = () => {
    const now = new Date();
    const fecha = now.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const hora = now.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { fecha, hora };
  };

  // ── LLAMADAS AL BACKEND ──────────────────────────────────────────
  const fetchDatos = async (tipo: TipoReporte): Promise<any> => {
    if (!institucionNit) {
      throw new Error("No se encontró la institución activa. Vuelve a iniciar sesión.");
    }
    const response = await fetch(
      `${BASE_URL}/api/reportes/${tipo}?colegioNit=${encodeURIComponent(institucionNit)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error(`Error al obtener reporte de ${tipo}`);
    return await response.json();
  };

  // ── FILAS SEGÚN TIPO (compartido entre PDF y Excel) ──────────────
  // Centraliza el mapeo de la respuesta del backend a filas de tabla,
  // para que el PDF y el Excel siempre muestren exactamente la misma información.
  const obtenerTabla = (tipo: TipoReporte, datos: any): { headers: string[]; rows: (string | number)[][] } => {
    switch (tipo) {
      case "errores":
        return {
          headers: ["ID", "Fecha", "Descripción", "Estado"],
          rows: (datos.errores ?? []).map((e: any) => [e.id, e.fecha, e.descripcion, e.estado]),
        };
      case "cartera":
        return {
          headers: ["ID", "Cliente", "Monto", "Estado", "Fecha"],
          rows: (datos.cuentas ?? []).map((c: any) => [
            c.id,
            c.cliente,
            c.monto ?? 0,
            c.estado,
            c.fecha,
          ]),
        };
      case "pagos":
        return {
          headers: ["ID", "Cliente", "Monto", "Estado", "Fecha"],
          rows: (datos.pagos ?? []).map((p: any) => [
            p.id,
            p.cliente,
            p.monto ?? 0,
            p.estado,
            p.fecha,
          ]),
        };
      case "deudores":
        return {
          headers: ["ID", "Cliente", "Deuda", "Días en mora", "Fecha"],
          rows: (datos.deudores ?? []).map((d: any) => [
            d.id,
            d.cliente,
            d.deuda ?? 0,
            d.diasMora,
            d.fecha,
          ]),
        };
      case "ingresos":
        return {
          headers: ["ID", "Cliente", "Periodo", "Servicio", "Monto", "Fecha"],
          rows: (datos.ingresos ?? []).map((i: any) => [
            i.id,
            i.cliente,
            i.periodo,
            i.servicio,
            i.monto ?? 0,
            i.fecha,
          ]),
        };
      default:
        return { headers: [], rows: [] };
    }
  };

  // ── CONSTRUCCIÓN DEL EXCEL ───────────────────────────────────────
  const construirExcel = (tipo: TipoReporte, datos: any): XLSX.WorkBook => {
    const { fecha, hora } = ahora();
    const labelTipo = tiposReporte.find((t) => t.id === tipo)?.label ?? tipo;
    const { headers, rows } = obtenerTabla(tipo, datos);

    // Encabezado informativo + tabla de datos en una sola hoja
    const encabezado = [
      ["Sistema Educativo"],
      [`Reporte de ${labelTipo}`],
      [`Generado: ${fecha} ${hora}`],
      [`Institución: ${institucionActual}`],
      [`Generado por: ${usuarioActual}`],
      [],
    ];

    if (tipo === "errores") {
      encabezado.push(
        [`Total de errores: ${datos.totalErrores ?? 0}`],
        [`Total de facturas generadas: ${datos.totalFacturas ?? 0}`],
        []
      );
    }

    const hoja = XLSX.utils.aoa_to_sheet([...encabezado, headers, ...rows]);

    // Ancho de columnas legible
    hoja["!cols"] = headers.map(() => ({ wch: 20 }));

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, labelTipo.slice(0, 31));
    return libro;
  };

  // ── CONSTRUCCIÓN DEL PDF ─────────────────────────────────────────
  const construirPDF = (tipo: TipoReporte, datos: any): jsPDF => {
    const doc = new jsPDF();
    const { fecha, hora } = ahora();
    const labelTipo = tiposReporte.find((t) => t.id === tipo)?.label ?? tipo;

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text("Sistema Educativo", 14, 20);

    doc.setFontSize(13);
    doc.setTextColor(100, 116, 139);
    doc.text(`Reporte de ${labelTipo}`, 14, 28);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generado: ${fecha} ${hora}`, 14, 35);
    doc.text(`Institución: ${institucionActual}`, 14, 41);
    doc.text(`Generado por: ${usuarioActual}`, 14, 47);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 51, 196, 51);

    // ── ERRORES ──
    // Espera: { totalErrores, totalFacturas, generadoPor, institucion, errores: [{ id, fecha, descripcion, estado }] }
    if (tipo === "errores") {
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(`Total de errores: ${datos.totalErrores ?? 0}`, 14, 60);
      doc.text(`Total de facturas generadas: ${datos.totalFacturas ?? 0}`, 14, 67);

      autoTable(doc, {
        startY: 75,
        head: [["ID", "Fecha", "Descripción", "Estado"]],
        body: (datos.errores ?? []).map((e: any) => [
          e.id,
          e.fecha,
          e.descripcion,
          e.estado,
        ]),
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
    }

    // ── CARTERA ──
    // Espera: { cuentas: [{ id, cliente, monto, estado, fecha }] }
    if (tipo === "cartera") {
      autoTable(doc, {
        startY: 58,
        head: [["ID", "Cliente", "Monto", "Estado", "Fecha"]],
        body: (datos.cuentas ?? []).map((c: any) => [
          c.id,
          c.cliente,
          `$${c.monto?.toLocaleString("es-CO")}`,
          c.estado,
          c.fecha,
        ]),
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
    }

    // ── PAGOS ──
    // Espera: { pagos: [{ id, cliente, monto, estado, fecha }] }
    if (tipo === "pagos") {
      autoTable(doc, {
        startY: 58,
        head: [["ID", "Cliente", "Monto", "Estado", "Fecha"]],
        body: (datos.pagos ?? []).map((p: any) => [
          p.id,
          p.cliente,
          `$${p.monto?.toLocaleString("es-CO")}`,
          p.estado,
          p.fecha,
        ]),
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
    }

    // ── DEUDORES ──
    // Espera: { deudores: [{ id, cliente, deuda, diasMora, fecha }] }
    if (tipo === "deudores") {
      autoTable(doc, {
        startY: 58,
        head: [["ID", "Cliente", "Deuda", "Días en mora", "Fecha"]],
        body: (datos.deudores ?? []).map((d: any) => [
          d.id,
          d.cliente,
          `$${d.deuda?.toLocaleString("es-CO")}`,
          d.diasMora,
          d.fecha,
        ]),
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
    }

    // ── INGRESOS ──
    // Espera: { ingresos: [{ id, cliente, periodo, servicio, monto, fecha }] }
    if (tipo === "ingresos") {
      autoTable(doc, {
        startY: 58,
        head: [["ID", "Cliente", "Periodo", "Servicio", "Monto", "Fecha"]],
        body: (datos.ingresos ?? []).map((i: any) => [
          i.id,
          i.cliente,
          i.periodo,
          i.servicio,
          `$${i.monto?.toLocaleString("es-CO")}`,
          i.fecha,
        ]),
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
    }

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${pageCount} — Sistema Educativo`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    return doc;
  };

  // ── GENERAR (fetch + PDF/Excel) ──────────────────────────────────
  const handleGenerar = async () => {
    if (!seleccionado) return;
    setGenerando(true);
    setErrorMsg("");

    try {
      const datos = await fetchDatos(seleccionado);
      const { fecha, hora } = ahora();
      const id = Date.now();

      if (formato === "pdf") {
        const doc = construirPDF(seleccionado, datos);
        doc.save(`reporte_${seleccionado}_${id}.pdf`);
      } else {
        const libro = construirExcel(seleccionado, datos);
        XLSX.writeFile(libro, `reporte_${seleccionado}_${id}.xlsx`);
      }

      setHistorial((prev) => [
        {
          id,
          tipo: seleccionado,
          fecha,
          hora,
          institucion: institucionActual,
          datos,
        },
        ...prev,
      ]);
    } catch (err) {
      setErrorMsg("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
    } finally {
      setGenerando(false);
    }
  };

  // ── REDOWNLOAD desde historial (permite elegir formato) ──────────
  const handleDescargar = (r: ReporteHistorial, formatoDescarga: FormatoReporte) => {
    if (formatoDescarga === "pdf") {
      const doc = construirPDF(r.tipo, r.datos);
      doc.save(`reporte_${r.tipo}_${r.id}.pdf`);
    } else {
      const libro = construirExcel(r.tipo, r.datos);
      XLSX.writeFile(libro, `reporte_${r.tipo}_${r.id}.xlsx`);
    }
  };

  const labelTipo = (tipo: TipoReporte) =>
    tiposReporte.find((t) => t.id === tipo)?.label ?? tipo;
  const emojiTipo = (tipo: TipoReporte) =>
    tiposReporte.find((t) => t.id === tipo)?.emoji ?? "📋";

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={userRole} />

      {/* CONTENIDO */}
      <main className="main-content">
        <header className="content-header">
          <h1>Reportes</h1>
          <p>Genera y descarga reportes en PDF</p>
        </header>

        <section className="rep-section-label">Tipo de reporte</section>
        <div className="rep-grid">
          {tiposReporte.map((tipo) => (
            <div
              key={tipo.id}
              className={`rep-card ${seleccionado === tipo.id ? "selected" : ""}`}
              onClick={() => { setSeleccionado(tipo.id); setErrorMsg(""); }}
            >
              <div className="rep-card-icon">{tipo.emoji}</div>
              <div className="rep-card-title">{tipo.label}</div>
              <div className="rep-card-desc">{tipo.descripcion}</div>
            </div>
          ))}
        </div>

        <section className="rep-section-label">Formato de salida</section>
        <div className="rep-formato-toggle">
          <button
            type="button"
            className={`rep-formato-btn ${formato === "pdf" ? "activo" : ""}`}
            onClick={() => setFormato("pdf")}
          >
            📄 PDF
          </button>
          <button
            type="button"
            className={`rep-formato-btn ${formato === "xlsx" ? "activo" : ""}`}
            onClick={() => setFormato("xlsx")}
          >
            📊 Excel
          </button>
        </div>

        {errorMsg && <p className="rep-error-msg">⚠️ {errorMsg}</p>}

        <button
          className="rep-btn-generar"
          onClick={handleGenerar}
          disabled={!seleccionado || generando}
        >
          {generando
            ? "Generando..."
            : `📥 Generar reporte ${formato === "pdf" ? "PDF" : "Excel"}`}
        </button>

        <section className="rep-section-label" style={{ marginTop: "2rem" }}>
          Historial de reportes
        </section>
        <div className="rep-historial">
          {historial.length === 0 ? (
            <p className="rep-historial-empty">
              Aún no has generado ningún reporte en esta sesión.
            </p>
          ) : (
            historial.map((r, i) => (
              <div key={r.id} className="rep-historial-row">
                <div className="rep-hist-icon">{emojiTipo(r.tipo)}</div>
                <div className="rep-hist-info">
                  <div className="rep-hist-nombre">
                    Reporte de {labelTipo(r.tipo)}
                    {i === 0 && <span className="rep-badge-nuevo">Reciente</span>}
                  </div>
                  <div className="rep-hist-meta">
                    {r.fecha}, {r.hora} · {r.institucion}
                  </div>
                </div>
                <div className="rep-hist-acciones">
                  <button
                    className="rep-btn-descargar"
                    onClick={() => handleDescargar(r, "pdf")}
                  >
                    ⬇ PDF
                  </button>
                  <button
                    className="rep-btn-descargar rep-btn-descargar-excel"
                    onClick={() => handleDescargar(r, "xlsx")}
                  >
                    ⬇ Excel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Reportes;