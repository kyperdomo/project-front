import React from "react";
import "../styles/EditProfileModal.css";

interface User {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Props {
  user: User;
  setUser: (user: User) => void;
  onClose: () => void;
}

const EditProfileModal: React.FC<Props> = ({ user, setUser, onClose }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Editar Perfil</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#95a5a6', marginLeft: '5px' }}>Nombre</label>
          <input name="name" value={user.name} onChange={handleChange} placeholder="Nombre" />
          
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#95a5a6', marginLeft: '5px' }}>Apellido</label>
          <input name="lastName" value={user.lastName} onChange={handleChange} placeholder="Apellido" />
          
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#95a5a6', marginLeft: '5px' }}>Correo</label>
          <input name="email" value={user.email} onChange={handleChange} placeholder="Correo" />
          
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#95a5a6', marginLeft: '5px' }}>Teléfono</label>
          <input name="phone" value={user.phone} onChange={handleChange} placeholder="Teléfono" />
        </div>

        <div className="modal-buttons">
          <button className="save-btn" onClick={onClose}>Guardar Cambios</button>
          <button className="cancel-btn" onClick={onClose}>Descartar</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;