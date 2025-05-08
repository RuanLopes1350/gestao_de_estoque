import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DbConnect from '../config/DbConnect.js';
import Usuario from '../models/Usuario.js';
import getGlobalFakeMapping from './globalFakeMapping.js';

async function seedUsuario() {
    try {
        await Usuario.deleteMany({});
        
        const usuarios = [];
        
        // Cria 5 usuários fake
        for (let i = 0; i < 50; i++) {
            usuarios.push({
                nome_usuario: getGlobalFakeMapping().usuario.nome_usuario(),
                matricula: getGlobalFakeMapping().usuario.matricula(),
                senha: getGlobalFakeMapping().usuario.senha(),
                cargo: getGlobalFakeMapping().usuario.cargo(),
                data_cadastro: getGlobalFakeMapping().usuario.data_cadastro(),
                data_ultima_atualizacao: getGlobalFakeMapping().usuario.data_ultima_atualizacao(),
            });
        }
        
        const result = await Usuario.create(usuarios);
        return result;
    } catch (error) {
        console.error('Erro em seedUsuario:', error);
        throw error;
    }
}

export default seedUsuario;