import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx' // importa o App principal
import './pages/LoginPage.css'
import './utils/fetchInterceptor' // Importa o interceptor de fetch para refresh automático

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
