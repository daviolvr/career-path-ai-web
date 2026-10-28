# CareerPath-AI Web

[![CI](https://github.com/daviolvr/career-path-ai-web/actions/workflows/ci.yml/badge.svg)](https://github.com/daviolvr/career-path-ai-web/actions/workflows/ci.yml)

Interface web do **CareerPath-AI**, plataforma que usa o Google Gemini para ajudar pessoas de tecnologia a planejar a carreira. O backend (API, regras de negócio e integração com o Gemini) fica em [`career-path-ai-api`](https://github.com/daviolvr/career-path-ai-api); este repositório contém só o cliente.

Telas principais: cadastro, login e recuperação de senha; **análise de currículo** (upload de PDF), **guia de entrevista** (PDF + descrição da vaga) e **trilha de desenvolvimento** (formulário), cada uma com histórico; configurações da conta (editar nome, redefinir senha, excluir conta). A trilha de desenvolvimento pode ser exportada em PDF.

> Projeto acadêmico em evolução, usado também como peça de portfólio. A seção [Limitações](#limitações) diz o que **não** foi verificado.

## Tecnologias

React 19, React Router 7, Vite 7, ESLint 9 e jsPDF (exporta a trilha em PDF). Sem TypeScript e sem biblioteca de componentes.

## Como executar

Pré-requisitos: Node.js 22 (usado no CI) e o [backend](https://github.com/daviolvr/career-path-ai-api) rodando.

```bash
npm ci
cp .env.example .env     # ajuste VITE_API_URL se o backend não estiver em localhost:8000
npm run dev              # http://localhost:5173
```

| Variável | Para quê |
|---|---|
| `VITE_API_URL` | URL base da API, sem barra no final (padrão: `http://localhost:8000`). O Vite a **embute no bundle**, então ela é pública: não coloque segredos aqui. |

O backend só aceita requisições da origem configurada em `FRONTEND_HOST`; para o servidor de desenvolvimento, use `http://localhost:5173`.

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento do Vite |
| `npm run lint` | ESLint em todo o projeto |
| `npm run build` | build de produção em `dist/` |
| `npm run preview` | serve o build localmente |

## Como conversa com a API

O contrato completo (rotas, formato de erro, limites de requisição) está na documentação do [backend](https://github.com/daviolvr/career-path-ai-api). O que o cliente faz:

- **Tokens:** guarda `access_token` e `refresh_token` no `localStorage` (ver [Limitações](#limitações)).
- **Renovação automática** (`src/utils/apiClient.js`, ativada pelo `fetchInterceptor`): ao receber `401`, chama `POST /auth/refresh` uma única vez (requisições simultâneas esperam na mesma fila) e repete a requisição. O backend **rotaciona** o refresh token: a resposta traz um novo, que o cliente passa a guardar; o anterior deixa de valer. Se a renovação falhar, remove os tokens e o usuário do `localStorage` e vai para `/login`.
- **Erros:** lê o envelope `{"error": {"status", "code", "message", "details?"}}` (`src/utils/errorMessage.js`), preferindo as mensagens por campo de `details`.

## Qualidade

- **CI** (GitHub Actions): `npm run lint` e `npm run build`.
- **Não há testes automatizados** do frontend.

## Limitações

- **Sem testes automatizados.** O comportamento no navegador (renovação de sessão, várias abas, fluxos de erro) não é coberto por testes e **não foi verificado de forma sistemática**.
- **JWT em `localStorage`**, exposto a roubo por XSS. A alternativa (cookie `HttpOnly` com proteção CSRF) exigiria mudanças no backend e não foi implementada.
- **Erros que o usuário não vê:** em algumas telas o erro é registrado no estado, mas **não é exibido**. Por exemplo, ao excluir a conta com a senha errada e ao pedir o link de recuperação de senha com falha, nada aparece na tela (`ExcludePage`, `RecoveryPage`; em `ConfigPage` isso vale para o erro do link de redefinição).
- **Não verifiquei** como as telas reagem aos erros `429` (limite de requisições) e `503` (serviço indisponível) do backend, nem a erros de validação `422` por campo fora dos formulários que já leem o envelope.
- A tela da trilha (`DevelopmentTrailPage`) decide o que mostrar a partir do **texto** da mensagem de erro, o que é frágil.
- O `Dockerfile` em `docker/` roda o **servidor de desenvolvimento** do Vite (`npm run dev`), não um build de produção, e usa Node 20 enquanto o CI usa Node 22.
- `axios` consta nas dependências, mas nenhum arquivo de `src/` o usa.
