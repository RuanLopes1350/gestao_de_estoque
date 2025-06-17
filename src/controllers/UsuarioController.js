import UsuarioService from "../services/usuarioService.js";
import { CommonResponse, CustomError, HttpStatusCodes } from "../utils/helpers/index.js";
import { UsuarioSchema, UsuarioUpdateSchema } from "../utils/validators/schemas/zod/UsuarioSchema.js";
import { UsuarioQuerySchema, UsuarioIdSchema } from "../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js";

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

    // reformulando o cadastrar usuario
    /*async cadastrarUsuario(req, res) {
        console.log('Estou no cadastrarUsuario em UsuarioController'); // mexendo aqui

        try {
            const parsedData = UsuarioSchema.parse(req.body);
            const data = await this.service.cadastrarUsuario(parsedData);
            return CommonResponse.created(
                res,
                data,
                HttpStatusCodes.CREATED.code,
                'Usuário cadastrado com sucesso.'
            );
        } catch (error) {
            return CommonResponse.error(res, error);
        }
    }*/
    async cadastrarUsuario(req, res) {
    console.log('Estou no cadastrarUsuario em UsuarioController');

    try {
        const parsedData = UsuarioSchema.parse(req.body);
        const data = await this.service.cadastrarUsuario(parsedData);

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
        console.log('Estou no desativarUsuario em UsuarioController');

        try {
            const { matricula } = req.params || {};
            if (!matricula) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'matricula',
                    details: [],
                    customMessage: 'Matricula do usuario é obrigatorio para desativar.'
                });
            }

            try {
                UsuarioIdSchema.parse(matricula);
            } catch (error) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'matricula',
                    details: [],
                    customMessage: 'Matricula do usuario invalído.'
                })
            }

            const data = await this.service.desativarUsuario(matricula);
            return CommonResponse.success(res, data, 200, 'Usuario desativado com sucesso');
        } catch (error) {
            if (error.statusCode === 404) {
                return CommonResponse.error(
                    res,
                    error.statusCode,
                    error.errorType,
                    error.field,
                    error.details,
                    'Usuario não encontrado. Verifique se a matricula está correta'
                );
            }
            return CommonResponse.error(res, error);
        }
    }

    async reativarUsuario(req, res) {
        console.log('Estou no reativarUsuario em UsuarioController');

        try {
            const { matricula } = req.params || {};
            if (!matricula) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'matricula',
                    details: [],
                    customMessage: 'Matricula do usuario é obrigatório para reativar.'
                });
            }

            try {
                UsuarioIdSchema.parse(matricula);
            } catch (error) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'id',
                    details: [],
                    customMessage: 'Matricula do usuario inválido.'
                });
            }

            const data = await this.service.reativarUsuario(matricula);
            return CommonResponse.success(res, data, 200, 'Usuario reativado com sucesso.');
        } catch (error) {
            if (error.statusCode === 404) {
                return CommonResponse.error(
                    res,
                    error.statusCode,
                    error.errorType,
                    error.field,
                    error.details,
                    'Usuario não encontrado. Verifique se a matricula está correta.'
                );
            }
            return CommonResponse.error(res, error);
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
}

export default UsuarioController;