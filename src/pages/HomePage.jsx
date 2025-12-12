import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import conversasLogo from '../assets/conversas.svg';
import pdfLogo from '../assets/pdf.svg';
import trilhaLogo from '../assets/trilha.svg';
import balaoLogo from '../assets/balaoDeConversa.svg';
import Header from '../components/Header'; // Usando o Header component
import { getTotalDevelopmentTrail, getDevelopmentTrails, getInterviewGuides } from '../services/authService';
import { getTotalInterviewGuide } from '../services/authService';
import { getTotalAnalyzeResume } from '../services/authService';



const HomePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [totalTrails, setTotalTrails] = React.useState(0);
  const [totalGuides, setTotalGuides] = React.useState(0);
  const [totalResumes, setTotalResumes] = React.useState(0);
  const [recentGuides, setRecentGuides] = React.useState([]);
  const [recentTrails, setRecentTrails] = React.useState([]);

  React.useEffect(() => {
    const fetchTotalTrails = async () => {
      try {
        const total = await getTotalDevelopmentTrail();
        setTotalTrails(total);
      } catch (error) {
        console.error('Erro ao buscar total de trilhas:', error);
      }
    };

    fetchTotalTrails();
  }, []);
  React.useEffect(() => {
    const fetchTotalGuides = async () => {
      try {
        const total = await getTotalInterviewGuide();
        setTotalGuides(total);
      } catch (error) {
        console.error('Erro ao buscar total de guias:', error);
      }
    };

    fetchTotalGuides();
  }, []);
  React.useEffect(() => {
    const fetchTotalResumes = async () => {
      try {
        const total = await getTotalAnalyzeResume();
        setTotalResumes(total);
      } catch (error) {
        console.error('Erro ao buscar total de currículos:', error);
      }
    };

    fetchTotalResumes();
  }, []);

  React.useEffect(() => {
    const fetchRecentGuides = async () => {
      try {
        const response = await getInterviewGuides(0, 3);
        const guides = response.interview_guides || [];
        
        const formattedGuides = guides.map(guide => {
          try {
            const guideData = guide.interview_guide || {};
            const overview = guideData.preparation_overview || guideData.overview || '';
            
            let jobTitle = 'Guia de Entrevista';
            if (overview) {
              const titleMatch = overview.match(/(?:para|como|vaga|posição|de)\s+([^-–—]+?)(?:[-–—]|$)/i);
              if (titleMatch) {
                jobTitle = titleMatch[1].trim();
              } else {
                const words = overview.split(' ').slice(0, 5).join(' ');
                jobTitle = words.length > 50 ? words.substring(0, 50) + '...' : words;
              }
            }
            
            const createdDate = guide.created_at ? new Date(guide.created_at) : new Date();
            const now = new Date();
            const diffTime = Math.abs(now - createdDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            let timeInfo = 'Hoje';
            if (diffDays === 1) {
              timeInfo = '1 dia atrás';
            } else if (diffDays > 1 && diffDays < 7) {
              timeInfo = `${diffDays} dias atrás`;
            } else if (diffDays >= 7 && diffDays < 14) {
              timeInfo = '1 semana atrás';
            } else if (diffDays >= 14) {
              const weeks = Math.floor(diffDays / 7);
              timeInfo = `${weeks} semana${weeks > 1 ? 's' : ''} atrás`;
            }
            
            return {
              id: guide.id,
              title: jobTitle,
              description: overview.substring(0, 100) + (overview.length > 100 ? '...' : '') || 'Guia completo para entrevista',
              timeInfo: timeInfo
            };
          } catch (error) {
            console.error('Erro ao formatar guia:', error);
            return {
              id: guide.id || 0,
              title: 'Guia de Entrevista',
              description: 'Guia completo para entrevista',
              timeInfo: 'Recente'
            };
          }
        });
        
        setRecentGuides(formattedGuides);
      } catch (error) {
        console.error('Erro ao buscar guias recentes:', error);
        setRecentGuides([]);
      }
    };

    fetchRecentGuides();
  }, []);

  React.useEffect(() => {
    const fetchRecentTrails = async () => {
      try {
        const response = await getDevelopmentTrails(0, 3);
        const trails = response.development_trails || [];
        
        const formattedTrails = trails.map(trail => {
          const trailData = trail.development_trail || {};
          const profileSummary = trailData.user_profile_summary || {};
          const goal = profileSummary.professional_goal || trailData.professional_goal || 'Trilha de Desenvolvimento';
          
          const status = trailData.status || 'pending';
          const statusText = status === 'completed' ? 'Concluída' : 'Em andamento';
          const statusClass = status === 'completed' ? 'green' : '';
          
          return {
            id: trail.id,
            title: goal,
            status: statusText,
            statusClass: statusClass
          };
        });
        
        setRecentTrails(formattedTrails);
      } catch (error) {
        console.error('Erro ao buscar trilhas recentes:', error);
        setRecentTrails([]);
      }
    };

    fetchRecentTrails();
  }, []); 
  

  const handleLogout = async () => {
    const { handleLogout: logoutHelper } = await import('../utils/logoutHelper');
    await logoutHelper();
  };

  const goToUpload = () => {
    navigate('/upload');
  };

  const goToHistoricoCurriculos = () => {
    navigate('/historico-curriculos');
  };

  const goToHistoricoTrilhas = () => {
    navigate('/historico-trilhas');
  };

  const goToHistoricoGuias = () => {
    navigate('/historico-guias');
  };

  return (
    <div className="dashboard-container">
      {/* Usando o Header component */}
      <Header user={user} onLogout={handleLogout} />

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <div className="welcome-container">
          <div className="welcome-texts">
            <h2>Bem-vinda de volta, {user?.name.split(' ')[0]}!</h2>
            <p>Continue sua jornada de desenvolvimento profissional com análises inteligentes.</p>
          </div>
        </div>

        {/* Top Cards */}
        <section className="top-cards">
          <div className="top-card">
            <img src={conversasLogo} alt="ícone" className="card-icon blue" />
            <p className="card-title">Conversas com IA</p>
            <p className="card-number">{totalGuides}</p>
            {/* <span className="card-subtext">+3 esta semana</span> */}
          </div>

          <div className="top-card">
            <img src={pdfLogo} alt="ícone" className="card-icon" />
            <p className="card-title">Currículos Analisados</p>
            <p className="card-number">{totalResumes}</p>
            {/* <span className="card-subtext">+2 este mês</span> */}
          </div>

          <div className="top-card">
            <img src={trilhaLogo} alt="ícone" className="card-icon" />
            <p className="card-title">Trilhas Criadas</p>
            <p className="card-number">{totalTrails}</p>
            {/* <span className="card-subtext">Em andamento</span> */}
          </div>
        </section>

        {/* Grid Principal */}
        <div className="dashboard-grid">
          {/* Coluna Esquerda */}
          <div className="left-column">
            {/* Meus guias de entrevistas */}
            <section className="box">
              <div className="box-header">
                <div className="box-header-left">
                  <img src={balaoLogo} alt="ícone" />
                  <h2>Meus Guias de Entrevista</h2>
                </div>
                <button className="see-more" onClick={goToHistoricoGuias}>
                  Ver todos
                </button>
              </div>

              {recentGuides.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  <p>Nenhum guia de entrevista criado ainda.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Crie seu primeiro guia!</p>
                </div>
              ) : (
                recentGuides.map((guide) => (
                  <div key={guide.id} className="guide-item" onClick={() => navigate(`/interview-guide-result/${guide.id}`)} style={{ cursor: 'pointer' }}>
                    <h3>{guide.title}</h3>
                    <p>{guide.description}</p>
                    <span className="time-info">{guide.timeInfo}</span>
                  </div>
                ))
              )}
            </section>

            {/* Minhas Trilhas de Estudo */}
            <section className="box full-width">
              <div className="box-header">
                <div className="box-header-left">
                  <h2>Minhas Trilhas de Estudo</h2>
                </div>
                <button className="see-more" onClick={goToHistoricoTrilhas}>
                  Ver todas
                </button>
              </div>

              {recentTrails.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  <p>Nenhuma trilha de estudo criada ainda.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Crie sua primeira trilha!</p>
                </div>
              ) : (
                recentTrails.map((trail) => (
                  <div key={trail.id} className="track" onClick={() => navigate(`/trail/${trail.id}`)} style={{ cursor: 'pointer' }}>
                    <div className="track-header">
                      <h3>{trail.title}</h3>
                      <span className={`track-status ${trail.statusClass}`}>{trail.status}</span>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>

          {/* Coluna Direita */}
          <div className="right-column">
            {/* Ações Rápidas */}
            <section className="box">
              <div className="box-header">
                <h2>Ações Rápidas</h2>
              </div>
              <div className="actions-box">
                <button className="action-button blue-btn" onClick={() => navigate('/upload')}>
                  Análise de Currículo
                </button>
                <button className="action-button gray-btn" onClick={() => navigate('/interview-guide')}>
                  Guia de entrevista
                </button>
                <button className="action-button purple-btn" onClick={() => navigate('/vocational-form')}>
                  Criar trilha de estudo
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;