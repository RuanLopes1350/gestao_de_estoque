import bcrypt from 'bcrypt';
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
        
        // Hash da senha do administrador
        const senhaHash = await bcrypt.hash('Admin@123', 10);
        
        // Adiciona um usuário administrador fixo
        usuarios.push({
            nome_usuario: 'Administrador',
            email: 'admin@sistema.com',
            matricula: 'ADM0001',
            senha: senhaHash,
            perfil: 'administrador',
            ativo: true,
            online: false,
            data_cadastro: new Date(),
            data_ultima_atualizacao: new Date()
        });
        
        // Cria usuários fake
        for (let i = 0; i < 10; i++) {
            const senhaFake = await bcrypt.hash('Senha123', 10);
            usuarios.push({
                nome_usuario: fakeMapping.usuario.nome_usuario(),
                email: `usuario${i+1}@sistema.com`,
                matricula: `USR${String(i+1).padStart(4, '0')}`,
                senha: senhaFake,
                perfil: i < 2 ? 'gerente' : 'estoquista', // 2 gerentes, o resto estoquistas
                ativo: true,
                online: false,
                data_cadastro: new Date(),
                data_ultima_atualizacao: new Date()
            });
        }
        
        const result = await Usuario.create(usuarios);
        console.log(`✅ ${result.length} usuários criados com sucesso (incluindo administrador)`);
        return result;
    } catch (error) {
        console.error('❌ Erro em seedUsuario:', error);
        throw error;
    }
}

export default seedUsuario;