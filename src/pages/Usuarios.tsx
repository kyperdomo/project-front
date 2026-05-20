// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../styles/Dashboard.css";
// import "../styles/Usuarios.css";

// type Props = {
//   userRole: "Administrador" | "Auxiliar";
// };

// const Usuarios: React.FC<Props> = ({ userRole }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [users, setUsers] = useState<any[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentUser, setCurrentUser] = useState<any>(null);

//   const [success, setSuccess] = useState("");
//   const [error, setError] = useState("");

//   const token = localStorage.getItem("token");

//   const totalAdmins = users.filter(u => u.role === "Administrador").length;
//   const totalAuxiliares = users.filter(u => u.role === "Auxiliar").length;


//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await fetch('http://localhost:8080/api/usuarios/get', {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });

//         const data = await response.json();
//         setUsers(data);
//       } catch (error) {
//         console.error("Error cargando usuarios:", error);
//       }
//     };

//     fetchUsers();
//   }, [token]);

//   // 🔐 PROTECCIÓN POR ROL
//   useEffect(() => {
//     if (userRole !== "Administrador") {
//       navigate("/estudiantes");
//     }
//   }, [userRole, navigate]);

//   // 🔥 TOGGLE ESTADO (USA TU ENDPOINT)
//   const handleToggleEstado = async (id: number) => {
//     try {
//       const response = await fetch(`http://localhost:8080/api/usuarios/estado/${id}`, {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       if (!response.ok) throw new Error();

//       const updatedUser = await response.json();

//       setUsers(users.map(u => u.id === id ? updatedUser : u));

//     } catch (error) {
//       console.error("Error cambiando estado:", error);
//     }
//   };

//   const handleCreateClick = () => {
//     setIsEditing(false);
//     setCurrentUser({
//       id: "",
//       name: "",
//       email: "",
//       password: "",
//       role: "Auxiliar"
//     });
//     setIsModalOpen(true);
//   };

//   const handleEditClick = (user: any) => {
//     setIsEditing(true);
//     setCurrentUser(user);
//     setIsModalOpen(true);
//   };

//   const handleDeleteUser = async (id: number) => {
//     if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

//     try {
//       const response = await fetch(`http://localhost:8080/api/usuarios/delete/${id}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       const message = await response.text();

//       if (!response.ok) throw new Error(message);

//       setUsers(users.filter(user => user.id !== id));
//       alert(message);

//     } catch (error) {
//       console.error("Error eliminando usuario:", error);
//       alert("No se pudo eliminar el usuario");
//     }
//   };

//   const handleSaveUser = async () => {
//     setError("");
//     setSuccess("");

//     try {
//       const url = isEditing
//         ? `http://localhost:8080/api/usuarios/update/${currentUser.id}`
//         : `http://localhost:8080/api/usuarios/create`;

//       const method = isEditing ? "PUT" : "POST";

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(currentUser)
//       });

//       if (!response.ok) throw new Error();

//       const updatedUser = await response.json();

//       if (isEditing) {
//         setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
//         setSuccess("Usuario actualizado correctamente");
//       } else {
//         setUsers([...users, updatedUser]);
//         setSuccess("Usuario creado correctamente");
//       }

//       setTimeout(() => {
//         setSuccess("");
//         setIsModalOpen(false);
//       }, 1500);

//     } catch (error) {
//       console.error("Error guardando usuario:", error);
//       setError("No se pudo guardar el usuario");
//     }
//   };

//   return (
//     <div className="dashboard-layout">
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
//           <h1>Usuarios</h1>
//           <p>Gestión de usuarios y roles del sistema</p>
//         </header>

//         <section className="stats-grid">
//           <div className="stat-card">
//             <span className="label">Total Usuarios</span>
//             <h2 className="value">{users.length}</h2>
//           </div>

//           <div className="stat-card">
//             <span className="label">Administradores</span>
//             <h2 className="value admin-text">{totalAdmins}</h2>
//           </div>

