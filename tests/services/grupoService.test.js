import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/repositories/grupoRepository.js', () => {
    return jest.fn().mockImplementation(() => ({
        listar: jest.fn(),
        buscarPorId: jest.fn(),
        criar: jest.fn(),
        atualizar: jest.fn(),
        deletar: jest.fn(),
        adicionarPermissao: jest.fn(),
        removerPermissao: jest.fn(),
        buscarPorNome: jest.fn(),
    }));
});

jest.mock('mongoose', () => ({
    Types: {
        ObjectId: {
            isValid: jest.fn(),
        },
    },
}));

jest.mock('../../src/utils/helpers/index.js', () => ({
    CustomError: class extends Error {
        constructor(options) {
            super(options.customMessage || 'Custom error');
            this.statusCode = options.statusCode;
            this.errorType = options.errorType;
            this.field = options.field;
            this.customMessage = options.customMessage;
        }
    },
    HttpStatusCodes: {
        BAD_REQUEST: { code: 400 },
        NOT_FOUND: { code: 404 },
        OK: { code: 200 },
        CREATED: { code: 201 },
        CONFLICT: { code: 409 },
        INTERNAL_SERVER_ERROR: { code: 500 }
    },
}));

import GrupoService from '../../src/services/grupoService.js';
import GrupoRepository from '../../src/repositories/grupoRepository.js';
import mongoose from 'mongoose';

describe('GrupoService', () => {
    let grupoService;
    let mockRepository;

    beforeEach(() => {
        grupoService = new GrupoService();
        mockRepository = grupoService.repository;

        // Reset dos mocks
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('deve listar grupos com sucesso', async () => {
            const mockGrupos = {
                docs: [
                    { id: '1', nome: 'Administradores', descricao: 'Grupo admin' },
                    { id: '2', nome: 'Estoquistas', descricao: 'Grupo estoque' }
                ],
                totalDocs: 2,
                page: 1,
                totalPages: 1
            };

            const mockReq = { query: { page: 1, limit: 10 } };
            mockRepository.listar.mockResolvedValue(mockGrupos);

            const result = await grupoService.listar(mockReq);

            expect(mockRepository.listar).toHaveBeenCalledWith(mockReq);
            expect(result).toEqual(mockGrupos);
        });
    });

    describe('buscarPorId', () => {
        it('deve buscar grupo por ID com sucesso', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Administradores',
                descricao: 'Grupo de administradores',
                permissoes: []
            };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);

            const result = await grupoService.buscarPorId('123');

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockGrupo);
        });

        it('deve propagar erro quando grupo não encontrado', async () => {
            const error = new Error('Grupo não encontrado');
            mockRepository.buscarPorId.mockRejectedValue(error);

            await expect(grupoService.buscarPorId('999'))
                .rejects.toThrow('Grupo não encontrado');
        });
    });

    describe('criar', () => {
        it('deve criar grupo com sucesso', async () => {
            const mockGrupo = {
                id: 'grupo123',
                nome: 'Novo Grupo',
                descricao: 'Descrição do novo grupo',
                ativo: true
            };

            const dadosGrupo = {
                nome: 'Novo Grupo',
                descricao: 'Descrição do novo grupo'
            };

            mockRepository.buscarPorNome.mockResolvedValue(null); // não existe grupo com mesmo nome
            mockRepository.criar.mockResolvedValue(mockGrupo);

            const result = await grupoService.criar(dadosGrupo);

            expect(mockRepository.buscarPorNome).toHaveBeenCalledWith('Novo Grupo', null);
            expect(mockRepository.criar).toHaveBeenCalledWith(dadosGrupo);
            expect(result).toEqual(mockGrupo);
        });

        it('deve lançar erro quando grupo com mesmo nome já existe', async () => {
            const grupoExistente = { id: '123', nome: 'Grupo Existente' };
            const dadosGrupo = { nome: 'Grupo Existente' };

            mockRepository.buscarPorNome.mockResolvedValue(grupoExistente);

            await expect(grupoService.criar(dadosGrupo))
                .rejects.toThrow();
        });
    });

    describe('atualizar', () => {
        it('deve atualizar grupo com sucesso', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Atualizado',
                descricao: 'Descrição atualizada'
            };

            const dadosAtualizacao = { nome: 'Grupo Atualizado' };
            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.buscarPorNome.mockResolvedValue(null);
            mockRepository.atualizar.mockResolvedValue(mockGrupo);

            const result = await grupoService.atualizar('123', dadosAtualizacao);

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(mockRepository.atualizar).toHaveBeenCalledWith('123', dadosAtualizacao);
            expect(result).toEqual(mockGrupo);
        });

        it('deve lançar erro quando grupo não existe', async () => {
            const error = new Error('Grupo não encontrado');
            mockRepository.buscarPorId.mockRejectedValue(error);

            await expect(grupoService.atualizar('invalid-id', {}))
                .rejects.toThrow('Grupo não encontrado');
        });
    });

    describe('deletar', () => {
        it('deve deletar grupo com sucesso', async () => {
            const mockResponse = { message: 'Grupo deletado com sucesso' };
            const mockGrupo = { id: '123', nome: 'Grupo Teste' };
            
            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.deletar.mockResolvedValue(mockResponse);

            const result = await grupoService.deletar('123');

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(mockRepository.deletar).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockResponse);
        });

        it('deve lançar erro quando grupo não existe', async () => {
            const error = new Error('Grupo não encontrado');
            mockRepository.buscarPorId.mockRejectedValue(error);

            await expect(grupoService.deletar('invalid-id'))
                .rejects.toThrow('Grupo não encontrado');
        });
    });

    describe('adicionarPermissao', () => {
        it('deve adicionar permissão ao grupo com sucesso', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Teste',
                permissoes: [
                    { rota: '/usuarios', dominio: 'localhost', buscar: true }
                ]
            };
            const mockResponse = { message: 'Permissão adicionada com sucesso' };
            const permissao = {
                rota: 'produtos',
                dominio: 'localhost',
                buscar: true,
                enviar: true
            };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.atualizar.mockResolvedValue(mockResponse);

            // Mock the validarPermissoes method to avoid internal errors
            jest.spyOn(grupoService, 'validarPermissoes').mockResolvedValue(true);

            const result = await grupoService.adicionarPermissao('123', permissao);

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockResponse);
        });
    });

    describe('removerPermissao', () => {
        it('deve remover permissão do grupo com sucesso', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Teste',
                permissoes: [
                    { rota: 'produtos', dominio: 'localhost', buscar: true },
                    { rota: 'usuarios', dominio: 'localhost', buscar: true }
                ]
            };
            const mockResponse = { message: 'Permissão removida com sucesso' };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.atualizar.mockResolvedValue(mockResponse);

            const result = await grupoService.removerPermissao('123', 'produtos');

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockResponse);
        });
    });
});
