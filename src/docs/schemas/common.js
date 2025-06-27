const commonSchemas = {
    // Respostas de sucesso
    SuccessResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
                description: 'Indica se a operação foi bem-sucedida'
            },
            message: {
                type: 'string',
                example: 'Operação realizada com sucesso',
                description: 'Mensagem descritiva do resultado'
            },
            data: {
                type: 'object',
                description: 'Dados retornados pela operação'
            }
        }
    },

    // Respostas paginadas
    PaginatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'object',
                properties: {
                    docs: {
                        type: 'array',
                        items: {
                            type: 'object'
                        },
                        description: 'Array com os documentos da página atual'
                    },
                    totalDocs: {
                        type: 'integer',
                        example: 150,
                        description: 'Total de documentos'
                    },
                    limit: {
                        type: 'integer',
                        example: 10,
                        description: 'Limite de itens por página'
                    },
                    totalPages: {
                        type: 'integer',
                        example: 15,
                        description: 'Total de páginas'
                    },
                    page: {
                        type: 'integer',
                        example: 1,
                        description: 'Página atual'
                    },
                    pagingCounter: {
                        type: 'integer',
                        example: 1,
                        description: 'Contador de paginação'
                    },
                    hasPrevPage: {
                        type: 'boolean',
                        example: false,
                        description: 'Indica se há página anterior'
                    },
                    hasNextPage: {
                        type: 'boolean',
                        example: true,
                        description: 'Indica se há próxima página'
                    },
                    prevPage: {
                        type: 'integer',
                        nullable: true,
                        example: null,
                        description: 'Número da página anterior'
                    },
                    nextPage: {
                        type: 'integer',
                        nullable: true,
                        example: 2,
                        description: 'Número da próxima página'
                    }
                }
            }
        }
    },

    // Respostas de erro
    ErrorResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false,
                description: 'Indica que houve erro'
            },
            message: {
                type: 'string',
                example: 'Erro ao processar solicitação',
                description: 'Mensagem de erro'
            },
            error: {
                type: 'string',
                example: 'ValidationError',
                description: 'Tipo do erro'
            },
            statusCode: {
                type: 'integer',
                example: 400,
                description: 'Código de status HTTP'
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Timestamp do erro'
            },
            path: {
                type: 'string',
                example: '/api/produtos',
                description: 'Endpoint onde ocorreu o erro'
            }
        }
    },

    // Erro de validação
    ValidationErrorResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false
            },
            message: {
                type: 'string',
                example: 'Dados de entrada inválidos'
            },
            error: {
                type: 'string',
                example: 'ValidationError'
            },
            details: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        field: {
                            type: 'string',
                            example: 'email',
                            description: 'Campo com erro'
                        },
                        message: {
                            type: 'string',
                            example: 'Email deve ter formato válido',
                            description: 'Mensagem específica do erro'
                        },
                        value: {
                            type: 'string',
                            example: 'email_invalido',
                            description: 'Valor que causou o erro'
                        }
                    }
                }
            },
            statusCode: {
                type: 'integer',
                example: 400
            }
        }
    },

    // Parâmetros comuns de paginação
    PaginationParams: [
        {
            name: 'page',
            in: 'query',
            description: 'Número da página',
            schema: {
                type: 'integer',
                default: 1,
                minimum: 1
            }
        },
        {
            name: 'limit',
            in: 'query',
            description: 'Número de itens por página',
            schema: {
                type: 'integer',
                default: 10,
                minimum: 1,
                maximum: 100
            }
        }
    ],

    // Respostas comuns
    CommonResponses: {
        '400': {
            description: 'Dados de entrada inválidos',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ValidationErrorResponse'
                    }
                }
            }
        },
        '401': {
            description: 'Token de acesso inválido ou ausente',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ErrorResponse'
                    }
                }
            }
        },
        '403': {
            description: 'Acesso negado - permissões insuficientes',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ErrorResponse'
                    }
                }
            }
        },
        '404': {
            description: 'Recurso não encontrado',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ErrorResponse'
                    }
                }
            }
        },
        '409': {
            description: 'Conflito - recurso já existe',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ErrorResponse'
                    }
                }
            }
        },
        '500': {
            description: 'Erro interno do servidor',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ErrorResponse'
                    }
                }
            }
        }
    }
};

export default commonSchemas;
