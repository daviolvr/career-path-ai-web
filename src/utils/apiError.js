// Modelo único de erro da API. O backend responde sempre
//   { "error": { "status", "code", "message", "details?" } }
// e, no 429, o cabeçalho Retry-After (em segundos). Aqui esse envelope vira um ApiError e,
// em describeError, a mensagem que a pessoa vê.

import { extractErrorMessage } from './errorMessage';

export class ApiError extends Error {
  constructor({ status, code = null, message, details = [], retryAfter = null }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

// Retry-After também pode vir como data HTTP; a API só envia segundos, então o resto é ignorado.
function parseRetryAfter(value) {
  if (value === null || value === undefined) return null;
  const seconds = Number(value);
  return Number.isInteger(seconds) && seconds > 0 ? seconds : null;
}

/**
 * Cria o ApiError de uma resposta com erro. Uso: `throw await buildApiError(response, 'texto')`.
 * `fallback` só vale se o corpo não trouxer o envelope (proxy, HTML de erro, corpo vazio).
 */
export async function buildApiError(response, fallback) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // corpo ausente ou que não é JSON: fica o fallback
  }

  const error = body?.error;
  return new ApiError({
    status: response.status,
    code: typeof error?.code === 'string' ? error.code : null,
    message: extractErrorMessage(body, fallback),
    details: Array.isArray(error?.details) ? error.details : [],
    retryAfter: parseRetryAfter(response.headers?.get?.('Retry-After')),
  });
}

function formatWait(seconds) {
  if (seconds < 60) return `${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;
  if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  const hours = Math.ceil(seconds / 3600);
  return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
}

const NETWORK_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
const SESSION_MESSAGE = 'Sua sessão expirou. Faça login novamente.';
const SERVER_MESSAGE = 'O servidor encontrou um problema. Tente novamente em instantes.';

/** Falha de rede do fetch: o navegador lança TypeError e não há resposta. */
export function isNetworkError(error) {
  return error instanceof TypeError;
}

/**
 * Mensagem final para a pessoa. Usa a mensagem da API quando ela é segura e específica
 * (a API só devolve textos próprios em português) e a troca nos casos em que o contexto
 * muda o que dizer: espera do 429, sessão expirada, falha de rede e erro interno.
 */
export function describeError(error, fallback = 'Algo deu errado. Tente novamente.') {
  if (isNetworkError(error)) return NETWORK_MESSAGE;

  if (!(error instanceof ApiError)) {
    // Erro local (por exemplo "Token de autenticação não encontrado"): sem status nem código.
    return error?.message || fallback;
  }

  const { status, code, message, retryAfter } = error;

  if (status === 429 && code === 'rate_limit_exceeded') {
    const when = retryAfter ? `em ${formatWait(retryAfter)}` : 'em alguns instantes';
    return `Muitas requisições. Tente novamente ${when}.`;
  }

  // 401 de login traz o motivo ("Credenciais inválidas"); nos demais é a sessão que acabou.
  if (status === 401 && code !== 'invalid_credentials') return SESSION_MESSAGE;

  // 500 e afins: a mensagem da API é genérica de propósito; nada a acrescentar.
  if (status >= 500 && status !== 502 && status !== 503) return SERVER_MESSAGE;

  return message || fallback;
}
