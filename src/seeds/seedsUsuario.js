import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DbConnect from '../config/DbConnect.js';
import Usuario from '../models/Usuario.js';
import getGlobalFakeMapping from './globalFakeMapping.js';

async function seedUsuario() {
    try {
        await Usuario.deleteMany({});
        
        const usuarios = [];
        const fakeMapping = getGlobalFakeMapping();
        
        // Cria 50 usuários fake
        for (let i = 0; i < 50; i++) {
            usuarios.push({
                nome_usuario: fakeMapping.usuario.nome_usuario(),
                matricula: fakeMapping.usuario.matricula(),
                senha: fakeMapping.usuario.senha(),
                cargo: fakeMapping.usuario.cargo(),
                data_cadastro: fakeMapping.usuario.data_cadastro(),
                data_ultima_atualizacao: fakeMapping.usuario.data_ultima_atualizacao(),
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