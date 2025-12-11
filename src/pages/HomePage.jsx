import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import conversasLogo from '../assets/conversas.svg';
import pdfLogo from '../assets/pdf.svg';
import trilhaLogo from '../assets/trilha.svg';
import balaoLogo from '../assets/balaoDeConversa.svg';
import Header from '../components/Header'; // Usando o Header component
import { getTotalDevelopmentTrail } from '../services/authService';
import { getTotalInterviewGuide } from '../services/authService';
import { getTotalAnalyzeResume } from '../services/authService';



const HomePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [totalTrails, setTotalTrails] = React.useState(0);
  const [totalGuides, setTotalGuides] = React.useState(0);
  const [totalResumes, setTotalResumes] = React.useState(0);

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
  

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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

              <div className="guide-item">
                <h3>Desenvolvedor Full Stack</h3>
                <p>Análise completa com trilha de estudos focada em React e Node.js</p>
                <span className="time-info">2 dias atrás</span>
              </div>

              <div className="guide-item">
                <h3>Analista de Dados</h3>
                <p>Recomendações para certificações em Python e SQL</p>
                <span className="time-info">1 semana atrás</span>
              </div>

              <div className="guide-item">
                <h3>UX/UI Designer</h3>
                <p>Sugestões de portfólio e cursos de design thinking</p>
                <span className="time-info">2 semanas atrás</span>
              </div>
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

              <div className="track">
                <div className="track-header">
                  <h3>Desenvolvedor Full Stack</h3>
                  <span className="track-status">Em andamento</span>
                </div>
              </div>

              <div className="track">
                <div className="track-header">
                  <h3>Análise de Dados</h3>
                  <span className="track-status green">Concluída</span>
                </div>
              </div>
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