import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DbConnect from '../config/DbConnect.js';
import Usuario from '../models/Usuario.js';
import Grupo from '../models/Grupo.js';
import getGlobalFakeMapping from './globalFakeMapping.js';
import { seedGrupos } from './seedGrupos.js';

async function seedUsuario() {
    try {
        await Usuario.deleteMany({});
        
        // Primeiro, garantir que os grupos existem
        await seedGrupos();
        
        // Buscar os grupos criados para fazer as associações
        const grupoAdmin = await Grupo.findOne({ nome: 'Administradores' });
        const grupoGerente = await Grupo.findOne({ nome: 'Gerentes' });
        const grupoEstoquista = await Grupo.findOne({ nome: 'Estoquistas' });
        const grupoAuditor = await Grupo.findOne({ nome: 'Auditores' });
        
        const usuarios = [];
        const fakeMapping = getGlobalFakeMapping();
        
        // Hash da senha do administrador
        const senhaHash = await bcrypt.hash('Admin@123', 10);
        
        // Adiciona um usuário administrador fixo com grupo
        usuarios.push({
            nome_usuario: 'Administrador',
            email: 'admin@sistema.com',
            matricula: 'ADM0001',
            senha: senhaHash,
            senha_definida: true,
            perfil: 'administrador',
            ativo: true,
            online: false,
            grupos: grupoAdmin ? [grupoAdmin._id] : [],
            permissoes: [], // Admin tem tudo via grupo
            data_cadastro: new Date(),
            data_ultima_atualizacao: new Date()
        });
        
        // Cria usuários fake com grupos baseados no perfil
        for (let i = 0; i < 10; i++) {
            const senhaFake = await bcrypt.hash('Senha123', 10);
            let perfil, grupos = [];
            
            // Define perfil e grupo baseado no índice
            if (i < 2) {
                perfil = 'gerente';
                grupos = grupoGerente ? [grupoGerente._id] : [];
            } else if (i < 6) {
                perfil = 'estoquista';
                grupos = grupoEstoquista ? [grupoEstoquista._id] : [];
            } else {
                perfil = 'estoquista'; // Usar estoquista em vez de auditor
                grupos = grupoAuditor ? [grupoAuditor._id] : [];
            }
            
            // Gera permissões individuais aleatórias para alguns usuários
            const permissoesIndividuais = i % 3 === 0 ? fakeMapping.usuario.permissoes() : [];
            
            usuarios.push({
                nome_usuario: fakeMapping.usuario.nome_usuario(),
                email: `usuario${i+1}@sistema.com`,
                matricula: `USR${String(i+1).padStart(4, '0')}`,
                senha: senhaFake,
                senha_definida: true,
                perfil: perfil,
                ativo: fakeMapping.usuario.ativo(),
                online: fakeMapping.usuario.online(),
                grupos: grupos,
                permissoes: permissoesIndividuais,
                data_cadastro: fakeMapping.usuario.data_cadastro(),
                data_ultima_atualizacao: fakeMapping.usuario.data_ultima_atualizacao()
            });
        }
        
        const result = await Usuario.create(usuarios);
        
        // Log detalhado dos usuários criados com suas permissões
        console.log(`✅ ${result.length} usuários criados com sucesso (incluindo administrador)`);
        console.log('\n👥 Resumo dos usuários criados:');
        
        for (const usuario of result) {
            const gruposNomes = [];
            for (const grupoId of usuario.grupos) {
                const grupo = await Grupo.findById(grupoId);
                if (grupo) gruposNomes.push(grupo.nome);
            }
            
            console.log(`   👤 ${usuario.nome_usuario} (${usuario.perfil})`);
            console.log(`      📧 ${usuario.email}`);
            console.log(`      👥 Grupos: ${gruposNomes.join(', ') || 'Nenhum'}`);
            console.log(`      🔐 Permissões individuais: ${usuario.permissoes.length}`);
        }
        
        return result;
    } catch (error) {
        console.error('❌ Erro em seedUsuario:', error);
        throw error;
    }
}

export default seedUsuario;