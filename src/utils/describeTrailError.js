import { ApiError, describeError } from './apiError';

/** Mensagem da tela de uma trilha. Decide pelo status da resposta, nunca pelo texto do erro. */
export function describeTrailError(error, id) {
  if (error instanceof ApiError) {
    // A API responde 404 também quando a trilha é de outra pessoa (não revela que ela existe).
    if (error.status === 404) {
      return `Trilha com ID ${id} não encontrada. Verifique se o ID está correto ou se você tem acesso a esta trilha.`;
    }
    if (error.status === 403) return 'Acesso negado a esta trilha.';
  }
  return describeError(error, 'Erro ao carregar trilha. Tente novamente.');
}
