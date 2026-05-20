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
          <button 
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
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

      {/* MINI FEATURES */}
      <section className="mini-features">
        <div className="feature-item">✓ Registro Seguro</div>
        <div className="feature-item">✓ Reportes de Gastos</div>
        <div className="feature-item">✓ Control de Proveedores</div>
      </section>

    </div>
  );
};

export default Home;
