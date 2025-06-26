import UsuarioService from "../services/usuarioService.js";
import { CommonResponse, CustomError, HttpStatusCodes } from "../utils/helpers/index.js";
import { UsuarioSchema, UsuarioUpdateSchema } from "../utils/validators/schemas/zod/UsuarioSchema.js";
import { UsuarioQuerySchema, UsuarioIdSchema, UsuarioMatriculaSchema } from "../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js";
import LogMiddleware from '../middlewares/LogMiddleware.js';

class UsuarioController {
    constructor() {
        this.service = new UsuarioService();
    }

    async listarUsuarios(req, res) {
        console.log('Estou no listarUsuarios em UsuarioController');

        try {
            const { id } = req.params || {};
            if (id) {
                UsuarioIdSchema.parse(id);
            }

            const query = req.query || {};
            if (Object.keys(query).length !== 0) {
                await UsuarioQuerySchema.parseAsync(query);
            }

            const data = await this.service.listarUsuarios(req);

            // Verificar se a lista está vazia
            if (data.docs && data.docs.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Usuario',
                    [],
                    'Nenhum usuário encontrado com os critérios informados.'
                );
            }

            return CommonResponse.success(res, data);
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async buscarUsuarioPorID(req, res) { 
        console.log('Estou no buscarUsuarioPorID em UsuarioController');

        try {
            const { id } = req.params || {};

            UsuarioIdSchema.parse(id);
            const data = await this.service.buscarUsuarioPorID(id);
            return CommonResponse.success(res, data, 200, 'Usuário encontrado com sucesso.');
        } catch (error) {
            if (error.statusCode === 404 || error.message.includes('not found')) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Usuario',
                    [],
                    'Usuário não encontrado. Verifique se o ID está correto.'
                );
            }
            return CommonResponse.error(res, error);
        }
    }

    async buscarUsuarioPorMatricula(req, res) {
        console.log('Estou no buscarUsuarioPorMatricula em UsuarioController');

        try {
            const { matricula } = req.params;
            if (!matricula) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'matricula',
                    details: [],
                    customMessage: 'A matrícula é obrigatória para esta busca.'
                });
            }

            const data = await this.service.buscarUsuarioPorMatricula(matricula);
            return CommonResponse.success(res, data, 200, 'Usuário encontrado com sucesso.');
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async cadastrarUsuario(req, res) {
    console.log('Estou no cadastrarUsuario em UsuarioController');

    try {
        const parsedData = UsuarioSchema.parse(req.body);
        const data = await this.service.cadastrarUsuario(parsedData);

        // Registra evento crítico de criação de usuário
        LogMiddleware.logCriticalEvent(req.userId, 'USUARIO_CRIADO', {
            usuario_criado: data._id,
            matricula: data.matricula,
            perfil: data.perfil,
            criado_por: req.userMatricula
        }, req);

        return CommonResponse.created(
            res,
            data,
            HttpStatusCodes.CREATED.code,
            'Usuário cadastrado com sucesso.'
        );
    } catch (error) {
        // Tratando erro Zod
        if (error.name === 'ZodError') {
            return CommonResponse.error(
                res,
                HttpStatusCodes.BAD_REQUEST.code,
                'validationError',
                'body',
                error.errors,
                'Dados de usuário inválidos. Verifique os campos e tente novamente.'
            );
        }

        // Tratando erro no Mongoose
        if (error.name === 'ValidationError') {
            return CommonResponse.error(
                res,
                HttpStatusCodes.BAD_REQUEST.code,
                'validationError',
                Object.keys(error.errors)[0],
                Object.values(error.errors).map(e => e.message),
                'Validação de dados falhou. Verifique os campos obrigatórios.'
            );
        }

        return CommonResponse.error(res, error);
    }
}


    async atualizarUsuario(req, res) {
        console.log('Estou no atualizarUsuario em UsuarioController');

        try {
            const { id } = req.params;
            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do usuário é obrigatório.'
                });
            }

            UsuarioIdSchema.parse(id);

            const dadosAtualizacao = req.body;
            if (Object.keys(dadosAtualizacao).length === 0) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'body',
                    details: [],
                    customMessage: 'Nenhum dado fornecido para atualização.'
                });
            }

            await UsuarioUpdateSchema.parseAsync(dadosAtualizacao);
            const usuarioAtualizado = await this.service.atualizarUsuario(id, dadosAtualizacao);
            return CommonResponse.success(res, usuarioAtualizado, 200, 'Usuário atualizado com sucesso.');
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async deletarUsuario(req, res) {
        console.log('Estou no deletarUsuario em UsuarioController');

        try {
            const { id } = req.params || {};
            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do usuário é obrigatório para deletar.'
                });
            }

            try {
                UsuarioIdSchema.parse(id);
            } catch (error) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do usuário inválido.'
                });
            }

            const data = await this.service.deletarUsuario(id);
            return CommonResponse.success(res, data, 200, 'Usuário excluído com sucesso.');
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }

    async desativarUsuario(req, res) {
           console.log('Estou no desativarUsusario em UsuarioController');
   
           try {
               const { id } = req.params || {};
               if (!id) {
                   throw new CustomError({
                       statusCode: HttpStatusCodes.BAD_REQUEST.code,
                       errorType: 'validationError',
                       field: 'id',
                       details: [],
                       customMessage: 'ID do usuario é obrigatório para desativar.'
                   });
               }
   
               try {
                   UsuarioIdSchema.parse(id);
               } catch (error) {
                   throw new CustomError({
                       statusCode: HttpStatusCodes.BAD_REQUEST.code,
                       errorType: 'validationError',
                       field: 'id',
                       details: [],
                       customMessage: 'ID do usuario inválido.'
                   });
               }
   
               const data = await this.service.desativarUsuario(id);
               return CommonResponse.success(res, data, 200, 'Usuario desativado com sucesso.');
           } catch (error) {
               if (error.statusCode === 404) {
                   return CommonResponse.error(
                       res,
                       error.statusCode,
                       error.errorType,
                       error.field,
                       error.details,
                       'Usuario não encontrado. Verifique se o id está correto.'
                   );
               }
               //return CommonResponse.error(res, error);
               return CommonResponse.error(
                res,
                error.statusCode || 500,
                error.errorType || 'serverError',
                error.field || null,
                error.details || [],
                error.customMessage || error.message || 'Erro interno no servidor.');
           }
    }

    async reativarUsuario(req, res) {
           console.log('Estou no reativarUsusario em UsuarioController');
   
           try {
               const { id } = req.params || {};
               if (!id) {
                   throw new CustomError({
                       statusCode: HttpStatusCodes.BAD_REQUEST.code,
                       errorType: 'validationError',
                       field: 'id',
                       details: [],
                       customMessage: 'ID do usuario é obrigatório para reativar.'
                   });
               }
   
               try {
                   UsuarioIdSchema.parse(id);
               } catch (error) {
                   throw new CustomError({
                       statusCode: HttpStatusCodes.BAD_REQUEST.code,
                       errorType: 'validationError',
                       field: 'id',
                       details: [],
                       customMessage: 'ID do usuario inválido.'
                   });
               }
   
               const data = await this.service.reativarUsuario(id);
               return CommonResponse.success(res, data, 200, 'Usuario reativado com sucesso.');
           } catch (error) {
               if (error.statusCode === 404) {
                   return CommonResponse.error(
                       res,
                       error.statusCode,
                       error.errorType,
                       error.field,
                       error.details,
                       'Usuario não encontrado. Verifique se o id está correto.'
                   );
               }
               //return CommonResponse.error(res, error);
               return CommonResponse.error(
                res,
                error.statusCode || 500,
                error.errorType || 'serverError',
                error.field || null,
                error.details || [],
                error.customMessage || error.message || 'Erro interno no servidor.');
           }
    }

    async criarComSenha(req, res) {
        try {
            const { nome, email, senha, perfil } = req.body;

            // Validar dados
            if (!nome || !email || !senha) {
                return res.status(400).json({
                    message: 'Nome, email e senha são obrigatórios',
                    type: 'validationError'
                });
            }

            // Verificar se o email já existe
            const emailExiste = await this.service.verificarEmailExistente(email);
            if (emailExiste) {
                return res.status(400).json({
                    message: 'Este email já está em uso',
                    type: 'validationError'
                });
            }

            // Criar usuário
            const usuario = await this.service.criarUsuario({
                nome,
                email,
                senha,
                perfil: perfil || 'estoquista', // Perfil padrão se não for especificado
                ativo: true
            });

            // Remover a senha do objeto de resposta
            const usuarioSemSenha = {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                ativo: usuario.ativo
            };

            return res.status(201).json({
                message: 'Usuário criado com sucesso',
                usuario: usuarioSemSenha
            });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return res.status(500).json({
                message: 'Erro interno ao criar usuário',
                error: error.message
            });
        }
    }

    /**
     * Adiciona usuário a um grupo
     */
    async adicionarUsuarioAoGrupo(req, res) {
        console.log('Estou no adicionarUsuarioAoGrupo em UsuarioController');

        try {
            const { usuarioId, grupoId } = req.body;

            if (!usuarioId || !grupoId) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'body',
                    details: [],
                    customMessage: 'ID do usuário e ID do grupo são obrigatórios.'
                });
            }

            const data = await this.service.adicionarUsuarioAoGrupo(usuarioId, grupoId);

            // Registra evento crítico
            LogMiddleware.logCriticalEvent(req.userId, 'USUARIO_ADICIONADO_GRUPO', {
                usuario_id: usuarioId,
                grupo_id: grupoId,
                adicionado_por: req.userMatricula
            }, req);

            return CommonResponse.success(res, data, 200, 'Usuário adicionado ao grupo com sucesso.');
        } catch (error) {
            console.error('Erro no controller ao adicionar usuário ao grupo:', error);
            return CommonResponse.error(res, error);
        }
    }

    /**
     * Remove usuário de um grupo
     */
    async removerUsuarioDoGrupo(req, res) {
        console.log('Estou no removerUsuarioDoGrupo em UsuarioController');

        try {
            const { usuarioId, grupoId } = req.body;

            if (!usuarioId || !grupoId) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'body',
                    details: [],
                    customMessage: 'ID do usuário e ID do grupo são obrigatórios.'
                });
            }

            const data = await this.service.removerUsuarioDoGrupo(usuarioId, grupoId);

            // Registra evento crítico
            LogMiddleware.logCriticalEvent(req.userId, 'USUARIO_REMOVIDO_GRUPO', {
                usuario_id: usuarioId,
                grupo_id: grupoId,
                removido_por: req.userMatricula
            }, req);

            return CommonResponse.success(res, data, 200, 'Usuário removido do grupo com sucesso.');
        } catch (error) {
            console.error('Erro no controller ao remover usuário do grupo:', error);
            return CommonResponse.error(res, error);
        }
    }

    /**
     * Adiciona permissão individual a um usuário
     */
    async adicionarPermissaoAoUsuario(req, res) {
        console.log('Estou no adicionarPermissaoAoUsuario em UsuarioController');

        try {
            const { id } = req.params;
            const permissao = req.body;

            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do usuário é obrigatório.'
                });
            }

            const data = await this.service.adicionarPermissaoAoUsuario(id, permissao);

            // Registra evento crítico
            LogMiddleware.logCriticalEvent(req.userId, 'PERMISSAO_INDIVIDUAL_ADICIONADA', {
                usuario_id: id,
                permissao_adicionada: {
                    rota: permissao.rota,
                    dominio: permissao.dominio
                },
                adicionado_por: req.userMatricula
            }, req);

            return CommonResponse.success(res, data, 200, 'Permissão adicionada ao usuário com sucesso.');
        } catch (error) {
            console.error('Erro no controller ao adicionar permissão ao usuário:', error);
            return CommonResponse.error(res, error);
        }
    }

    /**
     * Remove permissão individual de um usuário
     */
    async removerPermissaoDoUsuario(req, res) {
        console.log('Estou no removerPermissaoDoUsuario em UsuarioController');

        try {
            const { id } = req.params;
            const { rota, dominio } = req.body;

            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do usuário é obrigatório.'
                });
            }

            if (!rota) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'rota',
                    details: [],
                    customMessage: 'Nome da rota é obrigatório.'
                });
            }

            const data = await this.service.removerPermissaoDoUsuario(id, rota, dominio);

            // Registra evento crítico
            LogMiddleware.logCriticalEvent(req.userId, 'PERMISSAO_INDIVIDUAL_REMOVIDA', {
                usuario_id: id,
                permissao_removida: {
                    rota: rota,
                    dominio: dominio || 'localhost'
                },
                removido_por: req.userMatricula
            }, req);

            return CommonResponse.success(res, data, 200, 'Permissão removida do usuário com sucesso.');
        } catch (error) {
            console.error('Erro no controller ao remover permissão do usuário:', error);
            return CommonResponse.error(res, error);
        }
    }

    /**
     * Obtém permissões efetivas de um usuário
     */
    async obterPermissoesUsuario(req, res) {
        console.log('Estou no obterPermissoesUsuario em UsuarioController');

        try {
            const { id } = req.params;

            if (!id) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'ID do usuário é obrigatório.'
                });
            }

            const data = await this.service.obterPermissoesUsuario(id);

            return CommonResponse.success(res, data, 200, 'Permissões do usuário obtidas com sucesso.');
        } catch (error) {
            console.error('Erro no controller ao obter permissões do usuário:', error);
            return CommonResponse.error(res, error);
        }
    }

    async cadastrarUsuarioSemSenha(req, res) {
        console.log('Estou no cadastrarUsuarioSemSenha em UsuarioController');

        try {
            // Validar dados básicos (sem senha)
            const { nome_usuario, email, matricula, perfil, grupos } = req.body;
            
            if (!nome_usuario || !email || !matricula) {
                return CommonResponse.error(
                    res,
                    HttpStatusCodes.BAD_REQUEST.code,
                    'validationError',
                    'body',
                    ['Nome, email e matrícula são obrigatórios'],
                    'Dados obrigatórios não fornecidos.'
                );
            }

            const dadosUsuario = {
                nome_usuario,
                email,
                matricula,
                perfil: perfil || 'estoquista',
                grupos: grupos || []
            };

            const data = await this.service.cadastrarUsuarioSemSenha(dadosUsuario);

            // Registra evento crítico de criação de usuário sem senha
            LogMiddleware.logCriticalEvent(req.userId, 'USUARIO_CRIADO_SEM_SENHA', {
                usuario_criado: data._id,
                matricula: data.matricula,
                perfil: data.perfil,
                criado_por: req.userMatricula,
                codigo_gerado: true // Não logamos o código por segurança
            }, req);

            return CommonResponse.created(
                res,
                {
                    ...data,
                    message: `Usuário cadastrado com sucesso. Código de segurança gerado: ${data.codigoSeguranca}`,
                    instrucoes: "O usuário deve usar este código na endpoint '/auth/redefinir-senha/codigo' para definir sua senha. Código válido por 24 horas."
                },
                HttpStatusCodes.CREATED.code,
                'Usuário cadastrado com sucesso.'
            );
        } catch (error) {
            // Tratando erro Zod
            if (error.name === 'ZodError') {
                return CommonResponse.error(
                    res,
                    HttpStatusCodes.BAD_REQUEST.code,
                    'validationError',
                    'body',
                    error.errors,
                    'Dados de usuário inválidos. Verifique os campos e tente novamente.'
                );
            }

            // Tratando erro no Mongoose
            if (error.name === 'ValidationError') {
                return CommonResponse.error(
                    res,
                    HttpStatusCodes.BAD_REQUEST.code,
                    'validationError',
                    'body',
                    Object.values(error.errors).map(err => ({
                        field: err.path,
                        message: err.message
                    })),
                    'Erro de validação nos dados do usuário.'
                );
            }

            // Tratando erro de duplicação (E11000)
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0];
                const value = error.keyValue[field];
                return CommonResponse.error(
                    res,
                    HttpStatusCodes.CONFLICT.code,
                    'duplicateError',
                    field,
                    [{ field, value, message: `${field} já existe` }],
                    `${field} '${value}' já está cadastrado no sistema.`
                );
            }

            // Erro customizado
            if (error.customMessage) {
                return CommonResponse.error(
                    res,
                    error.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                    error.errorType || 'serverError',
                    error.field || 'unknown',
                    error.details || [],
                    error.customMessage
                );
            }

            // Erro genérico
            console.error('Erro não tratado no cadastrarUsuarioSemSenha:', error);
            return CommonResponse.error(
                res,
                HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                'serverError',
                'unknown',
                [],
                'Erro interno do servidor ao cadastrar usuário.'
            );
        }
    }
}

export default UsuarioController;