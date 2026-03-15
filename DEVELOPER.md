# Fotoland - Guia do Desenvolvedor

Este documento visa auxiliar novos desenvolvedores na manutenção e expansão do projeto Fotoland.

## 🏗️ Arquitetura do Projeto

O Fotoland é uma aplicação Full Stack dividida em dois diretórios principais:

- **fotoland-backend/**: API REST baseada em Spring Boot (Java 17).
- **fotoland-frontend/**: Aplicação Single Page (SPA) baseada em Angular 17.

### Backend (Spring Boot)
- **Segurança**: Utiliza Spring Security com JWT e Cookies seguros.
- **Banco de Dados**: PostgreSQL (Hospedado no Neon.tech em produção).
- **Storage**: Integração com AWS S3 para armazenamento de mídias.
- **WebSocket**: Utilizado para notificações em tempo real e chat.

### Frontend (Angular)
- **Navegação**: Sistema de Sidebar (Desktop) e Bottom Nav (Mobile).
- **Internacionalização**: @ngx-translate para suporte a PT/EN.
- **Estilização**: Tailwind CSS + CSS puro para efeitos de Glassmorphism.

## 🚀 Fluxo de Autenticação

1. O usuário realiza login em `/api/auth/login`.
2. O servidor gera um JWT e o envia através de um Cookie seguro e HttpOnly.
3. O `AuthInterceptor` no Angular garante que as requisições incluam as credenciais.

## 🛠️ Comandos Úteis

### Backend
```bash
mvn spring-boot:run           # Rodar localmente
mvn clean package -DskipTests # Gerar JAR de produção
```

### Frontend
```bash
npm install                   # Instalar dependências
ng serve                      # Iniciar servidor de dev (localhost:4200)
ng build --configuration prod # Gerar build de produção
```

## 📝 Padrões de Código

1. **Componentes Standalone**: Sempre prefira componentes standalone no Angular.
2. **DTOs**: No backend, nunca exponha entidades JPA diretamente. Use DTOs localizados em `com.fotoland.backend.dto`.
3. **Internacionalização**: Sempre adicione chaves de tradução em `assets/i18n/*.json` ao criar novos textos.

---
Desenvolvido por Antonio Algmar & Gemini CLI.
