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
}

export default UsuarioController;