// logoutHelper.js - Função helper para fazer logout corretamente

import { logout } from '../services/authService';

/**
 * Função helper para fazer logout
 * Limpa localStorage e redireciona para login usando replace para evitar histórico
 */
export async function handleLogout() {
  try {
    await logout();
  } catch (err) {
    console.error('Erro ao fazer logout:', err);
    // Continua mesmo se falhar
  } finally {
    localStorage.clear();
    // Usa replace em vez de href para substituir a entrada do histórico
    window.location.replace('/login');
  }
}

