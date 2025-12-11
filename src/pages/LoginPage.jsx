import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/div.svg';
import emailLogo from '../assets/Vector.svg';
import passwordLogo from '../assets/pass.svg';
import { loginUser } from '../services/authService'; 
// import './LoginPage.css';





const LoginPage = ({ onForgotPassword }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginUser(email, password);
      const user = response.data;
      const tokens = response.tokens;

      // guarda os tokens corretamente
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // salva o user como JSON
      localStorage.setItem('user', JSON.stringify(user));

      // alert('Login realizado com sucesso!');
      window.location.href = '/home';

    } catch (err) {
      console.error(err);
      setError('Email ou senha incorretos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className='logo-box'>
            <img src={logo} alt="Logo" />
          </div>
          <h1>Bem-vindo ao CareerPath-AI</h1>
          <p className="subtitle">Análise inteligente de currículos com IA</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error">{error}</p>}

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

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="input-icon-container">
              <img src={passwordLogo} alt="ícone de senha" className="input-icon" />
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

          <div className="remember-password">
            <button type="button" onClick={() => navigate("/recovery")} className="signup-button">
              Esqueceu sua senha?
            </button>
          </div>

          <button type="submit" className="login-button">Entrar</button>
        </form>

        <div className="signup-section">
          <p className="signup-text">Ainda não tem uma conta?</p>
          <button type="button" className="signup-button" onClick={() => navigate("/register")}>Cadastre-se</button>
        </div>

        <footer className="footer">
          <p>&copy; 2025 CareerPath-AI. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
