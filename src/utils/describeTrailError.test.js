import { describe, expect, it } from 'vitest';

import { ApiError } from './apiError';
import { describeTrailError } from './describeTrailError';

const apiError = (status, code = null, message = 'msg', retryAfter = null) =>
  new ApiError({ status, code, message, retryAfter });

describe('describeTrailError', () => {
  it('404 cita o ID e não depende do texto da mensagem', () => {
    expect(describeTrailError(apiError(404, 'not_found', 'qualquer coisa'), 7)).toMatch(
      /^Trilha com ID 7 não encontrada/,
    );
  });

  it('403 diz que o acesso foi negado', () => {
    expect(describeTrailError(apiError(403, 'forbidden'), 7)).toBe('Acesso negado a esta trilha.');
  });

  it('um erro com "404" ou "Token" no texto, mas outro status, NÃO é tratado como 404 nem como sessão', () => {
    const message = describeTrailError(apiError(500, null, 'falha 404 no Token interno'), 7);

    expect(message).toBe('O servidor encontrou um problema. Tente novamente em instantes.');
  });

  it('401 vira sessão expirada', () => {
    expect(describeTrailError(apiError(401, 'http_error'), 7)).toBe(
      'Sua sessão expirou. Faça login novamente.',
    );
  });

  it('429 mostra o tempo de espera', () => {
    expect(describeTrailError(apiError(429, 'rate_limit_exceeded', 'x', 12), 7)).toBe(
      'Muitas requisições. Tente novamente em 12 segundos.',
    );
  });

  it('falha de rede (TypeError) vira a mensagem de conexão', () => {
    expect(describeTrailError(new TypeError('Failed to fetch'), 7)).toMatch(/conectar ao servidor/);
  });

  it('um TypeError com "404" no texto continua sendo falha de rede', () => {
    expect(describeTrailError(new TypeError('404 NetworkError'), 7)).toMatch(/conectar ao servidor/);
  });
});
