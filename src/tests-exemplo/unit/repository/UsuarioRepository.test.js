// src/tests/unit/repository/UsuarioRepository.test.js

import UsuarioRepository from '../../../../src/repositories/UsuarioRepository.js';
import UsuarioModel from '../../../../src/models/Usuario.js';
import RotaModel from '../../../../src/models/Rota.js';
import { CustomError, messages } from '../../../../src/utils/helpers/index.js';

// Mock dos modelos do Mongoose
jest.mock('../../../../src/models/Usuario.js');
jest.mock('../../../../src/models/Rota.js');

// Mock do UsuarioFilterBuilder
jest.mock('../../../../src/repositories/filters/UsuarioFilterBuilder.js', () => {
    return jest.fn().mockImplementation(() => ({
        comNome: jest.fn().mockReturnThis(),
        comEmail: jest.fn().mockReturnThis(),
        comAtivo: jest.fn().mockReturnThis(),
        comGrupo: jest.fn().mockReturnThis(),
        comUnidade: jest.fn().mockReturnThis(),
        build: jest.fn()
    }));
});

// Mock de messages e CustomError
jest.mock('../../../../src/utils/helpers/index.js', () => ({
    CustomError: class extends Error {
        constructor({ statusCode, errorType, field, details, customMessage }) {
            super(customMessage);
            this.statusCode = statusCode;
            this.errorType = errorType;
            this.field = field;
            this.details = details;
        }
    },
    messages: {
        error: {
            internalServerError: (resource) => `Erro interno no ${resource}`,
            resourceNotFound: (resource) => `${resource} não encontrado`
        }
    }
}));

describe('UsuarioRepository', () => {
    let usuarioRepository;

    beforeEach(() => {
        usuarioRepository = new UsuarioRepository();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('buscarPorEmail', () => {
        it('deve encontrar um usuário por email', async () => {
            const mockUser = { email: 'test@example.com' };
            UsuarioModel.findOne.mockResolvedValue(mockUser);

            const result = await usuarioRepository.buscarPorEmail('test@example.com');

            expect(result).toEqual(mockUser);
            expect(UsuarioModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        });

        it('deve excluir um ID específico da busca', async () => {
            const mockUser = { email: 'test@example.com' };
            UsuarioModel.findOne.mockResolvedValue(mockUser);

            const result = await usuarioRepository.buscarPorEmail('test@example.com', '123');

            expect(result).toEqual(mockUser);
            expect(UsuarioModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com', _id: { $ne: '123' } });
        });

        it('deve retornar null se nenhum usuário for encontrado', async () => {
            UsuarioModel.findOne.mockResolvedValue(null);

            const result = await usuarioRepository.buscarPorEmail('nonexistent@example.com');

            expect(result).toBeNull();
            expect(UsuarioModel.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
        });
    });

    describe('buscarPorId', () => {
        it('deve encontrar um usuário por ID', async () => {
            const mockUser = { _id: '123', nome: 'Test User' };
            UsuarioModel.findById.mockResolvedValue(mockUser);

            const result = await usuarioRepository.buscarPorId('123');

            expect(result).toEqual(mockUser);
            expect(UsuarioModel.findById).toHaveBeenCalledWith('123');
        });

        it('deve lançar um erro se o usuário não for encontrado', async () => {
            UsuarioModel.findById.mockResolvedValue(null);

            await expect(usuarioRepository.buscarPorId('123')).rejects.toThrow(CustomError);
            expect(UsuarioModel.findById).toHaveBeenCalledWith('123');
        });

        it('deve encontrar um usuário por ID com tokens incluídos', async () => {
            const mockUserWithTokens = { 
                _id: '123', 
                nome: 'Test User', 
                refreshtoken: 'refresh123', 
                accesstoken: 'access123' 
            };
            UsuarioModel.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUserWithTokens)
            });

            const result = await usuarioRepository.buscarPorId('123', true);

            expect(result).toEqual(mockUserWithTokens);
            expect(UsuarioModel.findById).toHaveBeenCalledWith('123');
            expect(UsuarioModel.findById().select).toHaveBeenCalledWith('+refreshtoken +accesstoken');
        });
    });

    describe('buscarPorPermissao', () => {
        it('deve encontrar permissões por rota e domínio', async () => {
            const mockPermissions = [{ rota: 'rota1', dominio: 'dominio1' }];
            RotaModel.find.mockResolvedValue(mockPermissions);

            const result = await usuarioRepository.buscarPorPermissao([{ rota: 'rota1', dominio: 'dominio1' }]);

            expect(result).toEqual(mockPermissions);
            expect(RotaModel.find).toHaveBeenCalledWith({ $or: [{ rota: 'rota1', dominio: 'dominio1' }] });
        });

        it('deve retornar um array vazio se nenhuma rota for encontrada', async () => {
            const mockPermissions = [];
            RotaModel.find.mockResolvedValue(mockPermissions);

            const result = await usuarioRepository.buscarPorPermissao([{ rota: 'rotaInexistente', dominio: 'dominioInexistente' }]);

            expect(result).toEqual([]);
            expect(RotaModel.find).toHaveBeenCalledWith({ $or: [{ rota: 'rotaInexistente', dominio: 'dominioInexistente' }] });
        });

        it('deve lidar com permissões sem domínio', async () => {
            const mockPermissions = [{ rota: 'rota1', dominio: null }];
            RotaModel.find.mockResolvedValue(mockPermissions);

            const result = await usuarioRepository.buscarPorPermissao([{ rota: 'rota1' }]);

            expect(result).toEqual(mockPermissions);
            expect(RotaModel.find).toHaveBeenCalledWith({ $or: [{ rota: 'rota1', dominio: null }] });
        });
    });

    describe('listar', () => {
        it('deve listar usuários com filtros', async () => {
            const mockUsers = [{ nome: 'User1' }];
            const req = {
                query: { nome: 'User1', page: 1, limite: 10 },
                params: {}
            };
            UsuarioModel.paginate.mockResolvedValue(mockUsers);

            // Mockar UsuarioFilterBuilder.build para retornar filtros
            const mockFilters = { nome: { $regex: 'User1', $options: 'i' }, ativo: true };
            const UsuarioFilterBuilder = require('../../../../src/repositories/filters/UsuarioFilterBuilder.js');
            UsuarioFilterBuilder.mockImplementation(() => ({
                comNome: jest.fn().mockReturnThis(),
                comEmail: jest.fn().mockReturnThis(),
                comAtivo: jest.fn().mockReturnThis(),
                comGrupo: jest.fn().mockReturnThis(),
                comUnidade: jest.fn().mockReturnThis(),
                build: jest.fn().mockReturnValue(mockFilters)
            }));

            const result = await usuarioRepository.listar(req);

            expect(result).toEqual(mockUsers);
            // Verifica que paginate foi chamado com os filtros e opções corretas
            expect(UsuarioModel.paginate).toHaveBeenCalledWith(mockFilters, expect.objectContaining({
                page: 1,
                limit: 10,
                populate: expect.any(Array),
                sort: { nome: 1 },
            }));
        });

        it('deve listar um usuário por ID', async () => {
            const mockUser = { _id: '123', grupos: ['grupo1'], unidades: ['unidade1'], permissoes: ['permissao1'] };

            // Configuração do mock para encadear múltiplas chamadas de populate
            const mockPopulate3 = jest.fn().mockResolvedValue(mockUser);
            const mockPopulate2 = jest.fn().mockReturnValue({ populate: mockPopulate3 });
            const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
            UsuarioModel.findById.mockReturnValue({ populate: mockPopulate1 });

            const req = { params: { id: '123' } };
            const result = await usuarioRepository.listar(req);

            expect(result).toEqual(mockUser);
            expect(UsuarioModel.findById).toHaveBeenCalledWith('123');
            expect(mockPopulate1).toHaveBeenCalledWith({
                path: 'grupos',
                populate: { path: 'unidades' }
            });
            expect(mockPopulate2).toHaveBeenCalledWith('permissoes');
            expect(mockPopulate3).toHaveBeenCalledWith('unidades');
        });

        it('deve lançar um erro se filterBuilder.build não for uma função', async () => {
            const req = {
                query: { nome: 'User1', page: 1, limite: 10 },
                params: {}
            };
            
            // Mockar o UsuarioFilterBuilder para retornar um objeto inválido
            const UsuarioFilterBuilder = require('../../../../src/repositories/filters/UsuarioFilterBuilder.js');
            UsuarioFilterBuilder.mockImplementation(() => ({
                comNome: jest.fn().mockReturnThis(),
                comEmail: jest.fn().mockReturnThis(),
                comAtivo: jest.fn().mockReturnThis(),
                comGrupo: jest.fn().mockReturnThis(),
                comUnidade: jest.fn().mockReturnThis(),
                // build não é uma função
                build: 'not a function'
            }));

            await expect(usuarioRepository.listar(req)).rejects.toThrow(CustomError);
            expect(UsuarioFilterBuilder).toHaveBeenCalled();
        });

        it('deve listar usuários com vários filtros aplicados', async () => {
            const mockUsers = [{ nome: 'User1' }, { nome: 'User2' }];
            const req = {
                query: { nome: 'User', email: 'user@example.com', ativo: 'true', grupo: 'grupo1', unidade: 'unidade1', page: 2, limite: 20 },
                params: {}
            };
            UsuarioModel.paginate.mockResolvedValue(mockUsers);

            const mockFilter = {
                nome: { $regex: 'User', $options: 'i' },
                email: 'user@example.com',
                ativo: true,
                grupo: 'grupo1',
                unidade: 'unidade1'
            };
            const UsuarioFilterBuilder = require('../../../../src/repositories/filters/UsuarioFilterBuilder.js');

            // Criação de mocks compartilhados para rastrear as chamadas
            const mockComNome = jest.fn().mockReturnThis();
            const mockComEmail = jest.fn().mockReturnThis();
            const mockComAtivo = jest.fn().mockReturnThis();
            const mockComGrupo = jest.fn().mockReturnThis();
            const mockComUnidade = jest.fn().mockReturnThis();

            UsuarioFilterBuilder.mockImplementation(() => ({
                comNome: mockComNome,
                comEmail: mockComEmail,
                comAtivo: mockComAtivo,
                comGrupo: mockComGrupo,
                comUnidade: mockComUnidade,
                build: jest.fn().mockReturnValue(mockFilter)
            }));

            const result = await usuarioRepository.listar(req);

            expect(result).toEqual(mockUsers);
            expect(UsuarioFilterBuilder).toHaveBeenCalled();
            expect(mockComNome).toHaveBeenCalledWith('User');
            expect(mockComEmail).toHaveBeenCalledWith('user@example.com');
            expect(mockComAtivo).toHaveBeenCalledWith('true');
            expect(mockComGrupo).toHaveBeenCalledWith('grupo1');
            expect(mockComUnidade).toHaveBeenCalledWith('unidade1');
            expect(UsuarioModel.paginate).toHaveBeenCalledWith(mockFilter, expect.objectContaining({
                page: 2,
                limit: 20,
                populate: expect.any(Array),
                sort: { nome: 1 },
            }));
        });

        // Teste para limitar 'limite' a 100
        it('deve limitar o valor de limite a 100 se um valor maior for fornecido', async () => {
            const mockUsers = [{ nome: 'User1' }, { nome: 'User2' }];
            const req = {
                query: { nome: 'User', limite: 200 }, // limite maior que 100
                params: {}
            };
            UsuarioModel.paginate.mockResolvedValue(mockUsers);

            // Mockar UsuarioFilterBuilder.build para retornar filtros
            const mockFilters = { nome: { $regex: 'User', $options: 'i' }, ativo: true };
            const UsuarioFilterBuilder = require('../../../../src/repositories/filters/UsuarioFilterBuilder.js');
            UsuarioFilterBuilder.mockImplementation(() => ({
                comNome: jest.fn().mockReturnThis(),
                comEmail: jest.fn().mockReturnThis(),
                comAtivo: jest.fn().mockReturnThis(),
                comGrupo: jest.fn().mockReturnThis(),
                comUnidade: jest.fn().mockReturnThis(),
                build: jest.fn().mockReturnValue(mockFilters)
            }));

            const result = await usuarioRepository.listar(req);

            expect(result).toEqual(mockUsers);
            expect(UsuarioModel.paginate).toHaveBeenCalledWith(mockFilters, expect.objectContaining({
                page: 1,
                limit: 100, // Deve ser limitado a 100
                populate: expect.any(Array),
                sort: { nome: 1 },
            }));
        });

        // Teste para limite inválido (não numérico)
        it('deve usar o limite padrão quando um valor inválido é fornecido', async () => {
            const mockUsers = [{ nome: 'User1' }, { nome: 'User2' }];
            const req = {
                query: { nome: 'User', limite: 'abc' }, // limite inválido
                params: {}
            };
            UsuarioModel.paginate.mockResolvedValue(mockUsers);

            // Mockar UsuarioFilterBuilder.build para retornar filtros
            const mockFilters = { nome: { $regex: 'User', $options: 'i' }, ativo: true };
            const UsuarioFilterBuilder = require('../../../../src/repositories/filters/UsuarioFilterBuilder.js');
            UsuarioFilterBuilder.mockImplementation(() => ({
                comNome: jest.fn().mockReturnThis(),
                comEmail: jest.fn().mockReturnThis(),
                comAtivo: jest.fn().mockReturnThis(),
                comGrupo: jest.fn().mockReturnThis(),
                comUnidade: jest.fn().mockReturnThis(),
                build: jest.fn().mockReturnValue(mockFilters)
            }));

            const result = await usuarioRepository.listar(req);

            expect(result).toEqual(mockUsers);
            expect(UsuarioModel.paginate).toHaveBeenCalledWith(mockFilters, expect.objectContaining({
                page: 1,
                limit: 10, // Deve usar o limite padrão de 10
                populate: expect.any(Array),
                sort: { nome: 1 },
            }));
        });

        // Teste para diferentes números de página
        it('deve paginar corretamente com diferentes números de página', async () => {
            const mockUsers = [{ nome: 'User1' }, { nome: 'User2' }];
            const req = {
                query: { nome: 'User', page: 3, limite: 20 },
                params: {}
            };
            UsuarioModel.paginate.mockResolvedValue(mockUsers);

            // Mockar UsuarioFilterBuilder.build para retornar filtros
            const mockFilters = { nome: { $regex: 'User', $options: 'i' }, ativo: true };
            const UsuarioFilterBuilder = require('../../../../src/repositories/filters/UsuarioFilterBuilder.js');
            UsuarioFilterBuilder.mockImplementation(() => ({
                comNome: jest.fn().mockReturnThis(),
                comEmail: jest.fn().mockReturnThis(),
                comAtivo: jest.fn().mockReturnThis(),
                comGrupo: jest.fn().mockReturnThis(),
                comUnidade: jest.fn().mockReturnThis(),
                build: jest.fn().mockReturnValue(mockFilters)
            }));

            const result = await usuarioRepository.listar(req);

            expect(result).toEqual(mockUsers);
            expect(UsuarioFilterBuilder).toHaveBeenCalled();
            expect(UsuarioModel.paginate).toHaveBeenCalledWith(mockFilters, expect.objectContaining({
                page: 3,
                limit: 20,
                populate: expect.any(Array),
                sort: { nome: 1 },
            }));
        });

        // Teste para listar usuários com parâmetros padrão
        it('deve listar usuários com parâmetros padrão quando nenhum filtro é fornecido', async () => {
            const mockUsers = [{ nome: 'User1' }, { nome: 'User2' }];
            const req = {
                query: {},
                params: {}
            };
            UsuarioModel.paginate.mockResolvedValue(mockUsers);
        
            // Mockar UsuarioFilterBuilder.build para retornar filtros padrão
            const mockFilters = { ativo: true };
            const UsuarioFilterBuilder = require('../../../../src/repositories/filters/UsuarioFilterBuilder.js');
            UsuarioFilterBuilder.mockImplementation(() => ({
                comNome: jest.fn().mockReturnThis(),
                comEmail: jest.fn().mockReturnThis(),
                comAtivo: jest.fn().mockReturnThis(),
                comGrupo: jest.fn().mockReturnThis(),
                comUnidade: jest.fn().mockReturnThis(),
                build: jest.fn().mockReturnValue(mockFilters)
            }));
        
            const result = await usuarioRepository.listar(req);
        
            expect(result).toEqual(mockUsers);
            expect(UsuarioModel.paginate).toHaveBeenCalledWith(mockFilters, expect.objectContaining({
                page: 1,
                limit: 10,
                populate: expect.any(Array),
                sort: { nome: 1 },
            }));
        });

        // **Novo Teste para Cobrir o Caso de Erro Quando Usuário Não é Encontrado**
        it('deve lançar um erro se o usuário não for encontrado ao listar por ID', async () => {
            // Configurar o mock para retornar um objeto com métodos populate encadeáveis que eventualmente resolvem para null
            UsuarioModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue(null)
                    })
                })
            });

            const req = { params: { id: '123' } };
            await expect(usuarioRepository.listar(req)).rejects.toThrow(CustomError);
            expect(UsuarioModel.findById).toHaveBeenCalledWith('123');
        });

        // **Teste Adicional Opcional: Adicionar Duplicação na Entrada para Cobrir Mais Cenários**
        it('deve retornar permissões duplicadas apenas para rota-domínio existentes (com rota3 duplicada)', async () => {
            const permissoes = [
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota3', dominio: 'dominio3' },
                { rota: 'rota3', dominio: 'dominio3' } // Duplicado
            ];
            const combinacoesRecebidas = [
                'rota1_dominio1',
                'rota2_dominio2',
                'rota1_dominio1',
                'rota3_dominio3',
                'rota3_dominio3' // Duplicado
            ];

            const result = await usuarioRepository.obterPermissoesDuplicadas(permissoes, combinacoesRecebidas);

            expect(result).toEqual([
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota3', dominio: 'dominio3' }
            ]);
        });
    });

    describe('criar', () => {
        it('deve criar um novo usuário', async () => {
            const mockUser = { nome: 'User1' };
            UsuarioModel.prototype.save.mockResolvedValue(mockUser);

            const result = await usuarioRepository.criar(mockUser);

            expect(result).toEqual(mockUser);
            expect(UsuarioModel.prototype.save).toHaveBeenCalled();
        });

        it('deve lançar um erro se salvar o usuário falhar', async () => {
            const mockUser = { nome: 'User1' };
            UsuarioModel.prototype.save.mockRejectedValue(new Error('Erro ao salvar'));

            await expect(usuarioRepository.criar(mockUser)).rejects.toThrow('Erro ao salvar');
            expect(UsuarioModel.prototype.save).toHaveBeenCalled();
        });

        it('deve lançar um erro se os dados do usuário estiverem incompletos', async () => {
            const mockUser = { /* dados incompletos */ };
            UsuarioModel.prototype.save.mockRejectedValue(new Error('Dados incompletos'));

            await expect(usuarioRepository.criar(mockUser)).rejects.toThrow('Dados incompletos');
            expect(UsuarioModel.prototype.save).toHaveBeenCalled();
        });
    });

    describe('atualizar', () => {
        it('deve atualizar um usuário', async () => {
            const mockUpdatedUser = { _id: '123', nome: 'Updated User' };
            const updateData = { nome: 'Updated User' };

            UsuarioModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUpdatedUser)
            });

            const result = await usuarioRepository.atualizar('123', updateData);

            expect(result).toEqual(mockUpdatedUser);
            expect(UsuarioModel.findByIdAndUpdate).toHaveBeenCalledWith('123', updateData, { new: true });
            expect(UsuarioModel.findByIdAndUpdate().exec).toHaveBeenCalled();
        });

        it('deve lançar um erro se o usuário não for encontrado', async () => {
            const updateData = { nome: 'Updated User' };

            UsuarioModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });

            await expect(usuarioRepository.atualizar('123', updateData)).rejects.toThrow(CustomError);
            expect(UsuarioModel.findByIdAndUpdate).toHaveBeenCalledWith('123', updateData, { new: true });
            expect(UsuarioModel.findByIdAndUpdate().exec).toHaveBeenCalled();
        });

        it('deve lançar um erro se os dados de atualização forem inválidos', async () => {
            const updateData = { /* dados inválidos */ };

            UsuarioModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockRejectedValue(new Error('Dados inválidos'))
            });

            await expect(usuarioRepository.atualizar('123', updateData)).rejects.toThrow('Dados inválidos');
            expect(UsuarioModel.findByIdAndUpdate).toHaveBeenCalledWith('123', updateData, { new: true });
            expect(UsuarioModel.findByIdAndUpdate().exec).toHaveBeenCalled();
        });
    });

    describe('deletar', () => {
        it('deve deletar um usuário', async () => {
            const mockUser = { _id: '123' };
            UsuarioModel.findByIdAndDelete.mockResolvedValue(mockUser);

            const result = await usuarioRepository.deletar('123');

            expect(result).toEqual(mockUser);
            expect(UsuarioModel.findByIdAndDelete).toHaveBeenCalledWith('123');
        });

        it('deve retornar null se o usuário não for encontrado para deletar', async () => {
            UsuarioModel.findByIdAndDelete.mockResolvedValue(null);

            const result = await usuarioRepository.deletar('123');

            expect(result).toBeNull();
            expect(UsuarioModel.findByIdAndDelete).toHaveBeenCalledWith('123');
        });

        it('deve lançar um erro se a deleção falhar', async () => {
            UsuarioModel.findByIdAndDelete.mockRejectedValue(new Error('Erro ao deletar'));

            await expect(usuarioRepository.deletar('123')).rejects.toThrow('Erro ao deletar');
            expect(UsuarioModel.findByIdAndDelete).toHaveBeenCalledWith('123');
        });
    });

    describe('obterParesRotaDominioUnicos', () => {
        it('deve retornar pares rota-domínio únicos', async () => {
            const permissoes = [
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
                { rota: 'rota3' } // domínio undefined
            ];

            const result = await usuarioRepository.obterParesRotaDominioUnicos(permissoes);

            expect(result).toEqual([
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
                { rota: 'rota3', dominio: null }
            ]);
        });

        it('deve retornar um array vazio quando permissoes está vazio', async () => {
            const permissoes = [];
            const result = await usuarioRepository.obterParesRotaDominioUnicos(permissoes);
            expect(result).toEqual([]);
        });

        it('deve lidar com permissões sem domínio', async () => {
            const permissoes = [
                { rota: 'rota1' },
                { rota: 'rota2', dominio: 'dominio2' }
            ];

            const result = await usuarioRepository.obterParesRotaDominioUnicos(permissoes);

            expect(result).toEqual([
                { rota: 'rota1', dominio: null },
                { rota: 'rota2', dominio: 'dominio2' }
            ]);
        });
    });

    describe('obterPermissoesDuplicadas', () => {
        it('deve retornar permissões duplicadas', async () => {
            const permissoes = [
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' }
            ];
            const combinacoesRecebidas = ['rota1_dominio1', 'rota1_dominio1', 'rota2_dominio2'];

            const result = await usuarioRepository.obterPermissoesDuplicadas(permissoes, combinacoesRecebidas);

            expect(result).toEqual([{ rota: 'rota1', dominio: 'dominio1' }]);
        });

        it('deve retornar um array vazio quando permissoes e combinacoesRecebidas estão vazias', async () => {
            const permissoes = [];
            const combinacoesRecebidas = [];
            const result = await usuarioRepository.obterPermissoesDuplicadas(permissoes, combinacoesRecebidas);
            expect(result).toEqual([]);
        });

        // **Teste Adicional para Cobrir Múltiplas Duplicações**
        it('deve retornar permissões duplicadas apenas para rota-domínio existentes (com rota3 duplicada)', async () => {
            const permissoes = [
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota3', dominio: 'dominio3' },
                { rota: 'rota3', dominio: 'dominio3' } // Duplicado
            ];
            const combinacoesRecebidas = [
                'rota1_dominio1',
                'rota2_dominio2',
                'rota1_dominio1',
                'rota3_dominio3',
                'rota3_dominio3' // Duplicado
            ];

            const result = await usuarioRepository.obterPermissoesDuplicadas(permissoes, combinacoesRecebidas);

            expect(result).toEqual([
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota3', dominio: 'dominio3' }
            ]);
        });
    });
});
