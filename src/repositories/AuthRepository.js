import mongoose from 'mongoose';
import UsuarioModel from '../models/Usuario.js';
import GrupoModel from '../models/Grupo.js';
import UnidadeModel from '../models/Unidade.js';
import RotaModel from '../models/Rota.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class AuthRepository {
    constructor({
        usuarioModel = UsuarioModel,
        grupoModel = GrupoModel,
        unidadeModel = UnidadeModel,
        rotaModel = RotaModel
    } = {}) {
        this.model = usuarioModel;
        this.grupoModel = grupoModel;
        this.unidadeModel = unidadeModel;
        this.rotaModel = rotaModel;
    }

    /**
     * Armazenar accesstoken e refreshtoken no banco de dados
     */
    async armazenarTokens(id, accesstoken, refreshtoken) {
        const documento = await this.model.findById(id);
        if (!documento) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        documento.accesstoken = accesstoken;
        documento.refreshtoken = refreshtoken;
        const data = await documento.save();
        return data;
    }

    /**
     * Atualizar usuário removendo accesstoken e refreshtoken
     */
    async removeToken(id) {
        // Criar objeto com os campos a serem atualizados
        const parsedData = {
            accesstoken: null,
            refreshtoken: null
        };
        const usuario = await this.model.findByIdAndUpdate(id, parsedData, { new: true }).exec();

        // Validar se o usuário atualizado foi retornado
        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }
        return usuario;
    }
}

export default AuthRepository;
