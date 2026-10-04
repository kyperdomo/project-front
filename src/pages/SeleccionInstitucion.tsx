import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SeleccionInstitucion.css";
import { BASE_URL } from "../services/config";

export type Institucion = string;

type UserRole = "Administrador" | "Auxiliar";

type InstitucionData = {
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  // ── Credenciales de Siigo de ESTA institución ──────────────────────
  // En Siigo Nube cada colegio es una cuenta aparte, con su propia
  // credencial, su resolución DIAN y su numeración. Solver Control las
  // administra todas, pero factura a nombre de cada institución, así que
  // estos datos son por colegio y no configuración de la aplicación.
  siigoUsername: string;
  // El backend nunca la devuelve: al editar llega vacía y solo se
  // reemplaza si se escribe una nueva.
  siigoAccessKey: string;
  siigoDocumentId: string;
  siigoSellerId: string;
  siigoPaymentTypeId: string;
};

// Campos que el backend recibe como número.
const CAMPOS_NUMERICOS = ["siigoDocumentId", "siigoSellerId", "siigoPaymentTypeId"] as const;

type Props = {
  userName: string;
  userRole: UserRole;
  setInstitucion: (inst: string) => void;
};

// TODO: conectar con el backend para obtener las instituciones
// Ejemplo de llamada:
//   const token = localStorage.getItem("token");
//   const response = await fetch("/api/instituciones", {
//     headers: { Authorization: `Bearer ${token}` }
//   });
//   const data: InstitucionData[] = await response.json();
//   setInstituciones(data);
const institucionesIniciales: InstitucionData[] = [];

const camposVacios: InstitucionData = {
  nombre: "",
  nit: "",
  direccion: "",
  telefono: "",
  siigoUsername: "",
  siigoAccessKey: "",
  siigoDocumentId: "",
  siigoSellerId: "",
  siigoPaymentTypeId: "",
};

