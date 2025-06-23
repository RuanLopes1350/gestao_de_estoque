import UsuarioRepository from '../repositories/usuarioRepository.js';
import mongoose from 'mongoose';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';
import bcrypt from 'bcrypt';

class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository();
    }

    async listarUsuarios(req) {
        console.log('Estou no listarUsuarios em UsuarioService');
        const data = await this.repository.listarUsuarios(req);
        console.log('Estou retornando os dados em UsuarioService');
        return data;
    }

    async cadastrarUsuario(dadosUsuario) {
        console.log('Estou no cadastrarUsuario em UsuarioService');
        if (!dadosUsuario.data_cadastro) {
            dadosUsuario.data_cadastro = new Date();
        }

        dadosUsuario.data_ultima_atualizacao = new Date();

        const data = await this.criarUsuario(dadosUsuario);
        return data;
    }

    async atualizarUsuario(id, dadosAtualizacao) {
        console.log('Atualizando usuário:', id, dadosAtualizacao);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário inválido.'
            });
        }

        dadosAtualizacao.data_ultima_atualizacao = new Date();
        const usuarioAtualizado = await this.repository.atualizarUsuario(id, dadosAtualizacao);
        return usuarioAtualizado;
    }

    async buscarUsuarioPorID(id) {
        console.log('Estou no buscarUsuarioPorID em UsuarioService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário inválido.'
            });
        }

        const data = await this.repository.buscarUsuarioPorID(id);

        if (!data) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: 'Usuário não encontrado.'
            });
        }

        return data;
    }

    async buscarUsuarioPorMatricula(matricula) {
        console.log('Estou no buscarUsuarioPorMatricula em UsuarioService');

        if (!matricula || matricula.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matrícula válida é obrigatória para busca.'
            });
        }

        const usuario = await this.repository.buscarUsuarioPorMatricula(matricula);

        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: 'Usuário não encontrado com a matrícula informada.'
            });
        }

        return usuario;
    }

    async deletarUsuario(id) {
        console.log('Estou no deletarUsuario em UsuarioService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário inválido.'
            });
        }

        // Verificar se o usuário existe antes de tentar deletar
        await this.buscarUsuarioPorID(id);

        try {
            const data = await this.repository.deletarUsuario(id);
            return data;
        } catch (error) {
            throw error;
        }
    }
    /*
    async desativarUsuario(matricula) {
            console.log('Estou no desativarUsuario em UsuarioService');
    
            if (!mongoose.Types.ObjectId.isValid(matricula)) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'matricula',
                    details: [],
                    customMessage: 'Matricula do usuario inválida.'
                });
            }
    
            const data = await this.repository.desativarUsuario(matricula);
            return data;
    }
    */
    async desativarUsuario(matricula) {
    console.log('Estou no desativarUsuario em UsuarioService');

    try {
        UsuarioMatriculaSchema.parse(matricula);
    } catch (error) {
        throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: 'validationError',
            field: 'matricula',
            details: [],
            customMessage: 'Matrícula do usuário inválida.'
        });
    }

        const data = await this.repository.desativarUsuario(matricula);
        return data;
    }

    async verificarEmailExistente(email) {
        const usuario = await this.repository.buscarPorEmail(email);
        return usuario !== null;
    }

    async criarUsuario(dadosUsuario) {
        // Se a senha não estiver hash, faça o hash
        if (dadosUsuario.senha && !dadosUsuario.senha.startsWith('$2')) {
            dadosUsuario.senha = await bcrypt.hash(dadosUsuario.senha, 10);
        }

        return await this.repository.criarUsuario(dadosUsuario);
    }

    async revoke(token) {
        if (!token) {
            throw new CustomError({
                statusCode: 400,
                customMessage: 'Token não fornecido',
                errorType: 'validationError'
            });
        }
        await this.repository.adicionarTokenRevogado(token);

        return true;
    }
}

export default UsuarioService;