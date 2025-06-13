import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import getSwaggerOptions from "../docs/config/head.js";
import authMiddleware from "../middlewares/AuthMiddleware.js";
import rotasProdutos from "./produtoRoutes.js";
import rotasFornecedores from "./fornecedorRoutes.js";
import rotasUsuarios from "./usuarioRoutes.js";
import rotasMovimentacoes from './movimentacaoRoutes.js';
import rotasAuth from './authRoutes.js'; // Importando as rotas de autenticação

import dotenv from "dotenv";

dotenv.config();

const routes = (app) => {
  
  // Rota para encaminhar da raiz para /docs
  app.get("/", (req, res) => {
    res.redirect("/docs");
  });

  // Configuração do Swagger
  const swaggerDocs = swaggerJsDoc(getSwaggerOptions());
  app.use(swaggerUI.serve);
  app.get("/docs", (req, res, next) => {
    swaggerUI.setup(swaggerDocs)(req, res, next);
  });

  // Rotas de autenticação (não precisam de autenticação)
  app.use(express.json(), rotasAuth);
  
  // Rotas protegidas (precisam de autenticação)
  app.use(
    express.json(),
    authMiddleware, // Aplicando o middleware de autenticação
    rotasProdutos,
    rotasFornecedores,
    rotasUsuarios,
    rotasMovimentacoes
  );

  // Se não é nenhuma rota válida, produz 404
  app.use((req, res) => {
    res.status(404).json({ message: "Rota não encontrada" });
  });
};

export default routes;