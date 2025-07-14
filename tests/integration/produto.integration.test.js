const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Produto Integration Tests', () => {
    let app;
    let helper;
    let fornecedor;

    beforeAll(async () => {
        helper = new IntegrationTestHelper();
        await helper.setup();
        app = await helper.getApp();
    });

    afterAll(async () => {
        await helper.teardown();
    });

    beforeEach(async () => {
        // await helper.cleanDatabase(); // Otimizado para performance
        const token = await helper.getAdminToken();
        fornecedor = await helper.createTestFornecedor(token);
    });

    describe('GET /api/produtos', () => {
        it('should list products successfully', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/produtos')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should support pagination', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/produtos?page=1&limit=5')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should support filtering by categoria', async () => {
            const token = await helper.getAdminToken();
            
            // Criar produto para testar filtro
            await helper.createTestProduto(token, fornecedor._id);

            const response = await request(app)
                .get('/api/produtos?categoria=Categoria Teste')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .get('/api/produtos');

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('POST /api/produtos', () => {
        it('should create product successfully with valid data', async () => {
            const token = await helper.getAdminToken();
            const produtoData = {
                nome_produto: 'Notebook Dell Inspiron',
                descricao: 'Notebook para uso profissional',
                preco: 2500.00,
                marca: 'Dell',
                custo: 2000.00,
                categoria: 'Eletrônicos',
                estoque: 50,
                estoque_minimo: 5,
                fornecedor: fornecedor._id,
                codigo_barras: '7891234567890',
                ativo: true
            };

            const response = await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${token}`)
                .send(produtoData);

            helper.expectValidResponse(response, 201);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.nome_produto).toBe(produtoData.nome_produto);
            expect(response.body.data.preco).toBe(produtoData.preco);
            expect(response.body.data.estoque).toBe(produtoData.estoque);
            expect(response.body.data.fornecedor).toBe(fornecedor._id);
        });

        it('should fail with duplicate codigo_barras', async () => {
            const token = await helper.getAdminToken();
            
            // Criar primeiro produto
            const produtoData1 = {
                nome_produto: 'Produto 1',
                descricao: 'Descrição 1',
                preco: 100.00,
                marca: 'Marca',
                custo: 50.00,
                categoria: 'Categoria',
                estoque: 10,
                estoque_minimo: 1,
                fornecedor: fornecedor._id,
                codigo_barras: '1234567890123'
            };

            await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${token}`)
                .send(produtoData1);

            // Tentar criar segundo produto com mesmo código de barras
            const produtoData2 = {
                ...produtoData1,
                nome_produto: 'Produto 2',
                codigo_barras: '1234567890123' // Mesmo código
            };

            const response = await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${token}`)
                .send(produtoData2);

            helper.expectErrorResponse(response, 400);
            expect(response.body.message).toContain('código de barras');
        });

        it('should fail with missing required fields', async () => {
            const token = await helper.getAdminToken();
            const produtoData = {
                nome_produto: 'Produto Incompleto'
                // Faltando campos obrigatórios
            };

            const response = await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${token}`)
                .send(produtoData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with invalid fornecedor ID', async () => {
            const token = await helper.getAdminToken();
            const produtoData = {
                nome_produto: 'Produto Teste',
                descricao: 'Descrição',
                preco: 100.00,
                marca: 'Marca',
                custo: 50.00,
                categoria: 'Categoria',
                estoque: 10,
                estoque_minimo: 1,
                fornecedor: '507f1f77bcf86cd799439011' // ID que não existe
            };

            const response = await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${token}`)
                .send(produtoData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const produtoData = {
                nome_produto: 'Produto Sem Token',
                descricao: 'Descrição',
                preco: 100.00,
                marca: 'Marca',
                custo: 50.00,
                categoria: 'Categoria',
                estoque: 10,
                estoque_minimo: 1,
                fornecedor: fornecedor._id
            };

            const response = await request(app)
                .post('/api/produtos')
                .send(produtoData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('GET /api/produtos/:id', () => {
        it('should get product by ID successfully', async () => {
            const token = await helper.getAdminToken();
            const produto = await helper.createTestProduto(token, fornecedor._id);

            const response = await request(app)
                .get(`/api/produtos/${produto._id}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toHaveProperty('_id', produto._id);
            expect(response.body.data).toHaveProperty('nome_produto');
            expect(response.body.data).toHaveProperty('preco');
            expect(response.body.data).toHaveProperty('estoque');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/produtos/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail with invalid ID format', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/produtos/invalid-id')
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            const produto = await helper.createTestProduto(token, fornecedor._id);

            const response = await request(app)
                .get(`/api/produtos/${produto._id}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('PATCH /api/produtos/:id', () => {
        it('should update product successfully', async () => {
            const token = await helper.getAdminToken();
            const produto = await helper.createTestProduto(token, fornecedor._id);
            const updateData = {
                nome_produto: 'Produto Atualizado',
                preco: 150.00,
                estoque: 75
            };

            const response = await request(app)
                .patch(`/api/produtos/${produto._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.nome_produto).toBe(updateData.nome_produto);
            expect(response.body.data.preco).toBe(updateData.preco);
            expect(response.body.data.estoque).toBe(updateData.estoque);
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const updateData = {
                nome_produto: 'Produto Atualizado'
            };

            const response = await request(app)
                .patch(`/api/produtos/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            const produto = await helper.createTestProduto(token, fornecedor._id);
            const updateData = {
                nome_produto: 'Produto Atualizado'
            };

            const response = await request(app)
                .patch(`/api/produtos/${produto._id}`)
                .send(updateData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('DELETE /api/produtos/:id', () => {
        it('should delete product successfully', async () => {
            const token = await helper.getAdminToken();
            const produto = await helper.createTestProduto(token, fornecedor._id);

            const response = await request(app)
                .delete(`/api/produtos/${produto._id}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('deletado com sucesso');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/produtos/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            const produto = await helper.createTestProduto(token, fornecedor._id);

            const response = await request(app)
                .delete(`/api/produtos/${produto._id}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('GET /api/produtos/buscar/nome/:nome', () => {
        it('should search products by name successfully', async () => {
            const token = await helper.getAdminToken();
            await helper.createTestProduto(token, fornecedor._id);

            const response = await request(app)
                .get('/api/produtos/buscar/nome/Produto Teste')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should return empty array for non-existent name', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/produtos/buscar/nome/ProdutoInexistente')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
            expect(response.body.data.docs.length).toBe(0);
        });
    });

    describe('GET /api/produtos/buscar/categoria/:categoria', () => {
        it('should search products by category successfully', async () => {
            const token = await helper.getAdminToken();
            await helper.createTestProduto(token, fornecedor._id);

            const response = await request(app)
                .get('/api/produtos/buscar/categoria/Categoria Teste')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });
    });

    describe('GET /api/produtos/buscar/codigo/:codigo', () => {
        it('should search products by code successfully', async () => {
            const token = await helper.getAdminToken();
            const produto = await helper.createTestProduto(token, fornecedor._id);

            // Assumindo que o produto tem um código gerado
            const response = await request(app)
                .get(`/api/produtos/buscar/codigo/${produto.codigo_produto || 'P001'}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });
    });
});
