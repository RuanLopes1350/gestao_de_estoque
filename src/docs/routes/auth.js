import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";

const authRoutes = {
    "/login": {
        post: {
            tags: ["Auth"],
            summary: "Realiza login",
            description: "Rota para realizar login no sistema, usando o email e senha do usuário.",
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            "$ref": "#/components/schemas/loginPost"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioRespostaLogin"),
                400: commonResponses[400](),
                422: commonResponses[422](),
            }
        }
    },
    "/recuperasenha": {
        post: {
            tags: ["Auth"],
            summary: "Solicita recuperação de senha",
            description: "Rota para solicitar recuperação de senha, enviando um email para o usuário.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/RequisicaoRecuperaSenha" }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/RespostaRecuperaSenha"),
                400: commonResponses[400](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    },
    "/logout": {
        post: {
            tags: ["Auth"],
            summary: "Realiza logout",
            description: "Rota para realizar logout do sistema, usando o token de autenticação, access token. Após a execução, o token não será mais válido. Sendo o usuário obrigado a fazer login novamentem, usando o email e senha do usuário em /login",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTYzMjIwOTg4NWQ4ZTgzNzhlZTU5MCIsIm5vbWUiOiJKb8OjbyBkYSBTaWx2YSIsImVtYWlsIjoiam9hb0BlbWFpbC5jb20iLCJpYXQiOjE2ODg3NzQwMjMsImV4cCI6MTY4ODc4MTIyM30.iZvQN6NiGQ9GE1W2UpdUTv5YbDHH8ULsOyLtEockkqc" }
                            },
                            required: ["token"]
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200](),
                400: commonResponses[400](),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },
    "/pass": {
        post: {
            tags: ["Auth"],
            summary: "Realiza verificação de token, quando os cliente quiserem saber se o token é válido",
            description: "Rota para verificar se o token é válido, usando o token de autenticação, access token. Após a execução, o token não será mais válido. Sendo o usuário obrigado a fazer login novamente, usando o email e senha do usuário em /login",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTYzMjIwOTg4NWQ4ZTgzNzhlZTU5MCIsIm5vbWUiOiJKb8OjbyBkYSBTaWx2YSIsImVtYWlsIjoiam9hb0BlbWFpbC5jb20iLCJpYXQiOjE2ODg3NzQwMjMsImV4cCI6MTY4ODc4MTIyM30.iZvQN6NiGQ9GE1W2UpdUTv5YbDHH8ULsOyLtEockkqc" }
                            },
                            required: ["token"]
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/RespostaPass"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },
    "/token": {
        post: {
            tags: ["Auth"],
            summary: "Rota para renovar o refresh token do usuário",
            description: "Rota para renovar o refresh token do usuário, usando o refresh token do usuário.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTYzMjIwOTg4NWQ4ZTgzNzhlZTU5MCIsIm5vbWUiOiJKb8OjbyBkYSBTaWx2YSIsImVtYWlsIjoiam9hb0BlbWFpbC5jb20iLCJpYXQiOjE2ODg3NzQwMjMsImV4cCI6MTY4ODc4MTIyM30.iZvQN6NiGQ9GE1W2UpdUTv5YbDHH8ULsOyLtEockkqc" }
                            },
                            required: ["token"]
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/RespostaLogin"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },
    "/token/revoke": {
        post: {
            tags: ["Auth"],
            summary: "Revoga token",
            description: "Rota para revogar o refresh token do usuário, usando o refresh token do usuário.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                id: { type: "string", example: "674fa21d79969d2172e78710" },
                            },
                            required: ["id"]
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200](),
                400: commonResponses[400](),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    }
};

export default authRoutes;
