import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { getInterviewGuideById } from '../services/authService';
import './InterviewGuideResultPage.css';

const InterviewGuideResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Mario Silva"}');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id) {
        setError('ID do guia não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getInterviewGuideById(id);
        setGuide(data);
      } catch (err) {
        console.error('Erro ao buscar guia:', err);
        setError('Erro ao carregar guia de entrevista');
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleNewGuide = () => {
    navigate('/interview-guide');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  // Extrair sugestões do guia
  const extractSuggestions = (guideData) => {
    if (!guideData?.interview_guide) return [];
    
    const suggestions = [];
    const ig = guideData.interview_guide;
    
    // Preparação técnica
    if (ig.technical_preparation) {
      if (ig.technical_preparation.programming_languages) {
        ig.technical_preparation.programming_languages.forEach(lang => {
          if (lang.topic) {
            suggestions.push({
              title: `Revise suas habilidades técnicas em ${lang.topic}`,
              description: lang.focus_points?.join(', ') || lang.expected_level || ''
            });
          }
        });
      }
      
      if (ig.technical_preparation.frameworks_tools) {
        ig.technical_preparation.frameworks_tools.forEach(tool => {
          if (tool.topic) {
            suggestions.push({
              title: `Estude conceitos de ${tool.topic}`,
              description: tool.key_concepts?.join(', ') || tool.practical_examples?.join(', ') || ''
            });
          }
        });
      }
    }
    
    // Preparação comportamental
    if (ig.behavioral_preparation?.common_questions) {
      ig.behavioral_preparation.common_questions.forEach(q => {
        if (q.question) {
          suggestions.push({
            title: `Prepare exemplos para: ${q.question}`,
            description: q.preparation_tips || q.resume_connection || ''
          });
        }
      });
    }
    
    // Preparação específica da empresa
    if (ig.company_specific_preparation) {
      if (ig.company_specific_preparation.research_topics?.length > 0) {
        suggestions.push({
          title: 'Pesquise sobre a cultura da empresa',
          description: ig.company_specific_preparation.research_topics.join(', ')
        });
      }
      
      if (ig.company_specific_preparation.questions_to_ask?.length > 0) {
        suggestions.push({
          title: 'Prepare perguntas inteligentes sobre a posição',
          description: ig.company_specific_preparation.questions_to_ask.join(', ')
        });
      }
    }
    
    return suggestions.length > 0 ? suggestions : [{
      title: 'Preparação para entrevista',
      description: ig.preparation_overview || 'Revise seu currículo e prepare-se para a entrevista.'
    }];
  };

  if (loading) {
    return (
      <div className="interview-result-container">
        <Header user={user} onLogout={handleLogout} />
        <main className="interview-result-main">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Carregando guia de entrevista...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="interview-result-container">
        <Header user={user} onLogout={handleLogout} />
        <main className="interview-result-main">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'red' }}>{error || 'Guia não encontrado'}</p>
            <button onClick={handleBackToHome} style={{ marginTop: '20px' }}>
              Voltar
            </button>
          </div>
        </main>
      </div>
    );
  }

  const suggestions = extractSuggestions(guide);
  const jobInfo = guide.interview_guide?.preparation_overview || '';
  const titleMatch = jobInfo.match(/(?:para|como)\s+([^-]+)/i);
  const jobTitle = titleMatch ? titleMatch[1].trim() : 'Desenvolvedor';
  // Extrai nome da empresa ou posição da descrição se disponível
  const company = guide.interview_guide?.job_description?.match(/empresa[:\s]+([^\n,\.]+)/i)?.[1]?.trim() || 
                  guide.interview_guide?.company_name || 
                  'Vaga de Emprego';

  return (
    <div className="interview-result-container">
      <Header user={user} onLogout={handleLogout} />

      <main className="interview-result-main">
        <div className="interview-result-card">
          <div className="interview-result-header">
            <h1 className="interview-result-title">
              Guia de Entrevista para <span style={{ textDecoration: 'underline' }}>{jobTitle}</span> — {company}
            </h1>
          </div>

          <div className="interview-result-content">
            <h2 className="suggestions-title">Sugestões para sua preparação:</h2>
            
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <div className="bullet-point">•</div>
                  <div className="suggestion-text">
                    <strong>{suggestion.title}</strong>
                    {suggestion.description && `: ${suggestion.description}`}
                  </div>
                </div>
              ))}
            </div>

            <div className="button-group">
              <button
                type="button"
                className="new-guide-button"
                onClick={handleNewGuide}
              >
                + Iniciar Novo Guia
              </button>
              <button
                type="button"
                className="back-home-button"
                onClick={handleBackToHome}
              >
                Voltar à Tela Inicial
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewGuideResultPage;