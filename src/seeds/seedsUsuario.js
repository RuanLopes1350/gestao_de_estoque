import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import getGlobalFakeMapping from './globalFakeMapping.js';
import { UsuarioSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';

async function seedUsuario() {
    try {
        await Usuario.deleteMany({});
        
        const usuarios = [];
        const fakeMapping = getGlobalFakeMapping();
        
        // Adiciona um usuário administrador fixo que atende aos requisitos do Zod
        const adminUser = {
            nome_usuario: 'Administrador do Sistema',
            email: 'admin@sistema.com',
            matricula: '1234567', // Exatamente 7 caracteres
            senha: 'Admin123', // Pelo menos 7 caracteres, uma maiúscula, uma minúscula e um número
            perfil: 'administrador',
            data_cadastro: new Date(),
            data_ultima_atualizacao: new Date(),
        };
        
        // Validar o usuário admin com Zod antes de adicionar
        UsuarioSchema.parse(adminUser);
        usuarios.push(adminUser);
        
        console.log('✅ Usuário administrador validado com sucesso');
        
        // Cria usuários fake validados pelo Zod
        for (let i = 0; i < 50; i++) {
            let usuarioValido = false;
            let tentativa = 0;
            let usuarioFake;
            
            // Tentar até criar um usuário válido ou atingir número máximo de tentativas
            while (!usuarioValido && tentativa < 5) {
                try {
                    usuarioFake = {
                        nome_usuario: fakeMapping.usuario.nome_usuario(),
                        email: fakeMapping.usuario.email(),
                        matricula: String(Math.floor(1000000 + Math.random() * 9000000)).substring(0, 7), // Garantir 7 caracteres
                        senha: `Senha${Math.floor(Math.random() * 10000)}`, // Garantir o formato válido
                        perfil: fakeMapping.usuario.perfil(),
                        data_cadastro: fakeMapping.usuario.data_cadastro(),
                        data_ultima_atualizacao: fakeMapping.usuario.data_ultima_atualizacao(),
                    };
                    
                    // Validar com Zod
                    UsuarioSchema.parse(usuarioFake);
                    usuarioValido = true;
                } catch (error) {
                    tentativa++;
                    console.warn(`Tentativa ${tentativa}: Usuário inválido: ${error.message}`);
                }
            }
            
            if (usuarioValido) {
                usuarios.push(usuarioFake);
            }
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