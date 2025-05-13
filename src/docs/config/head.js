import authPaths from "../routes/auth.js";
import authSchemas from "../schemas/authSchema.js";

// Função para definir as URLs do servidor dependendo do ambiente
const getServersInCorrectOrder = () => {
    const devUrl = { url: process.env.SWAGGER_DEV_URL || "http://localhost:5011" };
    const prodUrl1 = { url: process.env.SWAGGER_PROD_URL || "https://edurondon.tplinkdns.com/event" };

    if (process.env.NODE_ENV === "production") return [prodUrl1, devUrl];
    else return [devUrl, prodUrl1];
};

// Função para obter as opções do Swagger
const getSwaggerOptions = () => {
    return {
        swaggerDefinition: {
            openapi: "3.0.0",
            info: {
                title: "API EVENT AUTH",
                version: "1.0-alpha",
                description: "API AUTH \n\nÉ necessário autenticar com token JWT antes de utilizar a maioria das rotas, faça isso na rota /login com um email e senha válido. Esta API conta com refresh token, que pode ser obtido na rota /token, e com logout, que pode ser feito na rota /logout. Para revogação de acesso de terceiros um perfil de administrador pode usar a rota /token/revoke Para mais informações, acesse a documentação.",
                contact: {
                    name: "Ruan Lopes",
                    email: "ruan.lopes@estudante.ifro.edu.br",
                },
            },
            servers: getServersInCorrectOrder(),
            tags: [
                {
                    name: "Auth",
                    description: "Rotas para autenticação e autorização"
                },
                {
                    name: "Rotas",
                    description: "Rotas para gestão de rotas disponíveis nesta API"
                },
                /**
                 * Rotas do sistema de referição
                 */
            ],
            paths: {
                ...authPaths,
                /**
                 * Rotas do sistema de referição
                 */
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
                    /**
                     * Schemas do sistema de referição
                     */
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
