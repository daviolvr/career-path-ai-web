import { useState } from "react";
import { Routes, Route, Link } from 'react-router-dom';

import LoginPage from "./pages/LoginPage";
import RecoveryPage from "./pages/RecoveryPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPassPage from "./pages/ResetPassPage";
import UploadResumePage from "./pages/UploadResumePage";
import HomePage from "./pages/HomePage";
import DevelopmentTrailPage from "./pages/DevelopmentTrailPage";
import ConfigPage from "./pages/ConfigPage";
import ExcludePage from "./pages/ExcludePage";
// import AskPage from "./pages/AskPage";
import StudyTrailHistoryPage from "./pages/StudyTrailHistoryPage";
import ResumeAnalysisHistoryPage from './pages/ResumeAnalysisHistoryPage';
import InterviewGuidePage from './pages/InterviewGuidePage';
import InterviewGuideResultPage from './pages/InterviewGuideResultPage';
import VocationalFormPage from './pages/VocationalFormPage';
import VocationalTrailResultPage from './pages/VocationalTrailResultPage';
import InterviewGuideHistoryPage from './pages/InterviewGuideHistoryPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';

function App() {
  return (
    <div>
      {/* DESCOMENTE PARA TESTAR PAGINAS KK */}
      <nav>
        <ul>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/recovery">Recuperar Senha</Link></li>
          <li><Link to="/register">Registrar</Link></li>
          <li><Link to="/reset">Reset</Link></li>
          <li><Link to="/upload">upload</Link></li>
          <li><Link to="/home">home</Link></li>
          <li><Link to="/trail/1">Trilha</Link></li>
          <li><Link to="/config">config</Link></li>
          <li><Link to="/exclude">exclude</Link></li>
          {/* <li><Link to="/asks">asks</Link></li> */}
          
          <li><Link to="/analise-curriculo/1">Resultado da Análise</Link></li>
          <li><Link to="/historico-trilhas">Histórico Trilhas</Link></li>
          <li><Link to="/historico-curriculos">Histórico de Análise de Currículos</Link></li>
          <li><Link to="/historico-guias">Histórico de Guias de Entrevista</Link></li>
          <li><Link to="/interview-guide">Guia de Entrevista</Link></li>
          <li><Link to="/interview-guide-result">Resposta da Guia de Entrevista</Link></li>
          <li><Link to="/vocational-form">Criar Trilha de Estudo</Link></li>
          <li><Link to="/vocational-form-response">Resposta da Trilha de Estudo</Link></li>
        </ul>
      </nav>

      {/* Rotas */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recovery" element={<RecoveryPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset" element={<ResetPassPage />} />
        <Route path="/upload" element={<UploadResumePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/trail/:id" element={<DevelopmentTrailPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/exclude" element={<ExcludePage />} />
        {/* <Route path="/asks" element={<AskPage />} /> */}
        <Route path="/historico-trilhas" element={<StudyTrailHistoryPage />} />
        <Route path="/historico-curriculos" element={<ResumeAnalysisHistoryPage />} />
        <Route path="/historico-guias" element={<InterviewGuideHistoryPage />} />
        <Route path="/analise-curriculo" element={<ResumeAnalysisPage />} />
        <Route path="/analise-curriculo/:id" element={<ResumeAnalysisPage />} />
        <Route path="/interview-guide" element={<InterviewGuidePage />} />
        <Route path="/interview-guide-result/:id" element={<InterviewGuideResultPage />} />
        <Route path="/vocational-form" element={<VocationalFormPage />} />
        <Route path="/vocational-form-response" element={<VocationalTrailResultPage />} />
      </Routes>
    </div>
  );
}

export default App;