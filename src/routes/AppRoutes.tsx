import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";
import Estudiantes from "../pages/Estudiantes";
import SeleccionInstitucion from "../pages/SeleccionInstitucion";

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

            {/* Ambos roles */}
            <Route
              path="/estudiantes"
              element={
                institucion
                  ? <Estudiantes userRole={userRole!} />
                  : <Navigate to="/seleccionar-institucion" />
              }
            />
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