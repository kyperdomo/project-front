import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";

type Props = {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
};

const AppRoutes = ({ isAuth, setIsAuth }: Props) => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Al entrar a la raíz, redirige siempre al Home */}
        <Route path="/" element={<Navigate to="/home" />} />
        
        {/* Rutas Públicas */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />

        {/* Manejo de Rutas Protegidas */}
        {isAuth ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </>
        ) : (
          /* El error estaba aquí: faltaba el Fragment <> </> */
          <>
            <Route path="/dashboard" element={<Navigate to="/login" />} />
            <Route path="/usuarios" element={<Navigate to="/login" />} />
          </>
        )}

        {/* Si escriben cualquier otra cosa, vuelven al home */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;