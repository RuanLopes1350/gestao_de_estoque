import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import authMiddleware from "../middlewares/AuthMiddleware.js";
import rotasProdutos from "./produtoRoutes.js";
import rotasFornecedores from "./fornecedorRoutes.js";
import rotasUsuarios from "./usuarioRoutes.js";
import rotasMovimentacoes from './movimentacaoRoutes.js';
import rotasAuth from './authRoutes.js';
import rotasLogs from './logRoutes.js';
import rotasGrupos from './grupoRoutes.js';
import dotenv from "dotenv";

dotenv.config();

const routes = (app) => {
  
  // Configuração do Swagger
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Sistema de Gestão de Estoque API',
        version: '1.0.0',
        description: 'API para gerenciamento de estoque, produtos, fornecedores e usuários'
      },
      servers: [
        {
          url: process.env.API_URL || 'http://localhost:3000',
          description: 'Servidor da API'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    apis: [
      './src/routes/*.js',
      './src/docs/**/*.js'
    ]
  };
  
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUI.serve);
  app.get('/api-docs', swaggerUI.setup(swaggerDocs));
  
  // Rota para encaminhar da raiz para a documentação
  app.get("/", (req, res) => {
    res.redirect("/api-docs");
  });

  // Rotas públicas (não necessitam de autenticação)
  app.use("/auth", express.json(), rotasAuth);
  
  // Rotas protegidas (precisam de autenticação)
  app.use("/api/produtos", express.json(), authMiddleware, rotasProdutos);
  app.use("/api/fornecedores", express.json(), authMiddleware, rotasFornecedores);
  app.use("/api/usuarios", express.json(), authMiddleware, rotasUsuarios);
  app.use("/api/grupos", express.json(), authMiddleware, rotasGrupos);
  app.use("/api/movimentacoes", express.json(), authMiddleware, rotasMovimentacoes);
  app.use("/api/logs", express.json(), rotasLogs); // Logs já têm authMiddleware internamente

  // Se não é nenhuma rota válida, produz 404
  app.use((req, res) => {
    res.status(404).json({ message: "Rota não encontrada" });
  });
};

export default routes;