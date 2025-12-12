import { Routes, Route } from 'react-router-dom';

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
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div>
      {/* Rotas */}
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recovery" element={<RecoveryPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset" element={<ResetPassPage />} />
        
        {/* Rotas protegidas */}
        <Route path="/upload" element={<ProtectedRoute><UploadResumePage /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/trail/:id" element={<ProtectedRoute><DevelopmentTrailPage /></ProtectedRoute>} />
        <Route path="/config" element={<ProtectedRoute><ConfigPage /></ProtectedRoute>} />
        <Route path="/exclude" element={<ProtectedRoute><ExcludePage /></ProtectedRoute>} />
        {/* <Route path="/asks" element={<ProtectedRoute><AskPage /></ProtectedRoute>} /> */}
        <Route path="/historico-trilhas" element={<ProtectedRoute><StudyTrailHistoryPage /></ProtectedRoute>} />
        <Route path="/historico-curriculos" element={<ProtectedRoute><ResumeAnalysisHistoryPage /></ProtectedRoute>} />
        <Route path="/historico-guias" element={<ProtectedRoute><InterviewGuideHistoryPage /></ProtectedRoute>} />
        <Route path="/analise-curriculo" element={<ProtectedRoute><ResumeAnalysisPage /></ProtectedRoute>} />
        <Route path="/analise-curriculo/:id" element={<ProtectedRoute><ResumeAnalysisPage /></ProtectedRoute>} />
        <Route path="/interview-guide" element={<ProtectedRoute><InterviewGuidePage /></ProtectedRoute>} />
        <Route path="/interview-guide-result/:id" element={<ProtectedRoute><InterviewGuideResultPage /></ProtectedRoute>} />
        <Route path="/vocational-form" element={<ProtectedRoute><VocationalFormPage /></ProtectedRoute>} />
        <Route path="/vocational-form-response" element={<ProtectedRoute><VocationalTrailResultPage /></ProtectedRoute>} />
        
        {/* Rota padrão redireciona para home */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;