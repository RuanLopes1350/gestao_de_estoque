const usuariosSchemas = {
    // Schema completo do usuário
    Usuario: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                description: "ID único do usuário",
                example: "60d5ecb74f8e4b2b3c8d6e7f"
            },
            nome_usuario: {
                type: "string",
                description: "Nome completo do usuário",
                example: "João Silva"
            },
            matricula: {
                type: "string",
                description: "Matrícula única do usuário",
                example: "USR001"
            },
            email: {
                type: "string",
                format: "email",
                description: "Email do usuário",
                example: "joao@empresa.com"
            },
            perfil: {
                type: "string",
                enum: ["administrador", "funcionario"],
                description: "Perfil do usuário",
                example: "funcionario"
            },
            ativo: {
                type: "boolean",
                description: "Status do usuário",
                example: true
            },
            online: {
                type: "boolean",
                description: "Status de conexão",
                example: false
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "Data de criação",
                example: "2024-01-15T10:30:00.000Z"
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                description: "Data da última atualização",
                example: "2024-01-15T15:45:00.000Z"
            }
        }
    },

    // Schema para criação de usuário
    UsuarioCreate: {
        type: "object",
        properties: {
            nome_usuario: {
                type: "string",
                description: "Nome completo do usuário",
                example: "João Silva",
                minLength: 3,
                maxLength: 100
            },
            matricula: {
                type: "string",
                description: "Matrícula única do usuário",
                example: "USR001",
                pattern: "^[A-Z]{3}\\d{3}$"
            },
            email: {
                type: "string",
                format: "email",
                description: "Email único do usuário",
                example: "joao@empresa.com"
            },
            senha: {
                type: "string",
                description: "Senha do usuário",
                example: "senha123",
                minLength: 6
            },
            perfil: {
                type: "string",
                enum: ["administrador", "funcionario"],
                description: "Perfil do usuário",
                example: "funcionario"
            }
        },
        required: ["nome_usuario", "matricula", "email", "senha", "perfil"]
    },

    // Schema para atualização de usuário
    UsuarioUpdate: {
        type: "object",
        properties: {
            nome_usuario: {
                type: "string",
                description: "Nome completo do usuário",
                example: "João Silva Santos",
                minLength: 3,
                maxLength: 100
            },
            email: {
                type: "string",
                format: "email",
                description: "Email do usuário",
                example: "joao.santos@empresa.com"
            },
            perfil: {
                type: "string",
                enum: ["administrador", "funcionario"],
                description: "Perfil do usuário",
                example: "administrador"
            },
            ativo: {
                type: "boolean",
                description: "Status do usuário",
                example: true
            }
        }
    },

    // Schema para lista de usuários
    UsuariosList: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Usuários listados com sucesso"
            },
            usuarios: {
                type: "array",
                items: {
                    "$ref": "#/components/schemas/Usuario"
                }
            },
            total: {
                type: "integer",
                description: "Total de usuários encontrados",
                example: 50
            },
            page: {
                type: "integer",
                description: "Página atual",
                example: 1
            },
            limit: {
                type: "integer",
                description: "Limite de itens por página",
                example: 10
            }
        }
    },

    // Schema para resposta de usuário único
    UsuarioResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Usuário encontrado com sucesso"
            },
            usuario: {
                "$ref": "#/components/schemas/Usuario"
            }
        }
    },

    // Schema para resposta de criação de usuário
    UsuarioCreateResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Usuário cadastrado com sucesso"
            },
            usuario: {
                "$ref": "#/components/schemas/Usuario"
            }
        }
    },

    // Schema para resposta de atualização de usuário
    UsuarioUpdateResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Usuário atualizado com sucesso"
            },
            usuario: {
                "$ref": "#/components/schemas/Usuario"
            }
        }
    },

    // Schema para alteração de senha
    AlterarSenhaRequest: {
        type: "object",
        properties: {
            senhaAtual: {
                type: "string",
                description: "Senha atual do usuário",
                example: "senhaAtual123"
            },
            novaSenha: {
                type: "string",
                description: "Nova senha do usuário",
                example: "novaSenha456",
                minLength: 6
            }
        },
        required: ["senhaAtual", "novaSenha"]
    }
};

export default usuariosSchemas;
