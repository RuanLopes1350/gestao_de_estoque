import UsuarioService from "../services/usuarioService.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";
// import { CommonResponse, HttpStatusCodes } from "../utils/helpers";

import CommonResponse from "../utils/helpers/CommonResponse.js";
import HttpStatusCodes from "../utils/helpers/HttpStatusCodes.js";
import Produto from "../models/Produto.js";

class UsuarioController {
    constructor() {
        this.service = new UsuarioService();
    }

    async cadastrarUsuario(req, res) {
        try {
            const usuarioNovo = await this.service.cadastrarUsuario(req.body);
            return CommonResponse.created(
                res,
                usuarioNovo,
                HttpStatusCodes.CREATED,
                "Usuario cadastro com sucesso!");
        } catch (erro) {
            return CommonResponse.error(res, erro);
        }
    }


    async listarUsuarios(req, res) {
        const usuarios = await this.service.buscarTodosusuarios(req);
        return CommonResponse.success(res, usuarios);
    }

    async buscarUsuarioPorMatricula(req, res) {
        try {
            const { matricula } = req.params;
            const usuario = await this.service.buscarUsuarioPorMatricula(matricula);
            return CommonResponse.success(
                res,
                usuario,
                HttpStatusCodes.ACCEPTED,
                "Usuario encontrado!");
        } catch (erro) {
            if (erro.statusCode) {
                return CommonResponse.error(res, erro.message, erro.statusCode);
            }
            return CommonResponse.error(res, erro.message || "Erro interno do servidor",
                HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async atualizarUsuario(req, res) {
        try {
            const { matricula } = req.params; // Adicionar esta linha para obter a matricula
            const usuarioAtualizado = await this.service.atualizarUsuario(matricula, req.body)
            return CommonResponse.success(
                res,
                usuarioAtualizado,
                HttpStatusCodes.ACCEPTED,
                "Dados do usuario atualizados com sucesso!"
            )
        } catch (erro) {
            return CommonResponse.error(res, erro);
        }
    }
    
    async deletarUsuario(req, res) {
        try {
            const usuarioDeletado = await this.service.deletarUsuario(matricula)
            return CommonResponse.success(
                res,
                HttpStatusCodes.OK,
                "Usuario deletado com sucesso!"
            )
        } catch (erro) {}
    }

}

export default UsuarioController;
