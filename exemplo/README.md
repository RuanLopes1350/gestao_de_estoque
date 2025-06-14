# 🚀 User‑Service API (Node.js + MongoDB)

Microserviço responsável por **autenticação, autorização (RBAC)** e gestão de:

- Usuários, grupos, rotas, unidades
- **Domínios “Meals”**: cursos, turmas, estudantes, projetos, estágios, refeições individuais e por turma

Parte do ecossistema **Event Grid**, esta API REST expõe endpoints seguros com JWT (*access* + *refresh*), documentação OpenAPI 3 e suíte completa de testes.

---

## 📌 Índice

1. [Recursos](#recursos)
2. [Tecnologias](#tecnologias)
3. [Arquitetura & Estrutura](#arquitetura--estrutura)
4. [Guia rápido](#guia-rápido)
5. [Variáveis de ambiente](#variáveis-de-ambiente)
6. [Scripts NPM](#scripts-npm)
7. [Docker](#docker)
8. [Documentação da API](#documentação-da-api)
9. [Seeds](#seeds)
10. [Testes & Lint](#testes--lint)
11. [Contribuindo](#contribuindo)
12. [Licença](#licença)

---

## Recursos

| Domínio            | Endpoints                                                                                                                  | Observações                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Auth**           | `/login`, `/logout`, `/token`, `/token/revoke`, `/pass`                                                                    | JWT, refresh, revogação; upload de avatar opcional                                                       |
| **Usuários**       | `/usuarios`                                                                                                                | CRUD, foto 400×400 redimensionada via **Sharp**                                                          |
| **Grupos**         | `/grupos`                                                                                                                  | Permissões granulares de rotas                                                                           |
| **Rotas**          | `/rotas`                                                                                                                   | Registro dinâmico para RBAC                                                                              |
| **Unidades**       | `/unidades`                                                                                                                | Escopo físico/lógico                                                                                     |
| **Meals**          | `/cursos`, `/turmas`, `/estudantes`, `/estagios`, `/projetos`, `/refeicoes`, `/refeicoesTurmas`                            | Paginação, filtros, joins (populate)                                                                     |
| **CommonResponse** | Saída unificada + _error handler_ global                                                                                   |
| **Docs**           | `/api-docs` Swagger‑UI                                                                                                     | OpenAPI 3 gerada via `src/docs`                                                                          |

---

## Tecnologias

| Camada       | Libs                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Servidor     | **Node.js 18+**, **Express 4**, ES Modules                                                        |
| Segurança    | **Helmet**, **CORS**, **Compression**, **bcrypt**, **jsonwebtoken**                               |
| Persistência | **MongoDB 6** + **Mongoose 8** (`mongoose-paginate-v2`, `aggregate-paginate`)                     |
| Validação    | **Zod** em todos os DTOs                                                                          |
| Documentação | **swagger-ui-express**, **swagger-jsdoc**                                                         |
| Testes       | **Jest 29**, **mongodb-memory-server**, **supertest**, **sinon**                                  |
| Lint         | **ESLint 9** (config recomendada + regras extras)                                                 |
| Dev tools    | **nodemon**, **dotenv**, **winston** (`daily-rotate-file`)                                        |

---

## Arquitetura & Estrutura

Design inspirado em **arquitetura hexagonal**:  
**controllers → services → repositories → models**

---

## ⚡ Guia rápido

### 🔁 Clone

```bash
git clone https://github.com/<usuario>/user-service.git
cd user-service
```

### Dependências

```bash
npm install
```

### ⚙️ Variáveis de ambiente

```bash
cp .env.example .env # edite DB_URL, JWT_SECRET, etc.
```

### 🧪 Mongo local (opcional)

```bash
docker run -d --name mongo -p 27017:27017 mongo:6
```

### 🚀 Servidor dev (hot reload)

```bash
npm run dev
```

### 📄 Swagger UI

[http://localhost:5011/docs](http://localhost:5011/docs)

---

## Variáveis de ambiente

### Server

```
PORT=5011
NODE_ENV=development
```

### Database

```
DB_URL=mongodb://localhost:27017/user-service
```

### JWT

```
JWT_SECRET=uma-frase-super-secreta
JWT_EXPIRES_IN=1h
REFRESH_EXPIRES_IN=7d
```

### Swagger

```
SWAGGER_DEV_URL=http://localhost:5011
SWAGGER_PROD_URL=https://api.meudominio.com
```

---

## Scripts NPM

| Script           | Descrição                                         |
|------------------|---------------------------------------------------|
| `npm run dev`    | nodemon + hot reload                              |
| `npm start`      | Produção (node server.js)                         |
| `npm run seed`   | Executa `src/seeds/seeds.js` para popular o banco |
| `npm test`       | Testes com Jest e cobertura                       |
| `npx eslint .`   | Lint em todo o projeto                            |

---

## Docker 

### Build único

```bash
docker build -t user-service .
docker run -d --env-file .env -p 5011:5011 user-service
```

### Orquestração (Docker Compose)

`docker-compose.yml` já inclui o serviço:

```yaml
services:
  user-service:
    build: .
    container_name: user-service-container
    ports:
      - "5011:5011"
    command: "npm start"
    restart: always
```

---

## Documentação da API

- **Swagger‑UI**: `GET /api-docs`  
- **Spec JSON**: `GET /docs.json`

Principais **tags**:  
`Auth`, `Usuários`, `Grupos`, `Rotas`, `Unidades`, `Cursos`, `Turmas`, `Estudantes`, `Estágios`, `Projetos`, `Refeições`, `RefeiçõesTurmas`.

Todos os endpoints suportam paginação (`page`, `limit`) e filtros via query string.

---

## Seeds

Popule rapidamente o banco com dados realistas:

```bash
npm run seed
```

Cria mais de **2.500 registros** com `faker-br`, cobrindo:

- Unidades
- Rotas
- Grupos
- Usuários
- Cursos
- Turmas
- Estudantes
- Projetos
- Estágios
- Refeições

---

## Testes & Lint

### Testes unitários + cobertura

```bash
npm test
```

- Configurado com `ES Modules` (`babel-jest`)
- `mongodb-memory-server` cria banco em RAM
- `jest.setup.js` silencia logs (`console.log/error`) durante testes

### ESLint

```bash
npx eslint .
```

---

## Contribuindo

1. Fork → nova branch → pull request  
2. Mantenha o padrão `CommonResponse`  
3. Adicione/atualize testes para suas mudanças  
4. Nunca comite `secrets` (`.env`, `JWT_SECRET`, etc.)

---

## 📄 Licença

Distribuído sob a licença **MIT** © Gilberto Silva
