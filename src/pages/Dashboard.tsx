import React, { useState } from "react";
import "../styles/Dashboard.css";
import UserCard from "../components/UserCard";
import EditProfileModal from "../components/EditProfileModal.tsx";

interface User {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User>({
    name: "Karen",
    lastName: "Perdomo",
    email: "karen@email.com",
    phone: "3001234567",
  });

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <button className="logout-btn">Cerrar sesión</button>
      </header>

      <main className="dashboard-content">
        <h1 className="profile-title">Mi Perfil</h1>

        <UserCard user={user} onEdit={() => setShowModal(true)} />

        <div className="actions-container">
          <button className="primary-btn">Ver Portafolio</button>
          <button className="secondary-btn">Nueva Orden</button>
        </div>
      </main>

      {showModal && (
        <EditProfileModal
          user={user}
          setUser={setUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;