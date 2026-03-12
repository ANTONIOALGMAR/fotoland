# 📸 Fotoland

![Angular](https://img.shields.io/badge/Angular-17.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.18-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4479A1?style=for-the-badge&logo=postgresql&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)

Fotoland é uma plataforma social moderna para compartilhamento de fotos e vídeos, construída com uma arquitetura robusta e escalável.

---

## 🚀 Funcionalidades Principais

### 🔐 Segurança & Autenticação
- **Proteção de Rotas:** Acesso restrito a usuários autenticados via `AuthGuard`.
- **JWT (JSON Web Token):** Autenticação segura com injeção de token via `AuthInterceptor`.
- **Gestão de Sessão:** Logout seguro com limpeza de tokens e redirecionamento.

### 📱 Experiência do Usuário (UI/UX)
- **Design Responsivo:** Interface moderna utilizando Tailwind CSS.
- **Feed Global:** Visualize álbuns e posts de todos os usuários.
- **Perfis Personalizáveis:** Edite suas informações, username e foto de perfil.
- **Notificações em Tempo Real:** Acompanhe interações e atualizações.

### 💬 Comunicação & Interação
- **Chat em Tempo Real:** Comunicação privada e coletiva via WebSockets (StompJS/SockJS).
- **Sistema de Comentários:** Interaja diretamente nos posts dos usuários.
- **Explorar:** Busca avançada de posts por legenda, tipo (foto/vídeo) e autor.

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework:** Angular 17
- **Estilização:** Tailwind CSS
- **Comunicação Real-time:** StompJS & SockJS
- **Estado & Rotas:** Angular Router & RxJS

### Backend
- **Framework:** Spring Boot 3.3.0
- **Linguagem:** Java 17
- **Banco de Dados:** PostgreSQL (Produção) / H2 (Desenvolvimento)
- **Segurança:** Spring Security & JWT
- **Armazenamento de Mídia:** AWS S3

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- Node.js (>= 18.18.0)
- Java 17
- Maven
- Docker (Opcional)

### Backend
1. Navegue até o diretório do backend:
   ```bash
   cd fotoland-backend
   ```
2. Execute localmente:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Ou utilize Docker:
   ```bash
   docker-compose up
   ```

### Frontend
1. Navegue até o diretório do frontend:
   ```bash
   cd fotoland-frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

---

## 📈 Roadmap de Evolução

- [x] **Sistema de Curtidas:** Adicionar "Like" aos posts.
- [x] **Seguidores:** Implementar sistema de "Seguir/Seguidores".
- [ ] **Melhorias de Performance:** Otimização de carregamento de imagens.
- [ ] **PWA:** Tornar a plataforma instalável em dispositivos móveis.
- [ ] **Internacionalização (i18n):** Suporte a múltiplos idiomas.

---

## 🤝 Contribuindo

1. Faça um Fork do projeto.
2. Crie uma Branch para sua feature (`git checkout -b feature/NovaFeature`).
3. Commit suas mudanças (`git commit -m 'Adicionando nova feature'`).
4. Push para a Branch (`git push origin feature/NovaFeature`).
5. Abra um Pull Request.

---

Desenvolvido por [Antonio Algmar](https://github.com/ANTONIOALGMAR) 🚀
