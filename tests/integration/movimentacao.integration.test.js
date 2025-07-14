const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Movimentacao Integration Tests', () => {
    let app;
    let helper;
    let fornecedor;
    let produto;

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
        produto = await helper.createTestProduto(token, fornecedor._id);
    });

    describe('GET /api/movimentacoes', () => {
        it('should list movimentacoes successfully', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should support pagination', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/movimentacoes?page=1&limit=5')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should support filtering by tipo', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/movimentacoes?tipo=entrada')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .get('/api/movimentacoes');

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('POST /api/movimentacoes', () => {
        it('should create entrada movimentacao successfully', async () => {
            const token = await helper.getAdminToken();
            const movimentacaoData = {
                tipo: 'entrada',
                produto_id: produto._id,
                quantidade: 50,
                destino: 'Estoque Principal',
                observacoes: 'Entrada de mercadoria do fornecedor'
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send(movimentacaoData);

            helper.expectValidResponse(response, 201);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.tipo).toBe(movimentacaoData.tipo);
            expect(response.body.data.quantidade).toBe(movimentacaoData.quantidade);
            expect(response.body.data.produto_id).toBe(produto._id);
            expect(response.body.data).toHaveProperty('usuario_id');
        });

        it('should create saida movimentacao successfully', async () => {
            const token = await helper.getAdminToken();
            const movimentacaoData = {
                tipo: 'saida',
                produto_id: produto._id,
                quantidade: 10,
                destino: 'Venda',
                observacoes: 'Saída para venda'
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send(movimentacaoData);

            helper.expectValidResponse(response, 201);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.tipo).toBe(movimentacaoData.tipo);
            expect(response.body.data.quantidade).toBe(movimentacaoData.quantidade);
        });

        it('should fail with insufficient stock for saida', async () => {
            const token = await helper.getAdminToken();
            const movimentacaoData = {
                tipo: 'saida',
                produto_id: produto._id,
                quantidade: 999999, // Quantidade maior que o estoque
                destino: 'Venda',
                observacoes: 'Tentativa de saída com estoque insuficiente'
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send(movimentacaoData);

            helper.expectErrorResponse(response, 400);
            expect(response.body.message).toContain('estoque insuficiente');
        });

        it('should fail with non-existent produto', async () => {
            const token = await helper.getAdminToken();
            const movimentacaoData = {
                tipo: 'entrada',
                produto_id: '507f1f77bcf86cd799439011', // ID que não existe
                quantidade: 10,
                destino: 'Estoque',
                observacoes: 'Teste com produto inexistente'
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send(movimentacaoData);

            helper.expectErrorResponse(response, 404);
            expect(response.body.message).toContain('Produto não encontrado');
        });

        it('should fail with missing required fields', async () => {
            const token = await helper.getAdminToken();
            const movimentacaoData = {
                tipo: 'entrada'
                // Faltando campos obrigatórios
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send(movimentacaoData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with invalid tipo', async () => {
            const token = await helper.getAdminToken();
            const movimentacaoData = {
                tipo: 'tipo_invalido',
                produto_id: produto._id,
                quantidade: 10,
                destino: 'Estoque'
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send(movimentacaoData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with negative quantity', async () => {
            const token = await helper.getAdminToken();
            const movimentacaoData = {
                tipo: 'entrada',
                produto_id: produto._id,
                quantidade: -10,
                destino: 'Estoque'
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send(movimentacaoData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const movimentacaoData = {
                tipo: 'entrada',
                produto_id: produto._id,
                quantidade: 10,
                destino: 'Estoque'
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .send(movimentacaoData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('GET /api/movimentacoes/:id', () => {
        it('should get movimentacao by ID successfully', async () => {
            const token = await helper.getAdminToken();
            
            // Criar movimentação
            const createResponse = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'entrada',
                    produto_id: produto._id,
                    quantidade: 25,
                    destino: 'Estoque Principal'
                });

            const movimentacaoId = createResponse.body.data._id;

            const response = await request(app)
                .get(`/api/movimentacoes/${movimentacaoId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toHaveProperty('_id', movimentacaoId);
            expect(response.body.data).toHaveProperty('tipo');
            expect(response.body.data).toHaveProperty('quantidade');
            expect(response.body.data).toHaveProperty('produto_id');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/movimentacoes/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail with invalid ID format', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/movimentacoes/invalid-id')
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            
            // Criar movimentação
            const createResponse = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'entrada',
                    produto_id: produto._id,
                    quantidade: 25,
                    destino: 'Estoque Principal'
                });

            const movimentacaoId = createResponse.body.data._id;

            const response = await request(app)
                .get(`/api/movimentacoes/${movimentacaoId}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('PATCH /api/movimentacoes/:id', () => {
        it('should update movimentacao successfully', async () => {
            const token = await helper.getAdminToken();
            
            // Criar movimentação
            const createResponse = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'entrada',
                    produto_id: produto._id,
                    quantidade: 25,
                    destino: 'Estoque Principal'
                });

            const movimentacaoId = createResponse.body.data._id;
            const updateData = {
                observacoes: 'Observação atualizada',
                destino: 'Estoque Secundário'
            };

            const response = await request(app)
                .patch(`/api/movimentacoes/${movimentacaoId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.observacoes).toBe(updateData.observacoes);
            expect(response.body.data.destino).toBe(updateData.destino);
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const updateData = {
                observacoes: 'Observação atualizada'
            };

            const response = await request(app)
                .patch(`/api/movimentacoes/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            
            // Criar movimentação
            const createResponse = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'entrada',
                    produto_id: produto._id,
                    quantidade: 25,
                    destino: 'Estoque Principal'
                });

            const movimentacaoId = createResponse.body.data._id;
            const updateData = {
                observacoes: 'Observação atualizada'
            };

            const response = await request(app)
                .patch(`/api/movimentacoes/${movimentacaoId}`)
                .send(updateData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('DELETE /api/movimentacoes/:id', () => {
        it('should delete movimentacao successfully', async () => {
            const token = await helper.getAdminToken();
            
            // Criar movimentação
            const createResponse = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'entrada',
                    produto_id: produto._id,
                    quantidade: 25,
                    destino: 'Estoque Principal'
                });

            const movimentacaoId = createResponse.body.data._id;

            const response = await request(app)
                .delete(`/api/movimentacoes/${movimentacaoId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('deletada com sucesso');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/movimentacoes/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            
            // Criar movimentação
            const createResponse = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'entrada',
                    produto_id: produto._id,
                    quantidade: 25,
                    destino: 'Estoque Principal'
                });

            const movimentacaoId = createResponse.body.data._id;

            const response = await request(app)
                .delete(`/api/movimentacoes/${movimentacaoId}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('Stock Updates Integration', () => {
        it('should update product stock correctly on entrada', async () => {
            const token = await helper.getAdminToken();
            const initialStock = produto.estoque;

            // Criar movimentação de entrada
            await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'entrada',
                    produto_id: produto._id,
                    quantidade: 50,
                    destino: 'Estoque Principal'
                });

            // Verificar se o estoque foi atualizado
            const produtoResponse = await request(app)
                .get(`/api/produtos/${produto._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(produtoResponse.body.data.estoque).toBe(initialStock + 50);
        });

        it('should update product stock correctly on saida', async () => {
            const token = await helper.getAdminToken();
            const initialStock = produto.estoque;

            // Criar movimentação de saída
            await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'saida',
                    produto_id: produto._id,
                    quantidade: 10,
                    destino: 'Venda'
                });

            // Verificar se o estoque foi atualizado
            const produtoResponse = await request(app)
                .get(`/api/produtos/${produto._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(produtoResponse.body.data.estoque).toBe(initialStock - 10);
        });
    });
});
