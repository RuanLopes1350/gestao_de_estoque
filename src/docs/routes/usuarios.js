import commonResponses from "../schemas/swaggerCommonResponses.js";

const usuariosRoutes = {
    "/api/usuarios": {
        get: {
            tags: ["Usuários"],
            summary: "Lista todos os usuários",
            description: `
            Lista todos os usuários cadastrados no sistema com suporte a paginação e filtros.
            
            **Funcionalidades:**
            - Paginação automática
            - Filtros por perfil, status, nome
            - Busca por texto
            - Ordenação customizável
            - Controle de acesso por perfil
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "page",
                    in: "query",
                    description: "Número da página",
                    schema: { type: "integer", default: 1, minimum: 1 }
                },
                {
                    name: "limit",
                    in: "query",
                    description: "Itens por página",
                    schema: { type: "integer", default: 10, minimum: 1, maximum: 100 }
                },
                {
                    name: "perfil",
                    in: "query",
                    description: "Filtrar por perfil",
                    schema: { type: "string", enum: ["administrador", "funcionario"], example: "funcionario" }
                },
                {
                    name: "ativo",
                    in: "query",
                    description: "Filtrar por status",
                    schema: { type: "boolean", example: true }
                },
                {
                    name: "nome",
                    in: "query",
                    description: "Buscar por nome (parcial)",
                    schema: { type: "string", example: "joão" }
                }
            ],
            responses: {
                200: {
                    description: "Usuários listados com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/UsuariosList" }
                        }
                    }
                },
                401: commonResponses[401](),
                403: commonResponses[403](),
                500: commonResponses[500]()
            }
        },
        post: {
            tags: ["Usuários"],
            summary: "Cadastra novo usuário",
            description: `
            Cadastra um novo usuário no sistema.
            
            **Funcionalidades:**
            - Validação de matrícula única
            - Validação de email único
            - Criptografia automática da senha
            - Definição de perfil de acesso
            - Registro automático de logs
            
            **Permissões:** Apenas administradores podem cadastrar usuários.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/UsuarioCreate" }
                    }
                }
            },
            responses: {
                201: {
                    description: "Usuário cadastrado com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/UsuarioCreateResponse" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                409: {
                    description: "Matrícula ou email já cadastrados",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Matrícula ou email já está cadastrado no sistema"
                                    }
                                }
                            }
                        }
                    }
                },
                422: commonResponses[422](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/usuarios/{matricula}": {
        get: {
            tags: ["Usuários"],
            summary: "Busca usuário por matrícula",
            description: `
            Retorna os dados de um usuário específico pela sua matrícula.
            
            **Permissões:** 
            - Administradores podem ver qualquer usuário
            - Funcionários podem ver apenas seus próprios dados
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "matricula",
                    in: "path",
                    required: true,
                    description: "Matrícula do usuário",
                    schema: { type: "string", example: "USR001" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/UsuarioResponse" }
                        }
                    }
                },
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        },
        patch: {
            tags: ["Usuários"],
            summary: "Atualiza usuário",
            description: `
            Atualiza os dados de um usuário existente.
            
            **Funcionalidades:**
            - Atualização parcial de campos
            - Validação de dados
            - Controle de permissões
            - Registro de logs de alteração
            
            **Permissões:**
            - Administradores podem alterar qualquer usuário
            - Funcionários podem alterar apenas alguns de seus próprios dados
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "matricula",
                    in: "path",
                    required: true,
                    description: "Matrícula do usuário",
                    schema: { type: "string", example: "USR001" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/UsuarioUpdate" }
                    }
                }
            },
            responses: {
                200: {
                    description: "Usuário atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/UsuarioUpdateResponse" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                422: commonResponses[422](),
                500: commonResponses[500]()
            }
        },
        delete: {
            tags: ["Usuários"],
            summary: "Exclui usuário",
            description: `
            Exclui um usuário do sistema (exclusão lógica).
            
            **Funcionalidades:**
            - Desativação do usuário
            - Invalidação de tokens ativos
            - Preservação do histórico
            - Registro de logs
            
            **Permissões:** Apenas administradores podem excluir usuários.
            **Regra:** Não é possível excluir o próprio usuário.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "matricula",
                    in: "path",
                    required: true,
                    description: "Matrícula do usuário",
                    schema: { type: "string", example: "USR001" }
                }
            ],
            responses: {
                200: commonResponses[200](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                409: {
                    description: "Não é possível excluir o próprio usuário",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Não é possível excluir o próprio usuário"
                                    }
                                }
                            }
                        }
                    }
                },
                500: commonResponses[500]()
            }
        }
    },

    "/api/usuarios/busca": {
        get: {
            tags: ["Usuários"],
            summary: "Busca usuário por matrícula específica",
            description: `
            Busca um usuário específico pela matrícula usando query parameter.
            
            **Funcionalidades:**
            - Busca exata por matrícula
            - Validação de acesso
            - Retorno de dados básicos
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "matricula",
                    in: "query",
                    required: true,
                    description: "Matrícula do usuário a buscar",
                    schema: { type: "string", example: "USR001" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/UsuarioResponse" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/usuarios/desativar/{id}": {
        patch: {
            tags: ["Usuários"],
            summary: "Desativa usuário",
            description: `
            Desativa um usuário do sistema (desativação lógica).
            
            **Funcionalidades:**
            - Marca usuário como inativo
            - Invalida tokens ativos do usuário
            - Preserva histórico de atividades
            - Registra ação nos logs do sistema
            
            **Permissões:** Apenas administradores podem desativar usuários.
            **Regra:** Não é possível desativar o próprio usuário.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do usuário a ser desativado",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e7f" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário desativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Usuário desativado com sucesso"
                                    },
                                    usuario: {
                                        "$ref": "#/components/schemas/UsuarioResponse"
                                    }
                                }
                            }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                409: {
                    description: "Não é possível desativar o próprio usuário",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Não é possível desativar o próprio usuário"
                                    }
                                }
                            }
                        }
                    }
                },
                500: commonResponses[500]()
            }
        }
    },

    "/api/usuarios/reativar/{id}": {
        patch: {
            tags: ["Usuários"],
            summary: "Reativa usuário",
            description: `
            Reativa um usuário que estava desativado no sistema.
            
            **Funcionalidades:**
            - Marca usuário como ativo novamente
            - Permite novo acesso ao sistema
            - Registra ação nos logs do sistema
            - Notifica por email sobre reativação
            
            **Permissões:** Apenas administradores podem reativar usuários.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do usuário a ser reativado",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e7f" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário reativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Usuário reativado com sucesso"
                                    },
                                    usuario: {
                                        "$ref": "#/components/schemas/UsuarioResponse"
                                    }
                                }
                            }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/usuarios/{matricula}/alterar-senha": {
        patch: {
            tags: ["Usuários"],
            summary: "Altera senha do usuário",
            description: `
            Permite que o usuário altere sua própria senha.
            
            **Funcionalidades:**
            - Validação da senha atual
            - Criptografia da nova senha
            - Invalidação de tokens ativos
            - Registro de logs de segurança
            
            **Permissões:** Usuários podem alterar apenas sua própria senha.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "matricula",
                    in: "path",
                    required: true,
                    description: "Matrícula do usuário",
                    schema: { type: "string", example: "USR001" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/AlterarSenhaRequest" }
                    }
                }
            },
            responses: {
                200: commonResponses[200](),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                422: commonResponses[422](),
                500: commonResponses[500]()
            }
        }
    }
};

export default usuariosRoutes;
