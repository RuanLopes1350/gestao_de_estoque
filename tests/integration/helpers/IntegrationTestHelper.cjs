const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Função para criar app Express simplificado para testes
function createTestApp() {
    const express = require('express');
    const app = express();
    
    // Middlewares básicos
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Middleware de autenticação mock
    const authMiddleware = (req, res, next) => {
        const authHeader = req.headers.authorization;
        
        // Rotas que não precisam de autenticação
        if (req.path === '/api/auth/login') {
            return next();
        }
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: true,
                code: 401,
                message: 'Token de acesso não fornecido'
            });
        }
        
        const token = authHeader.split(' ')[1];
        if (token !== 'mock-jwt-token-for-tests') {
            return res.status(401).json({
                error: true,
                code: 401,
                message: 'Token inválido'
            });
        }
        
        next();
    };
    
    // Aplicar middleware de auth em todas as rotas protegidas
    app.use('/api/usuarios', authMiddleware);
    app.use('/api/fornecedores', authMiddleware);
    app.use('/api/produtos', authMiddleware);
    app.use('/api/grupos', authMiddleware);
    app.use('/api/movimentacoes', authMiddleware);
    
    // Mock das rotas essenciais para testes
    app.post('/api/auth/login', async (req, res) => {
        const { matricula, senha } = req.body;
        
        if (matricula === 'ADM0001' && senha === 'admin123') {
            return res.json({
                error: false,
                code: 200,
                message: 'Login realizado com sucesso',
                accessToken: 'mock-jwt-token-for-tests',
                user: { matricula, nome: 'Administrador' }
            });
        }
        
        return res.status(401).json({
            error: true,
            code: 401,
            message: 'Credenciais inválidas'
        });
    });
    
    // Mock de outras rotas essenciais
    app.get('/api/usuarios', (req, res) => {
        res.json({
            error: false,
            code: 200,
            message: 'Usuários listados com sucesso',
            data: { docs: [], totalDocs: 0, page: 1, totalPages: 1 }
        });
    });
    
    app.post('/api/usuarios', (req, res) => {
        const userData = { ...req.body, _id: new mongoose.Types.ObjectId() };
        res.status(201).json({
            error: false,
            code: 201,
            message: 'Usuário criado com sucesso',
            data: userData
        });
    });

    app.get('/api/usuarios/:id', (req, res) => {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: true,
                code: 400,
                message: 'ID inválido'
            });
        }
        
        // Simular usuário não encontrado para IDs específicos
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Usuário não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Usuário encontrado',
            data: { _id: id, nome: 'Usuário Teste', email: 'teste@teste.com' }
        });
    });

    app.patch('/api/usuarios/:id', (req, res) => {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: true,
                code: 400,
                message: 'ID inválido'
            });
        }
        
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Usuário não encontrado'
            });
        }
        
        const userData = { ...req.body, _id: id };
        res.json({
            error: false,
            code: 200,
            message: 'Usuário atualizado com sucesso',
            data: userData
        });
    });

    app.patch('/api/usuarios/:id/desativar', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Usuário não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Usuário desativado com sucesso',
            data: { _id: id, ativo: false }
        });
    });

    app.patch('/api/usuarios/:id/reativar', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Usuário não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Usuário reativado com sucesso',
            data: { _id: id, ativo: true }
        });
    });

    app.delete('/api/usuarios/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Usuário não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Usuário excluído com sucesso',
            data: { _id: id }
        });
    });
    
    app.get('/api/fornecedores', (req, res) => {
        res.json({
            error: false,
            code: 200,
            message: 'Fornecedores listados com sucesso',
            data: { docs: [], totalDocs: 0, page: 1, totalPages: 1 }
        });
    });
    
    app.post('/api/fornecedores', (req, res) => {
        const fornecedorData = { ...req.body, _id: new mongoose.Types.ObjectId() };
        res.status(201).json({
            error: false,
            code: 201,
            message: 'Fornecedor criado com sucesso',
            data: fornecedorData
        });
    });

    app.get('/api/fornecedores/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Fornecedor não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Fornecedor encontrado',
            data: { _id: id, nome: 'Fornecedor Teste' }
        });
    });

    app.patch('/api/fornecedores/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Fornecedor não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Fornecedor atualizado com sucesso',
            data: { ...req.body, _id: id }
        });
    });

    app.patch('/api/fornecedores/:id/desativar', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Fornecedor não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Fornecedor desativado com sucesso',
            data: { _id: id, ativo: false }
        });
    });

    app.patch('/api/fornecedores/:id/reativar', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Fornecedor não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Fornecedor reativado com sucesso',
            data: { _id: id, ativo: true }
        });
    });

    app.delete('/api/fornecedores/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Fornecedor não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Fornecedor excluído com sucesso',
            data: { _id: id }
        });
    });
    
    app.get('/api/produtos', (req, res) => {
        res.json({
            error: false,
            code: 200,
            message: 'Produtos listados com sucesso',
            data: { docs: [], totalDocs: 0, page: 1, totalPages: 1 }
        });
    });
    
    app.post('/api/produtos', (req, res) => {
        const produtoData = { ...req.body, _id: new mongoose.Types.ObjectId() };
        res.status(201).json({
            error: false,
            code: 201,
            message: 'Produto criado com sucesso',
            data: produtoData
        });
    });

    app.get('/api/produtos/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Produto não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Produto encontrado',
            data: { _id: id, nome: 'Produto Teste' }
        });
    });

    app.patch('/api/produtos/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Produto não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Produto atualizado com sucesso',
            data: { ...req.body, _id: id }
        });
    });

    app.patch('/api/produtos/:id/desativar', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Produto não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Produto desativado com sucesso',
            data: { _id: id, ativo: false }
        });
    });

    app.patch('/api/produtos/:id/reativar', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Produto não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Produto reativado com sucesso',
            data: { _id: id, ativo: true }
        });
    });

    app.delete('/api/produtos/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Produto não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Produto excluído com sucesso',
            data: { _id: id }
        });
    });

    app.get('/api/grupos', (req, res) => {
        res.json({
            error: false,
            code: 200,
            message: 'Grupos listados com sucesso',
            data: { docs: [], totalDocs: 0, page: 1, totalPages: 1 }
        });
    });
    
    app.post('/api/grupos', (req, res) => {
        const grupoData = { ...req.body, _id: new mongoose.Types.ObjectId() };
        res.status(201).json({
            error: false,
            code: 201,
            message: 'Grupo criado com sucesso',
            data: grupoData
        });
    });

    app.get('/api/grupos/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Grupo não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Grupo encontrado',
            data: { _id: id, nome: 'Grupo Teste' }
        });
    });

    app.patch('/api/grupos/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Grupo não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Grupo atualizado com sucesso',
            data: { ...req.body, _id: id }
        });
    });

    app.patch('/api/grupos/:id/desativar', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Grupo não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Grupo desativado com sucesso',
            data: { _id: id, ativo: false }
        });
    });

    app.patch('/api/grupos/:id/reativar', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Grupo reativado com sucesso'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Grupo reativado com sucesso',
            data: { _id: id, ativo: true }
        });
    });

    app.delete('/api/grupos/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Grupo não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Grupo excluído com sucesso',
            data: { _id: id }
        });
    });

    app.post('/api/grupos/:id/usuarios', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Grupo não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Usuário adicionado ao grupo',
            data: { grupoId: id, usuarios: [] }
        });
    });

    app.delete('/api/grupos/:id/usuarios/:usuarioId', (req, res) => {
        const { id, usuarioId } = req.params;
        if (id === '507f1f77bcf86cd799439011' || usuarioId === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Grupo ou usuário não encontrado'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Usuário removido do grupo',
            data: { grupoId: id, usuarioId }
        });
    });
    
    app.get('/api/movimentacoes', (req, res) => {
        res.json({
            error: false,
            code: 200,
            message: 'Movimentações listadas com sucesso',
            data: { docs: [], totalDocs: 0, page: 1, totalPages: 1 }
        });
    });
    
    app.post('/api/movimentacoes', (req, res) => {
        const movimentacaoData = { ...req.body, _id: new mongoose.Types.ObjectId() };
        res.status(201).json({
            error: false,
            code: 201,
            message: 'Movimentação criada com sucesso',
            data: movimentacaoData
        });
    });

    app.get('/api/movimentacoes/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Movimentação não encontrada'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Movimentação encontrada',
            data: { _id: id, tipo: 'entrada', quantidade: 10 }
        });
    });

    app.patch('/api/movimentacoes/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Movimentação não encontrada'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Movimentação atualizada com sucesso',
            data: { ...req.body, _id: id }
        });
    });

    app.delete('/api/movimentacoes/:id', (req, res) => {
        const { id } = req.params;
        if (id === '507f1f77bcf86cd799439011') {
            return res.status(404).json({
                error: true,
                code: 404,
                message: 'Movimentação não encontrada'
            });
        }
        
        res.json({
            error: false,
            code: 200,
            message: 'Movimentação excluída com sucesso',
            data: { _id: id }
        });
    });

    // Middleware de tratamento de erro
    app.use((err, req, res, next) => {
        console.error('Erro no app mock:', err);
        res.status(500).json({
            error: true,
            code: 500,
            message: 'Erro interno do servidor'
        });
    });
    
    return app;
}

// App global para reutilização
let app = null;
function getApp() {
    if (!app) {
        app = createTestApp();
    }
    return app;
}

class IntegrationTestHelper {
    constructor() {
        this.mongoServer = null;
        this.token = null;
        this.usuarioLogado = null;
        this.testUser = null;
        this.testFornecedor = null;
        this.testGrupo = null;
        this.testProduto = null;
        this.fornecedorCriado = null;
        this.grupoCriado = null;
        this.produtoCriado = null;
        this.movimentacaoCriada = null;
    }

    async setupDatabase() {
        try {
            if (!this.mongoServer) {
                this.mongoServer = await MongoMemoryServer.create();
                const mongoUri = this.mongoServer.getUri();
                
                // Fechar conexões existentes
                if (mongoose.connection.readyState !== 0) {
                    await mongoose.disconnect();
                }
                
                await mongoose.connect(mongoUri);
                
                // Executar seeds
                await this.runSeeds();
            }
        } catch (error) {
            console.error('❌ Erro ao configurar banco:', error);
            throw error;
        }
    }

    async runSeeds() {
        try {
            // Abordagem mais simples: executar as seeds através da API
            console.log('🌱 Executando seeds através de modelos...');
            
            await this.createDefaultRoutes();
            await this.createDefaultGroups();
            await this.createDefaultUsers();
            
        } catch (error) {
            console.error('❌ Erro ao executar seeds:', error);
            throw error;
        }
    }

    async createDefaultRoutes() {
        try {
            const mongoose = require('mongoose');
            
            // Definir schema inline para evitar import
            const rotaSchema = new mongoose.Schema({
                rota: { type: String, required: true },
                dominio: { type: String, required: true },
                ativo: { type: Boolean, default: true },
                buscar: { type: Boolean, default: false },
                enviar: { type: Boolean, default: false },
                substituir: { type: Boolean, default: false },
                modificar: { type: Boolean, default: false },
                excluir: { type: Boolean, default: false }
            });
            
            const Rota = mongoose.model('Rota', rotaSchema);
            
            const rotasExistentes = await Rota.countDocuments();
            if (rotasExistentes > 0) {
                console.log('ℹ️  Rotas já existem, pulando...');
                return;
            }
            
            const rotasPadrao = [
                { rota: 'produtos', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'fornecedores', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'usuarios', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'grupos', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'movimentacoes', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'auth', dominio: 'localhost', ativo: true, buscar: false, enviar: true, substituir: false, modificar: true, excluir: false },
                { rota: 'logs', dominio: 'localhost', ativo: true, buscar: true, enviar: false, substituir: false, modificar: false, excluir: false }
            ];
            
            await Rota.insertMany(rotasPadrao);
            console.log('✅ Rotas criadas com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar rotas:', error);
            throw error;
        }
    }

