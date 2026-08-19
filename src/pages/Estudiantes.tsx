import React, { useState } from "react";
import "../styles/Dashboard.css";
import "../styles/Usuarios.css";
import "../styles/Estudiantes.css";
import Sidebar from "../components/Sidebar";

type Props = {
  userRole: "Administrador" | "Auxiliar";
};

const Estudiantes: React.FC<Props> = ({ userRole }) => {
  const [students] = useState<any[]>([]);

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

        <section className="upload-section">
          <div className="upload-card">
            <div className="upload-icon">📁</div>
            <h3>Cargar Archivos</h3>
            <p>Selecciona o arrastra cualquier archivo para procesar</p>
            
            <label htmlFor="file-upload" className="btn-upload">
              Seleccionar Archivo
            </label>
            <input 
              id="file-upload" 
              type="file" 
              /* Eliminamos el accept específico para permitir cualquier archivo */
              onChange={(e) => console.log("Archivo seleccionado:", e.target.files?.[0])}
              style={{ display: 'none' }} 
            />
            
            <span className="file-info">Formatos admitidos: Todos los archivos (Máx. 10MB)</span>
          </div>
        </section>

        <section className="table-container">
          <div className="table-header-flex">
            <h2 className="table-title">Lista de Estudiantes</h2>
            {students.length > 0 && <button className="btn-save-all">Confirmar Carga</button>}
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>DOCUMENTO</th>
                <th>NOMBRE DEL ESTUDIANTE</th>
                <th>GRADO</th>
                <th>ACUDIENTE</th>
                <th className="text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={index}>
                    <td className="font-bold">{student.documento}</td>
                    <td>{student.nombre}</td>
                    <td><span className="grade-tag">{student.grado}</span></td>
                    <td>{student.acudiente}</td>
                    <td className="actions-icons">
                      <span>🗑️</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-table-msg">
                    No hay datos cargados. Sube un archivo para previsualizar la información.
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

export default Estudiantes;