import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";
import Estudiantes from "../pages/Estudiantes";
import SeleccionInstitucion from "../pages/SeleccionInstitucion";

<<<<<<< HEAD
=======
// Tipo de roles
>>>>>>> 29501e6e431d0031c98f3ad3cf38e78b2b00d775
type UserRole = "Administrador" | "Auxiliar";

type Props = {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
  userRole: UserRole | null;
  setUserRole: (role: UserRole) => void;
  institucion: string | null;
  setInstitucion: (inst: string) => void;
  userName: string;
  setUserName: (name: string) => void;
};

<<<<<<< HEAD
const AppRoutes = ({
  isAuth,
  setIsAuth,
  userRole,
  setUserRole,
  institucion,
  setInstitucion,
  userName,
  setUserName,
}: Props) => {
=======
const AppRoutes = ({ isAuth, setIsAuth, userRole, setUserRole }: Props) => {
>>>>>>> 29501e6e431d0031c98f3ad3cf38e78b2b00d775

  if (isAuth && !userRole) {
    return <div>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Rutas públicas */}
        <Route path="/home" element={<Home />} />
<<<<<<< HEAD
        <Route
          path="/login"
          element={
            <Login
              setIsAuth={setIsAuth}
              setUserRole={setUserRole}
              setUserName={setUserName}
            />
          }
        />

        {isAuth ? (
          <>
            {/* Selección de institución — disponible para ambos roles */}
            <Route
              path="/seleccionar-institucion"
              element={
                <SeleccionInstitucion
                  userName={userName}
                  userRole={userRole ?? "Auxiliar"}
                  setInstitucion={setInstitucion}
                />
              }
            />

            {/* Rutas protegidas — requieren institución seleccionada */}
=======
        
        {/* Login */}
        <Route 
          path="/login" 
          element={<Login setIsAuth={setIsAuth} setUserRole={setUserRole} />} 
        />

        {}
        {isAuth ? (
          <>
            {}
>>>>>>> 29501e6e431d0031c98f3ad3cf38e78b2b00d775
            {userRole === "Administrador" ? (
              <>
                <Route
                  path="/dashboard"
                  element={
                    institucion
                      ? <Dashboard userRole={userRole} />
                      : <Navigate to="/seleccionar-institucion" />
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    institucion
                      ? <Usuarios userRole={userRole} />
                      : <Navigate to="/seleccionar-institucion" />
                  }
                />
              </>
            ) : (
              <>
                {/*AUXILIAR NO PUEDE ENTRAR */}
                <Route path="/dashboard" element={<Navigate to="/estudiantes" />} />
                <Route path="/usuarios" element={<Navigate to="/estudiantes" />} />
              </>
            )}

<<<<<<< HEAD
            {/* Ambos roles */}
            <Route
              path="/estudiantes"
              element={
                institucion
                  ? <Estudiantes userRole={userRole!} />
                  : <Navigate to="/seleccionar-institucion" />
              }
            />
=======
            {/*AMBOS ROLES */}
            <Route path="/estudiantes" element={<Estudiantes userRole={userRole!} />} />
>>>>>>> 29501e6e431d0031c98f3ad3cf38e78b2b00d775
          </>
        ) : (
          <>
            {/* No autenticado → login */}
            <Route path="/dashboard" element={<Navigate to="/login" />} />
            <Route path="/usuarios" element={<Navigate to="/login" />} />
            <Route path="/estudiantes" element={<Navigate to="/login" />} />
            <Route path="/seleccionar-institucion" element={<Navigate to="/login" />} />
          </>
        )}

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;