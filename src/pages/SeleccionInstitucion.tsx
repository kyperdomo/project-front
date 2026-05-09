import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SeleccionInstitucion.css";

export type Institucion = string;

type UserRole = "Administrador" | "Auxiliar";

type InstitucionData = {
  id: string;
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
};

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
  id: "",
  nombre: "",
  nit: "",
  direccion: "",
  telefono: "",
};

const SeleccionInstitucion: React.FC<Props> = ({ userName, userRole, setInstitucion }) => {
  const navigate = useNavigate();
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [instituciones, setInstituciones] = useState<InstitucionData[]>(institucionesIniciales);

  // Modal agregar
  const [mostrarModal, setMostrarModal] = useState(false);
  const [form, setForm] = useState<InstitucionData>(camposVacios);
  const [errores, setErrores] = useState<Partial<InstitucionData>>({});

  const handleIngresar = () => {
    if (!seleccionada) return;
    setInstitucion(seleccionada);
    localStorage.setItem("institucion", seleccionada);
    navigate("/dashboard");
  };

  const handleCampo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
  };

  const validar = (): boolean => {
    const nuevosErrores: Partial<InstitucionData> = {};
    if (!form.id.trim()) nuevosErrores.id = "El ID es obligatorio";
    if (!form.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!form.nit.trim()) nuevosErrores.nit = "El NIT es obligatorio";
    if (!form.direccion.trim()) nuevosErrores.direccion = "La dirección es obligatoria";
    if (!form.telefono.trim()) nuevosErrores.telefono = "El teléfono es obligatorio";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleAgregar = () => {
    if (!validar()) return;
    setInstituciones((prev) => [...prev, { ...form }]);
    setForm(camposVacios);
    setErrores({});
    setMostrarModal(false);
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
              key={inst.id}
              className={`si-inst-card ${seleccionada === inst.id ? "selected" : ""}`}
              onClick={() => setSeleccionada(inst.id)}
            >
              <div className="si-inst-icon">🏫</div>
              <div className="si-inst-info">
                <span className="si-inst-nombre">{inst.nombre}</span>
                <span className="si-inst-nit">NIT {inst.nit}</span>
              </div>
              {seleccionada === inst.id && <span className="si-check">✓</span>}
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
                  { name: "id", label: "ID", placeholder: "Ej: inst_001" },
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