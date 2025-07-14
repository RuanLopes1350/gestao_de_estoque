const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Complete Workflow Integration Tests', () => {
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

    describe('Complete Inventory Management Workflow', () => {
        it('should complete a full inventory management cycle', async () => {
            // 1. Login como administrador
            const adminToken = await helper.getAdminToken();

            // 2. Criar um grupo de permissões
            const grupoResponse = await request(app)
                .post('/api/grupos')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nome: 'Estoquistas',
                    descricao: 'Grupo para gerenciamento de estoque',
                    ativo: true
                });
            
            helper.expectValidResponse(grupoResponse, 201);
            const grupo = grupoResponse.body.data;

            // 3. Adicionar permissões ao grupo
            await request(app)
                .post(`/api/grupos/${grupo._id}/permissoes`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    rota: 'produtos',
                    permissoes: ['buscar', 'enviar', 'substituir']
                });

            // 4. Criar um usuário estoquista
            const usuarioResponse = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nome_usuario: 'João Estoquista',
                    email: 'joao.estoquista@empresa.com',
                    matricula: 'EST002',
                    perfil: 'estoquista'
                });
            
            helper.expectValidResponse(usuarioResponse, 201);
            const usuario = usuarioResponse.body.data;

            // 5. Adicionar usuário ao grupo
            await request(app)
                .post(`/api/grupos/${grupo._id}/usuarios`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    usuario_id: usuario._id
                });

            // 6. Criar um fornecedor
            const fornecedorResponse = await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nome_fornecedor: 'TechSupply LTDA',
                    cnpj: '12.345.678/0001-90',
                    telefone: '(11) 99999-9999',
                    email: 'contato@techsupply.com',
                    endereco: [{
                        rua: 'Av. Tecnologia, 1000',
                        cidade: 'São Paulo',
                        estado: 'SP',
                        cep: '01234-567'
                    }]
                });
            
            helper.expectValidResponse(fornecedorResponse, 201);
            const fornecedor = fornecedorResponse.body.data;

            // 7. Criar produtos
            const produto1Response = await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nome_produto: 'Notebook Dell Inspiron 15',
                    descricao: 'Notebook para uso corporativo',
                    preco: 2500.00,
                    marca: 'Dell',
                    custo: 2000.00,
                    categoria: 'Informática',
                    estoque: 0, // Iniciando sem estoque
                    estoque_minimo: 5,
                    fornecedor: fornecedor._id,
                    codigo_barras: '7891234567890'
                });
            
            helper.expectValidResponse(produto1Response, 201);
            const produto1 = produto1Response.body.data;

            const produto2Response = await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nome_produto: 'Mouse Logitech MX Master',
                    descricao: 'Mouse ergonômico para produtividade',
                    preco: 299.99,
                    marca: 'Logitech',
                    custo: 200.00,
                    categoria: 'Periféricos',
                    estoque: 0,
                    estoque_minimo: 10,
                    fornecedor: fornecedor._id,
                    codigo_barras: '7891234567891'
                });
            
            helper.expectValidResponse(produto2Response, 201);
            const produto2 = produto2Response.body.data;

            // 8. Fazer movimentações de entrada
            const entrada1Response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    tipo: 'entrada',
                    produto_id: produto1._id,
                    quantidade: 20,
                    destino: 'Estoque Principal',
                    observacoes: 'Primeira remessa de notebooks'
                });
            
            helper.expectValidResponse(entrada1Response, 201);

            const entrada2Response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    tipo: 'entrada',
                    produto_id: produto2._id,
                    quantidade: 50,
                    destino: 'Estoque Principal',
                    observacoes: 'Lote de mouses'
                });
            
            helper.expectValidResponse(entrada2Response, 201);

            // 9. Verificar se os estoques foram atualizados
            const produto1Updated = await request(app)
                .get(`/api/produtos/${produto1._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(produto1Updated.body.data.estoque).toBe(20);

            const produto2Updated = await request(app)
                .get(`/api/produtos/${produto2._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(produto2Updated.body.data.estoque).toBe(50);

            // 10. Fazer movimentações de saída
            const saida1Response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    tipo: 'saida',
                    produto_id: produto1._id,
                    quantidade: 3,
                    destino: 'Venda',
                    observacoes: 'Venda para cliente corporativo'
                });
            
            helper.expectValidResponse(saida1Response, 201);

            const saida2Response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    tipo: 'saida',
                    produto_id: produto2._id,
                    quantidade: 15,
                    destino: 'Distribuição',
                    observacoes: 'Distribuição para filiais'
                });
            
            helper.expectValidResponse(saida2Response, 201);

            // 11. Verificar estoques finais
            const produto1Final = await request(app)
                .get(`/api/produtos/${produto1._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(produto1Final.body.data.estoque).toBe(17); // 20 - 3

            const produto2Final = await request(app)
                .get(`/api/produtos/${produto2._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(produto2Final.body.data.estoque).toBe(35); // 50 - 15

            // 12. Verificar histórico de movimentações
            const movimentacoesResponse = await request(app)
                .get('/api/movimentacoes')
                .set('Authorization', `Bearer ${adminToken}`);
            
            helper.expectValidResponse(movimentacoesResponse, 200);
            expect(movimentacoesResponse.body.data.length).toBe(4); // 2 entradas + 2 saídas

            // 13. Testar filtros de movimentação
            const entradasResponse = await request(app)
                .get('/api/movimentacoes?tipo=entrada')
                .set('Authorization', `Bearer ${adminToken}`);
            
            helper.expectValidResponse(entradasResponse, 200);
            expect(entradasResponse.body.data.length).toBe(2);

            const saidasResponse = await request(app)
                .get('/api/movimentacoes?tipo=saida')
                .set('Authorization', `Bearer ${adminToken}`);
            
            helper.expectValidResponse(saidasResponse, 200);
            expect(saidasResponse.body.data.length).toBe(2);

            // 14. Testar busca de produtos
            const buscaProdutoResponse = await request(app)
                .get('/api/produtos/buscar/nome/Notebook')
                .set('Authorization', `Bearer ${adminToken}`);
            
            helper.expectValidResponse(buscaProdutoResponse, 200);
            expect(buscaProdutoResponse.body.data.length).toBeGreaterThan(0);

            // 15. Testar filtro por categoria
            const categoriaResponse = await request(app)
                .get('/api/produtos?categoria=Informática')
                .set('Authorization', `Bearer ${adminToken}`);
            
            helper.expectValidResponse(categoriaResponse, 200);
            expect(categoriaResponse.body.data.length).toBeGreaterThan(0);

            // 16. Fazer logout
            const logoutResponse = await request(app)
                .post('/auth/logout')
                .set('Authorization', `Bearer ${adminToken}`);
            
            helper.expectValidResponse(logoutResponse, 200);
        });
    });

    describe('Error Handling Workflow', () => {
        it('should handle business rule violations correctly', async () => {
            const adminToken = await helper.getAdminToken();

            // Criar fornecedor e produto
            const fornecedor = await helper.createTestFornecedor(adminToken);
            const produto = await helper.createTestProduto(adminToken, fornecedor._id);

            // Tentar fazer saída com estoque insuficiente
            const saidaResponse = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    tipo: 'saida',
                    produto_id: produto._id,
                    quantidade: 99999, // Mais que o estoque disponível
                    destino: 'Venda'
                });

            helper.expectErrorResponse(saidaResponse, 400);
            expect(saidaResponse.body.message).toContain('estoque insuficiente');

            // Verificar que o estoque não foi alterado
            const produtoResponse = await request(app)
                .get(`/api/produtos/${produto._id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(produtoResponse.body.data.estoque).toBe(produto.estoque);
        });

        it('should validate relationships correctly', async () => {
            const adminToken = await helper.getAdminToken();

            // Tentar criar produto com fornecedor inexistente
            const produtoResponse = await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nome_produto: 'Produto Teste',
                    descricao: 'Produto com fornecedor inexistente',
                    preco: 100.00,
                    marca: 'Marca',
                    custo: 50.00,
                    categoria: 'Categoria',
                    estoque: 10,
                    estoque_minimo: 1,
                    fornecedor: '507f1f77bcf86cd799439011' // ID inexistente
                });

            helper.expectErrorResponse(produtoResponse, 400);

            // Tentar criar movimentação com produto inexistente
            const movimentacaoResponse = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    tipo: 'entrada',
                    produto_id: '507f1f77bcf86cd799439011', // ID inexistente
                    quantidade: 10,
                    destino: 'Estoque'
                });

            helper.expectErrorResponse(movimentacaoResponse, 404);
        });
    });

    describe('Permission and Authentication Workflow', () => {
        it('should enforce authentication on protected routes', async () => {
            // Tentar acessar rotas sem token
            const routes = [
                { method: 'get', path: '/api/produtos' },
                { method: 'post', path: '/api/produtos' },
                { method: 'get', path: '/api/usuarios' },
                { method: 'post', path: '/api/usuarios' },
                { method: 'get', path: '/api/fornecedores' },
                { method: 'post', path: '/api/fornecedores' },
                { method: 'get', path: '/api/grupos' },
                { method: 'post', path: '/api/grupos' },
                { method: 'get', path: '/api/movimentacoes' },
                { method: 'post', path: '/api/movimentacoes' }
            ];

            for (const route of routes) {
                const response = await request(app)[route.method](route.path);
                helper.expectErrorResponse(response, 401);
            }
        });

        it('should allow access with valid token', async () => {
            const adminToken = await helper.getAdminToken();

            // Testar acesso com token válido
            const protectedRoutes = [
                '/api/produtos',
                '/api/usuarios',
                '/api/fornecedores',
                '/api/grupos',
                '/api/movimentacoes'
            ];

            for (const route of protectedRoutes) {
                const response = await request(app)
                    .get(route)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
            }
        });

        it('should handle token expiration and refresh', async () => {
            // Fazer login
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin@teste.com',
                    senha: '123456'
                });

            const { accessToken, refreshToken } = loginResponse.body.data;

            // Usar access token
            const protectedResponse = await request(app)
                .get('/api/produtos')
                .set('Authorization', `Bearer ${accessToken}`);
            
            helper.expectValidResponse(protectedResponse, 200);

            // Testar refresh token
            const refreshResponse = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken });

            helper.expectValidResponse(refreshResponse, 200);
            expect(refreshResponse.body.data).toHaveProperty('accessToken');
            expect(refreshResponse.body.data).toHaveProperty('refreshToken');
        });
    });

    describe('Data Consistency Workflow', () => {
        it('should maintain data consistency across operations', async () => {
            const adminToken = await helper.getAdminToken();

            // Criar fornecedor e produto
            const fornecedor = await helper.createTestFornecedor(adminToken);
            const produto = await helper.createTestProduto(adminToken, fornecedor._id);
            const estoqueInicial = produto.estoque;

            // Fazer várias movimentações
            const movimentacoes = [
                { tipo: 'entrada', quantidade: 30 },
                { tipo: 'saida', quantidade: 10 },
                { tipo: 'entrada', quantidade: 20 },
                { tipo: 'saida', quantidade: 5 }
            ];

            let estoqueEsperado = estoqueInicial;

            for (const mov of movimentacoes) {
                await request(app)
                    .post('/api/movimentacoes')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        tipo: mov.tipo,
                        produto_id: produto._id,
                        quantidade: mov.quantidade,
                        destino: mov.tipo === 'entrada' ? 'Estoque Principal' : 'Venda'
                    });

                // Atualizar estoque esperado
                if (mov.tipo === 'entrada') {
                    estoqueEsperado += mov.quantidade;
                } else {
                    estoqueEsperado -= mov.quantidade;
                }
            }

            // Verificar estoque final
            const produtoFinal = await request(app)
                .get(`/api/produtos/${produto._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(produtoFinal.body.data.estoque).toBe(estoqueEsperado);

            // Verificar número de movimentações registradas
            const movimentacoesResponse = await request(app)
                .get(`/api/movimentacoes?produto_id=${produto._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(movimentacoesResponse.body.data.length).toBe(movimentacoes.length);
        });
    });
});
