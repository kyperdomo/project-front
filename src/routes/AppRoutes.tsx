import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";
import Estudiantes from "../pages/Estudiantes"; 

// Definimos el tipo de rol para que TypeScript no de errores
type UserRole = "admin" | "auxiliar";

type Props = {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
};

const AppRoutes = ({ isAuth, setIsAuth, userRole, setUserRole }: Props) => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/home" />} />
        
        {/* Rutas Públicas */}
        <Route path="/home" element={<Home />} />
        
        {/* Pasamos setIsAuth y setUserRole al Login para que guarde quién entró */}
        <Route 
          path="/login" 
          element={<Login setIsAuth={setIsAuth} setUserRole={setUserRole} />} 
        />

        {/* Manejo de Rutas Protegidas */}
        {isAuth ? (
          <>
            {/* Rutas exclusivas para ADMIN */}
            {userRole === "admin" ? (
              <>
                <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
                <Route path="/usuarios" element={<Usuarios userRole={userRole} />} />
              </>
            ) : (
              /* Si el AUXILIAR intenta entrar a rutas de admin, lo mandamos a estudiantes */
              <>
                <Route path="/dashboard" element={<Navigate to="/estudiantes" />} />
                <Route path="/usuarios" element={<Navigate to="/estudiantes" />} />
              </>
            )}

            {/* Rutas accesibles para AMBOS (Admin y Auxiliar) */}
            <Route path="/estudiantes" element={<Estudiantes userRole={userRole} />} />
            {/* Agrega aquí Facturación, Pagos, etc., cuando los tengas */}
          </>
        ) : (
          /* Redirigir al login si no hay sesión iniciada */
          <>
            <Route path="/dashboard" element={<Navigate to="/login" />} />
            <Route path="/usuarios" element={<Navigate to="/login" />} />
            <Route path="/estudiantes" element={<Navigate to="/login" />} />
          </>
        )}

        {/* Catch-all: si la ruta no existe, al Home */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;