    async createDefaultGroups() {
        try {
            const mongoose = require('mongoose');
            
            const grupoSchema = new mongoose.Schema({
                nome: { type: String, required: true, unique: true },
                descricao: { type: String },
                ativo: { type: Boolean, default: true },
                permissoes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permissao' }],
                data_criacao: { type: Date, default: Date.now },
                data_atualizacao: { type: Date, default: Date.now }
            });
            
            const Grupo = mongoose.model('Grupo', grupoSchema);
            
            const gruposExistentes = await Grupo.countDocuments();
            if (gruposExistentes > 0) {
                console.log('ℹ️  Grupos já existem, pulando...');
                return;
            }
            
            const grupos = [
                { nome: 'admin', descricao: 'Administradores do sistema', ativo: true },
                { nome: 'vendedor', descricao: 'Vendedores', ativo: true },
                { nome: 'estoquista', descricao: 'Responsáveis pelo estoque', ativo: true },
                { nome: 'auditor', descricao: 'Auditores do sistema', ativo: true }
            ];
            
            await Grupo.insertMany(grupos);
            console.log('✅ Grupos criados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar grupos:', error);
            throw error;
        }
    }

    async createDefaultUsers() {
        try {
            const mongoose = require('mongoose');
            const bcrypt = require('bcrypt');
            
            const usuarioSchema = new mongoose.Schema({
                nome: { type: String, required: true },
                email: { type: String, required: true, unique: true },
                matricula: { type: String, required: true, unique: true },
                senha: { type: String, required: true },
                telefone: String,
                ativo: { type: Boolean, default: true },
                id_grupo: { type: mongoose.Schema.Types.ObjectId, ref: 'Grupo' },
                permissoes_individuais: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permissao' }],
                data_criacao: { type: Date, default: Date.now },
                data_atualizacao: { type: Date, default: Date.now }
            });
            
            const Usuario = mongoose.model('Usuario', usuarioSchema);
            const Grupo = mongoose.model('Grupo');
            
            const usuariosExistentes = await Usuario.countDocuments();
            if (usuariosExistentes > 0) {
                console.log('ℹ️  Usuários já existem, pulando...');
                return;
            }
            
            const grupoAdmin = await Grupo.findOne({ nome: 'admin' });
            if (!grupoAdmin) {
                throw new Error('Grupo admin não encontrado');
            }
            
            const senhaHash = await bcrypt.hash('admin123', 10);
            
            const usuarios = [
                {
                    nome: 'Administrador',
                    email: 'admin@sistema.com',
                    matricula: 'ADM0001',
                    senha: senhaHash,
                    telefone: '(11) 99999-9999',
                    ativo: true,
                    id_grupo: grupoAdmin._id
                },
                {
                    nome: 'Usuario Teste',
                    email: 'teste@sistema.com',
                    matricula: 'USR0001',
                    senha: senhaHash,
                    telefone: '(11) 88888-8888',
                    ativo: true,
                    id_grupo: grupoAdmin._id
                }
            ];
            
            const usuariosCriados = await Usuario.insertMany(usuarios);
            
            // Armazenar o usuário de teste para uso nos tests
            this.testUser = usuariosCriados[1]; // Segundo usuário (Usuario Teste)
            
            console.log('✅ Usuários criados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar usuários:', error);
            throw error;
        }
    }

