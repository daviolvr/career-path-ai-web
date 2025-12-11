import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { getResumeAnalysisById } from '../services/authService';
import './ResumeAnalysisPage.css';

const ResumeAnalysisPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Usuário"}');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) {
        setError('ID da análise não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getResumeAnalysisById(id);
        
        // Transformar dados da API em formato para exibição
        const analysisResult = data.analysis_result || {};
        const suggestions = (analysisResult.career_recommendations || []).map((rec, index) => ({
          title: rec || `Recomendação ${index + 1}`,
          description: rec || ''
        }));

        setAnalysis({
          id: data.id,
          fileName: data.original_filename || 'Currículo.pdf',
          analysisDate: new Date(data.created_at).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          suggestions: suggestions.length > 0 ? suggestions : [
            {
              title: 'Análise concluída',
              description: analysisResult.market_insights || 'Nenhuma recomendação específica disponível.'
            }
          ]
        });
      } catch (err) {
        console.error('Erro ao buscar análise:', err);
        setError('Erro ao carregar análise de currículo');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleBack = () => {
    navigate('/historico-curriculos');
  };

  const handleNewGuide = () => {
    navigate('/interview-guide');
  };

  if (loading) {
    return (
      <div className="analysis-container">
        <Header user={user} onLogout={handleLogout} />
        <main className="analysis-main">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Carregando análise...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="analysis-container">
        <Header user={user} onLogout={handleLogout} />
        <main className="analysis-main">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'red' }}>{error || 'Análise não encontrada'}</p>
            <button onClick={handleBack} style={{ marginTop: '20px' }}>
              Voltar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      <Header user={user} onLogout={handleLogout} />

      <main className="analysis-main">
        <div className="analysis-title-container">
          <h1 className="analysis-title">Análise de Currículo</h1>
          <div className="analysis-subtitle">
            <h2 className="analysis-file-name">
              {analysis.fileName}
            </h2>
            <span className="analysis-date">
              Analisado em {analysis.analysisDate}
            </span>
          </div>
        </div>

        <div className="analysis-grid">
          <section className="analysis-box">
            <div className="analysis-box-header">
              <h2>Sugestões de Melhoria</h2>
              <span className="analysis-count">
                {analysis.suggestions.length} recomendações
              </span>
            </div>

            <div className="suggestions-list">
              {analysis.suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                >
                  <h3 className="suggestion-title">
                    {index + 1}. {suggestion.title}
                  </h3>
                  <p className="suggestion-description">
                    {suggestion.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="analysis-action-buttons">
          <button 
            onClick={handleBack}
            className="analysis-back-btn"
          >
            Retornar
          </button>
          <button 
            onClick={handleNewGuide}
            className="analysis-new-guide-btn"
          >
            Iniciar Novo Guia
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResumeAnalysisPage;