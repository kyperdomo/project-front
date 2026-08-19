import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export type UserRole = "Administrador" | "Auxiliar";

type Props = {
  userRole: UserRole;
};

/**
 * Sidebar único para todo el sistema.
 * Todas las páginas (Dashboard, Estudiantes, Reportes, Usuarios,
 * HistorialCargas, etc.) deben importar y usar este componente
 * en vez de tener su propia copia del <aside>.
 *
 * Para agregar un módulo nuevo al menú: agrégalo UNA vez aquí abajo
 * y aparece automáticamente en todas las pantallas.
 */
const Sidebar: React.FC<Props> = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Sistema Educativo</h2>
        <span>
          {userRole === "Administrador" ? "Gestión Administrativa" : "Gestión Auxiliar"}
        </span>
      </div>

      <nav className="sidebar-nav">
        {userRole === "Administrador" && (
          <div
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            📊 Dashboard
          </div>
        )}

        <div
          className={`nav-item ${isActive("/estudiantes") ? "active" : ""}`}
          onClick={() => navigate("/estudiantes")}
        >
          🎓 Estudiantes
        </div>

        <div className="nav-item">📄 Facturación</div>
        <div className="nav-item">💳 Pagos</div>

        <div
          className={`nav-item ${isActive("/reportes") ? "active" : ""}`}
          onClick={() => navigate("/reportes")}
        >
          📈 Reportes
        </div>

        {userRole === "Administrador" && (
          <div
            className={`nav-item ${isActive("/historial-cargas") ? "active" : ""}`}
            onClick={() => navigate("/historial-cargas")}
          >
            🕒 Historial de cargas
          </div>
        )}

        {userRole === "Administrador" && (
          <div
            className={`nav-item ${isActive("/usuarios") ? "active" : ""}`}
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
  );
};

export default Sidebar;