import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import logo from '../assets/div.svg';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleGoToHome = () => {
    navigate('/home');
  };

  return (
    <header className="upload-header">
      <div 
        className="header-left" 
        onClick={handleGoToHome} 
        style={{ cursor: 'pointer' }}
      >
        <div className="logo-box-header">
          <img src={logo} alt="Logo" />
        </div>
        <span className="app-name">CareerPathAI</span>
      </div>

      <nav className="header-nav">
        <UserProfile user={user} onLogout={onLogout} />
      </nav>
    </header>
  );
};

export default Header;