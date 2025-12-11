// VocationalTrailResultPage.jsx
// NOTA: Esta página não está mais sendo usada.
// O formulário redireciona para /trail/:id que usa DevelopmentTrailPage
// Mantida apenas por compatibilidade, mas recomenda-se remover ou redirecionar para DevelopmentTrailPage

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getDevelopmentTrailById } from '../services/authService';
import './VocationalTrailResultPage.css';

const VocationalTrailResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trailData, setTrailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Recuperar usuário do localStorage
  const user = JSON.parse(localStorage.getItem("user") || '{"name": "Usuário"}');

  useEffect(() => {
    // Se não houver ID, redireciona para a página de formulário
    if (!id) {
      navigate('/vocational-form');
      return;
    }

    const fetchTrail = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await getDevelopmentTrailById(id);
        
        // Transforma dados da API no formato esperado pela página
        const developmentData = data.development_trail || {};
        const profileSummary = developmentData.user_profile_summary || {};
        
        // Formata semanas das fases de desenvolvimento
        const weeks = (developmentData.development_phases || []).map((phase, index) => ({
          weekNumber: index + 1,
          title: phase.phase || `Fase ${index + 1}`,
          focus: phase.focus || '',
          topics: phase.topics || [],
          activities: phase.projects || [],
          resources: phase.learning_resources || [],
          estimatedHours: 20 // Valor padrão, pode ser calculado se disponível
        }));

        setTrailData({
          id: data.id,
          title: profileSummary.professional_goal || 'Trilha de Desenvolvimento',
          created_at: data.created_at,
          weeks: weeks.length > 0 ? weeks : [],
          summary: {
            totalHours: weeks.reduce((sum, week) => sum + (week.estimatedHours || 0), 0),
            difficulty: profileSummary.current_level || 'Intermediário',
            timeframe: profileSummary.goal_timeframe || '6 meses',
            estimatedCompletion: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            requiredTechnologies: developmentData.technologies || [],
            certifications: developmentData.certifications || []
          },
          recommendations: developmentData.recommendations || [
            "Revise os conceitos diariamente",
            "Pratique com projetos reais",
            "Participe de comunidades de desenvolvedores"
          ],
          formData: {
            name: profileSummary.name || user.name || '',
            professional_goal: profileSummary.professional_goal || '',
            interested_technologies: profileSummary.interested_technologies?.join(', ') || '',
            skills: profileSummary.skills?.join(', ') || '',
            available_time_week: profileSummary.available_time_week || '',
            current_level: profileSummary.current_level || '',
            goal_timeframe: profileSummary.goal_timeframe || ''
          }
        });
      } catch (err) {
        console.error('Erro ao buscar trilha:', err);
        setError('Erro ao carregar trilha. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrail();
  }, [id, navigate, user.name]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleExportPDF = () => {
    alert('Funcionalidade de exportar PDF em desenvolvimento!');
  };

  const handleNewTrail = () => {
    navigate('/vocational-form');
  };

  const handleSaveTrail = () => {
    // A trilha já está salva no backend quando criada
    alert('Esta trilha já está salva no seu histórico!');
    navigate('/historico-trilhas');
  };

  const handleShareTrail = () => {
    alert('Compartilhe esta trilha com seus amigos!');
    // Em produção, implementaria compartilhamento via link
  };

  if (loading) {
    return (
      <div className="trail-result-container">
        <Header user={user} onLogout={handleLogout} />
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2>Carregando sua trilha personalizada...</h2>
          <p>Aguarde enquanto buscamos os dados da sua trilha</p>
        </div>
      </div>
    );
  }

  if (error || !trailData) {
    return (
      <div className="trail-result-container">
        <Header user={user} onLogout={handleLogout} />
        <div className="loading-screen">
          <h2>Erro ao carregar trilha</h2>
          <p>{error || 'Trilha não encontrada'}</p>
          <button 
            onClick={() => navigate('/vocational-form')}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Criar Nova Trilha
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trail-result-container">
      {/* Header component */}
      <Header user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="trail-result-main">
        <div className="trail-result-card">
          {/* Cabeçalho da trilha */}
          <div className="trail-result-header">
            <div className="header-content">
              <h1 className="trail-result-title">
                {trailData.title}
              </h1>
              <p className="trail-result-subtitle">
                Criada especialmente para <strong>{user?.name?.split(' ')[0] || 'você'}</strong> com base no seu perfil
              </p>
              
              <div className="trail-meta-info">
                <div className="meta-grid">
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <div className="meta-content">
                      <span className="meta-label">Duração Total</span>
                      <span className="meta-value">{trailData.summary.totalHours} horas</span>
                    </div>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <div className="meta-content">
                      <span className="meta-label">Prazo Estimado</span>
                      <span className="meta-value">{trailData.summary.timeframe}</span>
                    </div>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">🎯</span>
                    <div className="meta-content">
                      <span className="meta-label">Nível</span>
                      <span className="meta-value">{trailData.summary.difficulty}</span>
                    </div>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">🏆</span>
                    <div className="meta-content">
                      <span className="meta-label">Conclusão</span>
                      <span className="meta-value">{trailData.summary.estimatedCompletion}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do perfil */}
          <div className="profile-summary">
            <div className="summary-header">
              <h3>📋 Resumo do Seu Perfil</h3>
              <p>Baseado nas suas respostas ao formulário</p>
            </div>
            <div className="profile-grid">
              <div className="profile-item">
                <span className="profile-label">Objetivo Profissional:</span>
                <span className="profile-value highlight">{trailData.formData?.professional_goal || 'Não informado'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Tecnologias de Interesse:</span>
                <span className="profile-value">{trailData.formData?.interested_technologies || 'Não informado'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Habilidades Atuais:</span>
                <span className="profile-value">{trailData.formData?.skills || 'Não informado'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Tempo Disponível:</span>
                <span className="profile-value">{trailData.formData?.available_time_week || 'Não informado'}</span>
              </div>
            </div>
          </div>

          {/* Tecnologias e certificações */}
          <div className="tech-cert-section">
            <div className="section-card">
              <h3>🛠️ Tecnologias Requeridas</h3>
              <div className="tech-tags">
                {trailData.summary.requiredTechnologies && trailData.summary.requiredTechnologies.length > 0 ? (
                  trailData.summary.requiredTechnologies.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma tecnologia especificada</p>
                )}
              </div>
            </div>
            <div className="section-card">
              <h3>📜 Certificações Sugeridas</h3>
              <div className="cert-list">
                {trailData.summary.certifications && trailData.summary.certifications.length > 0 ? (
                  trailData.summary.certifications.map((cert, index) => (
                    <div key={index} className="cert-item">
                      <span className="cert-icon">✓</span>
                      <span>{cert}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma certificação sugerida</p>
                )}
              </div>
            </div>
          </div>

          {/* Plano semanal detalhado */}
          <div className="weeks-container">
            <div className="section-header">
              <h2>📚 Plano de Estudos Semanal</h2>
              <p>Siga este cronograma passo a passo para alcançar seus objetivos</p>
            </div>
            
            {trailData.weeks && trailData.weeks.length > 0 ? (
              trailData.weeks.map((week, index) => (
              <div key={index} className="week-card">
                <div className="week-header">
                  <div className="week-number">SEMANA {week.weekNumber}</div>
                  <h3 className="week-title">{week.title}</h3>
                  <div className="week-hours">⏰ {week.estimatedHours} horas</div>
                </div>
                
                <div className="week-focus">
                  <strong>Foco Principal:</strong> {week.focus}
                </div>
                
                <div className="week-content">
                  <div className="content-section">
                    <h4>📖 Tópicos de Estudo</h4>
                    <ul>
                      {week.topics.map((topic, idx) => (
                        <li key={idx}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="content-section">
                    <h4>🎯 Atividades Práticas</h4>
                    <ul>
                      {week.activities.map((activity, idx) => (
                        <li key={idx}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="content-section">
                    <h4>🔗 Recursos Recomendados</h4>
                    <ul>
                      {week.resources.map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>Nenhum plano semanal disponível para esta trilha.</p>
              </div>
            )}
          </div>

          {/* Recomendações finais */}
          {trailData.recommendations && trailData.recommendations.length > 0 && (
          <div className="recommendations-section">
            <h3>💡 Recomendações Importantes</h3>
            <div className="recommendations-list">
              {trailData.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <span className="rec-number">{index + 1}</span>
                  <span className="rec-text">{rec}</span>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Ações */}
          <div className="trail-actions">
            <button className="action-btn primary-btn" onClick={handleSaveTrail}>
              💾 Salvar esta Trilha
            </button>
            <button className="action-btn secondary-btn" onClick={handleExportPDF}>
              📄 Exportar como PDF
            </button>
            <button className="action-btn share-btn" onClick={handleShareTrail}>
              🔗 Compartilhar
            </button>
            <button className="action-btn outline-btn" onClick={handleNewTrail}>
              ✏️ Criar Nova Trilha
            </button>
          </div>

          <div className="trail-footer">
            <div className="footer-note">
              <p className="footer-text">
                <strong>✨ Dica Pro:</strong> Mantenha um diário de estudos para acompanhar seu progresso. 
                Revise este plano a cada 2 semanas e ajuste conforme sua evolução.
              </p>
              <p className="footer-subtext">
                Esta trilha é uma sugestão personalizada - adapte-a às suas necessidades e ritmo de aprendizado!
              </p>
            </div>
            <div className="footer-links">
              <button className="back-link" onClick={() => navigate('/home')}>
                ← Voltar para o Dashboard
              </button>
              <button className="history-link" onClick={() => navigate('/historico-trilhas')}>
                📚 Ver Todas as Trilhas
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VocationalTrailResultPage;