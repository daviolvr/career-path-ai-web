import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/div.svg'
import emailLogo from '../assets/Vector.svg'
import './RecoveryPage.css';

import { emailResetPassword } from '../services/authService'; 

const RecoveryPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(' ');
    try {
      const data = await emailResetPassword(email);
      alert("Se o e-mail existir, enviaremos instruções para redefinir sua senha.");

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
          <h1>Recuperar senha</h1>
          <p className="subtitle">Insira seu e-mail cadastrado e enviaremos um link para redefinir sua senha.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo de E-mail */}
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div className="input-icon-container">
              <img src={emailLogo} alt="ícone de e-mail" className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botão de Entrar */}
          <button type="submit" className="login-button">Recuperar Senha</button>
        </form>

        {/* Link de Cadastro */}
        <div className="signup-section">
          <p className="signup-text">Ainda não tem uma conta?</p>
          <button type="button" className="signup-button" onClick={() => navigate("/register")}>Cadastre-se</button>
        </div>

        {/* Rodapé */}
        <footer className="footer">
          <p>&copy; 2025 CareerPath-AI. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default RecoveryPage;