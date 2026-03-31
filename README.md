# 📸 Fotoland - 2026 Social Platform

![Angular](https://img.shields.io/badge/Angular-17.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.18-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-00AEEF?style=for-the-badge&logo=pwa&logoColor=white)

**Fotoland** é uma plataforma social moderna e imersiva para compartilhamento de momentos, construída com uma arquitetura robusta e uma interface futurista baseada nas tendências de UI/UX de 2026.

---

## 🚀 Novas Funcionalidades (Update 2026)

Implementamos as tecnologias mais recentes para elevar a experiência do usuário ao nível das gigantes do mercado:

### 🌑 Futuristic Dark Mode & Glassmorphism
- **Tema Híbrido:** Suporte nativo a Dark Mode com alternância em tempo real e persistência de preferência.
- **UI de Vidro (Glassmorphism):** Headers e Sidebars com efeitos de desfoque (backdrop-blur) e transparência, proporcionando um visual leve e moderno.
- **Mesh Gradients:** Fundo animado na tela de login com gradientes dinâmicos para uma recepção futurista.

### 📱 Experiência Mobile & PWA (Installable)
- **App Nativo via Navegador:** O Fotoland agora é um **Progressive Web App**. Você pode instalá-lo no Android, iOS ou Desktop e usá-lo com ícone próprio e sem as barras do navegador.
- **Performance Offline:** Service Workers garantem que o app abra instantaneamente.

### ⚡ Performance Visual (Skeleton Loaders)
- **Zero "Telas Brancas":** Implementamos Skeleton Loaders (esqueletos de carregamento) que pulsam enquanto os dados são buscados, eliminando a ansiedade de espera do usuário.

---

## 💡 Funcionalidades Principais

- **Feed Global Dinâmico:** Visualize álbuns e posts de todos os usuários com suporte a Double Tap (curtida rápida).
- **Stories:** Compartilhe momentos temporários com um player de story imersivo.
- **Chat em Tempo Real:** Comunicação privada e coletiva via WebSockets.
- **Exploração Avançada:** Aba de busca com Grid estilo Instagram e busca rápida de usuários por nickname.
- **Perfis Personalizáveis:** Gestão de álbuns, fotos de perfil e informações de usuário.

---

## 🛠️ Stack Tecnológica

### Frontend (Angular 17)
- **Standalone Components:** Arquitetura limpa e moderna.
- **Tailwind CSS:** Estilização responsiva e customizada.
- **RxJS:** Gestão de estado reativa.
- **ngx-translate:** Suporte completo a múltiplos idiomas (PT/EN).

### Backend (Spring Boot 3.3)
- **Spring Security + JWT:** Autenticação segura via Cookies HttpOnly (Proteção contra XSS).
- **PostgreSQL:** Banco de dados relacional robusto.
- **AWS S3:** Armazenamento escalável de imagens e vídeos.
- **WebSockets:** Notificações e mensagens instantâneas.

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js (>= 18.18.0)
- Java 17
- Maven

### 1. Backend
```bash
cd fotoland-backend
./mvnw spring-boot:run
```

### 2. Frontend
```bash
cd fotoland-frontend
npm install
npm start
```

### 3. Como instalar o App (PWA)
Para testar a instalação do app, você deve gerar o build de produção:
```bash
cd fotoland-frontend
npx ng build
npx http-server dist/fotoland-frontend/browser
```
*Acesse o link gerado e clique em **"Instalar App"** na barra de endereços do Chrome.*

---

## 🎨 Design System (Trend 2026)
- **Primária:** Emerald Green (`#10b981`)
- **Secundária:** Sky Blue (`#3b82f6`)
- **Dark BG:** Slate Deep (`#0f172a`)
- **Animações:** Cubic-Bezier para transições ultra-suaves.

---

Desenvolvido com ❤️ por [Antonio Algmar](https://github.com/ANTONIOALGMAR) & Gemini CLI 🚀
