import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, describeError } from '../utils/apiError';
import * as authService from './authService';

const file = () => new File(['conteúdo'], 'curriculo.pdf', { type: 'application/pdf' });

// Toda função exportada que faz uma requisição, com argumentos válidos. O teste "cobre todas as
// funções" abaixo falha se uma nova for exportada sem entrar aqui.
const REQUESTS = {
  registerUser: () => ['a@b.co', 'Maria Silva', 'Abcdef12'],
  loginUser: () => ['a@b.co', 'Abcdef12'],
  emailResetPassword: () => ['a@b.co'],
  resetPassword: () => ['token', 'Abcdef12'],
  uploadResume: () => [file()],
  excludeUser: () => ['Abcdef12'],
  EditUserName: () => ['Maria Silva'],
  getDevelopmentTrails: () => [],
  getDevelopmentTrailById: () => [1],
  getTotalDevelopmentTrail: () => [],
  getTotalAnalyzeResume: () => [],
  getTotalInterviewGuide: () => [],
  analyzeResume: () => [file()],
  analyzeInterviewGuide: () => ['Vaga de backend', file()],
  getResumeAnalysisById: () => [1],
  getResumeAnalyses: () => [],
  deleteResumeAnalysis: () => [1],
  getInterviewGuideById: () => [1],
  getInterviewGuides: () => [],
  deleteInterviewGuide: () => [1],
  createDevelopmentTrail: () => [{ name: 'Ana' }],
  deleteDevelopmentTrail: () => [1],
  getCurrentUser: () => [],
};

// Estas devolvem um valor neutro em vez de lançar quando a API responde 404.
const EMPTY_ON_404 = {
  getDevelopmentTrails: { development_trails: [], total_count: 0 },
  getResumeAnalyses: { analyses: [], total_count: 0 },
  getInterviewGuides: { interview_guides: [], total_count: 0 },
  getTotalDevelopmentTrail: 0,
  getTotalAnalyzeResume: 0,
};

function envelope(status, code, message) {
  return JSON.stringify({ error: { status, code, message } });
}

function respondWith(status, body, headers = {}) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status, headers })));
}

beforeEach(() => {
  vi.stubGlobal('localStorage', { getItem: () => 'token' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('authService', () => {
  it('cobre todas as funções exportadas que fazem requisições', () => {
    const exported = Object.keys(authService).filter((name) => name !== 'logout');

    expect(exported.sort()).toEqual(Object.keys(REQUESTS).sort());
  });

  describe.each(Object.keys(REQUESTS))('%s', (name) => {
    it('lança ApiError com status, código e Retry-After quando a API responde 429', async () => {
      respondWith(429, envelope(429, 'rate_limit_exceeded', 'Muitas requisições.'), {
        'Retry-After': '7',
      });

      const failure = await authService[name](...REQUESTS[name]()).catch((error) => error);

      expect(failure).toBeInstanceOf(ApiError);
      expect(failure.status).toBe(429);
      expect(failure.code).toBe('rate_limit_exceeded');
      expect(failure.retryAfter).toBe(7);
      expect(describeError(failure)).toBe('Muitas requisições. Tente novamente em 7 segundos.');
    });

    it('lança ApiError com a mensagem de fallback quando o corpo não é o envelope', async () => {
      respondWith(500, '<html>Internal Server Error</html>');

      const failure = await authService[name](...REQUESTS[name]()).catch((error) => error);

      expect(failure).toBeInstanceOf(ApiError);
      expect(failure.status).toBe(500);
      expect(failure.message).toMatch(/\S/);
      expect(failure.message).not.toMatch(/<html>/);
    });

    it('deixa passar a falha de rede (TypeError) para a tela tratar', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }));

      const failure = await authService[name](...REQUESTS[name]()).catch((error) => error);

      expect(failure).toBeInstanceOf(TypeError);
      expect(describeError(failure)).toMatch(/conectar ao servidor/);
    });
  });

  describe('404 que não é erro', () => {
    it.each(Object.entries(EMPTY_ON_404))('%s devolve um valor vazio', async (name, expected) => {
      respondWith(404, envelope(404, 'not_found', 'Nada aqui'));

      await expect(authService[name](...REQUESTS[name]())).resolves.toEqual(expected);
    });

    it('as demais funções continuam tratando o 404 como erro', async () => {
      respondWith(404, envelope(404, 'not_found', 'Trilha não encontrada'));

      const failure = await authService.getDevelopmentTrailById(1).catch((error) => error);

      expect(failure).toBeInstanceOf(ApiError);
      expect(failure.status).toBe(404);
      expect(failure.message).toBe('Trilha não encontrada');
    });
  });

  it('o login mantém o motivo de "Credenciais inválidas"', async () => {
    respondWith(401, envelope(401, 'invalid_credentials', 'Credenciais inválidas'));

    const failure = await authService.loginUser('a@b.co', 'errada').catch((error) => error);

    expect(describeError(failure)).toBe('Credenciais inválidas');
  });

  it('o logout continua fazendo logout local mesmo se a API falhar', async () => {
    respondWith(500, envelope(500, 'internal_error', 'erro'));

    await expect(authService.logout()).resolves.toEqual({ message: 'Logout realizado' });
  });

  it('as funções que exigem token falham sem chamar a API quando não há token', async () => {
    vi.stubGlobal('localStorage', { getItem: () => null });
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await expect(authService.getCurrentUser()).rejects.toThrow('Token de autenticação não encontrado');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
