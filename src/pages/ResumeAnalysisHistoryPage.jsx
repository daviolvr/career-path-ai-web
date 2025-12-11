import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/div.svg";
import UserProfile from "../components/UserProfile";
import { getResumeAnalyses, deleteResumeAnalysis } from "../services/authService";
import "./ResumeAnalysisHistoryPage.css";

const ResumeAnalysisHistoryPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Usuário" };

  const [ordenacao, setOrdenacao] = useState("mais-recente");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [analises, setAnalises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const itensPorPagina = 4;

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        const response = await getResumeAnalyses(0, 100);
        setAnalises(response.analyses || []);
        setTotalCount(response.total_count || 0);
      } catch (err) {
        console.error('Erro ao buscar análises:', err);
        setAnalises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  const handleDelete = async (analysisId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta análise?')) {
      return;
    }

    try {
      await deleteResumeAnalysis(analysisId);
      // Recarrega a lista
      const response = await getResumeAnalyses(0, 100);
      setAnalises(response.analises || []);
      setTotalCount(response.total_count || 0);
    } catch (err) {
      console.error('Erro ao deletar análise:', err);
      alert('Erro ao excluir análise');
    }
  };


  // Transformar dados da API para o formato da página
  const analisesFormatadas = analises.map(analysis => ({
    id: analysis.id,
    titulo: `Análise: ${analysis.original_filename || 'Currículo'}`,
    fileName: analysis.original_filename || 'Currículo.pdf',
    dataAnalise: new Date(analysis.created_at).toLocaleDateString('pt-BR'),
    analysis: analysis
  }));

  const ordenarAnalises = (lista, criterio) => {
    let t = [...lista];
    
    if (criterio === "mais-recente") {
      return t.sort((a, b) => new Date(b.analysis.created_at) - new Date(a.analysis.created_at));
    }
    if (criterio === "mais-antigo") {
      return t.sort((a, b) => new Date(a.analysis.created_at) - new Date(b.analysis.created_at));
    }
    return t;
  };

  const analisesFiltradas = ordenarAnalises(analisesFormatadas, ordenacao);

  const indexUltimo = paginaAtual * itensPorPagina;
  const analisesPaginaAtual = analisesFiltradas.slice(indexUltimo - itensPorPagina, indexUltimo);
  const totalPaginas = Math.ceil(analisesFiltradas.length / itensPorPagina);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleVerAnalise = (analise) => {
    navigate(`/analise-curriculo/${analise.id}`);
  };

  return (
    <div className="resume-analysis-container">
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
          <UserProfile user={user} onLogout={handleLogout} />
        </nav>
      </header>

      <main className="resume-analysis-main">
        <div className="header-section">
          <h1 className="title-page">Histórico de Análises de Currículo</h1>
          <p className="page-description">
            Revise suas conversas anteriores com nossa IA sobre análises de currículo e feedback recebido.
          </p>
        </div>

        <div className="content-container">
          <div className="filter-bar">
            <div className="contador">
              Exibindo {analisesPaginaAtual.length} de {totalCount} análises
            </div>

            <div className="select-wrapper">
              <label>Ordenar por:</label>
              <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                <option value="mais-recente">Mais recente</option>
                <option value="mais-antigo">Mais antigo</option>
              </select>
            </div>
          </div>

          <div className="analises-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Carregando análises...</p>
              </div>
            ) : analisesPaginaAtual.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px', color: '#333' }}>
                  Nenhuma análise de currículo encontrada
                </h3>
                <p style={{ color: '#666', marginBottom: '30px' }}>
                  Você ainda não fez upload de nenhum currículo para análise. Envie seu primeiro currículo!
                </p>
                <button 
                  onClick={() => navigate('/upload')}
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
                  Analisar Currículo
                </button>
              </div>
            ) : (
              analisesPaginaAtual.map((analise, index) => (
                <div className="analise-card" key={analise.id}>
                  <div className="analise-info">
                    <div className="analise-icon">📄</div>
                    <div className="analise-details">
                      <h3 className="analise-title">{analise.fileName}</h3>
                      <div className="analise-meta">
                        <span className="analise-date">{analise.dataAnalise}</span>
                      </div>
                    </div>
                  </div>
                  <div className="analise-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleVerAnalise(analise)}
                    >
                      Ver Análise
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(analise.id)}
                      style={{ marginLeft: '10px', background: '#dc3545', color: 'white' }}
                    >
                      Excluir
                    </button>
                  </div>
                  {index < analisesPaginaAtual.length - 1 && <div className="divider" />}
                </div>
              ))
            )}
          </div>

          <div className="pagination-section">
            <div className="pagination-info">
              Página {paginaAtual} de {totalPaginas}
            </div>
            <div className="pagination">
              <button 
                className="pagination-btn" 
                disabled={paginaAtual === 1} 
                onClick={() => setPaginaAtual(paginaAtual - 1)}
              >
                Anterior
              </button>
              
              <div className="pagination-numbers">
                {[...Array(totalPaginas)].map((_, i) => (
                  <button
                    key={i}
                    className={`pagination-btn ${paginaAtual === i + 1 ? "active" : ""}`}
                    onClick={() => setPaginaAtual(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                className="pagination-btn" 
                disabled={paginaAtual === totalPaginas} 
                onClick={() => setPaginaAtual(paginaAtual + 1)}
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeAnalysisHistoryPage;