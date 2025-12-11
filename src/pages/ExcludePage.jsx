import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/div.svg'
import passwordLogo from '../assets/pass.svg';
import './ExcludePage.css';

import { excludeUser } from '../services/authService'; 

const ExcludePage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(' ');
    try {
      const data = await excludeUser(password);
      alert("Conta excluida com sucesso.");
      window.location.href = "/login";

    } catch (err) {
      console.error(err);
      setError('Erro ao gerar link para resetar senha');
    }
  };

  

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Cabeçalho */}
        <div className="login-header">
          <div className='logo-box'>
            <img src={logo} alt="Logo"/>
          </div>
          <h1>Excluir Conta</h1>
          <p className="subtitle">Digite sua senha para excluir a conta, mas saiba que após a exclusão todos os dados serão excluidos.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo de E-mail */}
          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="input-icon-container">
              <img src={passwordLogo} alt="ícone de e-mail" className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botão de Entrar */}
          <button type="submit" className="login-button">Excluir conta</button>
        </form>

        {/* Rodapé */}
        <footer className="footer">
          <p>&copy; 2025 CareerPath-AI. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default ExcludePage;