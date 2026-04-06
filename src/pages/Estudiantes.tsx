// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../styles/Dashboard.css";
// import "../styles/Usuarios.css";
// import "../styles/Estudiantes.css";

// const Estudiantes: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Estado para los estudiantes cargados
//   const [students, setStudents] = useState<any[]>([]);

//   return (
//     <div className="dashboard-layout">
//       {/* SIDEBAR IDENTICO */}
//       <aside className="sidebar">
//         <div className="sidebar-header">
//           <h2>Sistema Educativo</h2>
//           <span>Gestión Administrativa</span>
//         </div>
//         <nav className="sidebar-nav">
//           <div className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate("/dashboard")}>📊 Dashboard</div>
//           <div className={`nav-item ${location.pathname === '/estudiantes' ? 'active' : ''}`} onClick={() => navigate("/estudiantes")}>🎓 Estudiantes</div>
//           <div className="nav-item">📄 Facturación</div>
//           <div className="nav-item">💳 Pagos</div>
//           <div className="nav-item">📈 Reportes</div>
//           <div className={`nav-item ${location.pathname === '/usuarios' ? 'active' : ''}`} onClick={() => navigate("/usuarios")}>👥 Usuarios</div>
//         </nav>
//         <div className="sidebar-footer">
//           <button className="sidebar-logout" onClick={() => navigate("/home")}>🚪 Cerrar Sesión</button>
//         </div>
//       </aside>

//       <main className="main-content">
//         <header className="content-header">
//           <h1>Gestión de Estudiantes</h1>
//           <p>Carga masiva de alumnos mediante archivos Excel</p>
//         </header>

//         {/* SECCIÓN DE CARGA DE ARCHIVO */}
//         <section className="upload-section">
//           <div className="upload-card">
//             <div className="upload-icon">📁</div>
//             <h3>Cargar Base de Datos</h3>
//             <p>Selecciona o arrastra tu archivo .xlsx o .csv</p>
            
//             <label htmlFor="file-upload" className="btn-upload">
//               Seleccionar Excel
//             </label>
//             <input 
//               id="file-upload" 
//               type="file" 
//               accept=".xlsx, .xls, .csv" 
//               style={{ display: 'none' }} 
//             />
            
//             <span className="file-info">Formatos admitidos: Excel, CSV (Máx. 10MB)</span>
//           </div>
//         </section>

//         {/* TABLA DE PREVISUALIZACIÓN */}
//         <section className="table-container">
//           <div className="table-header-flex">
//             <h2>Lista de Estudiantes</h2>
//             {students.length > 0 && <button className="btn-save-all">Confirmar Carga</button>}
//           </div>

//           <table className="custom-table">
//             <thead>
//               <tr>
//                 <th>DOCUMENTO</th>
//                 <th>NOMBRE DEL ESTUDIANTE</th>
//                 <th>GRADO</th>
//                 <th>ACUDIENTE</th>
//                 <th className="text-right">ACCIONES</th>
//               </tr>
//             </thead>
//             <tbody>
//               {students.length > 0 ? (
//                 students.map((student, index) => (
//                   <tr key={index}>
//                     <td className="font-bold">{student.documento}</td>
//                     <td>{student.nombre}</td>
//                     <td><span className="grade-tag">{student.grado}</span></td>
//                     <td>{student.acudiente}</td>
//                     <td className="actions-icons">
//                       <span>🗑️</span>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={5} className="empty-table-msg">
//                     No hay datos cargados. Sube un archivo Excel para previsualizar la información.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default Estudiantes;

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/Usuarios.css";
import "../styles/Estudiantes.css";

type Props = {
  userRole: "admin" | "auxiliar";
};

const Estudiantes: React.FC<Props> = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students] = useState<any[]>([]);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sistema Educativo</h2>
          <span>{userRole === "admin" ? "Gestión Administrativa" : "Gestión Auxiliar"}</span>
        </div>
        <nav className="sidebar-nav">
          {userRole === "admin" && (
            <div 
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} 
              onClick={() => navigate("/dashboard")}
            >
              📊 Dashboard
            </div>
          )}

          <div 
            className={`nav-item ${location.pathname === '/estudiantes' ? 'active' : ''}`} 
            onClick={() => navigate("/estudiantes")}
          >
            🎓 Estudiantes
          </div>
          
          <div className="nav-item">📄 Facturación</div>
          <div className="nav-item">💳 Pagos</div>
          <div className="nav-item">📈 Reportes</div>

          {userRole === "admin" && (
            <div 
              className={`nav-item ${location.pathname === '/usuarios' ? 'active' : ''}`} 
              onClick={() => navigate("/usuarios")}
            >
              👥 Usuarios
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={() => navigate("/home")}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>Gestión de Estudiantes</h1>
          <p>
            {userRole === "admin" 
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