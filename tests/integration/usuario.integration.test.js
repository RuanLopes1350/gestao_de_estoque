const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Usuario Integration Tests', () => {
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

    describe('GET /api/usuarios', () => {
        it('should list users successfully with admin token', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/usuarios')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toHaveProperty('docs');
            expect(response.body.data.docs).toBeInstanceOf(Array);
            expect(response.body.data.docs.length).toBeGreaterThan(0);
            expect(response.body.data.docs[0]).toHaveProperty('nome_usuario');
            expect(response.body.data.docs[0]).toHaveProperty('email');
            expect(response.body.data.docs[0]).toHaveProperty('matricula');
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .get('/api/usuarios');

            helper.expectErrorResponse(response, 401);
        });

        it('should support pagination', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/usuarios?page=1&limit=1')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
            expect(response.body.data.docs.length).toBeLessThanOrEqual(1);
        });

        it('should support filtering by perfil', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/usuarios?perfil=administrador')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.docs).toBeInstanceOf(Array);
            if (response.body.data.docs.length > 0) {
                expect(response.body.data.docs[0].perfil).toBe('administrador');
            }
        });
    });

    describe('POST /api/usuarios', () => {
        it('should create user successfully with valid data', async () => {
            const token = await helper.getAdminToken();
            const userData = {
                nome_usuario: 'Novo Usuario',
                email: 'novo@teste.com',
                matricula: 'USR001',
                perfil: 'estoquista'
            };

            const response = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectValidResponse(response, 201);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.nome_usuario).toBe(userData.nome_usuario);
            expect(response.body.data.email).toBe(userData.email);
            expect(response.body.data.matricula).toBe(userData.matricula);
            expect(response.body.data.perfil).toBe(userData.perfil);
        });

        it('should fail with duplicate email', async () => {
            const token = await helper.getAdminToken();
            const userData = {
                nome_usuario: 'Usuario Duplicado',
                email: 'admin@teste.com', // Email já existe
                matricula: 'USR002',
                perfil: 'estoquista'
            };

            const response = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectErrorResponse(response, 400);
            expect(response.body.message).toContain('email');
        });

        it('should fail with duplicate matricula', async () => {
            const token = await helper.getAdminToken();
            const userData = {
                nome_usuario: 'Usuario Duplicado',
                email: 'duplicado@teste.com',
                matricula: 'ADM001', // Matrícula já existe
                perfil: 'estoquista'
            };

            const response = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectErrorResponse(response, 400);
            expect(response.body.message).toContain('matricula');
        });

        it('should fail with missing required fields', async () => {
            const token = await helper.getAdminToken();
            const userData = {
                nome_usuario: 'Usuario Incompleto'
                // Faltando campos obrigatórios
            };

            const response = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with invalid email format', async () => {
            const token = await helper.getAdminToken();
            const userData = {
                nome_usuario: 'Usuario Email Inválido',
                email: 'email-invalido',
                matricula: 'USR003',
                perfil: 'estoquista'
            };

            const response = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${token}`)
                .send(userData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const userData = {
                nome_usuario: 'Usuario Sem Token',
                email: 'semtoken@teste.com',
                matricula: 'USR004',
                perfil: 'estoquista'
            };

            const response = await request(app)
                .post('/api/usuarios')
                .send(userData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('GET /api/usuarios/:id', () => {
        it('should get user by ID successfully', async () => {
            const token = await helper.getAdminToken();
            const userId = helper.adminUser._id.toString();

            const response = await request(app)
                .get(`/api/usuarios/${userId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toHaveProperty('_id', userId);
            expect(response.body.data).toHaveProperty('nome_usuario');
            expect(response.body.data).toHaveProperty('email');
            expect(response.body.data).not.toHaveProperty('senha');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/usuarios/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail with invalid ID format', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .get('/api/usuarios/invalid-id')
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail without token', async () => {
            const userId = helper.adminUser._id.toString();

            const response = await request(app)
                .get(`/api/usuarios/${userId}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('PATCH /api/usuarios/:id', () => {
        it('should update user successfully', async () => {
            const token = await helper.getAdminToken();
            const userId = helper.testUser._id.toString();
            const updateData = {
                nome_usuario: 'Nome Atualizado',
                perfil: 'gerente'
            };

            const response = await request(app)
                .patch(`/api/usuarios/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectValidResponse(response, 200);
            expect(response.body.data.nome_usuario).toBe(updateData.nome_usuario);
            expect(response.body.data.perfil).toBe(updateData.perfil);
        });

        it('should fail to update with duplicate email', async () => {
            const token = await helper.getAdminToken();
            const userId = helper.testUser._id.toString();
            const updateData = {
                email: 'admin@teste.com' // Email já existe
            };

            const response = await request(app)
                .patch(`/api/usuarios/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';
            const updateData = {
                nome_usuario: 'Nome Atualizado'
            };

            const response = await request(app)
                .patch(`/api/usuarios/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const userId = helper.testUser._id.toString();
            const updateData = {
                nome_usuario: 'Nome Atualizado'
            };

            const response = await request(app)
                .patch(`/api/usuarios/${userId}`)
                .send(updateData);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('DELETE /api/usuarios/:id', () => {
        it('should delete user successfully', async () => {
            const token = await helper.getAdminToken();
            const userId = helper.testUser._id.toString();

            const response = await request(app)
                .delete(`/api/usuarios/${userId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('deletado com sucesso');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/usuarios/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });

        it('should fail without token', async () => {
            const userId = helper.testUser._id.toString();

            const response = await request(app)
                .delete(`/api/usuarios/${userId}`);

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('PATCH /api/usuarios/:id/desativar', () => {
        it('should deactivate user successfully', async () => {
            const token = await helper.getAdminToken();
            const userId = helper.testUser._id.toString();

            const response = await request(app)
                .patch(`/api/usuarios/${userId}/desativar`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('desativado com sucesso');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .patch(`/api/usuarios/${fakeId}/desativar`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });
    });

    describe('PATCH /api/usuarios/:id/reativar', () => {
        it('should reactivate user successfully', async () => {
            const token = await helper.getAdminToken();
            const userId = helper.testUser._id.toString();

            // Primeiro desativar
            await request(app)
                .patch(`/api/usuarios/${userId}/desativar`)
                .set('Authorization', `Bearer ${token}`);

            // Depois reativar
            const response = await request(app)
                .patch(`/api/usuarios/${userId}/reativar`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('reativado com sucesso');
        });

        it('should fail with non-existent ID', async () => {
            const token = await helper.getAdminToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .patch(`/api/usuarios/${fakeId}/reativar`)
                .set('Authorization', `Bearer ${token}`);

            helper.expectErrorResponse(response, 404);
        });
    });
});
