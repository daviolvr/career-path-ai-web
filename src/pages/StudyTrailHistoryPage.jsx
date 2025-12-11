import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/div.svg";
import UserProfile from "../components/UserProfile";
import { getDevelopmentTrails, deleteDevelopmentTrail } from "../services/authService";
import "./StudyTrailHistoryPage.css";

const StudyTrailHistoryPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Usuário" };

  const [ordenacao, setOrdenacao] = useState("mais-recente");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [trilhas, setTrilhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const itensPorPagina = 4;

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        setLoading(true);
        const response = await getDevelopmentTrails();
        setTrilhas(response.development_trails || []);
      } catch (err) {
        console.error('Erro ao buscar trilhas:', err);
        setTrilhas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrails();
  }, []);

  const handleDelete = async (trailId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta trilha?')) {
      return;
    }

    try {
      await deleteDevelopmentTrail(trailId);
      const response = await getDevelopmentTrails();
      setTrilhas(response.development_trails || []);
    } catch (err) {
      console.error('Erro ao deletar trilha:', err);
      alert('Erro ao excluir trilha');
    }
  };


  // Formatar trilhas da API
  const formattedTrails = trilhas.map(trail => {
    const trailData = trail.development_trail || {};
    const profileSummary = trailData.user_profile_summary || {};
    const goal = profileSummary.professional_goal || trailData.professional_goal || 'Trilha de Desenvolvimento';
    
    return {
      id: trail.id,
      titulo: goal,
      dataCriacao: new Date(trail.created_at || new Date()).toLocaleDateString('pt-BR'),
      created_at: trail.created_at
    };
  });

  const ordenarTrilhas = (lista, criterio) => {
    let t = [...lista];

    if (criterio === "mais-recente") {
      return t.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    if (criterio === "mais-antigo") {
      return t.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return t;
  };

  const trilhasFiltradas = ordenarTrilhas(formattedTrails, ordenacao);

  const indexUltimo = paginaAtual * itensPorPagina;
  const trilhasPaginaAtual = trilhasFiltradas.slice(indexUltimo - itensPorPagina, indexUltimo);
  const totalPaginas = Math.ceil(trilhasFiltradas.length / itensPorPagina);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="study-trail-container">
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

        <nav className="header-nav">
          <button 
            className="nav-link" 
            onClick={() => navigate("/interview-guide")}
          >
            Guia de Entrevista
          </button>
          <UserProfile user={user} onLogout={handleLogout} />
        </nav>
      </header>

      <main className="study-trail-main">
        <h1 className="title-page">Histórico de Trilhas Criadas</h1>

        <div className="filter-bar">
          <div className="contador">{trilhasFiltradas.length} trilhas encontradas</div>

          <div className="select-wrapper">
            <label>Ordenar por:</label>
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="mais-recente">Mais recente</option>
              <option value="mais-antigo">Mais antigo</option>
            </select>
          </div>
        </div>

        <div className="lista-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Carregando trilhas...</p>
            </div>
          ) : trilhasPaginaAtual.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px', color: '#333' }}>
                Nenhuma trilha de estudo encontrada
              </h3>
              <p style={{ color: '#666', marginBottom: '30px' }}>
                Você ainda não criou nenhuma trilha de desenvolvimento. Crie sua primeira trilha personalizada!
              </p>
              <button 
                onClick={() => navigate('/vocational-form')}
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
                Criar Primeira Trilha
              </button>
            </div>
          ) : (
            trilhasPaginaAtual.map((t, i) => (
              <div className="card" key={t.id}>
                <div className="info">
                  <h3>{t.titulo}</h3>
                  <p>Criada em <strong>{t.dataCriacao}</strong></p>
                  <p>ID: <span className="id">{t.id}</span></p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="arrow" onClick={() => navigate(`/trail/${t.id}`)}>
                    {">"}
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    style={{ 
                      background: '#dc3545', 
                      color: 'white', 
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Excluir
                  </button>
                </div>
                {i < trilhasPaginaAtual.length - 1 && <div className="divider" />}
              </div>
            ))
          )}
        </div>

        <div className="pagination">
          <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(paginaAtual - 1)}>{"<"}</button>

          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={paginaAtual === i + 1 ? "active" : ""}
              onClick={() => setPaginaAtual(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(paginaAtual + 1)}>{">"}</button>
        </div>
      </main>
    </div>
  );
};

export default StudyTrailHistoryPage;