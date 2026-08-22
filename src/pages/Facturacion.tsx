import React, { useEffect, useMemo, useState } from "react";
import "../styles/Dashboard.css";
import "../styles/Facturacion.css";
import type { CobroPendiente, EmisorInstitucion, EstadoFactura, FacturaPreview } from "../types/factura";
import * as facturacionService from "../services/facturacion.service";
import Sidebar from "../components/Sidebar";

type Props = {
  userRole: "Administrador" | "Auxiliar";
};

const emisorInicial: EmisorInstitucion = {
  nombre: "Institución educativa",
  nit: "",
  direccion: "",
  telefono: "",
  resolucionDian: "",
};

const Facturacion: React.FC<Props> = ({ userRole }) => {
  const token = localStorage.getItem("token");
  const institucionActual = localStorage.getItem("institucion") || "Institución";

  const [periodo, setPeriodo] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [cobros, setCobros] = useState<CobroPendiente[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [emisor, setEmisor] = useState<EmisorInstitucion>(emisorInicial);
  const [buscando, setBuscando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Errores reales de conexión con el backend (se muestran siempre,
  // incluso en MODO_PRUEBA_SIN_BACKEND, para poder detectar problemas
  // de configuración — CORS, URL mal escrita, token vencido, etc.)
  const [errorEmisor, setErrorEmisor] = useState<string | null>(null);
  const [errorCobros, setErrorCobros] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // Vista previa
  const [facturasPreview, setFacturasPreview] = useState<FacturaPreview[]>([]);
  const [indicePreview, setIndicePreview] = useState(0);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    obtenerEmisor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── EMISOR (datos del colegio activo) ─────────────────────────────
  // Reutiliza el mismo endpoint que ya usa SeleccionInstitucion.tsx,
  // así que este fetch es real y no un mock.
  const obtenerEmisor = async () => {
    setErrorEmisor(null);
    try {
      const data = await facturacionService.obtenerEmisor(token, institucionActual);
      setEmisor(data);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error desconocido";
      setErrorEmisor(mensaje);
    }
  };

  // ── COBROS PENDIENTES DEL PERIODO ─────────────────────────────────
  const obtenerCobros = async () => {
    setBuscando(true);
    setSeleccionados(new Set());
    setErrorCobros(null);
    try {
      const data = await facturacionService.obtenerCobros(token, institucionActual, periodo);
      setCobros(data);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error desconocido";
      setCobros([]);
      setErrorCobros(mensaje);
    } finally {
      setBuscando(false);
      setBusquedaRealizada(true);
    }
  };

  // ── SELECCIÓN DE FILAS ─────────────────────────────────────────────
  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSeleccionarTodos = () => {
    if (seleccionados.size === cobros.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(cobros.map((c) => c.id)));
    }
  };

  const totalSeleccionado = useMemo(
    () => cobros.filter((c) => seleccionados.has(c.id)).reduce((sum, c) => sum + c.valor, 0),
    [cobros, seleccionados]
  );

  // ── CONSTRUCCIÓN DE LA FACTURA (front) ────────────────────────────
  // Arma la representación de cada factura seleccionada con los datos
  // que ya tenemos en el front. Cuando el backend esté conectado, este
  // mismo objeto es el que se le envía para que él la procese con Siigo.
  const construirFactura = (cobro: CobroPendiente, correlativo: number): FacturaPreview => {
    const hoy = new Date();
    const vencimiento = new Date(hoy);
    vencimiento.setDate(vencimiento.getDate() + 15);

    return {
      cobroId: cobro.id,
      // TODO backend: el número real y el prefijo lo asigna Siigo según
      // el rango de resolución DIAN autorizado. Este es solo un placeholder
      // para poder visualizar la factura antes de conectar.
      numeroFactura: `FE-${String(correlativo).padStart(4, "0")}`,
      fechaGeneracion: hoy.toLocaleDateString("es-CO"),
      fechaVencimiento: vencimiento.toLocaleDateString("es-CO"),
      emisor,
      adquiriente: {
        nombre: cobro.nombreAcudiente,
        documento: cobro.documentoAcudiente,
        direccion: cobro.direccionAcudiente,
        telefono: cobro.telefonoAcudiente,
      },
      estudiante: {
        nombre: cobro.nombreEstudiante,
        documento: cobro.documentoEstudiante,
        grado: cobro.grado,
      },
      items: [
        {
          concepto: cobro.concepto,
          cantidad: 1,
          valorUnitario: cobro.valor,
          subtotal: cobro.valor,
        },
      ],
      subtotal: cobro.valor,
      // Los servicios de educación formal están excluidos de IVA
      // (Art. 476 del Estatuto Tributario colombiano).
      iva: 0,
      total: cobro.valor,
      formaPago: "Contado",
      medioPago: "Transferencia bancaria",
      estado: "Generada",
    };
  };

  const handleGenerarPreview = () => {
    const seleccionadosArr = cobros.filter((c) => seleccionados.has(c.id));
    if (seleccionadosArr.length === 0) return;

    const facturas = seleccionadosArr.map((c, i) => construirFactura(c, c.id + i));
    setFacturasPreview(facturas);
    setIndicePreview(0);
    setMostrarPreview(true);

    // Reflejar en la tabla que estas facturas ya están "Generadas"
    setCobros((prev) =>
      prev.map((c) =>
        seleccionados.has(c.id) ? { ...c, estado: "Generada" as EstadoFactura } : c
      )
    );
  };

  // ── ENVÍO AL BACKEND (que a su vez habla con Siigo/DIAN) ─────────
  const enviarFactura = async (factura: FacturaPreview) => {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const resultado = await facturacionService.enviarFactura(token, factura);
      actualizarResultadoFactura(factura.cobroId, resultado);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error desconocido";
      setErrorEnvio(`No se pudo enviar la factura a Siigo: ${mensaje}`);
    } finally {
      setEnviando(false);
    }
  };

  const actualizarResultadoFactura = (
    cobroId: number,
    resultado: { estado: EstadoFactura; cufe?: string; motivoRechazo?: string }
  ) => {
    setCobros((prev) =>
      prev.map((c) => (c.id === cobroId ? { ...c, ...resultado } : c))
    );
    setFacturasPreview((prev) =>
      prev.map((f) => (f.cobroId === cobroId ? { ...f, ...resultado } : f))
    );
  };

  const handleEnviarActual = () => {
    const factura = facturasPreview[indicePreview];
    if (factura) enviarFactura(factura);
  };

  const handleEnviarTodas = async () => {
    for (const factura of facturasPreview) {
      if (factura.estado === "Generada") {
        // eslint-disable-next-line no-await-in-loop
        await enviarFactura(factura);
      }
    }
  };

  const cerrarPreview = () => {
    setMostrarPreview(false);
  };

  const claseEstado = (estado: EstadoFactura) => {
    switch (estado) {
      case "Aceptada":
        return "fac-badge fac-badge-ok";
      case "Rechazada":
        return "fac-badge fac-badge-error";
      case "Enviada":
        return "fac-badge fac-badge-info";
      case "Generada":
        return "fac-badge fac-badge-warning";
      default:
        return "fac-badge fac-badge-neutral";
    }
  };

  const formatoCOP = (valor: number) =>
    valor.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  const facturaActual = facturasPreview[indicePreview];

  return (
    <div className="dashboard-layout">
      <Sidebar userRole={userRole} />

      {/* CONTENIDO */}
      <main className="main-content">
        <header className="content-header">
          <h1>Facturación</h1>
          <p>Genera y envía las facturas electrónicas del periodo a Siigo</p>
        </header>

        {/* TODO ELIMINAR junto con MODO_PRUEBA_SIN_BACKEND (ver services/facturacion.service.ts) */}
        {facturacionService.MODO_PRUEBA_SIN_BACKEND && (
          <p className="fac-aviso-demo">
            🧪 Modo prueba activo — usando datos simulados mientras el backend de{" "}
            <code>/api/facturacion</code> no esté conectado. Recuerda desactivar{" "}
            <code>MODO_PRUEBA_SIN_BACKEND</code> en <code>facturacion.service.ts</code> antes de
            entregar.
          </p>
        )}

        {errorEmisor && (
          <p className="fac-aviso-error">⚠️ No se pudo cargar la institución: {errorEmisor}</p>
        )}
        {errorCobros && (
          <p className="fac-aviso-error">⚠️ No se pudo cargar los cobros pendientes: {errorCobros}</p>
        )}
        {errorEnvio && <p className="fac-aviso-error">⚠️ {errorEnvio}</p>}

        {/* BUSCADOR DE COBROS PENDIENTES */}
        <section className="fac-filtros">
          <div className="fac-filtro-campo">
            <label>Institución</label>
            <input type="text" value={institucionActual} disabled />
          </div>
          <div className="fac-filtro-campo">
            <label>Periodo</label>
            <input
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
          </div>
          <button className="fac-btn-buscar" onClick={obtenerCobros} disabled={buscando}>
            {buscando ? "Buscando..." : "🔍 Buscar cobros pendientes"}
          </button>
        </section>

        {/* TABLA DE COBROS */}
        {busquedaRealizada && (
          <section className="fac-tabla-container">
            {cobros.length === 0 ? (
              <p className="fac-vacio">No hay cobros pendientes para este periodo.</p>
            ) : (
              <>
                <table className="fac-tabla">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={seleccionados.size === cobros.length && cobros.length > 0}
                          onChange={toggleSeleccionarTodos}
                        />
                      </th>
                      <th>Estudiante</th>
                      <th>Grado</th>
                      <th>Acudiente</th>
                      <th>Concepto</th>
                      <th className="text-right">Valor</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobros.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={seleccionados.has(c.id)}
                            onChange={() => toggleSeleccion(c.id)}
                          />
                        </td>
                        <td className="font-bold">{c.nombreEstudiante}</td>
                        <td>{c.grado}</td>
                        <td>{c.nombreAcudiente}</td>
                        <td>{c.concepto}</td>
                        <td className="text-right">{formatoCOP(c.valor)}</td>
                        <td>
                          <span className={claseEstado(c.estado)}>{c.estado}</span>
                          {c.estado === "Rechazada" && c.motivoRechazo && (
                            <div className="fac-motivo-rechazo">{c.motivoRechazo}</div>
                          )}
                          {c.estado === "Aceptada" && c.cufe && (
                            <div className="fac-cufe-mini" title={c.cufe}>
                              CUFE: {c.cufe.slice(0, 12)}…
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="fac-resumen-seleccion">
                  <span>
                    {seleccionados.size} seleccionado(s) · Total:{" "}
                    <strong>{formatoCOP(totalSeleccionado)}</strong>
                  </span>
                  <button
                    className="fac-btn-generar"
                    onClick={handleGenerarPreview}
                    disabled={seleccionados.size === 0}
                  >
                    🧾 Generar vista previa ({seleccionados.size})
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* ── MODAL DE VISTA PREVIA DE FACTURA ────────────────────────── */}
      {mostrarPreview && facturaActual && (
        <div className="fac-modal-overlay" onClick={cerrarPreview}>
          <div className="fac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <span>
                Factura {indicePreview + 1} de {facturasPreview.length}
              </span>
              <button className="fac-modal-close" onClick={cerrarPreview}>
                ✕
              </button>
            </div>

            {/* ── DOCUMENTO DE FACTURA ── */}
            <div className="factura-doc">
              <div className="factura-doc-header">
                <div className="factura-doc-emisor">
                  <h2>{facturaActual.emisor.nombre}</h2>
                  <p>NIT: {facturaActual.emisor.nit}</p>
                  <p>{facturaActual.emisor.direccion}</p>
                  <p>Tel: {facturaActual.emisor.telefono}</p>
                </div>
                <div className="factura-doc-info">
                  <h3>FACTURA DE VENTA ELECTRÓNICA</h3>
                  <p>
                    <strong>N.º:</strong> {facturaActual.numeroFactura}
                  </p>
                  <p>
                    <strong>Fecha generación:</strong> {facturaActual.fechaGeneracion}
                  </p>
                  <p>
                    <strong>Fecha vencimiento:</strong> {facturaActual.fechaVencimiento}
                  </p>
                  <p className="factura-doc-resolucion">
                    Resolución DIAN: {facturaActual.emisor.resolucionDian}
                  </p>
                </div>
              </div>

              <div className="factura-doc-partes">
                <div className="factura-doc-parte">
                  <h4>Adquiriente</h4>
                  <p className="font-bold">{facturaActual.adquiriente.nombre}</p>
                  <p>C.C. {facturaActual.adquiriente.documento}</p>
                  <p>{facturaActual.adquiriente.direccion}</p>
                  <p>Tel: {facturaActual.adquiriente.telefono}</p>
                </div>
                <div className="factura-doc-parte">
                  <h4>Estudiante asociado</h4>
                  <p className="font-bold">{facturaActual.estudiante.nombre}</p>
                  <p>Documento: {facturaActual.estudiante.documento}</p>
                  <p>Grado: {facturaActual.estudiante.grado}</p>
                </div>
              </div>

              <table className="factura-doc-items">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th className="text-right">Cant.</th>
                    <th className="text-right">Valor unitario</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {facturaActual.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.concepto}</td>
                      <td className="text-right">{item.cantidad}</td>
                      <td className="text-right">{formatoCOP(item.valorUnitario)}</td>
                      <td className="text-right">{formatoCOP(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="factura-doc-totales">
                <div className="factura-doc-totales-fila">
                  <span>Subtotal</span>
                  <span>{formatoCOP(facturaActual.subtotal)}</span>
                </div>
                <div className="factura-doc-totales-fila">
                  <span>IVA (excluido — Art. 476 E.T.)</span>
                  <span>{formatoCOP(facturaActual.iva)}</span>
                </div>
                <div className="factura-doc-totales-fila factura-doc-total-final">
                  <span>Total a pagar</span>
                  <span>{formatoCOP(facturaActual.total)}</span>
                </div>
                <div className="factura-doc-totales-fila fac-forma-pago">
                  <span>Forma de pago: {facturaActual.formaPago}</span>
                  <span>Medio: {facturaActual.medioPago}</span>
                </div>
              </div>

              <div className="factura-doc-footer">
                <div className="factura-doc-qr">QR CUFE</div>
                <div className="factura-doc-footer-info">
                  <span className={claseEstado(facturaActual.estado)}>
                    {facturaActual.estado}
                  </span>
                  {facturaActual.cufe && (
                    <p className="factura-doc-cufe">CUFE: {facturaActual.cufe}</p>
                  )}
                  {facturaActual.motivoRechazo && (
                    <p className="factura-doc-motivo">Motivo: {facturaActual.motivoRechazo}</p>
                  )}
                  <p className="factura-doc-disclaimer">
                    Esta es una representación gráfica generada por el sistema. La factura
                    electrónica válida es la que se transmite en formato XML a la DIAN a
                    través de Siigo.
                  </p>
                </div>
              </div>
            </div>

            {/* NAVEGACIÓN Y ACCIONES */}
            <div className="fac-modal-acciones">
              <button
                className="fac-btn-nav"
                onClick={() => setIndicePreview((i) => Math.max(0, i - 1))}
                disabled={indicePreview === 0}
              >
                ← Anterior
              </button>
              <button
                className="fac-btn-enviar"
                onClick={handleEnviarActual}
                disabled={enviando || facturaActual.estado !== "Generada"}
              >
                {facturaActual.estado === "Generada"
                  ? enviando
                    ? "Enviando..."
                    : "📤 Enviar a Siigo"
                  : `Estado: ${facturaActual.estado}`}
              </button>
              <button
                className="fac-btn-nav"
                onClick={() =>
                  setIndicePreview((i) => Math.min(facturasPreview.length - 1, i + 1))
                }
                disabled={indicePreview === facturasPreview.length - 1}
              >
                Siguiente →
              </button>
            </div>

            <button
              className="fac-btn-enviar-todas"
              onClick={handleEnviarTodas}
              disabled={enviando || !facturasPreview.some((f) => f.estado === "Generada")}
            >
              📤 Enviar todas las pendientes a Siigo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturacion;