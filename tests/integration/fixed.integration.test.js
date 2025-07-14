const { describe, it, beforeAll, afterAll, expect } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Fixed Integration Test', () => {
    let helper;
    let app;
    let token;

    beforeAll(async () => {
        helper = new IntegrationTestHelper();
        await helper.setup();
        app = await helper.getApp();
        token = await helper.getAdminToken();
    });

    afterAll(async () => {
        await helper.teardown();
    });

    it('should list fornecedores successfully', async () => {
        const response = await request(app)
            .get('/api/fornecedores')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('docs');
        expect(response.body.data.docs).toBeInstanceOf(Array);
    });

    it('should create fornecedor successfully', async () => {
        const fornecedorData = {
            nome_fornecedor: 'Teste Fornecedor',
            cnpj: '12.345.678/0001-99',
            telefone: '(11) 99999-9999',
            email: 'teste@fornecedor.com',
            endereco: [{
                logradouro: 'Rua Teste, 123',
                bairro: 'Centro',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01234-567'
            }]
        };

        const response = await request(app)
            .post('/api/fornecedores')
            .set('Authorization', `Bearer ${token}`)
            .send(fornecedorData);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('_id');
    });
});
