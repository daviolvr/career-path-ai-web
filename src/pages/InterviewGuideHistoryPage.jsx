import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InterviewGuideHistoryPage.css';
import logo from '../assets/div.svg';
import UserProfile from '../components/UserProfile';
import { getInterviewGuides, deleteInterviewGuide } from '../services/authService';

const InterviewGuideHistoryPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const response = await getInterviewGuides(0, 100);
        
        // Valida a estrutura da resposta
        if (response && Array.isArray(response.interview_guides)) {
          setGuides(response.interview_guides);
        } else if (response && Array.isArray(response)) {
          // Caso a resposta seja diretamente um array
          setGuides(response);
        } else {
          console.warn('Resposta da API em formato inesperado:', response);
          setGuides([]);
        }
      } catch (err) {
        console.error('Erro ao buscar guias:', err);
        setGuides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const handleDelete = async (guideId) => {
    if (!window.confirm('Tem certeza que deseja excluir este guia?')) {
      return;
    }

    try {
      await deleteInterviewGuide(guideId);
      const response = await getInterviewGuides(0, 100);
      setGuides(response.interview_guides || []);
    } catch (err) {
      console.error('Erro ao deletar guia:', err);
      alert('Erro ao excluir guia');
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleViewGuide = (guideId) => {
    navigate(`/interview-guide-result/${guideId}`);
  };

  // Formatar guias da API
  const formattedGuides = guides.map(guide => {
    try {
      const guideData = guide.interview_guide || {};
      const overview = guideData.preparation_overview || guideData.overview || '';
      
      // Tenta extrair título da descrição da vaga ou do overview
      let jobTitle = 'Guia de Entrevista';
      if (overview) {
        const titleMatch = overview.match(/(?:para|como|vaga|posição|de)\s+([^-–—]+?)(?:[-–—]|$)/i);
        if (titleMatch) {
          jobTitle = titleMatch[1].trim();
        } else {
          // Se não encontrar, pega as primeiras palavras do overview
          const words = overview.split(' ').slice(0, 5).join(' ');
          jobTitle = words.length > 50 ? words.substring(0, 50) + '...' : words;
        }
      }
      
      return {
        id: guide.id,
        title: jobTitle,
        date: guide.created_at 
          ? new Date(guide.created_at).toLocaleDateString('pt-BR')
          : new Date().toLocaleDateString('pt-BR'),
        description: overview || 'Guia completo para entrevista',
        created_at: guide.created_at
      };
    } catch (error) {
      console.error('Erro ao formatar guia:', error, guide);
      return {
        id: guide.id || 0,
        title: 'Guia de Entrevista',
        date: new Date().toLocaleDateString('pt-BR'),
        description: 'Guia completo para entrevista',
        created_at: guide.created_at
      };
    }
  });

  const handleCreateNewGuide = () => {
    navigate('/interview-guide');
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Header - MESMO DA HOME PAGE */}
      <header className="upload-header">
        <div 
          className="header-left" 
          onClick={() => navigate("/home")} 
          style={{ cursor: 'pointer' }}
        >
          <div className="logo-box-header">
            <img src={logo} alt="Logo" />
          </div>
          <span className="app-name">CareerPathAI</span>
        </div>

        {/* NAVBAR - Mesmo da HomePage */}
        <nav className="header-nav">
          <UserProfile user={user} onLogout={handleLogout} />
        </nav>
      </header>

      <main className="dashboard-main">
        <div className="welcome-container">
          <div className="welcome-texts">
            <h2>Histórico de Guias de Entrevista</h2>
            <p>Acesse todos os guias de entrevista criados anteriormente</p>
          </div>
          <button className="welcome-btn" onClick={handleCreateNewGuide}>
            Criar Novo Guia
          </button>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          <section className="box">
            <div className="box-header">
              <h2>Seus Guias de Entrevista ({formattedGuides.length})</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Ordenar por:</span>
                <select 
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option>Mais recente</option>
                  <option>Mais antigo</option>
                  <option>A-Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Carregando guias...</p>
              </div>
            ) : formattedGuides.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>💼</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px', color: '#333' }}>
                  Nenhum guia de entrevista encontrado
                </h3>
                <p style={{ color: '#666', marginBottom: '30px' }}>
                  Você ainda não criou nenhum guia de entrevista. Crie seu primeiro guia personalizado!
                </p>
                <button 
                  onClick={handleCreateNewGuide}
                  style={{
                    padding: '12px 24px',
                    background: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Criar Primeiro Guia
                </button>
              </div>
            ) : (
              formattedGuides.map((guide) => (
                <div 
                  key={guide.id} 
                  className="guide-item" 
                  style={{ 
                    cursor: 'pointer',
                    padding: '20px',
                    margin: '0 -24px',
                    transition: 'background-color 0.2s ease'
                  }} 
                  onClick={() => handleViewGuide(guide.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>{guide.title}</h3>
                      <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>
                        {guide.description}
                      </p>
                      <span className="time-info">Criado em: {guide.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="see-more"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewGuide(guide.id);
                        }}
                        style={{ 
                          background: '#f0f7ff',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}
                      >
                        Visualizar
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(guide.id);
                        }}
                        style={{ 
                          background: '#dc3545',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '30px',
          gap: '20px'
        }}>
          <button 
            onClick={handleBack}
            style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              color: '#374151',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Voltar para Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default InterviewGuideHistoryPage;