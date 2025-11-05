# Fotoland

## Mudanças recentes
- Proteção de acesso: todas as telas (exceto `login` e `register`) exigem autenticação via `AuthGuard`. Rota raiz (`/`) protegida.
- UnauthGuard: impede acesso a `login` e `register` quando já autenticado.
- Sidebar oculta antes do login: exibida somente quando `isAuthenticated` é `true`.
- Cabeçalho padronizado: botões “Ir para privado/coletivo” somente nas telas de chat.
- Tela de login limpa: sem “Cancelar” e “Voltar”.
- Segurança pública: `backend_base_url` só pode ser alterado via `localStorage` em ambiente de desenvolvimento; logs sensíveis removidos em produção.

## Boas práticas de segurança em repositório público
- Nunca comitar credenciais ou tokens. Use variáveis de ambiente na plataforma de deploy.
- `AuthGuard` verifica token; `AuthInterceptor` injeta `Authorization: Bearer <token>`.
- Renovação/encerramento de sessão: `logout()` remove token e redireciona para `login`.
- CORS e domínio: backend disponível por `https://fotoland-backend.onrender.com`. Alterações de `backend_base_url` são permitidas apenas em dev.
- Logs: evite `console.log` em produção para endpoints sensíveis ou detalhes de erro do usuário.
- Build: use `ng build --configuration production` para minificar e desabilitar dev mode.

## Configuração de backend
- Local:
  ```bash
  ./mvnw -f fotoland-backend spring-boot:run
  ```
- Docker:
  ```bash
  docker-compose -f fotoland-backend/docker-compose.yml up
  ```
- Hospedado:
  - `localStorage.setItem('backend_base_url', 'https://fotoland-backend.onrender.com')` (apenas em dev).
  - `localStorage.removeItem('backend_base_url')` para voltar ao local.

## Desenvolvimento
```bash
npm --prefix fotoland-frontend run build

## Novas Telas (Fase 1)

- Perfil (`/profile`): visualizar/editar nome, username, telefone, endereço e foto.
- Configurações (`/settings`): alterar senha e gerenciar preferências básicas (UI).
- Ambas as rotas são protegidas por `AuthGuard`.

### Sidebar
- Adicionada seção “Conta” com links para Perfil e Configurações.
- Sidebar continua oculta para usuários não autenticados.

### Backend
- Os seguintes endpoints são utilizados pelo frontend:
  - `GET /api/user/me` — dados do usuário atual.
  - `PUT /api/user/me` — atualização de perfil.
  - `POST /api/user/me/change-password` — troca de senha.
  - `POST /api/upload` — upload de arquivos (foto de perfil).

> Nota: se seu backend ainda não expõe `PUT /api/user/me` e `POST /api/user/me/change-password`, ajuste os endpoints em `auth.service.ts` ou implemente-os no backend.

## Execução

- Frontend:
  ```bash
  npm --prefix fotoland-frontend run start
  ```

## Fase 2 — Explorar e Notificações

- Explorar (`/explore`): busca de posts por texto, tipo e autor usando `searchPosts`.
- Notificações (`/notifications`): listar notificações do usuário e marcar como lidas.
- Ambas protegidas por `AuthGuard`. Links adicionados na sidebar (Descobrir, Notificações).

### Endpoints backend esperados
- `GET /api/search/posts` — já utilizado pelo frontend.
- `GET /api/notifications/mine` — lista do usuário logado.
- `PUT /api/notifications/{id}/read` — marcar como lida.

> Caso seu backend use caminhos diferentes, ajuste em `auth.service.ts`.

## Build/Run
```bash
npm --prefix fotoland-frontend run build
```
```bash
npm --prefix fotoland-frontend run start
```
