import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import logo from '../assets/div.svg'
import passwordLogo from '../assets/pass.svg';
import './RecoveryPage.css';

import { resetPassword } from '../services/authService'; 

const ResetPassPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");  
  const [firstPassword, setFirstPassword] = useState('');
  const [secondPassword, setSecondPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if(firstPassword !== secondPassword){
      setError('As senhas não coincidem');
      return;
    }

    try {
          const data = await resetPassword(token, firstPassword);
          alert("Senha redefinida com sucesso!");
          window.location.href = "/login";
    
        } catch (err) {
          console.error(err);
          setError('Erro ao gerar link para resetar senha');
        }



    console.log("senhas identicas")
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
          <p className="subtitle">Por segurança, você precisa repetir a senha nos dois campos.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="error">{error}</p>}
          
          {/* Campo da primeiraSenha */}
          <div className="form-group">
            <label className="form-label"></label>
            <div className="input-icon-container">
              <img src={passwordLogo} alt="ícone de senha" className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Digite sua nova senha"
                value={firstPassword}
                onChange={(e) => setFirstPassword(e.target.value)}
                required
                
              />
            </div>
          </div>

          {/* Campo da segundaSenha */}
          <div className="form-group">
            <label className="form-label"></label>
            <div className="input-icon-container">
              <img src={passwordLogo} alt="ícone de senha" className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Confirme sua senha"
                value={secondPassword}
                onChange={(e) => setSecondPassword(e.target.value)}
                required
              />
            </div>
          </div>          

          {/* Botão de Entrar */}
          <button type="submit" className="login-button">Alterar senha</button>
        </form>

        {/* Rodapé */}
        <footer className="footer">
          <p>&copy; 2025 CareerPath-AI. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default ResetPassPage;