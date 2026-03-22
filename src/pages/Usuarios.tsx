import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/Usuarios.css";

const Usuarios: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- ESTADOS PARA EL BACKEND (Spring Boot) ---
  const [users, setUsers] = useState<any[]>([]);
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Lógica automática para las tarjetas
  const totalAdmins = users.filter(u => u.role === "Administrador").length;
  const totalAuxiliares = users.filter(u => u.role === "Auxiliar").length;

  /* BACKEND_CONNECT: Cargar usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/usuarios');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };
    fetchUsers();
  }, []);
  */

  // Función para abrir modal de CREACIÓN
  const handleCreateClick = () => {
    setIsEditing(false);
    setCurrentUser({
      id: "",
      name: "",
      email: "",
      password: "",
      role: "Auxiliar"
    });
    setIsModalOpen(true);
  };

  // Función para abrir modal de EDICIÓN
  const handleEditClick = (user: any) => {
    setIsEditing(true);
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sistema Educativo</h2>
          <span>Gestión Administrativa</span>
        </div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate("/dashboard")}>📊 Dashboard</div>
          <div className="nav-item">🎓 Estudiantes</div>
          <div className="nav-item">📄 Facturación</div>
          <div className="nav-item">💳 Pagos</div>
          <div className="nav-item">📈 Reportes</div>
          <div className={`nav-item ${location.pathname === '/usuarios' ? 'active' : ''}`} onClick={() => navigate("/usuarios")}>👥 Usuarios</div>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={() => navigate("/home")}>🚪 Cerrar Sesión</button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <header className="content-header">
          <h1>Usuarios</h1>
          <p>Gestión de usuarios y roles del sistema</p>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-data">
              <span className="label">Total Usuarios</span>
              <h2 className="value">{users.length}</h2>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-data">
              <span className="label">Administradores</span>
              <h2 className="value admin-text">{totalAdmins}</h2>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-data">
              <span className="label">Auxiliares</span>
              <h2 className="value auxiliar-text">{totalAuxiliares}</h2>
            </div>
          </div>
        </section>

        {/* BARRA DE ACCIONES */}
        <div className="table-actions-bar">
          <input type="text" placeholder="🔍 Buscar por nombre o email..." className="search-input" />
          <button className="btn-add-user" onClick={handleCreateClick}>
            + Nuevo Usuario
          </button>
        </div>

        {/* TABLA */}
        <section className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>USUARIO</th>
                <th>EMAIL</th>
                <th>ROL</th>
                <th>ESTADO</th>
                <th className="text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-bold">#{user.id}</td>
                    <td>
                      <div className="user-info-cell">
                        <div className="avatar-circle">
                          {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                        </div>
                        <span className="user-name">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td><span className="role-tag">{user.role}</span></td>
                    <td><span className="status-badge-active">Activo</span></td>
                    <td className="actions-icons">
                      <span onClick={() => handleEditClick(user)} title="Editar">📝</span>
                      <span title="Eliminar">🗑️</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-table-msg">
                    No hay usuarios registrados. Haz clic en "Nuevo Usuario" para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* MODAL DINÁMICO (CREAR / EDITAR) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>
            <form className="edit-form">
              
              <div className="form-group">
                <label>Identificación (ID)</label>
                <input 
                  type="text" 
                  defaultValue={currentUser?.id} 
                  placeholder="Ej. 1090123"
                  disabled={isEditing} 
                  className={isEditing ? "input-disabled" : ""} 
                />
              </div>

              <div className="form-group">
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  defaultValue={currentUser?.name} 
                  placeholder="Ej. Karen Perdomo" 
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  defaultValue={currentUser?.email} 
                  placeholder="ejemplo@correo.com" 
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input 
                  type="password" 
                  placeholder={isEditing ? "Nueva contraseña (opcional)" : "Crea una contraseña"} 
                />
              </div>

              <div className="form-group">
                <label>Rol del Sistema</label>
                <select defaultValue={currentUser?.role}>
                  <option value="Administrador">Administrador</option>
                  <option value="Auxiliar">Auxiliar</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-save" 
                  onClick={(e) => { e.preventDefault(); setIsModalOpen(false); }}
                >
                  {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;