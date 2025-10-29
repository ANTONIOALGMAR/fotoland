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

### 2. Backend (Java/Spring Boot)

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
