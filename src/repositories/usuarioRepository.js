import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class UsuarioRepository {
    constructor({ model = Usuario } = {}) {
        this.model = model;
    }

    async listarUsuarios(req) {
        console.log('Estou no listarUsuarios em UsuarioRepository');
        console.log('Query recebida:', req.query);

        const id = req.params ? req.params.id : null;

        if (id) {
            const data = await this.model.findById(id);

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Usuario',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Usuario')
                });
            }

            return data;
        }

        // Para busca por filtros
        // Mapeia o nome da query para nome_usuario no banco
        const { nome_usuario, matricula, senha, cargo, data_cadastro, data_ultima_atualizacao, page = 1 } = req.query || {};
        const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);

        const filtros = {};

        if (nome_usuario) {
            filtros.nome_usuario = { $regex: nome_usuario, $options: 'i' };
            console.log(`Aplicando filtro por nome: "${nome_usuario}"`);
        }

        if (matricula) {
            filtros.matricula = { $regex: matricula, $options: 'i' };
            console.log(`Aplicando filtro por matricula: "${matricula}"`);
        }

        if (cargo) {
            filtros.cargo = { $regex: cargo, $options: 'i' };
            console.log(`Aplicando filtro por cargo: "${cargo}"`);
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limite, 10),
            sort: { nome_usuario: 1 },
        };

        console.log('Filtros aplicados:', filtros);
        const resultado = await this.model.paginate(filtros, options);
        console.log(`Encontrados ${resultado.docs?.length || 0} usuários`);
        return resultado;
    }

    async buscarPorId(id, includeTokens = false) {
        const projection = includeTokens ? {} : { accesstoken: 0, refreshtoken: 0 };
        return await this.model.findById(id, projection);
    }

    async buscarUsuarioPorMatricula(matricula) {
        console.log('Estou no buscarUsuarioPorMatricula em UsuarioRepository');

        const usuario = await this.model.findOne({ matricula: matricula });
        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: 'Usuário não encontrado com a matrícula informada'
            });
        }
        return usuario;
    }

    async cadastrarUsuario(dadosUsuario) {
        console.log('Estou no cadastrarUsuario em UsuarioRepository');

        // Verificar se já existe um usuário com a mesma matrícula
        if (dadosUsuario.matricula) {
            const usuarioExistente = await this.model.findOne({ matricula: dadosUsuario.matricula });
            if (usuarioExistente) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'matricula',
                    details: [],
                    customMessage: 'Já existe um usuário com esta matrícula.'
                });
            }
        }
    }

    async atualizarUsuario(matricula, dadosAtualizacao) {
        console.log('Repositório - atualizando usuário:', matricula);
        console.log('Dados de atualização:', JSON.stringify(dadosAtualizacao, null, 2));

        // Verificar se o ID é válido
        if (!mongoose.Types.ObjectId.isValid(matricula)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matricula do usuário inválido'
            });
        }

        // Verificar se a matrícula já existe (se estiver sendo atualizada)
        if (dadosAtualizacao.matricula) {
            const usuarioExistente = await this.model.findOne({
                matricula: dadosAtualizacao.matricula,
                _id: { $ne: id }
            });

            if (usuarioExistente) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'matricula',
                    details: [],
                    customMessage: 'Esta matrícula já está sendo usada por outro usuário.'
                });
            }
        }

        // Garantir que estamos usando as opções corretas
        const usuario = await this.model.findByIdAndUpdate(
            matricula,
            dadosAtualizacao,
            { new: true, runValidators: true }
        );

        console.log('Resultado da atualização:', usuario ? 'Sucesso' : 'Falha');

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: 'Usuário não encontrado'
            });
        }

        return usuario;
    }

    async deletarUsuario(matricula) {
        console.log('Estou no deletarUsuario em UsuarioRepository');

        if (!mongoose.Types.ObjectId.isValid(matricula)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matricula do usuário inválido'
            });
        }

        const usuario = await this.model.findByIdAndDelete(matricula);
        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuario')
            });
        }
        return usuario;
    }

    /**
     * Armazenar accesstoken e refreshtoken no banco de dados
     */
    async armazenarTokens(id, accesstoken, refreshtoken) {
        return await this.model.findByIdAndUpdate(
            id,
            { accesstoken, refreshtoken },
            { new: true }
        );
    }

    /**
     * Atualizar usuário removendo accesstoken e refreshtoken
     */
    async removeToken(id) {
        return await this.model.findByIdAndUpdate(
            id,
            { accesstoken: null, refreshtoken: null },
            { new: true }
        );
    }

    async atualizarTokenRecuperacao(id, token, codigo) {
        return await this.model.findByIdAndUpdate(
            id,
            {
                token_recuperacao: token,
                codigo_recuperacao: codigo,
                token_recuperacao_expira: Date.now() + 3600000 // 1 hora
            },
            { new: true }
        );
    }

    async atualizarSenha(id, senha) {
        return await this.model.findByIdAndUpdate(
            id,
            {
                senha,
                token_recuperacao: null,
                codigo_recuperacao: null,
                token_recuperacao_expira: null
            },
            { new: true }
        );
    }

    async criarUsuario(dadosUsuario) {
        const novoUsuario = new this.model(dadosUsuario);
        return await novoUsuario.save();
    }
}

export default UsuarioRepository; 