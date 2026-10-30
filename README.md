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

### Docker (build de produção)

A imagem compila o app (Node 22) e serve os arquivos estáticos com nginx sem privilégios (usuário `nginx`, porta 8080). O `VITE_API_URL` é fixado **no build**:

```bash
docker build -f docker/Dockerfile -t career-path-web \
  --build-arg VITE_API_URL=http://localhost:8000 .
docker run --rm -p 5173:8080 career-path-web   # http://localhost:5173
```

Para subir tudo junto (API, banco, Redis e este frontend), use o `docker compose` do [backend](https://github.com/daviolvr/career-path-ai-api).

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento do Vite |
| `npm run lint` | ESLint em todo o projeto |
| `npm test` | testes (Vitest) |
| `npm run build` | build de produção em `dist/` |
| `npm run preview` | serve o build localmente |

## Como conversa com a API

O contrato completo (rotas, formato de erro, limites de requisição) está na documentação do [backend](https://github.com/daviolvr/career-path-ai-api). O que o cliente faz:

- **Tokens:** guarda `access_token` e `refresh_token` no `localStorage` (ver [Limitações](#limitações)).
- **Renovação automática** (`src/utils/apiClient.js`, ativada pelo `fetchInterceptor`): ao receber `401`, chama `POST /auth/refresh` uma única vez (requisições simultâneas esperam na mesma fila) e repete a requisição. O backend **rotaciona** o refresh token: a resposta traz um novo, que o cliente passa a guardar; o anterior deixa de valer. Se a renovação falhar, remove os tokens e o usuário do `localStorage` e vai para `/login`.
- **Erros:** toda falha de resposta vira um `ApiError` (`src/utils/apiError.js`) com `status`, `code`, `details` e o `Retry-After`, lidos do envelope `{"error": {"status", "code", "message", "details?"}}`. As telas chamam `describeError(err)`, que devolve a mensagem final: no `429` do limite de requisições diz quanto esperar (`Muitas requisições. Tente novamente em 59 segundos.`), no `401` diz que a sessão expirou (exceto credenciais inválidas), em falha de rede diz que não foi possível conectar, e um `5xx` inesperado nunca mostra o texto interno. As decisões usam `status` e `code`, nunca o texto da mensagem.

## Qualidade

- **CI** (GitHub Actions): `npm run lint`, `npm test`, `npm run build` e o build da imagem Docker.
- **Testes (Vitest):** cobrem a lógica de erro (`ApiError`, `describeError`, a mensagem da tela de trilha), a geração do PDF da trilha (gerado com o `jspdf` de verdade e conferido pelo texto, pelas páginas e pelo rodapé) e o contrato do `authService`: um teste percorre **todas** as funções exportadas e falha se alguma deixar de lançar `ApiError` ou se uma função nova ficar de fora. Usam `fetch` simulado. Em uma verificação manual, as mesmas funções também foram executadas contra a API real (422, 401, 429 com `Retry-After`, 403, 404, 502, sessão expirada e rede fora do ar) e produziram as mensagens esperadas; essa verificação não está automatizada.
- **Não há testes de telas** nem de fluxos no navegador.

## Limitações

- **Telas e fluxos sem testes.** O comportamento no navegador (renovação de sessão, várias abas, como cada tela exibe o erro) não é coberto por testes e **não foi verificado de forma sistemática**: a lógica que decide a mensagem é testada, mas a renderização não.
- **JWT em `localStorage`**, exposto a roubo por XSS. A alternativa (cookie `HttpOnly` com proteção CSRF) exigiria mudanças no backend e não foi implementada.
- **Mensagens de validação (`422`) misturam idiomas.** A API devolve as mensagens do Pydantic em inglês junto das próprias em português, então uma mesma tela pode exibir frases em dois idiomas. O frontend as mostra como vêm; traduzi-las é trabalho da API.
- **A `HomePage` ainda falha em silêncio:** os totais e as listas recentes só registram o erro no console e mostram `0` ou lista vazia, o que é indistinguível de "não há itens".
- A imagem Docker foi testada localmente (rotas do React Router, cache de assets, usuário não-root, healthcheck), mas **sem** cabeçalhos de segurança (CSP, HSTS) e sem TLS: isso fica para o proxy ou o provedor de hospedagem.
- **Dependências:** `npm audit` rodou **uma vez** e achou 22 avisos (1 crítico, no `jspdf`); foram corrigidos (o `axios`, sem uso, foi removido; `jspdf` subiu da 3.x para a 4.2.1) e o relatório saiu zerado. Ele **não roda no CI**, e a geração do PDF da trilha não tem teste automatizado: conferi no Node que as chamadas que a página usa produzem um PDF válido, mas não abri o arquivo no navegador.
