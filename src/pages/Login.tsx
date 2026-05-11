// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/Login.css";

// type UserRole = "Administrador" | "Auxiliar";

// type Props = {
//   setIsAuth: (value: boolean) => void;
//   setUserRole: (role: UserRole) => void; 
// };

// const Login = ({ setIsAuth, setUserRole }: Props) => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const response = await fetch("http://localhost:8080/api/usuarios/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           email,
//           password
//         })
//       });

//       if (!response.ok) {
//         throw new Error("Credenciales incorrectas");
//       }

//       const data = await response.json();

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.role);

//       setIsAuth(true);
//       setUserRole(data.role);

//       if (data.role === "Auxiliar") {
//         navigate("/estudiantes");
//       } else {
//         navigate("/Usuarios");
//       }

//     } catch (error) {
//       setError("Correo o contraseña incorrectos");
//       console.error(error);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <h2 className="login-title">Iniciar Sesión</h2>

//         <p className="login-subtitle">Accede a tu cuenta</p>

//         {error && <p className="login-error">{error}</p>}

//         <form onSubmit={handleLogin}>
//           <input
//             type="email"
//             placeholder="Correo"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="login-input"
//           />

//           <input
//             type="password"
//             placeholder="Contraseña"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="login-input"
//           />

//           <button type="submit" className="login-button">
//             Ingresar
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;




import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

type UserRole = "Administrador" | "Auxiliar";

type Props = {
  setIsAuth: (value: boolean) => void;
  setUserRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
};

const Login = ({ setIsAuth, setUserRole, setUserName }: Props) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.nombre || data.username || data.email);
      localStorage.setItem("role", data.role);

      setIsAuth(true);
      setUserRole(data.role);
      setUserName(data.nombre || data.username || data.email);

      navigate("/seleccionar-institucion"); // siempre pasa por selección
       //if (data.role === "Auxiliar") {
         //navigate("/estudiantes");
       //} else {
         //navigate("/Usuarios");
       //}

    } catch (error) {
      setError("Correo o contraseña incorrectos");
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Iniciar Sesión</h2>

        <p className="login-subtitle">Accede a tu cuenta</p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />

          <button type="submit" className="login-button">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;