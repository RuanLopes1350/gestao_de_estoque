import mongoose from 'mongoose';
import Produto from '../../models/Produto.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

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
})

// Limpeza após cada teste para garantir isolamento
afterEach(async () => {
    jest.clearAllMocks();
    await Produto.deleteMany({});
});

describe('Modelo de Produto', () => {
    it('deve criar um produto com dados válidos', async () => {
        const productData = {
            nome_produto: 'Produto Teste',
            descricao: 'Descrição do produto teste',
            preco: 99.99,
            marca: 'Marca Teste',
            custo: 49.99,
            categoria: 'Categoria Teste',
            estoque: 100,
            estoque_min: 10,
            data_ultima_entrada: new Date(),
            status: true,
            id_fornecedor: 1,
            codigo_produto: 'PROD123',
        }

        const product = new Produto(productData);
        await product.save();

        const savedProduct = await Produto.findById(product._id);

        expect(savedProduct.nome_produto).toBe(productData.nome_produto);
        expect(savedProduct.descricao).toBe(productData.descricao);
        expect(savedProduct.preco).toBe(productData.preco);
        expect(savedProduct.marca).toBe(productData.marca);
        expect(savedProduct.custo).toBe(productData.custo);
        expect(savedProduct.categoria).toBe(productData.categoria);
        expect(savedProduct.estoque).toBe(productData.estoque);
        expect(savedProduct.estoque_min).toBe(productData.estoque_min);
        expect(savedProduct.data_ultima_entrada).toEqual(productData.data_ultima_entrada);
        expect(savedProduct.status).toBe(productData.status);
        expect(savedProduct.id_fornecedor).toBe(productData.id_fornecedor);
        expect(savedProduct.codigo_produto).toBe(productData.codigo_produto);
    });

    it('deve falhar ao criar um produto sem nome', async () => {
        const productData = {
            descricao: 'Descrição do produto teste',
            preco: 99.99,
            marca: 'Marca Teste',
            custo: 49.99,
            categoria: 'Categoria Teste',
            estoque: 100,
            estoque_min: 10,
            data_ultima_entrada: new Date(),
            status: true,
            id_fornecedor: 1,
            codigo_produto: 'PROD123',
        };

        const product = new Produto(productData);
        await expect(product.save()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('deve falhar ao criar um produto com nome duplicado', async () => {
        const productData = {
            nome_produto: 'Produto Teste',
            descricao: 'Descrição do produto teste',
            preco: 99.99,
            marca: 'Marca Teste',
            custo: 49.99,
            categoria: 'Categoria Teste',
            estoque: 100,
            estoque_min: 10,
            data_ultima_entrada: new Date(),
            status: true,
            id_fornecedor: 1,
            codigo_produto: 'PROD123',
        };

        const product1 = new Produto(productData);
        await product1.save();

        const product2 = new Produto(productData);
        await expect(product2.save()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('deve falhar ao criar um produto sem preço', async () => {
        const productData = {
            nome_produto: 'Produto Teste',
            descricao: 'Descrição do produto teste',
            marca: 'Marca Teste',
            custo: 49.99,
            categoria: 'Categoria Teste',
            estoque: 100,
            estoque_min: 10,
            data_ultima_entrada: new Date(),
            status: true,
            id_fornecedor: 1,
            codigo_produto: 'PROD123',
        };

        const product = new Produto(productData);
        await expect(product.save()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('deve falhar ao criar um produto com codigo de produto duplicado', async () => {
        const productData = {
            nome_produto: 'Produto Teste',
            descricao: 'Descrição do produto teste',
            preco: 99.99,
            marca: 'Marca Teste',
            custo: 49.99,
            categoria: 'Categoria Teste',
            estoque: 100,
            estoque_min: 10,
            data_ultima_entrada: new Date(),
            status: true,
            id_fornecedor: 1,
            codigo_produto: 'PROD123',
        };

        const product1 = new Produto(productData);
        await product1.save();

        const productData2 = {
            nome_produto: 'Produto Teste 2',
            descricao: 'Descrição do produto teste 2',
            preco: 199.99,
            marca: 'Marca Teste 2',
            custo: 99.99,
            categoria: 'Categoria Teste 2',
            estoque: 50,
            estoque_min: 5,
            data_ultima_entrada: new Date(),
            status: true,
            id_fornecedor: 2,
            codigo_produto: 'PROD123',
        };

        const product2 = new Produto(productData2);
        await expect(product2.save()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('deve falhar ao criar um produto sem id_fornecedor', async () => {
        const productData = {
            nome_produto: 'Produto Teste',
            descricao: 'Descrição do produto teste',
            preco: 99.99,
            marca: 'Marca Teste',
            custo: 49.99,
            categoria: 'Categoria Teste',
            estoque: 100,
            estoque_min: 10,
            data_ultima_entrada: new Date(),
            status: true,
            codigo_produto: 'PROD104',
        };

        const product = new Produto(productData);
        await expect(product.save()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('deve falhar ao criar um produto sem categoria', async () => {
        const productData = {
            nome_produto: 'Produto Sem Categoria',
            descricao: 'Descrição do produto teste',
            preco: 99.99,
            marca: 'Marca Teste',
            custo: 49.99,
            estoque: 100,
            estoque_min: 10,
            data_ultima_entrada: new Date(),
            status: true,
            id_fornecedor: 1,
            codigo_produto: 'PROD999',
        };

        const product = new Produto(productData);
        await expect(product.save()).rejects.toThrowErrorMatchingSnapshot();
    });
});