import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import getSwaggerOptions from "../docs/config/head.js";
import logRoutes from "../middlewares/LogRoutesMiddleware.js";

import dotenv from "dotenv";



// importar as rotas/endpoints

dotenv.config();

const routes = (app) => {
    if (process.env.DEBUGLOG) {
        app.use(logRoutes);
    }
    // rota para encaminhar da raiz para /docs
    app.get("/", (req, res) => {
        res.redirect("/docs");
    }
    );

    const swaggerDocs = swaggerJsDoc(getSwaggerOptions());
    app.use(swaggerUI.serve);
    app.get("/docs", (req, res, next) => {
        swaggerUI.setup(swaggerDocs)(req, res, next);
    });

    app.use(express.json(),
        auth, 
        usuarios,
        grupos,
        rotas,
        unidades,
        
        cursos,
        turmas,
        estudantes,
        projetos,
        estagios,
        refeicaoTurmas,
        refeicoes
    );

};

export default routes;
