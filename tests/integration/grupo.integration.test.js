const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Grupo Integration Tests', () => {
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

    describe('GET /api/grupos', () => {
        it('should list grupos successfully', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/grupos')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            // A resposta tem estrutura de paginação, então data.docs é o array
            expect(response.body.data).toHaveProperty('docs');
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should support pagination', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/grupos?page=1&limit=5')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should support filtering by nome', async () => {
            const token = await helper.getAdminToken();
            
            // Criar grupo para testar filtro
            await helper.createTestGrupo(token);

            const response = await request(app)
                .get('/api/grupos?nome=Grupo Teste')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .get('/api/grupos');

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('POST /api/grupos', () => {
        it('should create grupo successfully with valid data', async () => {
            const token = await helper.getAdminToken();
            const grupoData = {
                nome: 'Administradores Sistema',
                descricao: 'Grupo com permissões administrativas do sistema',
                ativo: true
            };

            const response = await request(app)
                .post('/api/grupos')
                .set('Authorization', `Bearer ${token}`)
                .send(grupoData);

            helper.expectValidResponse(response, 201);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.nome).toBe(grupoData.nome);
            expect(response.body.data.descricao).toBe(grupoData.descricao);
            expect(response.body.data.ativo).toBe(grupoData.ativo);
        });

        it('should fail with duplicate nome', async () => {
            const token = await helper.getAdminToken();
            
            // Criar primeiro grupo
            const grupoData1 = {
                nome: 'Grupo Duplicado',
                descricao: 'Primeiro grupo',
                ativo: true
            };

            await request(app)
                .post('/api/grupos')
                .set('Authorization', `Bearer ${token}`)
                .send(grupoData1);

            // Tentar criar segundo grupo com mesmo nome
            const grupoData2 = {
                nome: 'Grupo Duplicado', // Mesmo nome
                descricao: 'Segundo grupo',
                ativo: true
            };

            const response = await request(app)
                .post('/api/grupos')
                .set('Authorization', `Bearer ${token}`)
                .send(grupoData2);

            helper.expectErrorResponse(response, 400);
            expect(response.body.message).toContain('nome');
        });

        it('should fail with missing required fields', async () => {
            const token = await helper.getAdminToken();
            const grupoData = {
                descricao: 'Grupo sem nome'
                // Faltando nome obrigatório
            };

            const response = await request(app)
                .post('/api/grupos')
                .set('Authorization', `Bearer ${token}`)
                .send(grupoData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with empty nome', async () => {
            const token = await helper.getAdminToken();
            const grupoData = {
                nome: '',
                descricao: 'Grupo com nome vazio'
            };

            const response = await request(app)
                .post('/api/grupos')
                .set('Authorization', `Bearer ${token}`)
                .send(grupoData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const grupoData = {
                nome: 'Grupo Sem Token',
                descricao: 'Tentativa de criar grupo sem autenticação'
            };

            const response = await request(app)
                .post('/api/grupos')
                .send(grupoData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('GET /api/grupos/:id', () => {
        it('should get grupo by ID successfully', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);

            const response = await request(app)
                .get(`/api/grupos/${grupo._id}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toHaveProperty('_id', grupo._id);
            expect(response.body.data).toHaveProperty('nome');
            expect(response.body.data).toHaveProperty('descricao');
            expect(response.body.data).toHaveProperty('ativo');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/grupos/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail with invalid ID format', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/grupos/invalid-id')
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);

            const response = await request(app)
                .get(`/api/grupos/${grupo._id}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('PATCH /api/grupos/:id', () => {
        it('should update grupo successfully', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);
            const updateData = {
                nome: 'Grupo Atualizado',
                descricao: 'Descrição atualizada do grupo'
            };

            const response = await request(app)
                .patch(`/api/grupos/${grupo._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.nome).toBe(updateData.nome);
            expect(response.body.data.descricao).toBe(updateData.descricao);
        });

        it('should fail to update with duplicate nome', async () => {
            const token = await helper.getAdminToken();
            
            // Criar dois grupos
            const grupo1 = await helper.createTestGrupo(token);
            
            const grupoData2 = {
                nome: 'Segundo Grupo',
                descricao: 'Segundo grupo de teste'
            };
            const createResponse = await request(app)
                .post('/api/grupos')
                .set('Authorization', `Bearer ${token}`)
                .send(grupoData2);
            const grupo2 = createResponse.body.data;

            // Tentar atualizar segundo grupo com nome do primeiro
            const updateData = {
                nome: grupo1.nome // Nome já existe
            };

            const response = await request(app)
                .patch(`/api/grupos/${grupo2._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const updateData = {
                nome: 'Grupo Atualizado'
            };

            const response = await request(app)
                .patch(`/api/grupos/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);
            const updateData = {
                nome: 'Grupo Atualizado'
            };

            const response = await request(app)
                .patch(`/api/grupos/${grupo._id}`)
                .send(updateData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('DELETE /api/grupos/:id', () => {
        it('should delete grupo successfully', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);

            const response = await request(app)
                .delete(`/api/grupos/${grupo._id}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('deletado com sucesso');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/grupos/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);

            const response = await request(app)
                .delete(`/api/grupos/${grupo._id}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('PATCH /api/grupos/:id/status', () => {
        it('should change grupo status successfully', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);
            const statusData = {
                ativo: false
            };

            const response = await request(app)
                .patch(`/api/grupos/${grupo._id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send(statusData);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.ativo).toBe(statusData.ativo);
            expect(response.body.message).toContain('status alterado');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const statusData = {
                ativo: false
            };

            const response = await request(app)
                .patch(`/api/grupos/${fakeId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send(statusData);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without status field', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);

            const response = await request(app)
                .patch(`/api/grupos/${grupo._id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({});

            helper.expectErrorResponse(response, 400);
        });
    });

    describe('POST /api/grupos/:id/permissoes', () => {
        it('should add permission to grupo successfully', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);
            const permissaoData = {
                rota: 'produtos',
                permissoes: ['buscar', 'enviar']
            };

            const response = await request(app)
                .post(`/api/grupos/${grupo._id}/permissoes`)
                .set('Authorization', `Bearer ${token}`)
                .send(permissaoData);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('adicionada com sucesso');
        });

        it('should fail with non-existent grupo ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const permissaoData = {
                rota: 'produtos',
                permissoes: ['buscar', 'enviar']
            };

            const response = await request(app)
                .post(`/api/grupos/${fakeId}/permissoes`)
                .set('Authorization', `Bearer ${token}`)
                .send(permissaoData);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail with invalid permission data', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);
            const permissaoData = {
                // Dados de permissão inválidos ou incompletos
                rota: 'produtos'
                // Faltando permissoes
            };

            const response = await request(app)
                .post(`/api/grupos/${grupo._id}/permissoes`)
                .set('Authorization', `Bearer ${token}`)
                .send(permissaoData);

            helper.expectErrorResponse(response, 400);
        });
    });

    describe('DELETE /api/grupos/:id/permissoes', () => {
        it('should remove permission from grupo successfully', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);
            
            // Primeiro adicionar uma permissão
            await request(app)
                .post(`/api/grupos/${grupo._id}/permissoes`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rota: 'produtos',
                    permissoes: ['buscar', 'enviar']
                });

            // Depois remover a permissão
            const removeData = {
                rota: 'produtos'
            };

            const response = await request(app)
                .delete(`/api/grupos/${grupo._id}/permissoes`)
                .set('Authorization', `Bearer ${token}`)
                .send(removeData);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('removida com sucesso');
        });

        it('should fail with non-existent grupo ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const removeData = {
                rota: 'produtos'
            };

            const response = await request(app)
                .delete(`/api/grupos/${fakeId}/permissoes`)
                .set('Authorization', `Bearer ${token}`)
                .send(removeData);

            helper.expectErrorResponse(response, 404);
        });
    });

    describe('POST /api/grupos/:id/usuarios', () => {
        it('should add user to grupo successfully', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);
            const userData = {
                usuario_id: helper.testUser._id.toString()
            };

            const response = await request(app)
                .post(`/api/grupos/${grupo._id}/usuarios`)
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('adicionado ao grupo');
        });

        it('should fail with non-existent grupo ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const userData = {
                usuario_id: helper.testUser._id.toString()
            };

            const response = await request(app)
                .post(`/api/grupos/${fakeId}/usuarios`)
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail with non-existent user ID', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);
            const userData = {
                usuario_id: '507f1f77bcf86cd799439011'
            };

            const response = await request(app)
                .post(`/api/grupos/${grupo._id}/usuarios`)
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectErrorResponse(response, 404);
        });
    });

    describe('DELETE /api/grupos/:id/usuarios', () => {
        it('should remove user from grupo successfully', async () => {
            const token = await helper.getAdminToken();
            const grupo = await helper.createTestGrupo(token);
            
            // Primeiro adicionar usuário ao grupo
            await request(app)
                .post(`/api/grupos/${grupo._id}/usuarios`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    usuario_id: helper.testUser._id.toString()
                });

            // Depois remover usuário do grupo
            const userData = {
                usuario_id: helper.testUser._id.toString()
            };

            const response = await request(app)
                .delete(`/api/grupos/${grupo._id}/usuarios`)
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('removido do grupo');
        });

        it('should fail with non-existent grupo ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const userData = {
                usuario_id: helper.testUser._id.toString()
            };

            const response = await request(app)
                .delete(`/api/grupos/${fakeId}/usuarios`)
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectErrorResponse(response, 404);
        });
    });
});
