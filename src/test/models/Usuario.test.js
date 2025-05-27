import mongoose from 'mongoose';
import Usuario from '../../models/Usuario';
import { MongoMemoryServer } from 'mongodb-memory-server';
import e from 'express';

let mongoServer;

// Configuração antes de todos os testes
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        // Opções de conexão não são necessárias no Mongoose 6+
    });
});

// Limpeza após todos os testes
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Limpeza após cada teste para garantir isolamento
afterEach(async () => {
    jest.clearAllMocks();
    await Usuario.deleteMany({});
});

describe('Modelo de Usuário', () => {
    it('deve criar um usuário com dados válidos', async () => {
        const userData = {
            nome_usuario: 'Test User',
            matricula: '1234567',
            senha: 'password',
            email: 'testuser@example.com',
            cargo: 'Desenvolvedor',
            status: true,
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            data_cadastro: new Date(),
            data_atualizacao: new Date(),
            data_ultimo_login: new Date(),
        }

        const user = new Usuario(userData);
        await user.save();

        const savedUser = await Usuario.findById(user._id).select('-senha');
        expect(savedUser.nome_usuario).toBe(userData.nome_usuario);
        expect(savedUser.matricula).toBe(userData.matricula);
        expect(savedUser.senha).toBeUndefined(); // Verifica se a senha não está presente
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.cargo).toBe(userData.cargo);
        expect(savedUser.status).toBe(userData.status);
        expect(savedUser.accessToken).toBe(userData.accessToken);
        expect(savedUser.refreshToken).toBe(userData.refreshToken);
        expect(savedUser.data_cadastro).toEqual(userData.data_cadastro);
        expect(savedUser.data_atualizacao).toEqual(userData.data_atualizacao);
        expect(savedUser.data_ultimo_login).toEqual(userData.data_ultimo_login);
    });

    it('deve falhar ao criar um usuário sem nome', async () => {
        const userData = {
            matricula: '1234567',
            senha: 'password',
            email: 'testuser@example.com',
            cargo: 'Desenvolvedor',
            status: true,
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            data_cadastro: new Date(),
            data_atualizacao: new Date(),
            data_ultimo_login: new Date(),
        };

        const user = new Usuario(userData);
        await expect(user.save()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('deve falhar ao criar um usuário sem matrícula', async () => {
        const userData = {
            nome_usuario: 'Test User',
            senha: 'password',
            email: 'testuser@example.com',
            cargo: 'Desenvolvedor',
            status: true,
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            data_cadastro: new Date(),
            data_atualizacao: new Date(),
            data_ultimo_login: new Date(),
        };

        const user = new Usuario(userData);
        await expect(user.save()).rejects.toThrowErrorMatchingSnapshot();
    })
})