//           <div className="stat-card">
//             <span className="label">Auxiliares</span>
//             <h2 className="value auxiliar-text">{totalAuxiliares}</h2>
//           </div>
//         </section>

//         <div className="table-actions-bar">
//           <input type="text" placeholder="🔍 Buscar..." className="search-input" />

//           {userRole === "Administrador" && (
//             <button className="btn-add-user" onClick={handleCreateClick}>
//               + Nuevo Usuario
//             </button>
//           )}
//         </div>

//         <section className="table-container">
//           <table className="custom-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>USUARIO</th>
//                 <th>EMAIL</th>
//                 <th>ROL</th>
//                 <th>ESTADO</th>
//                 <th>ACCIONES</th>
//               </tr>
//             </thead>

//             <tbody>
//               {users.map(user => (
//                 <tr key={user.id}>
//                   <td>#{user.id}</td>

//                   <td>
//                     <div className="user-info-cell">
//                       <div className="avatar-circle">
//                         {user.name?.substring(0, 2).toUpperCase()}
//                       </div>
//                       {user.name}
//                     </div>
//                   </td>

//                   <td>{user.email}</td>

//                   <td>
//                     <span className="role-tag">{user.role}</span>
//                   </td>

//                   {/* 🔥 ESTADO CON TOGGLE */}
//                   <td>
//                     <span
//                       className={user.activo ? "status-badge-active" : "status-badge-inactive"}
//                       onClick={() => handleToggleEstado(user.id)}
//                       style={{ cursor: "pointer" }}
//                       title="Cambiar estado"
//                     >
//                       {user.activo ? "Activo" : "Inactivo"}
//                     </span>
//                   </td>

//                   <td className="actions-icons">
//                     <span onClick={() => handleEditClick(user)}>📝</span>
//                     <span onClick={() => handleDeleteUser(user.id)}>🗑️</span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </section>
//       </main>

//       {isModalOpen && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <h2>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>

//             {error && <p className="login-error">{error}</p>}
//             {success && <p className="login-success">{success}</p>}

//             <form className="edit-form">

//               <div className="form-group">
//                 <label>Nombre Completo</label>
//                 <input
//                   type="text"
//                   value={currentUser?.name || ""}
//                   onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Correo Electrónico</label>
//                 <input
//                   type="email"
//                   value={currentUser?.email || ""}
//                   onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Contraseña</label>
//                 <input
//                   type="password"
//                   onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
//                   placeholder={isEditing ? "Nueva contraseña (opcional)" : "Crea una contraseña"}
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Rol del Sistema</label>
//                 <select
//                   value={currentUser?.role}
//                   onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
//                 >
//                   <option value="Administrador">Administrador</option>
//                   <option value="Auxiliar">Auxiliar</option>
//                 </select>
//               </div>

//               <div className="modal-actions">
//                 <button
//                   type="button"
//                   className="btn-cancel"
//                   onClick={() => setIsModalOpen(false)}
//                 >
//                   Cancelar
//                 </button>

//                 <button
//                   type="submit"
//                   className="btn-save"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     handleSaveUser();
//                   }}
//                 >
//                   {isEditing ? "Actualizar" : "Crear"}
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Usuarios;



import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/Usuarios.css";

type Props = {
  userRole: "Administrador" | "Auxiliar";
};

