import authPaths from "../routes/auth.js";
import usuariosPaths from "../routes/usuarios.js";
import authSchemas from "../schemas/authSchema.js";
import usuariosSchemas from "../schemas/usuariosSchema.js";
import gruposPaths from "../routes/grupos.js";
import gruposSchemas from "../schemas/gruposSchema.js";
import unidadesPaths from "../routes/unidades.js";
import unidadesSchemas from "../schemas/unidadesSchema.js";
import rotasPaths from "../routes/rotas.js";
import rotasSchemas from "../schemas/rotasSchema.js";
import cursoPaths from "../routes/cursos.js";
import cursosSchemas from "../schemas/cursosSchema.js";
import estudantesPaths from "../routes/estudantes.js";
import estudantesSchemas from "../schemas/estudantesSchema.js";
import turmasPaths from "../routes/turmas.js";
import turmasSchemas from "../schemas/turmasSchema.js";
import estagiosPaths from "../routes/estagios.js";
import estagiosSchemas from "../schemas/estagiosSchema.js";
import projetosPaths from "../routes/projetos.js";
import projetosSchemas from "../schemas/projetosSchema.js";
import refeicoesPaths from "../routes/refeicoes.js";
import refeicoesSchemas from "../schemas/refeicoesSchema.js";
import refeicoesTurmasPaths from "../routes/refeicoesTurmas.js";
import refeicoesTurmasSchemas from "../schemas/refeicoesTurmasSchema.js";
import suppliersPaths from "../routes/supplier.js";
import suppliersSchemas from "../schemas/suppliersSchema.js";

// Função para definir as URLs do servidor dependendo do ambiente
const getServersInCorrectOrder = () => {
    const devUrl = { url: process.env.SWAGGER_DEV_URL || "http://localhost:5011" };
    const prodUrl1 = { url: process.env.SWAGGER_PROD_URL || "https://edurondon.tplinkdns.com/meals" };

    if (process.env.NODE_ENV === "production") return [prodUrl1, devUrl];
    else return [devUrl, prodUrl1];
};

// Função para obter as opções do Swagger
const getSwaggerOptions = () => {
    return {
        swaggerDefinition: {
            openapi: "3.0.0",
            info: {
                title: "API MEALS",
                version: "1.0-alpha",
                description: "API MEALS \n\nÉ necessário autenticar com token JWT antes de utilizar a maioria das rotas, faça isso na rota /login com um email e senha válido. Esta API conta com refresh token, que pode ser obtido na rota /token, e com logout, que pode ser feito na rota /logout. Para revogação de acesso de terceiros um perfil de administrador pode usar a rota /token/revoke Para mais informações, acesse a documentação.",
                contact: {
                    name: "Gilberto Silva",
                    email: "gilberto.silva@ifro.edu.br",
                },
            },
            servers: getServersInCorrectOrder(),
            tags: [
                {
                    name: "Auth",
                    description: "Rotas para autenticação e autorização"
                },
                {
                    name: "Usuários",
                    description: "Rotas para gestão de usuários"
                },
                {
                    name: "Grupos",
                    description: "Rotas para gestão de grupos"
                },
                {
                    name: "Rotas",
                    description: "Rotas para gestão de rotas disponíveis nesta API"
                },
                {
                    name: "Unidades",
                    description: "Rotas para gestão de unidades"
                },
                /**
                 * Rotas do sistema de referição
                 */
                {
                    name: "Estudantes",
                    description: "Rotas para gestão de estudantes"
                },
                {
                    name: "Cursos",
                    description: "Rotas para gestão de cursos"
                },
                {
                    name: "Turmas",
                    description: "Rotas para gestão de turmas"
                },
                {
                    name: "Estágios",
                    description: "Rotas para gestão de estágios"
                },
                {
                    name: "Projetos",
                    description: "Rotas para gestão de projetos"
                },
                {
                    name: "Refeições",
                    description: "Rotas para gestão de refeições"
                },
                {
                    name: "RefeiçõesTurmas",
                    description: "Rotas para gestão de refeições por turmas"
                },
                {
                    name: "Fornecedores",
                    description: "Rotas para gestão de fornecedores"
                }
            ],
            paths: {
                ...authPaths,
                ...usuariosPaths,
                ...gruposPaths,
                ...unidadesPaths,
                ...rotasPaths,
                /**
                 * Rotas do sistema de referição
                 */
                ...cursoPaths,
                ...estudantesPaths,
                ...turmasPaths,
                ...estagiosPaths,
                ...projetosPaths,
                ...refeicoesPaths,
                ...refeicoesTurmasPaths,
                ...suppliersPaths


            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                },
                schemas: {
                    ...authSchemas,
                    ...usuariosSchemas,
                    ...gruposSchemas,
                    ...unidadesSchemas,
                    ...rotasSchemas,

                    /**
                     * Schemas do sistema de referição
                     */
                    ...cursosSchemas,
                    ...estudantesSchemas,
                    ...turmasSchemas,
                    ...estagiosSchemas,
                    ...projetosSchemas,
                    ...refeicoesSchemas,
                    ...refeicoesTurmasSchemas,
                    ...suppliersSchemas

                }
            },
            security: [{
                bearerAuth: []
            }]
        },
        apis: ["./src/routes/*.js"]
    };
};

export default getSwaggerOptions;
