
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

type Props = {
  setIsAuth: (value: boolean) => void;
};

const Login = ({ setIsAuth }: Props) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // --- MODO DESARROLLO FRONTEND ---
    // Saltamos la validación para trabajar más rápido en el diseño
    setIsAuth(true);
    navigate("/dashboard");

    /* // Lógica para el futuro (Backend):
    if (email === "admin@test.com" && password === "123456") {
      setIsAuth(true);
      navigate("/dashboard");
    } else {
      setError("Correo o contraseña incorrectos");
    } 
    */
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