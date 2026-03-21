import React from "react";

interface User {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Props {
  user: User;
  onEdit: () => void;
}

const UserCard: React.FC<Props> = ({ user, onEdit }) => {
  return (
    <div className="profile-card-glass">
      <div className="avatar-circle">
        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
      </div>

      <div className="user-details">
        {/* Solo mostramos Nombre y Apellido como título */}
        <h2 className="user-name">
          {user.name} {user.lastName}
        </h2>

        {/* Solo el email como info secundaria */}
        <p className="user-email">{user.email}</p>

        <button onClick={onEdit} className="edit-link-green">
          Editar perfil
        </button>
      </div>
    </div>
  );
};

export default UserCard;