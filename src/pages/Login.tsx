import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Login.css";

// Definimos el tipo para que coincida con App.tsx
type UserRole = "admin" | "auxiliar";

type Props = {
  setIsAuth: (value: boolean) => void;
  setUserRole: (role: UserRole) => void; 
};

const Login = ({ setIsAuth, setUserRole }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Detectamos el rol desde la URL
  const queryParams = new URLSearchParams(location.search);
  const roleFromUrl = (queryParams.get("role") as UserRole) || "admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 2. MODO DESARROLLO: No validamos campos, solo aplicamos el rol y entramos
    setUserRole(roleFromUrl);
    setIsAuth(true);

    // 3. Redirección automática según el flujo que definimos
    if (roleFromUrl === "auxiliar") {
      navigate("/estudiantes");
    } else {
      navigate("/dashboard");
    }
  };

  const isAuxiliar = roleFromUrl === "auxiliar";

  return (
    <div className={`login-container ${isAuxiliar ? "theme-auxiliar" : ""}`}>
      <div className="login-box">
        <h2 className="login-title">
          {isAuxiliar ? "Portal Auxiliar" : "Portal Administrativo"}
        </h2>

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

          <button 
            type="submit" 
            className={`login-button ${isAuxiliar ? "btn-auxiliar" : ""}`}
          >
            Ingresar
          </button>
        </form>
        
        <button className="back-link" onClick={() => navigate("/home")}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default Login;