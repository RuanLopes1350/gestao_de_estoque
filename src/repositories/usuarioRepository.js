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
        const { nome, nome_usuario, matricula, cargo, email, page = 1 } = req.query || {};
        const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);
    
        const filtros = {};
    
        // Aceita tanto "nome" quanto "nome_usuario" como parâmetros de busca
        if (nome || nome_usuario) {
            filtros.nome_usuario = { 
                $regex: (nome || nome_usuario), 
                $options: 'i' 
            };
            console.log(`Aplicando filtro por nome: "${nome || nome_usuario}" no campo nome_usuario`);
        }
    
        if (matricula) {
            filtros.matricula = { $regex: matricula, $options: 'i' };
        }
    
        if (cargo) {
            filtros.cargo = { $regex: cargo, $options: 'i' };
        }
    
        if (email) {
            filtros.email = { $regex: email, $options: 'i' };
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

    async buscarUsuarioPorID(id) {
        console.log('Estou no buscarUsuarioPorID em UsuarioRepository');
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário inválido'
            });
        }
        
        const usuario = await this.model.findById(id);
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
        
        // Verificar se já existe um usuário com o mesmo email
        if (dadosUsuario.email) {
            const emailExistente = await this.model.findOne({ email: dadosUsuario.email });
            if (emailExistente) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'email',
                    details: [],
                    customMessage: 'Este email já está cadastrado para outro usuário.'
                });
            }
        }

        const usuario = new this.model(dadosUsuario);
        return await usuario.save();
    }

    async atualizarUsuario(id, dadosAtualizacao) {
        console.log('Repositório - atualizando usuário:', id);
        console.log('Dados de atualização:', JSON.stringify(dadosAtualizacao, null, 2));

        // Verificar se o ID é válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário inválido'
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

        // Verificar se o email já existe (se estiver sendo atualizado)
        if (dadosAtualizacao.email) {
            const usuarioExistente = await this.model.findOne({
                email: dadosAtualizacao.email,
                _id: { $ne: id }
            });

            if (usuarioExistente) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'email',
                    details: [],
                    customMessage: 'Este email já está sendo usado por outro usuário.'
                });
            }
        }

        // Garantir que estamos usando as opções corretas
        const usuario = await this.model.findByIdAndUpdate(
            id,
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

    async deletarUsuario(id) {
        console.log('Estou no deletarUsuario em UsuarioRepository');
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário inválido'
            });
        }
        
        const usuario = await this.model.findByIdAndDelete(id);
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
}

export default UsuarioRepository;