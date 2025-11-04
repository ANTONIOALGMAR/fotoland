# Fotoland

Fotoland é uma plataforma social completa, estilo full-stack, projetada para compartilhar fotos em álbuns.

## Tecnologias Utilizadas

- **Frontend:** Angular 17, Tailwind CSS
- **Backend:** Java 17, Spring Boot 3, Maven
- **Banco de Dados:** PostgreSQL
- **Containerização:** Docker

## Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas em sua máquina:

- [Git](https://git-scm.com/)
- [Java 17 ou superior](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- [Apache Maven](https://maven.apache.org/download.cgi)
- [Node.js e npm](https://nodejs.org/)
- [Docker e Docker Compose](https://www.docker.com/products/docker-desktop)

## Instalação e Execução

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento local.

### 1. Clone o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd fotoland
```

## Perfis (dev/prod) e Segurança

- Perfis
  - `dev` (padrão): usa Postgres local via `docker-compose`.
  - `prod`: usa Neon; exige `DB_PASSWORD` via variável de ambiente.
  - Seletor de perfil:
    - `SPRING_PROFILES_ACTIVE=dev` para desenvolvimento
    - `SPRING_PROFILES_ACTIVE=prod` para produção

- Variáveis de ambiente
  - Obrigatória:
    - `JWT_SECRET`: chave com 32+ bytes (Base64 recomendado).
  - Banco (prod):
    - `DB_PASSWORD`: senha do usuário `neondb_owner` no Neon.
  - Upload (S3) — configurar quando for usar uploads:
    - `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_S3_ENDPOINT`

- Comandos (DEV com Docker)
  - Subir Postgres local:
    ```bash
    cd fotoland-backend && docker-compose up -d
    ```
  - Backend com perfil `dev`:
    ```bash
    export JWT_SECRET="wK0ZKqYHkGNSgF0zU0ZlYlZpQG5KM3JwR2pTQ2hVaHc="
    ```
    ```bash
    SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
    ```
  - Frontend:
    ```bash
    cd fotoland-frontend && npm install
    ```
    ```bash
    npm start
    ```

- Comandos (PROD com Neon)
  - Backend com perfil `prod`:
    ```bash
    export JWT_SECRET="wK0ZKqYHkGNSgF0zU0ZlYlZpQG5KM3JwR2pTQ2hVaHc="
    ```
    ```bash
    export DB_PASSWORD="<sua_senha_do_neon>"
    ```
    ```bash
    SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run
    ```

- Boas práticas de segurança
  - Não versione segredos; use variáveis de ambiente e proteja-as no CI/CD.
  - CORS restrito a `localhost` e domínios Render já configurados no backend.
  - `csrf` desabilitado por ser API stateless com JWT; mantenha assim para APIs.
  - Em produção, desative logs verbosos (`spring.jpa.show-sql=false`).
  - Considere migrações de banco com Flyway no futuro para evitar `ddl-auto` em `prod`.
  - JWT no `localStorage`: simples e funcional. Para máxima proteção contra XSS, futuro upgrade para cookies `HttpOnly` + proxy seria ideal.

### 2. Backend (Java/Spring Boot)

**a. Banco de Dados (Dev com Docker):**
```bash
cd fotoland-backend && docker-compose up -d
```

**b. Variáveis essenciais (DEV):**
```bash
export JWT_SECRET="wK0ZKqYHkGNSgF0zU0ZlYlZpQG5KM3JwR2pTQ2hVaHc="
```
```bash
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

**c. Variáveis essenciais (PROD/Neon):**
```bash
export JWT_SECRET="wK0ZKqYHkGNSgF0zU0ZlYlZpQG5KM3JwR2pTQ2hVaHc="
```
```bash
export DB_PASSWORD="<sua_senha_do_neon>"
```
```bash
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run
```

O backend é responsável por toda a lógica de negócio e pela API.

**a. Inicie o Banco de Dados com Docker:**

O projeto utiliza Docker para rodar um container PostgreSQL, facilitando a configuração do banco de dados.

```bash
cd fotoland-backend
docker-compose up -d
```

Este comando irá baixar a imagem do PostgreSQL e iniciar um container com o banco de dados `fotolanddb`.

**b. Execute a Aplicação Spring Boot:**

Com o banco de dados no ar, inicie a aplicação backend.

```bash
# Dentro da pasta fotoland-backend
./mvnw spring-boot:run
```

O servidor backend estará disponível em `http://localhost:8080`.

### 3. Frontend (Angular)

O frontend é a interface com o usuário, construída em Angular.

**a. Instale as Dependências:**

Abra um novo terminal, navegue até a pasta do frontend e instale os pacotes necessários.

```bash
cd fotoland-frontend
npm install
```

**b. Execute o Servidor de Desenvolvimento:**

```bash
# Dentro da pasta fotoland-frontend
npm start
```

O servidor de desenvolvimento do Angular será iniciado.

## Acessando a Aplicação

Após seguir todos os passos, a aplicação estará rodando e acessível em seu navegador no endereço:

[**http://localhost:4200**](http://localhost:4200)

Você pode criar uma nova conta, fazer login e começar a usar a plataforma para criar álbuns e postar fotos.

## Arquitetura e Funcionalidades

- Autenticação JWT:
  - Registro em `/api/auth/register` e login em `/api/auth/login`.
  - JWT é salvo no `localStorage` do navegador como `jwt_token`.
- Upload de arquivos:
  - Endpoint público `/api/upload` aceita `multipart/form-data` com campo `file`.
  - Retorna `{"fileUrl":"https://.../bucket/uuid_nome.ext"}` em sucesso.
- Perfil do usuário:
  - Endpoint protegido `/api/user/me` retorna dados do usuário autenticado.
- Conteúdo:
  - Álbuns, posts e comentários, com criação/edição protegida e listagem pública.
- Frontend:
  - Interceptor adiciona `Authorization: Bearer <token>` automaticamente em rotas protegidas e ignora endpoints públicos (auth e upload).
- CORS:
  - Backend permite origens `localhost` e domínios Render configurados.

## Configuração de Ambiente (Backend)

Defina as propriedades sensíveis antes de iniciar o backend:

- `jwt.secret`:
  - Chave para assinar tokens JWT (mínimo 256 bits).
  - Aceita Base64 ou texto bruto (se não for Base64, será usado como bytes); se tiver menos de 32 bytes, o backend falha.
  - Exemplo de chave em Base64 (apenas exemplo, troque por a sua):
    ```bash
    export JWT_SECRET="wK0ZKqYHkGNSgF0zU0ZlYlZpQG5KM3JwR2pTQ2hVaHc="  # 32+ bytes
    ```
    Configure no `application.properties` (se aplicável):
    ```
    jwt.secret=${JWT_SECRET}
    ```
- S3 (upload de arquivos):
  - `cloud.aws.region.static`: região (ex.: `us-east-1`).
  - `cloud.aws.s3.endpoint`: endpoint (ex.: `https://s3.us-east-1.amazonaws.com`).
  - `cloud.aws.s3.bucket-name`: nome do bucket (ex.: `fotoland`).

## Instalação e Execução (Resumo)

- Banco (Docker):
  ```bash
  cd fotoland-backend && docker-compose up -d
  ```