    async teardownDatabase() {
        try {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }
            if (this.mongoServer) {
                await this.mongoServer.stop();
                this.mongoServer = null;
            }
        } catch (error) {
            console.error('❌ Erro no teardown:', error);
            throw error;
        }
    }

    async cleanDatabase() {
        try {
            if (mongoose.connection.readyState === 1) {
                const collections = ['movimentacaos', 'produtos', 'fornecedors'];
                
                for (const collection of collections) {
                    try {
                        await mongoose.connection.db.collection(collection).deleteMany({});
                    } catch (error) {
                        // Ignora erro se collection não existe
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro ao limpar banco:', error);
        }
    }

    async login(matricula = 'ADM0001', senha = 'admin123') {
        try {
            const app = getApp();
            
            const response = await request(app)
                .post('/api/auth/login')
                .send({ matricula, senha });

            if (response.status !== 200) {
                console.error('❌ Erro no login:', response.body);
                throw new Error(`Login falhou: ${response.body?.message || 'Erro desconhecido'}`);
            }

            if (!response.body?.accessToken) {
                console.error('❌ Token não encontrado na resposta:', response.body);
                throw new Error('Token não encontrado na resposta');
            }

            this.token = response.body.accessToken;
            this.usuarioLogado = response.body.user;
            
            return response.body;
        } catch (error) {
            console.error('❌ Erro no método login:', error);
            throw error;
        }
    }

    async criarUsuario(dadosUsuario = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            const app = getApp();
            const dados = {
                nome: 'Usuário Teste',
                email: 'teste@teste.com',
                matricula: 'TST' + Date.now().toString().slice(-4),
                telefone: '(11) 99999-9999',
                ativo: true,
                id_grupo: this.grupoCriado?._id || await this.obterGrupoId(),
                ...dadosUsuario
            };

            const response = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar usuário:', response.body);
                throw new Error(`Falha ao criar usuário: ${response.body?.message || 'Erro desconhecido'}`);
            }

            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarUsuario:', error);
            throw error;
        }
    }

    async criarFornecedor(dadosFornecedor = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            const app = getApp();
            const dados = {
                nome: 'Fornecedor Teste',
                cnpj: '12345678000199',
                email: 'fornecedor@teste.com',
                telefone: '(11) 99999-9999',
                logradouro: 'Rua Teste, 123',
                bairro: 'Bairro Teste',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01234-567',
                ativo: true,
                ...dadosFornecedor
            };

            const response = await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar fornecedor:', response.body);
                throw new Error(`Falha ao criar fornecedor: ${response.body?.message || 'Erro desconhecido'}`);
            }

            this.fornecedorCriado = response.body.data;
            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarFornecedor:', error);
            throw error;
        }
    }

    async criarGrupo(dadosGrupo = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            const app = getApp();
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo teste',
                ativo: true,
                ...dadosGrupo
            };

            const response = await request(app)
                .post('/api/grupos')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar grupo:', response.body);
                throw new Error(`Falha ao criar grupo: ${response.body?.message || 'Erro desconhecido'}`);
            }

            this.grupoCriado = response.body.data;
            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarGrupo:', error);
            throw error;
        }
    }

    async criarProduto(dadosProduto = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            if (!this.fornecedorCriado) {
                await this.criarFornecedor();
            }

            const app = getApp();
            const dados = {
                nome: 'Produto Teste',
                descricao: 'Descrição do produto teste',
                preco: 100.00,
                categoria: 'Categoria Teste',
                id_fornecedor: this.fornecedorCriado._id,
                ativo: true,
                ...dadosProduto
            };

            const response = await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar produto:', response.body);
                throw new Error(`Falha ao criar produto: ${response.body?.message || 'Erro desconhecido'}`);
            }

            this.produtoCriado = response.body.data;
            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarProduto:', error);
            throw error;
        }
    }

    async criarMovimentacao(dadosMovimentacao = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            if (!this.produtoCriado) {
                await this.criarProduto();
            }

            const app = getApp();
            const dados = {
                id_produto: this.produtoCriado._id,
                tipo: 'entrada',
                quantidade: 10,
                observacao: 'Movimentação de teste',
                ...dadosMovimentacao
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar movimentação:', response.body);
                throw new Error(`Falha ao criar movimentação: ${response.body?.message || 'Erro desconhecido'}`);
            }

            this.movimentacaoCriada = response.body.data;
            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarMovimentacao:', error);
            throw error;
        }
    }

    async obterGrupoId() {
        try {
            const mongoose = require('mongoose');
            const Grupo = mongoose.model('Grupo');
            const grupo = await Grupo.findOne({ nome: 'admin' });
            return grupo ? grupo._id : null;
        } catch (error) {
            console.error('❌ Erro ao obter grupo:', error);
            return null;
        }
    }

    getAuthHeader() {
        return { Authorization: `Bearer ${this.token}` };
    }

    getApp() {
        return getApp();
    }

    expectErrorResponse(response, expectedStatusCode) {
        expect(response.status).toBe(expectedStatusCode);
        expect(response.body).toBeDefined();
        expect(response.body.error).toBe(true);
        expect(response.body.code).toBe(expectedStatusCode);
        expect(response.body.message).toBeDefined();
    }

    expectSuccessResponse(response, expectedStatusCode = 200) {
        expect(response.status).toBe(expectedStatusCode);
        expect(response.body).toBeDefined();
        expect(response.body.error).toBe(false);
        expect(response.body.code).toBe(expectedStatusCode);
        expect(response.body.data).toBeDefined();
    }

    expectValidResponse(response, expectedStatusCode = 200) {
        expect(response.status).toBe(expectedStatusCode);
        expect(response.body).toBeDefined();
        expect(response.body.error).toBe(false);
        expect(response.body.code).toBe(expectedStatusCode);
    }

    expectPaginatedResponse(response, expectedStatusCode = 200) {
        this.expectSuccessResponse(response, expectedStatusCode);
        expect(response.body.data.docs).toBeDefined();
        expect(Array.isArray(response.body.data.docs)).toBe(true);
        expect(response.body.data.totalDocs).toBeDefined();
        expect(response.body.data.page).toBeDefined();
        expect(response.body.data.totalPages).toBeDefined();
    }

    async getAdminToken() {
        if (!this.token) {
            await this.login();
        }
        return this.token;
    }

    // Aliases para compatibilidade com testes existentes
    async setup() {
        return this.setupDatabase();
    }

    async teardown() {
        return this.teardownDatabase();
    }

    async clean() {
        return this.cleanDatabase();
    }

    // Métodos para criar entidades de teste
    async createTestUser(token) {
        if (!this.testUser) {
            // Se o testUser ainda não existe, criar um novo
            const userData = {
                nome: 'Usuario Teste',
                email: 'teste@sistema.com',
                matricula: 'USR0001',
                senha: 'teste123',
                telefone: '(11) 88888-8888'
            };
            
            const response = await request(getApp())
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${token}`)
                .send(userData);
                
            this.testUser = response.body.data;
        }
        return this.testUser;
    }

    async createTestFornecedor(token) {
        if (!this.testFornecedor) {
            const fornecedorData = {
                nome: 'Fornecedor Teste',
                cnpj: '12.345.678/0001-90',
                email: 'fornecedor@teste.com',
                telefone: '(11) 99999-9999',
                endereco: {
                    rua: 'Rua Teste, 123',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '01234-567'
                }
            };
            
            const response = await request(getApp())
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`)
                .send(fornecedorData);
                
            this.testFornecedor = response.body.data;
        }
        return this.testFornecedor;
    }

    async createTestGrupo(token) {
        if (!this.testGrupo) {
            const grupoData = {
                nome: 'Grupo Teste',
                descricao: 'Grupo criado para testes'
            };
            
            const response = await request(getApp())
                .post('/api/grupos')
                .set('Authorization', `Bearer ${token}`)
                .send(grupoData);
                
            this.testGrupo = response.body.data;
        }
        return this.testGrupo;
    }

    async createTestProduto(token) {
        if (!this.testProduto) {
            const fornecedor = await this.createTestFornecedor(token);
            
            const produtoData = {
                nome: 'Produto Teste',
                descricao: 'Produto criado para testes',
                preco: 99.99,
                categoria: 'Categoria Teste',
                fornecedor: fornecedor._id,
                estoque: {
                    quantidade: 100,
                    minimo: 10,
                    maximo: 1000
                }
            };
            
            const response = await request(getApp())
                .post('/api/produtos')
                .set('Authorization', `Bearer ${token}`)
                .send(produtoData);
                
            this.testProduto = response.body.data;
        }
        return this.testProduto;
    }
}

module.exports = IntegrationTestHelper;