const Usuarios: React.FC<Props> = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const totalAdmins = users.filter(u => u.role === "Administrador").length;
  const totalAuxiliares = users.filter(u => u.role === "Auxiliar").length;


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/usuarios/get', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    fetchUsers();
  }, [token]);

  // 🔐 PROTECCIÓN POR ROL
  useEffect(() => {
    if (userRole !== "Administrador") {
      navigate("/estudiantes");
    }
  }, [userRole, navigate]);

  // 🔥 TOGGLE ESTADO (USA TU ENDPOINT)
  const handleToggleEstado = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/estado/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error();

      const updatedUser = await response.json();

      setUsers(users.map(u => u.id === id ? updatedUser : u));

    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

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

  const handleEditClick = (user: any) => {
    setIsEditing(true);
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const message = await response.text();

      if (!response.ok) throw new Error(message);

      setUsers(users.filter(user => user.id !== id));
      alert(message);

    } catch (error) {
      console.error("Error eliminando usuario:", error);
      alert("No se pudo eliminar el usuario");
    }
  };

  const handleSaveUser = async () => {
    setError("");
    setSuccess("");

    try {
      const url = isEditing
        ? `http://localhost:8080/api/usuarios/update/${currentUser.id}`
        : `http://localhost:8080/api/usuarios/create`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(currentUser)
      });

      if (!response.ok) throw new Error();

      const updatedUser = await response.json();

      if (isEditing) {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setSuccess("Usuario actualizado correctamente");
      } else {
        setUsers([...users, updatedUser]);
        setSuccess("Usuario creado correctamente");
      }

      setTimeout(() => {
        setSuccess("");
        setIsModalOpen(false);
      }, 1500);

    } catch (error) {
      console.error("Error guardando usuario:", error);
      setError("No se pudo guardar el usuario");
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sistema Educativo</h2>
          <span>Gestión Administrativa</span>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate("/dashboard")}>📊 Dashboard</div>
          <div className={`nav-item ${location.pathname === '/estudiantes' ? 'active' : ''}`} onClick={() => navigate("/estudiantes")}>🎓 Estudiantes</div>
          <div className="nav-item">📄 Facturación</div>
          <div className="nav-item">💳 Pagos</div>
          <div className={`nav-item ${location.pathname === "/reportes" ? "active" : ""}`} onClick={() => navigate("/reportes")}>📈 Reportes</div>
          <div className={`nav-item ${location.pathname === '/usuarios' ? 'active' : ''}`} onClick={() => navigate("/usuarios")}>👥 Usuarios</div>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={() => navigate("/home")}>🚪 Cerrar Sesión</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>Usuarios</h1>
          <p>Gestión de usuarios y roles del sistema</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="label">Total Usuarios</span>
            <h2 className="value">{users.length}</h2>
          </div>

          <div className="stat-card">
            <span className="label">Administradores</span>
            <h2 className="value admin-text">{totalAdmins}</h2>
          </div>

          <div className="stat-card">
            <span className="label">Auxiliares</span>
            <h2 className="value auxiliar-text">{totalAuxiliares}</h2>
          </div>
        </section>

        <div className="table-actions-bar">
          <input type="text" placeholder="🔍 Buscar..." className="search-input" />

          {userRole === "Administrador" && (
            <button className="btn-add-user" onClick={handleCreateClick}>
              + Nuevo Usuario
            </button>
          )}
        </div>

        <section className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>USUARIO</th>
                <th>EMAIL</th>
                <th>ROL</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>

            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>#{user.id}</td>

                  <td>
                    <div className="user-info-cell">
                      <div className="avatar-circle">
                        {user.name?.substring(0, 2).toUpperCase()}
                      </div>
                      {user.name}
                    </div>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span className="role-tag">{user.role}</span>
                  </td>

                  {/* 🔥 ESTADO CON TOGGLE */}
                  <td>
                    <span
                      className={user.activo ? "status-badge-active" : "status-badge-inactive"}
                      onClick={() => handleToggleEstado(user.id)}
                      style={{ cursor: "pointer" }}
                      title="Cambiar estado"
                    >
                      {user.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="actions-icons">
                    <span onClick={() => handleEditClick(user)}>📝</span>
                    <span onClick={() => handleDeleteUser(user.id)}>🗑️</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>

            {error && <p className="login-error">{error}</p>}
            {success && <p className="login-success">{success}</p>}

            <form className="edit-form">

              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  value={currentUser?.name || ""}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  placeholder={isEditing ? "Nueva contraseña (opcional)" : "Crea una contraseña"}
                />
              </div>

              <div className="form-group">
                <label>Rol del Sistema</label>
                <select
                  value={currentUser?.role}
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                >
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveUser();
                  }}
                >
                  {isEditing ? "Actualizar" : "Crear"}
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