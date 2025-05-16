// src/tests/unit/models/Rota.test.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Rota from '../../../../src/models/Rota';
import mongoosePaginate from 'mongoose-paginate-v2';

describe('Modelo Rota', () => {
    let mongoServer;
    let rota;

    // Aumenta o tempo limite padrão do Jest (opcional)
    jest.setTimeout(10000); // 10 segundos

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        await mongoose.connect(uri, {

        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(() => {
        rota = new Rota({
            rota: 'test-route',
            dominio: 'test-domain'
        });
    });

    afterEach(async () => {
        // Limpa todos os dados após cada teste
        await Rota.deleteMany({});
    });

    it('deve ser inválido se "rota" estiver vazio', async () => {
        rota.rota = '';
        await expect(rota.validate()).rejects.toThrow();
        try {
            await rota.validate();
        } catch (error) {
            expect(error.errors.rota).toBeDefined();
        }
    });

    it('deve ser inválido se "dominio" estiver vazio', async () => {
        rota.dominio = '';
        await expect(rota.validate()).rejects.toThrow();
        try {
            await rota.validate();
        } catch (error) {
            expect(error.errors.dominio).toBeDefined();
        }
    });

    it('deve ter valores padrão para os campos booleanos', () => {
        expect(rota.ativo).toBe(true);
        expect(rota.buscar).toBe(true);
        expect(rota.enviar).toBe(true);
        expect(rota.substituir).toBe(true);
        expect(rota.modificar).toBe(true);
        expect(rota.excluir).toBe(true);
    });

    it('deve converter "rota" para minúsculas antes de salvar', async () => {
        rota.rota = 'Test-Route';
        const savedRota = await rota.save();
        expect(savedRota.rota).toBe('test-route');
    });

    it('deve remover espaços em branco de "rota" antes de salvar', async () => {
        rota.rota = '  test-route  ';
        const savedRota = await rota.save();
        expect(savedRota.rota).toBe('test-route');
    });

    it('deve criar um índice único para "rota" e "dominio"', async () => {
        await rota.save();

        const duplicateRota = new Rota({
            rota: 'test-route',
            dominio: 'test-domain'
        });

        await expect(duplicateRota.save()).rejects.toThrow();
    });

    it('deve utilizar o plugin mongoose-paginate-v2', () => {
        // Verifica se o método 'paginate' existe no modelo
        expect(typeof Rota.paginate).toBe('function');
    });

    it('deve ter timestamps', () => {
        expect(Rota.schema.options.timestamps).toBe(true);
    });
});
