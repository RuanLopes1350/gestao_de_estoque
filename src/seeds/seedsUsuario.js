import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DbConnect from '../config/DbConnect';
import { Usuario } from '../models/Usuario';
import getGlobalFakeMapping from './globalFakeMapping';

await DbConnect.conectar();

async function seedUsuario() {

    await Usuario.deleteMany();

    const usuarios = [];

    usuarios.push(
        {
            nome_usuario: getGlobalFakeMapping().usuario.nome_usuario(),
            matricula: getGlobalFakeMapping().usuario.matricula(),
            senha: getGlobalFakeMapping().usuario.senha(),
            cargo: getGlobalFakeMapping().usuario.cargo(),
            data_cadastro: getGlobalFakeMapping().usuario.data_cadastro(),
            data_ultima_atualizacao: getGlobalFakeMapping().usuario.data_ultima_atualizacao(),
        }
    )
}

export default seedUsuario;