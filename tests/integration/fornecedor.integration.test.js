const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Fornecedor Integration Tests', () => {
    let app;
    let helper;

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
    });

    describe('GET /api/fornecedores', () => {
        it('should list fornecedores successfully', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            // A resposta tem estrutura de paginação, então data.docs é o array
            expect(response.body.data).toHaveProperty('docs');
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should support pagination', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/fornecedores?page=1&limit=5')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toBeInstanceOf(Array);
        });

        it('should support filtering by nome', async () => {
            const token = await helper.getAdminToken();
            
            // Criar fornecedor para testar filtro
            await helper.createTestFornecedor(token);

            const response = await request(app)
                .get('/api/fornecedores?nome=Fornecedor Teste')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toBeInstanceOf(Array);
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .get('/api/fornecedores');

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('POST /api/fornecedores', () => {
        it('should create fornecedor successfully with valid data', async () => {
            const token = await helper.getAdminToken();
            const fornecedorData = {
                nome_fornecedor: 'Fornecedor ABC LTDA',
                cnpj: '98.765.432/0001-10',
                telefone: '(11) 88888-8888',
                email: 'contato@fornecedorabc.com',
                endereco: [{
                    rua: 'Av. Principal, 456',
                    cidade: 'Rio de Janeiro',
                    estado: 'RJ',
                    cep: '20000-000'
                }],
                ativo: true
            };

            const response = await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`)
                .send(fornecedorData);

            helper.expectValidResponse(response, 201);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.nome_fornecedor).toBe(fornecedorData.nome_fornecedor);
            expect(response.body.data.cnpj).toBe(fornecedorData.cnpj);
            expect(response.body.data.email).toBe(fornecedorData.email);
            expect(response.body.data.endereco).toHaveLength(1);
        });

        it('should fail with duplicate CNPJ', async () => {
            const token = await helper.getAdminToken();
            
            // Criar primeiro fornecedor
            const fornecedorData1 = {
                nome_fornecedor: 'Fornecedor 1',
                cnpj: '11.222.333/0001-44',
                telefone: '(11) 11111-1111',
                email: 'fornecedor1@teste.com',
                endereco: [{
                    rua: 'Rua 1',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '01000-000'
                }]
            };

            await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`)
                .send(fornecedorData1);

            // Tentar criar segundo fornecedor com mesmo CNPJ
            const fornecedorData2 = {
                ...fornecedorData1,
                nome_fornecedor: 'Fornecedor 2',
                email: 'fornecedor2@teste.com',
                cnpj: '11.222.333/0001-44' // Mesmo CNPJ
            };

            const response = await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`)
                .send(fornecedorData2);

            helper.expectErrorResponse(response, 400);
            expect(response.body.message).toContain('CNPJ');
        });

        it('should fail with duplicate email', async () => {
            const token = await helper.getAdminToken();
            
            // Criar primeiro fornecedor
            const fornecedorData1 = {
                nome_fornecedor: 'Fornecedor 1',
                cnpj: '11.222.333/0001-44',
                telefone: '(11) 11111-1111',
                email: 'duplicado@teste.com',
                endereco: [{
                    rua: 'Rua 1',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '01000-000'
                }]
            };

            await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`)
                .send(fornecedorData1);

            // Tentar criar segundo fornecedor com mesmo email
            const fornecedorData2 = {
                ...fornecedorData1,
                nome_fornecedor: 'Fornecedor 2',
                cnpj: '55.666.777/0001-88',
                email: 'duplicado@teste.com' // Mesmo email
            };

            const response = await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`)
                .send(fornecedorData2);

            helper.expectErrorResponse(response, 400);
            expect(response.body.message).toContain('email');
        });

        it('should fail with missing required fields', async () => {
            const token = await helper.getAdminToken();
            const fornecedorData = {
                nome_fornecedor: 'Fornecedor Incompleto'
                // Faltando campos obrigatórios
            };

            const response = await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`)
                .send(fornecedorData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with invalid CNPJ format', async () => {
            const token = await helper.getAdminToken();
            const fornecedorData = {
                nome_fornecedor: 'Fornecedor CNPJ Inválido',
                cnpj: '123456789', // CNPJ inválido
                telefone: '(11) 99999-9999',
                email: 'cnpjinvalido@teste.com',
                endereco: [{
                    rua: 'Rua Teste',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '01000-000'
                }]
            };

            const response = await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`)
                .send(fornecedorData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const fornecedorData = {
                nome_fornecedor: 'Fornecedor Sem Token',
                cnpj: '12.345.678/0001-90',
                telefone: '(11) 99999-9999',
                email: 'semtoken@teste.com',
                endereco: [{
                    rua: 'Rua Teste',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '01000-000'
                }]
            };

            const response = await request(app)
                .post('/api/fornecedores')
                .send(fornecedorData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('GET /api/fornecedores/:id', () => {
        it('should get fornecedor by ID successfully', async () => {
            const token = await helper.getAdminToken();
            const fornecedor = await helper.createTestFornecedor(token);

            const response = await request(app)
                .get(`/api/fornecedores/${fornecedor._id}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toHaveProperty('_id', fornecedor._id);
            expect(response.body.data).toHaveProperty('nome_fornecedor');
            expect(response.body.data).toHaveProperty('cnpj');
            expect(response.body.data).toHaveProperty('email');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/fornecedores/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail with invalid ID format', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/fornecedores/invalid-id')
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            const fornecedor = await helper.createTestFornecedor(token);

            const response = await request(app)
                .get(`/api/fornecedores/${fornecedor._id}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('PATCH /api/fornecedores/:id', () => {
        it('should update fornecedor successfully', async () => {
            const token = await helper.getAdminToken();
            const fornecedor = await helper.createTestFornecedor(token);
            const updateData = {
                nome_fornecedor: 'Fornecedor Atualizado LTDA',
                telefone: '(11) 77777-7777'
            };

            const response = await request(app)
                .patch(`/api/fornecedores/${fornecedor._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.nome_fornecedor).toBe(updateData.nome_fornecedor);
            expect(response.body.data.telefone).toBe(updateData.telefone);
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const updateData = {
                nome_fornecedor: 'Fornecedor Atualizado'
            };

            const response = await request(app)
                .patch(`/api/fornecedores/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            const fornecedor = await helper.createTestFornecedor(token);
            const updateData = {
                nome_fornecedor: 'Fornecedor Atualizado'
            };

            const response = await request(app)
                .patch(`/api/fornecedores/${fornecedor._id}`)
                .send(updateData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('DELETE /api/fornecedores/:id', () => {
        it('should delete fornecedor successfully', async () => {
            const token = await helper.getAdminToken();
            const fornecedor = await helper.createTestFornecedor(token);

            const response = await request(app)
                .delete(`/api/fornecedores/${fornecedor._id}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('deletado com sucesso');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/fornecedores/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            const fornecedor = await helper.createTestFornecedor(token);

            const response = await request(app)
                .delete(`/api/fornecedores/${fornecedor._id}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('PATCH /api/fornecedores/:id/desativar', () => {
        it('should deactivate fornecedor successfully', async () => {
            const token = await helper.getAdminToken();
            const fornecedor = await helper.createTestFornecedor(token);

            const response = await request(app)
                .patch(`/api/fornecedores/${fornecedor._id}/desativar`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('desativado com sucesso');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .patch(`/api/fornecedores/${fakeId}/desativar`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });
    });

    describe('PATCH /api/fornecedores/:id/reativar', () => {
        it('should reactivate fornecedor successfully', async () => {
            const token = await helper.getAdminToken();
            const fornecedor = await helper.createTestFornecedor(token);

            // Primeiro desativar
            await request(app)
                .patch(`/api/fornecedores/${fornecedor._id}/desativar`)
                .set('Authorization', `Bearer ${token}`);

            // Depois reativar
            const response = await request(app)
                .patch(`/api/fornecedores/${fornecedor._id}/reativar`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('reativado com sucesso');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .patch(`/api/fornecedores/${fakeId}/reativar`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });
    });
});
