const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Auth Integration Tests', () => {
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
        // await helper.cleanDatabase(); // Removido temporariamente para evitar interferência
    });

    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'Admin@123'
                });

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.usuario.matricula).toBe('ADM0001');
        });

        it('should fail with invalid matricula', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'INVALID001',
                    senha: 'Admin@123'
                });

            helper.expectErrorResponse(response, 401);
            expect(response.body.message).toContain('Matrícula ou senha incorretos');
        });

        it('should fail with invalid password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'senhaerrada'
                });

            helper.expectErrorResponse(response, 401);
            expect(response.body.message).toContain('Matrícula ou senha incorretos');
        });

        it('should fail with missing credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({});

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with inactive user', async () => {
            // Desativar usuário
            await helper.adminUser.updateOne({ ativo: false });

            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'Admin@123'
                });

            helper.expectErrorResponse(response, 401);
            expect(response.body.message).toContain('usuário está inativo');
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout successfully with valid token', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .post('/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('Logout realizado com sucesso');
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .post('/auth/logout');

            helper.expectErrorResponse(response, 401);
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .post('/auth/logout')
                .set('Authorization', 'Bearer invalid-token');

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh token successfully', async () => {
            // Fazer login para obter refresh token
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'Admin@123'
                });

            const refreshToken = loginResponse.body.data.refreshToken;

            const response = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken });

            helper.expectValidResponse(response, 200);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
        });

        it('should fail with invalid refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken: 'invalid-refresh-token' });

            helper.expectErrorResponse(response, 401);
        });

        it('should fail without refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send({});

            helper.expectErrorResponse(response, 400);
        });
    });

    describe('POST /auth/solicitar-recuperacao', () => {
        it('should send recovery for valid matricula', async () => {
            const response = await request(app)
                .post('/auth/solicitar-recuperacao')
                .send({
                    matricula: 'ADM0001'
                });

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('código de recuperação foi enviado');
        });

        it('should fail for non-existent matricula', async () => {
            const response = await request(app)
                .post('/auth/solicitar-recuperacao')
                .send({
                    matricula: 'NAOEXISTE'
                });

            helper.expectErrorResponse(response, 404);
            expect(response.body.message).toContain('Usuário não encontrado');
        });

        it('should fail with invalid matricula format', async () => {
            const response = await request(app)
                .post('/auth/solicitar-recuperacao')
                .send({
                    matricula: 'INVALID'
                });

            helper.expectErrorResponse(response, 400);
        });
    });

    describe('POST /auth/alterar-senha', () => {
        it('should change password successfully with valid token', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .post('/auth/alterar-senha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    senhaAtual: '123456',
                    novaSenha: 'novaSenha123',
                    confirmarSenha: 'novaSenha123'
                });

            helper.expectValidResponse(response, 200);
            expect(response.body.message).toContain('Senha alterada com sucesso');
        });

        it('should fail with wrong current password', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .post('/auth/alterar-senha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    senhaAtual: 'senhaErrada',
                    novaSenha: 'novaSenha123',
                    confirmarSenha: 'novaSenha123'
                });

            helper.expectErrorResponse(response, 400);
            expect(response.body.message).toContain('Senha atual incorreta');
        });

        it('should fail with mismatched new passwords', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .post('/auth/alterar-senha')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    senhaAtual: '123456',
                    novaSenha: 'novaSenha123',
                    confirmarSenha: 'senhasDiferentes'
                });

            helper.expectErrorResponse(response, 400);
            expect(response.body.message).toContain('As senhas não coincidem');
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .post('/auth/alterar-senha')
                .send({
                    senhaAtual: '123456',
                    novaSenha: 'novaSenha123',
                    confirmarSenha: 'novaSenha123'
                });

            helper.expectErrorResponse(response, 401);
        });
    });
});
