import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import key from '../assets/key.svg';
import card from '../assets/card.svg';
import back from '../assets/back.svg';
import logoutIcon from '../assets/logout.svg';
import exclude from '../assets/exclude.svg';
import "./ConfigPage.css";

import { emailResetPassword, EditUserName, excludeUser, logout } from '../services/authService'; 

const ConfigPage = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [email] = useState(user.email || "");
  const [name, setName] = useState(user.name || "");

  const [errorName, setErrorName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // validação simples: mínimo 2 palavras
  function validarNomeCompleto(nomeDigitado) {
    const partes = nomeDigitado.trim().split(" ");
    return partes.length >= 2;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorName("");
    setSuccess("");

    // validação antes da requisição
    if (!validarNomeCompleto(name)) {
      setErrorName("O nome deve ter pelo menos duas palavras, exemplo: 'Mozar Braga'.");
      return;
    }

    try {
      // usando o serviço EditUserName que você pediu
      const response = await EditUserName(name);

      if (!response) {
        throw new Error("Erro ao atualizar nome");
      }

      // O backend retorna UserUpdateResponse com email, name, updated_at
      // atualizar o user no localStorage
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      if (response.name) {
        updatedUser.name = response.name;
      }
      if (response.email) {
        updatedUser.email = response.email;
      }
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // setSuccess("Nome atualizado com sucesso!");
      alert("Nome atualizado com sucesso");

    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "Erro ao atualizar nome.";
      setErrorName(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleDelete = async () => {
    const password = window.prompt("Digite sua senha para confirmar a exclusão:");
    if (!password) return;

    const confirmDelete = window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é permanente!");
    if (!confirmDelete) return;

    try {
      await excludeUser(password);
      alert('Conta excluída com sucesso');
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      alert('Erro ao excluir conta. Verifique se a senha está correta.');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await emailResetPassword(email);
      alert("Se o e-mail existir, enviaremos instruções para redefinir sua senha.");
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar link para resetar senha");
    }
  };

  return (
    <div className="config-container">
      <div className="config-card">

        <h1 className="config-title">Configurações da Conta</h1>
        <p className="config-subtitle">Gerencie suas informações pessoais e configurações de segurança</p>

        <hr className="separator" />

        <h2 className="section-header">Informações Pessoais</h2>

        <div className="personal-info">

          {/* EMAIL */}
          <div className="field-block">
            <label className="config-label">E-mail</label>
            <input
              className="config-input disabled"
              value={email}
              disabled
            />
            <small className="email-note">O e-mail não pode ser alterado</small>
          </div>

          {/* NOME */}
          <div className="field-block">
            <label className="config-label">Nome Completo</label>
            <input
              className="config-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* ERRO - NOME INVÁLIDO */}
            {errorName && (
              <div className="alert alert-error">{errorName}</div>
            )}

          </div>

        </div>

        <button className="config-btn blue" onClick={handleUpdatePassword}>
          <img src={key} alt="ícone de chave" className="input-icon" />
          Atualizar Senha
        </button>

        <div className="btn-row">

          <button className="config-btn save" onClick={handleSave}>
            <img src={card} alt="ícone de card" className="input-icon" />
            Salvar Informações
          </button>

          <button className="config-btn return" onClick={() => navigate("/home")}>
            <img src={back} alt="ícone de back" className="input-icon" />
            Retornar
          </button>
        </div>

        <h2 className="section-header">Ações da Conta</h2>

        <div className="danger-card">
          <div>
            <h3>Sair da Conta</h3>
            <p>Fazer logout do sistema</p>
          </div>
          <button className="danger-btn logout" onClick={handleLogout}>Sair</button>
        </div>

        <div className="danger-card red">
          <div>
            <h3>Excluir Minha Conta</h3>
            <p>Esta ação é permanente e não pode ser desfeita</p>
          </div>
          <button className="danger-btn delete" onClick={handleDelete}>Excluir</button>
        </div>

      </div>
    </div>
  );
};

export default ConfigPage;
