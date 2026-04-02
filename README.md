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

### 1.1 Script de inicialização
Para garantir que o RabbitMQ/Postgres estejam prontos antes do backend, execute o script interno:
```bash
./scripts/start-backend.sh
```
Ele sobe os containers (RabbitMQ + Postgres), espera os healthchecks e inicia o `spring-boot:run`.

### 1.2 Deploy Docker / Render
Use o `Dockerfile` abaixo para criar a imagem final. A sequência multi-stage compila o backend e copia o JAR + script de inicialização.
```dockerfile
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY . .
RUN ./mvnw -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/fotoland-backend-0.0.1-SNAPSHOT.jar ./fotoland-backend.jar
COPY --from=builder /app/scripts/start-backend.sh ./scripts/start-backend.sh
RUN chmod +x ./scripts/start-backend.sh

ENTRYPOINT ["./scripts/start-backend.sh"]
```

No Render, defina o comando de startup exatamente como acima e configure as variáveis de ambiente listadas abaixo.

#### Variáveis necessárias (Render / outro host)
- `SPRING_PROFILES_ACTIVE=prod` (ou `dev` para habilitar logs/H2)
- `SPRING_DATASOURCE_URL=jdbc:postgresql://<postgres-host>:5432/<db-name>`
- `SPRING_DATASOURCE_USERNAME=<user>`
- `SPRING_DATASOURCE_PASSWORD=<senha>`
- `SPRING_RABBITMQ_HOST=<rabbitmq-host>`
- `SPRING_RABBITMQ_PORT=5672`
- `SPRING_RABBITMQ_USERNAME=<user>`
- `SPRING_RABBITMQ_PASSWORD=<senha>`
- `JWT_SECRET=<chave base64 com >=32 bytes>`
- `AWS_S3_BUCKET_NAME` e `AWS_S3_ENDPOINT` se usar S3
- `MAIL`/`SMS` credenciais se o fluxo precisa de envio

Não exponha `fotoland_jwt` no frontend; o backend entrega cookie HttpOnly para autenticação.

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

### 🧯 Camada assíncrona de notificações (RabbitMQ)
- O backend agora publica eventos `NotificationEvent` em vez de invocar o `NotificationService` diretamente, deixando RabbitMQ entregar os eventos de curtida, comentário, follow ou chat de forma escalável.
- Execute `docker compose up -d rabbitmq postgres` (o `docker-compose.yml` já registra o serviço `rabbitmq:3-management`, expondo 5672/15672 e um healthcheck `rabbitmqctl status`), depois rode a API; os listeners declararem as filas automaticamente.
- Para validar o fluxo, existe o teste `NotificationEventIntegrationTest`, que sobe um RabbitMQ via Testcontainers, publica um evento e espera até que a notificação seja persistida. Basta rodar `./mvnw test` (o container é baixado automaticamente na primeira execução).

### 📡 Observabilidade + métricas
- Micrometer/Prometheus estão habilitados (`micrometer-registry-prometheus`) e expõem `/actuator/prometheus` com métricas do broker graças ao binder `RabbitMetrics`.
- Os endpoints `health`, `info` e `prometheus` já estão expostos e incluo tags fixas (`management.metrics.tags.application=fotoland-backend`) para facilitar agregação.
- Se quiser integração com Prometheus/Grafana, direcione o scrape para `http://localhost:8080/actuator/prometheus` e monitore `rabbitmq.*` junto com métricas de heap, GC e latência.

---

## 🎨 Design System (Trend 2026)
- **Primária:** Emerald Green (`#10b981`)
- **Secundária:** Sky Blue (`#3b82f6`)
- **Dark BG:** Slate Deep (`#0f172a`)
- **Animações:** Cubic-Bezier para transições ultra-suaves.

---

Desenvolvido com ❤️ por [Antonio Algmar](https://github.com/ANTONIOALGMAR) & Gemini CLI 🚀
