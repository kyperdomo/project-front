import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      
      {/* NAVBAR */}
      <header className="home-navbar">
        <h2 className="logo">SolverControl S.A.S<span>.</span></h2>

        <div className="auth-buttons">
          {/* Botón sutil para el auxiliar */}
          <button 
            className="auxiliar-btn"
            onClick={() => navigate("/login?role=auxiliar")}
          >
            Acceso Auxiliar
          </button>
          
          {/* Botón con borde para el administrador */}
          <button 
            className="login-btn"
            onClick={() => navigate("/login?role=admin")}
          >
            Acceso Administrativo
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="badge">Solución Contable Educativa</div>
        <h1>Gestión de Facturación para Instituciones Educativas</h1>
        <p>
          Simplifica la contabilidad de tu colegio. Registra, organiza y audita 
          facturas de proveedores con precisión y transparencia total.
        </p>

        <div className="home-actions">
          <button className="secondary-cta">
            Saber más
          </button>
        </div>
      </section>

      {/* MINI FEATURES DECORATIVAS */}
      <section className="mini-features">
        <div className="feature-item">✓ Registro Seguro</div>
        <div className="feature-item">✓ Reportes de Gastos</div>
        <div className="feature-item">✓ Control de Proveedores</div>
      </section>

    </div>
  );
};

export default Home;