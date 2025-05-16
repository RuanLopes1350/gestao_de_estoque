// src/tests/unit/models/Usuario.test.js
import mongoose from 'mongoose';
import Usuario from '../../../../src/models/Usuario.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

// src/tests/unit/models/Usuario.test.js

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
            nome: 'Test User',
            email: 'test@example.com',
            senha: 'password123',
            link_foto: 'http://example.com/photo.jpg',
            ativo: true,
            permissoes: [
                {
                    rota: 'usuarios',
                    dominio: 'http://localhost:3000',
                    ativo: true,
                    buscar: true,
                    enviar: true,
                    substituir: true,
                    modificar: true,
                    excluir: true
                }
            ]
        };

        const user = new Usuario(userData);
        await user.save();

        const savedUser = await Usuario.findById(user._id).select('-senha'); // Busca o usuário sem o campo senha

        expect(savedUser.nome).toBe(userData.nome);
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.senha).toBeUndefined(); // Verificação para confirmar que senha não está presente
        expect(savedUser.link_foto).toBe(userData.link_foto);
        expect(savedUser.ativo).toBe(userData.ativo);
        expect(savedUser.permissoes.length).toBe(1);
        expect(savedUser.permissoes[0].rota).toBe(userData.permissoes[0].rota);
    });

    it('não deve criar um usuário com email duplicado', async () => {
        const userData = {
            nome: 'Test User',
            email: 'duplicate@example.com',
            senha: 'password123'
        };

        const user1 = new Usuario(userData);
        await user1.save();

        const user2 = new Usuario(userData);
        await expect(user2.save()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('não deve criar um usuário com rota e domínio duplicados em permissões', async () => {
        const userData = {
            nome: 'Test User',
            email: 'test2@example.com',
            senha: 'password123',
            permissoes: [
                {
                    rota: 'usuarios',
                    dominio: 'http://localhost:3000',
                    ativo: true,
                    buscar: true,
                    enviar: true,
                    substituir: true,
                    modificar: true,
                    excluir: true
                },
                {
                    rota: 'usuarios',
                    dominio: 'http://localhost:3000',
                    ativo: true,
                    buscar: true,
                    enviar: true,
                    substituir: true,
                    modificar: true,
                    excluir: true
                }
            ]
        };

        const user = new Usuario(userData);
        await expect(user.save()).rejects.toThrowError('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada usuário.');
    });

    it('deve criar um usuário com múltiplas permissões válidas', async () => {
        const userData = {
            nome: 'Test User',
            email: 'test3@example.com',
            senha: 'password123',
            permissoes: [
                {
                    rota: 'usuarios',
                    dominio: 'http://localhost:3000',
                    ativo: true,
                    buscar: true,
                    enviar: true,
                    substituir: true,
                    modificar: true,
                    excluir: true
                },
                {
                    rota: 'grupos',
                    dominio: 'http://localhost:3000',
                    ativo: true,
                    buscar: true,
                    enviar: true,
                    substituir: true,
                    modificar: true,
                    excluir: true
                }
            ]
        };

        const user = new Usuario(userData);
        await user.save();

        const savedUser = await Usuario.findById(user._id).select('-senha');

        expect(savedUser.permissoes.length).toBe(2);
        expect(savedUser.permissoes[0].rota).toBe(userData.permissoes[0].rota);
        expect(savedUser.permissoes[1].rota).toBe(userData.permissoes[1].rota);
    });

    it('deve criar um usuário com unidades e grupos válidos', async () => {
        const unidadeId = new mongoose.Types.ObjectId();
        const grupoId = new mongoose.Types.ObjectId();

        const userData = {
            nome: 'Test User',
            email: 'test4@example.com',
            senha: 'password123',
            unidades: [unidadeId],
            grupos: [grupoId]
        };

        const user = new Usuario(userData);
        await user.save();

        const savedUser = await Usuario.findById(user._id).select('-senha');

        expect(savedUser.unidades.length).toBe(1);
        expect(savedUser.unidades[0].toString()).toBe(unidadeId.toString());
        expect(savedUser.grupos.length).toBe(1);
        expect(savedUser.grupos[0].toString()).toBe(grupoId.toString());
    });
});