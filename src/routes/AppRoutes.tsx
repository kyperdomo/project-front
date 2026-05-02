import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";
import Estudiantes from "../pages/Estudiantes"; 

// Tipo de roles
type UserRole = "Administrador" | "Auxiliar";

type Props = {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
  userRole: UserRole | null;
  setUserRole: (role: UserRole) => void;
};

const AppRoutes = ({ isAuth, setIsAuth, userRole, setUserRole }: Props) => {

  if (isAuth && !userRole) {
    return <div>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/home" />} />
        
        {/* Rutas Públicas */}
        <Route path="/home" element={<Home />} />
        
        {/* Login */}
        <Route 
          path="/login" 
          element={<Login setIsAuth={setIsAuth} setUserRole={setUserRole} />} 
        />

        {}
        {isAuth ? (
          <>
            {}
            {userRole === "Administrador" ? (
              <>
                <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
                <Route path="/usuarios" element={<Usuarios userRole={userRole} />} />
              </>
            ) : (
              <>
                {/*AUXILIAR NO PUEDE ENTRAR */}
                <Route path="/dashboard" element={<Navigate to="/estudiantes" />} />
                <Route path="/usuarios" element={<Navigate to="/estudiantes" />} />
              </>
            )}

            {/*AMBOS ROLES */}
            <Route path="/estudiantes" element={<Estudiantes userRole={userRole!} />} />
          </>
        ) : (
          <>
            {/* No autenticado → login */}
            <Route path="/dashboard" element={<Navigate to="/login" />} />
            <Route path="/usuarios" element={<Navigate to="/login" />} />
            <Route path="/estudiantes" element={<Navigate to="/login" />} />
          </>
        )}

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;