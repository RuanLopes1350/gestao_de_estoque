import mongoose from "mongoose";
import Usuario from "../models/Usuario";
import { CommonPesponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import { criarUsuarioDto, atualizarUsuarioDto } from "../dto/usuarioDto.js";

class UsuarioRepository {
    usuarios = [];
    proximaMatricula = 1;

    async buscarTodosusuarios() {
        return this.usuarios
    }

    async buscarUsuarioPorMatricula (matricula) {
        const usuario = this.usuarios.find(usuario => usuario.matricula === matricula);
        return usuario || null;
    }

    async cadastrarUsuario (criarUsuarioDto) {
        const dataAgora = new Date();
        const novoUsuario = {
            matricula: this.matricula++,
            nome_usuario: criarUsuarioDto.nome_usuario,
            senha: criarUsuarioDto.senha,
            cargo: criarUsuarioDto.cargo,
            data_cadastro: dataAgora,
            data_ultima_atualizacao: dataAgora,
        }
        this.usuarios.push(novoUsuario);
        return novoUsuario
    }

    async atualizarUsuario (atualizarUsuarioDto) {
        const usuarioIndex = this.usuarios.findIndex(usuario => usuario.matricula === matricula);

        if(usuarioIndex === -1){
            return null;
        }

        const usuarioAtualizado = {
            ...this.usuarios[usuarioIndex],
            ...atualizarUsuarioDto,
            data_ultima_atualizacao: new Date(),
        }
        this.usuarios[usuarioIndex] = usuarioAtualizado;
        return usuarioAtualizado;
    }

    async deletarUsuario(matricula) {
        const usuarioIndex = this.usuarios.findIndex(usuario => usuario.matricula === matricula);

        if(usuarioIndex === -1) {
            return false;
        }
        this.usuarios.splice(usuarioIndex, 1);
        return true;
    }
}

export default UsuarioRepository;