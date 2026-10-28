import { describe, expect, it } from 'vitest';

import { ApiError, buildApiError, describeError } from './apiError';

function response(status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(payload, { status, headers });
}

function envelope(status, code, message, extra = {}) {
  return { error: { status, code, message, ...extra } };
}

function apiError(status, code, message, retryAfter = null) {
  return new ApiError({ status, code, message, retryAfter });
}

describe('buildApiError', () => {
  it('lê status, código, mensagem e Retry-After do envelope da API', async () => {
    const res = response(
      429,
      envelope(429, 'rate_limit_exceeded', 'Muitas requisições. Tente novamente em alguns instantes.'),
      { 'Retry-After': '42' },
    );

    const error = await buildApiError(res, 'fallback');

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(429);
    expect(error.code).toBe('rate_limit_exceeded');
    expect(error.message).toBe('Muitas requisições. Tente novamente em alguns instantes.');
    expect(error.retryAfter).toBe(42);
  });

  it('junta as mensagens por campo de `details` em erros de validação', async () => {
    const res = response(
      422,
      envelope(422, 'request_validation_error', 'Request validation error', {
        details: [
          { field: 'email', message: 'E-mail inválido.' },
          { field: 'password', message: 'A senha é curta.' },
        ],
      }),
    );

    const error = await buildApiError(res, 'fallback');

    expect(error.message).toBe('E-mail inválido. A senha é curta.');
    expect(error.details).toHaveLength(2);
  });

  it.each([
    ['sem cabeçalho', {}],
    ['texto', { 'Retry-After': 'abc' }],
    ['zero', { 'Retry-After': '0' }],
    ['negativo', { 'Retry-After': '-5' }],
    ['decimal', { 'Retry-After': '1.5' }],
    ['data HTTP', { 'Retry-After': 'Wed, 21 Oct 2026 07:28:00 GMT' }],
  ])('ignora um Retry-After inválido (%s)', async (_name, headers) => {
    const res = response(429, envelope(429, 'rate_limit_exceeded', 'x'), headers);

    expect((await buildApiError(res, 'fallback')).retryAfter).toBeNull();
  });

  it.each([
    ['HTML de um proxy', '<html>Bad Gateway</html>'],
    ['corpo vazio', ''],
    ['JSON sem envelope', '{"detail": "legado"}'],
  ])('usa o fallback quando o corpo não é o envelope (%s)', async (_name, body) => {
    const error = await buildApiError(response(502, body), 'Erro ao buscar dados');

    expect(error.status).toBe(502);
    expect(error.code).toBeNull();
    expect(error.message).toBe('Erro ao buscar dados');
    expect(error.details).toEqual([]);
  });
});

describe('describeError', () => {
  it('trata falha de rede (TypeError do fetch) sem expor o texto do navegador', () => {
    const message = describeError(new TypeError('Failed to fetch'));

    expect(message).toMatch(/conectar ao servidor/);
    expect(message).not.toMatch(/Failed to fetch/);
  });

  it('mantém a mensagem de um erro local e usa o fallback se ela for vazia', () => {
    expect(describeError(new Error('Token de autenticação não encontrado'))).toBe(
      'Token de autenticação não encontrado',
    );
    expect(describeError(new Error(''), 'Algo falhou')).toBe('Algo falhou');
    expect(describeError(undefined, 'Algo falhou')).toBe('Algo falhou');
  });

  describe('429', () => {
    it.each([
      [1, 'em 1 segundo'],
      [30, 'em 30 segundos'],
      [60, 'em 1 minuto'],
      [90, 'em 2 minutos'],
      [3600, 'em 1 hora'],
      [7300, 'em 3 horas'],
      [null, 'em alguns instantes'],
    ])('nosso limite de requisições com Retry-After %s diz "%s"', (retryAfter, expected) => {
      const message = describeError(apiError(429, 'rate_limit_exceeded', 'texto da API', retryAfter));

      expect(message).toBe(`Muitas requisições. Tente novamente ${expected}.`);
    });

    it('a cota do provedor de IA mantém a mensagem da API e não promete um tempo', () => {
      const message = describeError(
        apiError(429, 'ai_quota_exceeded', 'Limite de uso do serviço de IA excedido. Tente novamente em alguns minutos.', 30),
      );

      expect(message).toBe('Limite de uso do serviço de IA excedido. Tente novamente em alguns minutos.');
    });
  });

  describe('401', () => {
    it('credenciais inválidas no login mantêm o motivo', () => {
      expect(describeError(apiError(401, 'invalid_credentials', 'Credenciais inválidas'))).toBe(
        'Credenciais inválidas',
      );
    });

    it.each(['http_error', 'unauthorized', null])('em qualquer outro caso (%s) é sessão expirada', (code) => {
      expect(describeError(apiError(401, code, 'Token é inválido ou está expirado'))).toBe(
        'Sua sessão expirou. Faça login novamente.',
      );
    });
  });

  it.each([
    [400, 'validation_error', 'Pelo menos um campo deve ser fornecido'],
    [403, 'invalid_password', 'Senha incorreta'],
    [404, 'not_found', 'Trilha não encontrada'],
    [409, 'email_already_registered', 'Esse email já está em uso'],
    [502, 'ai_timeout', 'O serviço de IA demorou demais para responder'],
    [502, 'ai_invalid_response', 'O serviço de IA devolveu uma resposta inválida'],
    [503, 'rate_limiter_unavailable', 'Serviço temporariamente indisponível. Tente novamente em instantes.'],
  ])('%s %s mostra a mensagem da API', (status, code, message) => {
    expect(describeError(apiError(status, code, message))).toBe(message);
  });

  it.each([500, 504, 599])('um %s inesperado mostra uma mensagem genérica', (status) => {
    const message = describeError(apiError(status, null, 'detalhe interno qualquer'));

    expect(message).toBe('O servidor encontrou um problema. Tente novamente em instantes.');
    expect(message).not.toMatch(/detalhe interno/);
  });

  it('usa o fallback se a API não trouxe mensagem', () => {
    expect(describeError(apiError(404, null, ''), 'Erro ao buscar trilha')).toBe('Erro ao buscar trilha');
  });
});