const SeleccionInstitucion: React.FC<Props> = ({ userName, userRole, setInstitucion }) => {
  const navigate = useNavigate();
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [instituciones, setInstituciones] = useState<InstitucionData[]>(institucionesIniciales);
  const token = localStorage.getItem("token");

  // Modal agregar
  const [mostrarModal, setMostrarModal] = useState(false);
  const [form, setForm] = useState<InstitucionData>(camposVacios);
  const [errores, setErrores] = useState<Partial<InstitucionData>>({});

  useEffect(() => {
    obtenerInstituciones();
  }, []);

  const obtenerInstituciones = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/colegios/get`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener colegios");
      }

      const data = await response.json();

      setInstituciones(data);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleIngresar = () => {

    if (!seleccionada) return;

    const institucionSeleccionada = instituciones.find(
      (inst) => inst.nit === seleccionada
    );

    if (!institucionSeleccionada) return;

    setInstitucion(institucionSeleccionada.nombre);

    localStorage.setItem(
      "institucion",
      institucionSeleccionada.nombre
    );

    // Se guarda también el NIT: es lo que usa el backend para filtrar
    // los reportes por el colegio activo (ver Reportes.tsx).
    localStorage.setItem(
      "institucionNit",
      institucionSeleccionada.nit
    );

    navigate("/dashboard");
  };

  const handleCampo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
  };

  const validar = (): boolean => {
    const nuevosErrores: Partial<InstitucionData> = {};
    if (!form.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!form.nit.trim()) nuevosErrores.nit = "El NIT es obligatorio";
    if (!form.direccion.trim()) nuevosErrores.direccion = "La dirección es obligatoria";
    if (!form.telefono.trim()) nuevosErrores.telefono = "El teléfono es obligatorio";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleAgregar = async () => {
    if (!validar()) return;

    try {

      // Los ids de Siigo viajan como número; si el campo quedó vacío se
      // manda null en vez de "", que el backend no puede convertir.
      const cuerpo: Record<string, unknown> = { ...form };
      CAMPOS_NUMERICOS.forEach((campo) => {
        const valor = form[campo].trim();
        cuerpo[campo] = valor === "" ? null : Number(valor);
      });
      if (!form.siigoAccessKey.trim()) delete cuerpo.siigoAccessKey;

      const response = await fetch(
        `${BASE_URL}/api/colegios/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(cuerpo),
        }
      );

      const mensaje = await response.text();

      if (!response.ok) {
        alert(mensaje);
        return;
      }

      alert(mensaje);

      await obtenerInstituciones();

      setForm(camposVacios);
      setErrores({});
      setMostrarModal(false);

    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setForm(camposVacios);
    setErrores({});
  };

  return (
    <div className="si-page">
      <div className="si-card">

        <h1 className="si-title">Sistema Educativo</h1>
        <p className="si-subtitle">Selecciona la institución para continuar</p>

        <p className="si-greeting">
          Hola, <span className="si-username">{userName}</span> — ¿con cuál institución vas a trabajar hoy?
        </p>

        <div className="si-list">
          {instituciones.map((inst) => (
            <div
              key={inst.nit}
              className={`si-inst-card ${seleccionada === inst.nit ? "selected" : ""}`}
              onClick={() => setSeleccionada(inst.nit)}
            >
              <div className="si-inst-icon">🏫</div>
              <div className="si-inst-info">
                <span className="si-inst-nombre">{inst.nombre}</span>
                <span className="si-inst-nit">NIT {inst.nit}</span>
              </div>
              {seleccionada === inst.nit && <span className="si-check">✓</span>}
            </div>
          ))}
        </div>

        {/* Botón agregar — solo Administrador */}
        {userRole === "Administrador" && (
          <button className="si-btn-agregar" onClick={() => setMostrarModal(true)}>
            + Agregar institución
          </button>
        )}

        <button className="si-btn" onClick={handleIngresar} disabled={!seleccionada}>
          Ingresar al sistema
        </button>
      </div>

      {/* ===== MODAL ===== */}
      {mostrarModal && (
        <div className="si-modal-overlay" onClick={handleCerrarModal}>
          <div className="si-modal" onClick={(e) => e.stopPropagation()}>

            <div className="si-modal-header">
              <h2 className="si-modal-title">Nueva institución</h2>
              <button className="si-modal-close" onClick={handleCerrarModal}>✕</button>
            </div>

            <div className="si-modal-body">
              {(
                [
                  { name: "nombre", label: "Nombre", placeholder: "Ej: Colegio San José" },
                  { name: "nit", label: "NIT", placeholder: "Ej: 900.111.222-3" },
                  { name: "direccion", label: "Dirección", placeholder: "Ej: Calle 10 #20-30" },
                  { name: "telefono", label: "Teléfono", placeholder: "Ej: 601 333 4444" },
                ] as { name: keyof InstitucionData; label: string; placeholder: string }[]
              ).map(({ name, label, placeholder }) => (
                <div className="si-campo" key={name}>
                  <label className="si-label">{label}</label>
                  <input
                    className={`si-input ${errores[name] ? "si-input-error" : ""}`}
                    type="text"
                    name={name}
                    value={form[name]}
                    onChange={handleCampo}
                    placeholder={placeholder}
                  />
                  {errores[name] && <span className="si-error-msg">{errores[name]}</span>}
                </div>
              ))}

              <div className="si-campo">
                <p className="si-label" style={{ marginTop: "1rem" }}>
                  Facturación electrónica (Siigo)
                </p>
                <span className="si-error-msg" style={{ color: "#6b7280" }}>
                  Se toman de la cuenta de Siigo de esta institución: Alianzas →
                  Mi Credencial API. Se pueden dejar en blanco y cargarlas después,
                  pero sin ellas no se puede facturar este colegio.
                </span>
              </div>

              {(
                [
                  { name: "siigoUsername", label: "Usuario de API", placeholder: "correo@colegio.edu.co" },
                  { name: "siigoAccessKey", label: "Clave de API", placeholder: "Se guarda cifrada" },
                  { name: "siigoDocumentId", label: "ID tipo de comprobante", placeholder: "GET /document-types" },
                  { name: "siigoSellerId", label: "ID del vendedor", placeholder: "GET /users" },
                  { name: "siigoPaymentTypeId", label: "ID del medio de pago", placeholder: "GET /payment-types" },
                ] as { name: keyof InstitucionData; label: string; placeholder: string }[]
              ).map(({ name, label, placeholder }) => (
                <div className="si-campo" key={name}>
                  <label className="si-label">{label}</label>
                  <input
                    className="si-input"
                    // La clave nunca se muestra en pantalla mientras se escribe.
                    type={name === "siigoAccessKey" ? "password" : "text"}
                    name={name}
                    value={form[name]}
                    onChange={handleCampo}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="si-modal-footer">
              <button className="si-btn-cancelar" onClick={handleCerrarModal}>Cancelar</button>
              <button className="si-btn-guardar" onClick={handleAgregar}>Guardar</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SeleccionInstitucion;