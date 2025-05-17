import UsuarioRepository from "../repositories/usuarioRepository";
import { CustomError, HttpStatusCodes } from "../utils/helpers";
class UsuarioService {
    constructor() {
        this.repository = new UsuarioService();
    }

    async cadastrarUsuario(dadosUsuario) {
        const usuarioNovo = await this.repository.cadastrarUsuario(dadosUsuario);
        return usuarioNovo;
    }

    async buscarTodosUsuarios(req) {
        const usuarios = await this.repository.buscarTodosUsuarios(req)
        return usuarios;
    }

    async buscarUsuariosPorMtricula(matricula) {
        try {
            const usuario = await this.repository.buscarUsuariosPorMtricula(matricula);
            if (!usuario) {
                throw new CustomError("Usuario não encontrado",
                    HttpStatusCodes.NOT_FOUND);
            }
            return usuario;
        } catch (error) {
            throw error;
        }
    }

    async atualizarUsuario(matricula, dadosUsuario) {
        const usuarioAtualizado = await this.repository.atualizarUsuario(matricula, dadosUsuario);
        return usuarioAtualizado;
    }

    async deletarUsuario(matricula) {
        const usuarioDeletado = await this.repository.deletarUsuario(matricula)
        return usuarioDeletado;
    }
}

export default UsuarioService;
