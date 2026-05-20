// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Home from "../pages/Home";
// import Login from "../pages/Login";
// import Dashboard from "../pages/Dashboard";
// import Usuarios from "../pages/Usuarios";
// import Estudiantes from "../pages/Estudiantes"; 

// // Definimos el tipo de rol para que TypeScript no de errores
// type UserRole = "admin" | "auxiliar";

// type Props = {
//   isAuth: boolean;
//   setIsAuth: (value: boolean) => void;
//   userRole: UserRole;
//   setUserRole: (role: UserRole) => void;
// };

// const AppRoutes = ({ isAuth, setIsAuth, userRole, setUserRole }: Props) => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Redirección inicial */}
//         <Route path="/" element={<Navigate to="/home" />} />
        
//         {/* Rutas Públicas */}
//         <Route path="/home" element={<Home />} />
        
//         {/* Pasamos setIsAuth y setUserRole al Login para que guarde quién entró */}
//         <Route 
//           path="/login" 
//           element={<Login setIsAuth={setIsAuth} setUserRole={setUserRole} />} 
//         />

//         {/* Manejo de Rutas Protegidas */}
//         {isAuth ? (
//           <>
//             {/* Rutas exclusivas para ADMIN */}
//             {userRole === "admin" ? (
//               <>
//                 <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
//                 <Route path="/usuarios" element={<Usuarios userRole={userRole} />} />
//               </>
//             ) : (
//               /* Si el AUXILIAR intenta entrar a rutas de admin, lo mandamos a estudiantes */
//               <>
//                 <Route path="/dashboard" element={<Navigate to="/estudiantes" />} />
//                 <Route path="/usuarios" element={<Navigate to="/estudiantes" />} />
//               </>
//             )}

//             {/* Rutas accesibles para AMBOS (Admin y Auxiliar) */}
//             <Route path="/estudiantes" element={<Estudiantes userRole={userRole} />} />
//             {/* Agrega aquí Facturación, Pagos, etc., cuando los tengas */}
//           </>
//         ) : (
//           /* Redirigir al login si no hay sesión iniciada */
//           <>
//             <Route path="/dashboard" element={<Navigate to="/login" />} />
//             <Route path="/usuarios" element={<Navigate to="/login" />} />
//             <Route path="/estudiantes" element={<Navigate to="/login" />} />
//           </>
//         )}

//         {/* Catch-all: si la ruta no existe, al Home */}
//         <Route path="*" element={<Navigate to="/home" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default AppRoutes;


// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Home from "../pages/Home";
// import Login from "../pages/Login";
// import Dashboard from "../pages/Dashboard";
// import Usuarios from "../pages/Usuarios";
// import Estudiantes from "../pages/Estudiantes";
// import SeleccionInstitucion from "../pages/SeleccionInstitucion";

// type UserRole = "Administrador" | "Auxiliar";

// type Props = {
//   isAuth: boolean;
//   setIsAuth: (value: boolean) => void;
//   userRole: UserRole | null;
//   setUserRole: (role: UserRole) => void;
//   institucion: string | null;
//   setInstitucion: (inst: string) => void;
//   userName: string;
//   setUserName: (name: string) => void;
// };

// const AppRoutes = ({
//   isAuth,
//   setIsAuth,
//   userRole,
//   setUserRole,
//   institucion,
//   setInstitucion,
//   userName,
//   setUserName,
// }: Props) => {

//   if (isAuth && !userRole) {
//     return <div>Cargando...</div>;
//   }

//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Redirección inicial */}
//         <Route path="/" element={<Navigate to="/home" />} />

//         {/* Rutas públicas */}
//         <Route path="/home" element={<Home />} />
//         <Route
//           path="/login"
//           element={
//             <Login
//               setIsAuth={setIsAuth}
//               setUserRole={setUserRole}
//               setUserName={setUserName}
//             />
//           }
//         />

//         {isAuth ? (
//           <>
//             {/* Selección de institución — disponible para ambos roles */}
//             <Route
//               path="/seleccionar-institucion"
//               element={
//                 <SeleccionInstitucion
//                   userName={userName}
//                   userRole={userRole ?? "Auxiliar"}
//                   setInstitucion={setInstitucion}
//                 />
//               }
//             />

//             {/* Rutas protegidas — requieren institución seleccionada */}
//             {userRole === "Administrador" ? (
//               <>
//                 <Route
//                   path="/dashboard"
//                   element={
//                     institucion
//                       ? <Dashboard userRole={userRole} />
//                       : <Navigate to="/seleccionar-institucion" />
//                   }
//                 />
//                 <Route
//                   path="/usuarios"
//                   element={
//                     institucion
//                       ? <Usuarios userRole={userRole} />
//                       : <Navigate to="/seleccionar-institucion" />
//                   }
//                 />
//               </>
//             ) : (
//               <>
//                 {/*AUXILIAR NO PUEDE ENTRAR */}
//                 <Route path="/dashboard" element={<Navigate to="/estudiantes" />} />
//                 <Route path="/usuarios" element={<Navigate to="/estudiantes" />} />
//               </>
//             )}

//             {/* Ambos roles */}
//             <Route
//               path="/estudiantes"
//               element={
//                 institucion
//                   ? <Estudiantes userRole={userRole!} />
//                   : <Navigate to="/seleccionar-institucion" />
//               }
//             />
//           </>
//         ) : (
//           <>
//             {/* No autenticado → login */}
//             <Route path="/dashboard" element={<Navigate to="/login" />} />
//             <Route path="/usuarios" element={<Navigate to="/login" />} />
//             <Route path="/estudiantes" element={<Navigate to="/login" />} />
//             <Route path="/seleccionar-institucion" element={<Navigate to="/login" />} />
//           </>
//         )}

//         {/* Ruta no encontrada */}
//         <Route path="*" element={<Navigate to="/home" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default AppRoutes;




import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";
import Estudiantes from "../pages/Estudiantes";
import Reportes from "../pages/Reportes";
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
            <Route
              path="/reportes"
              element={
                institucion
                  ? <Reportes userRole={userRole!} />
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