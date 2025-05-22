// src/tests/unit/repository/filters/GrupoFilterBuilder.test.js

import GrupoFilterBuilder from '../../../../filters/GrupoFilterBuilder.js';
import UnidadeRepository from '../../../../repositories/UnidadeRepository.js';

// Mock the UnidadeRepository
jest.mock('../../../../repositories/UnidadeRepository.js', () => {
    return jest.fn().mockImplementation(() => {
        return {
            buscarPorNome: jest.fn(),
        };
    });
});

describe('GrupoFilterBuilder', () => {
    let grupoFilterBuilder;
    let mockUnidadeRepository;

    beforeEach(() => {
        // Clear all previous mock calls and implementations
        jest.clearAllMocks();

        // Instantiate GrupoFilterBuilder
        grupoFilterBuilder = new GrupoFilterBuilder();

        // Get the mocked UnidadeRepository instance
        mockUnidadeRepository = UnidadeRepository.mock.instances[0];
    });

    // Test comNome
    describe('comNome', () => {
        it('deve adicionar filtro de nome se fornecido', () => {
            grupoFilterBuilder.comNome('Grupo1');
            expect(grupoFilterBuilder.filtros.nome).toEqual({ $regex: 'Grupo1', $options: 'i' });
            expect(grupoFilterBuilder.comNome).toHaveBeenCalledWith('Grupo1');
        });

        it('não deve adicionar filtro de nome se não fornecido', () => {
            grupoFilterBuilder.comNome('');
            expect(grupoFilterBuilder.filtros.nome).toBeUndefined();
            expect(grupoFilterBuilder.comNome).toHaveBeenCalledWith('');
        });
    });

    // Test comDescricao
    describe('comDescricao', () => {
        it('deve adicionar filtro de descrição se fornecido', () => {
            grupoFilterBuilder.comDescricao('Descricao1');
            expect(grupoFilterBuilder.filtros.descricao).toEqual({ $regex: 'Descricao1', $options: 'i' });
            expect(grupoFilterBuilder.comDescricao).toHaveBeenCalledWith('Descricao1');
        });

        it('não deve adicionar filtro de descrição se não fornecido', () => {
            grupoFilterBuilder.comDescricao('');
            expect(grupoFilterBuilder.filtros.descricao).toBeUndefined();
            expect(grupoFilterBuilder.comDescricao).toHaveBeenCalledWith('');
        });
    });

    // Test comAtivo
    describe('comAtivo', () => {
        it('deve adicionar filtro ativo como true', () => {
            grupoFilterBuilder.comAtivo('true');
            expect(grupoFilterBuilder.filtros.ativo).toBe(true);
            expect(grupoFilterBuilder.comAtivo).toHaveBeenCalledWith('true');
        });

        it('deve adicionar filtro ativo como false', () => {
            grupoFilterBuilder.comAtivo('false');
            expect(grupoFilterBuilder.filtros.ativo).toBe(false);
            expect(grupoFilterBuilder.comAtivo).toHaveBeenCalledWith('false');
        });

        it('não deve alterar filtro ativo se valor inválido', () => {
            grupoFilterBuilder.filtros.ativo = true; // Initial value
            grupoFilterBuilder.comAtivo('maybe');
            expect(grupoFilterBuilder.filtros.ativo).toBe(true); // No change
            expect(grupoFilterBuilder.comAtivo).toHaveBeenCalledWith('maybe');
        });
    });

    // Test comUnidade
    describe('comUnidade', () => {
        it('deve adicionar filtro unidades se unidade encontrada', async () => {
            mockUnidadeRepository.buscarPorNome.mockResolvedValue([
                { _id: 'unidade1' },
                { _id: 'unidade2' },
            ]);

            await grupoFilterBuilder.comUnidade('Unidade1');

            expect(mockUnidadeRepository.buscarPorNome).toHaveBeenCalledWith('Unidade1');
            expect(grupoFilterBuilder.filtros.unidades).toEqual({ $in: ['unidade1', 'unidade2'] });
        });

        it('deve adicionar filtro unidades como array vazio se unidade não encontrada', async () => {
            mockUnidadeRepository.buscarPorNome.mockResolvedValue(null);

            await grupoFilterBuilder.comUnidade('UnidadeX');

            expect(mockUnidadeRepository.buscarPorNome).toHaveBeenCalledWith('UnidadeX');
            expect(grupoFilterBuilder.filtros.unidades).toEqual({ $in: [] });
        });

        it('não deve adicionar filtro unidades se unidade não fornecida', async () => {
            await grupoFilterBuilder.comUnidade(undefined);

            expect(mockUnidadeRepository.buscarPorNome).not.toHaveBeenCalled();
            expect(grupoFilterBuilder.filtros.unidades).toBeUndefined();
        });
    });

    // Test escapeRegex
    describe('escapeRegex', () => {
        it('deve escapar caracteres especiais em texto', () => {
            const texto = 'Grupo.*?+[]()';
            const textoEscapado = grupoFilterBuilder.escapeRegex(texto);
            expect(textoEscapado).toBe('Grupo\\.\\*\\?\\+\\[\\]\\(\\)');
        });
    });

    // Test build
    describe('build', () => {
        it('deve retornar os filtros construídos', () => {
            grupoFilterBuilder.filtros = {
                nome: { $regex: 'Grupo1', $options: 'i' },
                descricao: { $regex: 'Descricao1', $options: 'i' },
                ativo: true,
                unidades: { $in: ['unidade1'] },
            };
            const filtros = grupoFilterBuilder.build();
            expect(filtros).toEqual(grupoFilterBuilder.filtros);
        });
    });
});
