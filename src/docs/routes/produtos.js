import commonResponses from "../schemas/swaggerCommonResponses.js";

const produtosRoutes = {
    "/api/produtos": {
        get: {
            tags: ["Produtos"],
            summary: "Lista todos os produtos",
            description: `
            Lista todos os produtos cadastrados no sistema com suporte a paginação e filtros.
            
            **Funcionalidades:**
            - Paginação automática
            - Filtros por categoria, fornecedor, status
            - Busca por nome ou código
            - Ordenação customizável
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
                    name: "categoria",
                    in: "query",
                    description: "Filtrar por categoria",
                    schema: { type: "string", example: "Freios" }
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
                    schema: { type: "string", example: "pastilha" }
                }
            ],
            responses: {
                200: {
                    description: "Produtos listados com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/ProdutosList" }
                        }
                    }
                },
                401: commonResponses[401](),
                403: commonResponses[403](),
                500: commonResponses[500]()
            }
        },
        post: {
            tags: ["Produtos"],
            summary: "Cadastra novo produto",
            description: `
            Cadastra um novo produto no sistema.
            
            **Funcionalidades:**
            - Validação de dados obrigatórios
            - Verificação de código único
            - Associação com fornecedor
            - Registro automático de logs
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/ProdutoCreate" }
                    }
                }
            },
            responses: {
                201: {
                    description: "Produto cadastrado com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/ProdutoCreateResponse" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                422: commonResponses[422](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/produtos/{id}": {
        get: {
            tags: ["Produtos"],
            summary: "Busca produto por ID",
            description: "Retorna os dados de um produto específico pelo seu ID.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e7f" }
                }
            ],
            responses: {
                200: {
                    description: "Produto encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/ProdutoResponse" }
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
            tags: ["Produtos"],
            summary: "Atualiza produto",
            description: `
            Atualiza os dados de um produto existente.
            
            **Funcionalidades:**
            - Atualização parcial de campos
            - Validação de dados
            - Preservação do histórico
            - Registro de logs de alteração
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e7f" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/ProdutoUpdate" }
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
        },
        delete: {
            tags: ["Produtos"],
            summary: "Exclui produto",
            description: `
            Exclui um produto do sistema (exclusão lógica).
            
            **Funcionalidades:**
            - Exclusão lógica (marca como inativo)
            - Verificação de dependências
            - Preservação do histórico
            - Registro de logs
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e7f" }
                }
            ],
            responses: {
                200: commonResponses[200](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                409: {
                    description: "Produto possui dependências e não pode ser excluído",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Produto não pode ser excluído pois possui movimentações associadas"
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

    "/api/produtos/estoque-baixo": {
        get: {
            tags: ["Produtos"],
            summary: "Lista produtos com estoque baixo",
            description: `
            Lista produtos que estão com estoque abaixo do mínimo definido.
            
            **Funcionalidades:**
            - Identificação automática de estoque baixo
            - Alertas para reposição
            - Filtros por categoria
            - Ordenação por criticidade
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "categoria",
                    in: "query",
                    description: "Filtrar por categoria",
                    schema: { type: "string", example: "Freios" }
                }
            ],
            responses: {
                200: {
                    description: "Produtos com estoque baixo listados",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/ProdutosEstoqueBaixo" }
                        }
                    }
                },
                401: commonResponses[401](),
                403: commonResponses[403](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/produtos/busca": {
        get: {
            tags: ["Produtos"],
            summary: "Busca produtos por critérios",
            description: `
            Busca produtos usando diferentes critérios de pesquisa.
            
            **Funcionalidades:**
            - Busca por nome (parcial)
            - Busca por código
            - Busca por categoria
            - Busca por fornecedor
            - Combinação de filtros
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "nome",
                    in: "query",
                    description: "Buscar por nome do produto",
                    schema: { type: "string", example: "freio" }
                },
                {
                    name: "codigo",
                    in: "query",
                    description: "Buscar por código do produto",
                    schema: { type: "string", example: "PF001" }
                },
                {
                    name: "categoria",
                    in: "query",
                    description: "Buscar por categoria",
                    schema: { type: "string", example: "Freios" }
                },
                {
                    name: "fornecedor",
                    in: "query",
                    description: "Buscar por nome do fornecedor",
                    schema: { type: "string", example: "Auto Peças Sul" }
                }
            ],
            responses: {
                200: {
                    description: "Produtos encontrados",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/ProdutosList" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/produtos/desativar/{id}": {
        patch: {
            tags: ["Produtos"],
            summary: "Desativa produto",
            description: "Desativa um produto, mantendo-o no sistema mas indisponível para novas operações.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e7f" }
                }
            ],
            responses: {
                200: commonResponses[200](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/produtos/reativar/{id}": {
        patch: {
            tags: ["Produtos"],
            summary: "Reativa produto",
            description: "Reativa um produto previamente desativado.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e7f" }
                }
            ],
            responses: {
                200: commonResponses[200](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    }
};

export default produtosRoutes;
