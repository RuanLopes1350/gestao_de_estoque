// src/tests/unit/models/Unidade.test.js
import mongoose from 'mongoose';
import Unidade from '../../../models/Unidade';
import mongoosePaginate from 'mongoose-paginate-v2';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Configuração antes de todos os testes
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        // As opções useNewUrlParser e useUnifiedTopology são desnecessárias no Mongoose 6+
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
    // Remove todos os documentos para garantir que os testes sejam isolados
    await Unidade.deleteMany({});
});

describe('Unidade Model', () => {
    it('should be invalid if nome is empty', async () => {
        const unidade = new Unidade();

        await expect(unidade.validate()).rejects.toThrow(mongoose.ValidationError);
        await expect(unidade.validate()).rejects.toHaveProperty('errors.nome');
    });

    it('should be invalid if localidade is empty', async () => {
        const unidade = new Unidade({ nome: 'Unidade Teste' });

        await expect(unidade.validate()).rejects.toThrow(mongoose.ValidationError);
        await expect(unidade.validate()).rejects.toHaveProperty('errors.localidade');
    });

    it('should have default value of ativo as true', () => {
        const unidade = new Unidade({ nome: 'Unidade Teste', localidade: 'Localidade Teste' });
        expect(unidade.ativo).toBe(true);
    });

    it('should trim nome and localidade fields', async () => {
        const unidade = new Unidade({
            nome: '  Unidade Teste  ',
            localidade: '  Localidade Teste  '
        });

        const savedUnidade = await unidade.save();

        expect(savedUnidade.nome).toBe('Unidade Teste');
        expect(savedUnidade.localidade).toBe('Localidade Teste');
    });

    it('should have timestamps', async () => {
        const unidade = new Unidade({ nome: 'Unidade Teste', localidade: 'Localidade Teste' });
        const savedUnidade = await unidade.save();

        expect(savedUnidade.createdAt).toBeDefined();
        expect(savedUnidade.updatedAt).toBeDefined();
    });

    it('should have a composite index on nome and localidade', () => {
        const indexes = Unidade.schema.indexes();
        const compositeIndex = indexes.find(
            index =>
                Object.keys(index[0]).length === 2 &&
                index[0].nome === 1 &&
                index[0].localidade === 1 &&
                index[1].unique === true
        );

        expect(compositeIndex).toBeDefined();
    });

});
