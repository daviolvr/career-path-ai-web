import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleHistoricoCurriculos = () => {
    navigate("/historico-curriculos");
    setIsDropdownOpen(false);
  };

  const handleHistoricoTrilhas = () => {
    navigate("/historico-trilhas");
    setIsDropdownOpen(false);
  };

  const handleHistoricoGuias = () => {
    navigate("/historico-guias");
    setIsDropdownOpen(false);
  };

  const handleConfiguracoes = () => {
    // Navegar para configurações
    navigate("/config");
    setIsDropdownOpen(false);
  };

  return (
    <div className="user-profile-container" style={{ position: 'relative' }}>
      <div className="user-profile" onClick={toggleDropdown}>
        <span className="user-name">{user?.name || 'Usuário'}</span>
        <div className="user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="dropdown-arrow">▼</span>
      </div>

      {isDropdownOpen && (
        <div className="dropdown-menu" style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: '220px',
          zIndex: 1000,
          marginTop: '8px'
        }}>
          <div className="dropdown-header" style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: '600',
            color: '#333',
            fontSize: '14px'
          }}>
            {user?.email || 'user@example.com'}
          </div>
          
          <button 
            onClick={handleHistoricoCurriculos}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
              borderBottom: '1px solid #f3f4f6'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            Histórico de Análise de Currículos
          </button>

          <button 
            onClick={handleHistoricoTrilhas}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
              borderBottom: '1px solid #f3f4f6'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            Histórico de Trilhas de Estudo
          </button>

          <button 
            onClick={handleHistoricoGuias}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
              borderBottom: '1px solid #f3f4f6'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            Histórico de Guias de Entrevista
          </button>

          <button 
            onClick={handleConfiguracoes}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
              borderBottom: '1px solid #f3f4f6'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            Configurações
          </button>

          <button 
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#dc2626'
            }}
            onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            🚪 Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;