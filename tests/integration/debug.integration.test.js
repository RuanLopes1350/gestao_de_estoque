const { describe, it, beforeAll, afterAll, expect } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Debug Integration Test', () => {
    let helper;
    let app;

    beforeAll(async () => {
        helper = new IntegrationTestHelper();
        await helper.setup();
        app = await helper.getApp();
    });

    afterAll(async () => {
        await helper.teardown();
    });

    it('should login successfully', async () => {
        console.log('🔍 Tentando fazer login...');
        
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                matricula: 'ADM0001',
                senha: 'admin123'
            });
        
        console.log('📝 Status:', response.status);
        console.log('📝 Body:', JSON.stringify(response.body, null, 2));
        
        if (response.status !== 200) {
            console.log('❌ Login falhou');
            console.log('Headers:', response.headers);
        }
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
    });

    it('should access protected route with token', async () => {
        console.log('🔍 Obtendo token admin...');
        const token = await helper.getAdminToken();
        console.log('🎫 Token obtido:', token ? 'SIM' : 'NÃO');
        
        console.log('🔍 Tentando acessar rota protegida...');
        const response = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${token}`);
        
        console.log('📝 Status da rota protegida:', response.status);
        console.log('📝 Body da rota protegida:', JSON.stringify(response.body, null, 2));
        
        expect(response.status).toBe(200);
    });
});
