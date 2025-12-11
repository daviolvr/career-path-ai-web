import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'; // Importando o Header component
import './InterviewGuidePage.css';
import { analyzeInterviewGuide } from '../services/authService';


const InterviewGuidePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Recuperar usuário do localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Mario Silva"}');

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Por favor, envie apenas arquivos PDF.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('O arquivo excede o tamanho máximo de 10MB.');
      return false;
    }
    setError('');
    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo PDF.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Por favor, insira a descrição da vaga.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const result = await analyzeInterviewGuide(jobDescription, selectedFile);
      console.log('Guia de entrevista gerado com sucesso:', result);

      // Redireciona para a página de resultado com o ID
      navigate(`/interview-guide-result/${result.id}`);

    } catch (err) {
      console.error(err);
      // Usa a mensagem de erro específica do backend se disponível
      const errorMessage = err.message || 'Erro ao gerar o guia de entrevista. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="interview-guide-container">
      {/* Header component */}
      <Header user={user} onLogout={handleLogout} />

      <main className="interview-guide-main">
        <div className="interview-guide-card">
          <div className="interview-guide-header">
            <h1 className="interview-guide-title">Criar Guia de Entrevista</h1>
            <p className="interview-guide-subtitle">
              Envie seu currículo e a descrição da vaga para gerar um guia personalizado
            </p>
          </div>

          <form onSubmit={handleSubmit} className="interview-guide-form">
            {error && <p className="error">{error}</p>}

            <div className="form-section">
              <h3 className="section-title">Envie seu currículo em PDF</h3>
              <div
                className={`upload-area ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  className="file-input"
                  style={{ display: 'none' }}
                />
                
                {selectedFile ? (
                  <div className="file-selected">
                    <div className="file-icon">📄</div>
                    <div className="file-info">
                      <p className="file-name">{selectedFile.name}</p>
                      <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">☁️</div>
                    <p className="upload-text">Arraste e solte seu arquivo PDF aqui</p>
                    <p className="upload-instructions">ou clique para selecionar um arquivo</p>
                    <p className="upload-limit">Somente arquivos .pdf serão aceitos</p>
                  </>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Coloque a descrição da vaga</h3>
              <div className="job-description-container">
                <textarea
                  className="job-description-input"
                  placeholder="Cole aqui a descrição completa da vaga, incluindo requisitos, responsabilidades, diferenciais e qualquer coisa que achar importante sobre a vaga."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                />
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                className="back-button"
                onClick={handleBack}
              >
                Retornar
              </button>
              <button
                type="submit"
                className="generate-button"
                disabled={!selectedFile || !jobDescription.trim() || isGenerating}
              >
                {isGenerating ? 'Gerando...' : 'Gerar Guia de Entrevista'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default InterviewGuidePage;