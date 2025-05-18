// src/tests/unit/repository/GrupoRepository.test.js

// 1. Importações Necessárias
import GrupoRepository from '../../../repositories/GrupoRepository.js';
import { CustomError, messages } from '../../../utils/helpers/index.js';
import UsuarioModel from '../../../models/Usuario.js';

// 2. Mock das Dependências
jest.mock('../../../models/Usuario.js', () => ({
    findOne: jest.fn(),
}));

// 3. Definição dos Métodos Mockados para `GrupoModel` e Outros Modelos
const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockPaginate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockFind = jest.fn();

// Mock para `GrupoModel` como uma função construtora
const mockSave = jest.fn();
const mockGrupoModel = jest.fn().mockImplementation(() => ({
    save: mockSave,
}));

// Atribuição dos métodos estáticos ao `mockGrupoModel`
mockGrupoModel.findOne = mockFindOne;
mockGrupoModel.findById = mockFindById;
mockGrupoModel.paginate = mockPaginate;
mockGrupoModel.findByIdAndUpdate = mockFindByIdAndUpdate;
mockGrupoModel.findByIdAndDelete = mockFindByIdAndDelete;

// Mock para `UnidadeModel`
const mockUnidadeModel = {
    // Adicione métodos mockados se necessário
};

// Mock para `RotaModel`
const mockRotaModel = {
    find: mockFind,
};

// 4. Início da Suíte de Testes
describe('GrupoRepository', () => {
    let grupoRepository;
    let mockGrupoFilterBuilder;

    beforeEach(() => {
        // Limpar todas as chamadas e implementações anteriores dos mocks
        jest.clearAllMocks();

        // Inicializar um novo `mockGrupoFilterBuilder` antes de cada teste
        mockGrupoFilterBuilder = {
            comNome: jest.fn().mockReturnThis(),
            comDescricao: jest.fn().mockReturnThis(),
            comAtivo: jest.fn().mockReturnThis(),
            comUnidade: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue({
                nome: { $regex: 'Grupo1', $options: 'i' },
                descricao: { $regex: 'Descricao1', $options: 'i' },
                ativo: true,
                unidades: { $in: ['unidade1'] },
            }),
        };

        // Instanciar o `GrupoRepository` com os modelos e o filter builder mockados
        grupoRepository = new GrupoRepository({
            grupoModel: mockGrupoModel,
            unidadeModel: mockUnidadeModel,
            rotaModel: mockRotaModel,
            usuarioModel: UsuarioModel, // Injeção do `UsuarioModel` mockado
            grupoFilterBuilder: mockGrupoFilterBuilder,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // 5. Testes para `obterParesRotaDominioUnicos`
    describe('obterParesRotaDominioUnicos', () => {
        it('deve retornar pares únicos de rota e domínio', async () => {
            const permissoes = [
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
            ];
            const result = await grupoRepository.obterParesRotaDominioUnicos(permissoes);
            expect(result).toEqual([
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
            ]);
        });
    });

    // 6. Testes para `obterPermissoesDuplicadas`
    describe('obterPermissoesDuplicadas', () => {
        it('deve retornar permissões duplicadas', async () => {
            const permissoes = [
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
            ];
            const combinacoesRecebidas = ['rota1_dominio1', 'rota2_dominio2'];
            const result = grupoRepository.obterPermissoesDuplicadas(permissoes, combinacoesRecebidas);
            expect(result).toEqual([{ rota: 'rota1', dominio: 'dominio1' }]);
        });
    });

    // 7. Testes para `buscarPorNome`
    describe('buscarPorNome', () => {
        it('deve retornar o grupo pelo nome', async () => {
            const nome = 'Grupo1';
            const grupo = { nome: 'Grupo1' };
            mockFindOne.mockResolvedValue(grupo);

            const result = await grupoRepository.buscarPorNome(nome);
            expect(result).toEqual(grupo);
            expect(mockFindOne).toHaveBeenCalledWith({ nome });
        });

        it('deve retornar o grupo pelo nome excluindo um ID específico', async () => {
            const nome = 'Grupo1';
            const idIgnorado = '123';
            const grupo = { nome: 'Grupo1' };
            mockFindOne.mockResolvedValue(grupo);

            const result = await grupoRepository.buscarPorNome(nome, idIgnorado);
            expect(result).toEqual(grupo);
            expect(mockFindOne).toHaveBeenCalledWith({ nome, _id: { $ne: idIgnorado } });
        });

        it('deve retornar null se nenhum grupo for encontrado pelo nome', async () => {
            const nome = 'GrupoInexistente';
            mockFindOne.mockResolvedValue(null);

            const result = await grupoRepository.buscarPorNome(nome);
            expect(result).toBeNull();
            expect(mockFindOne).toHaveBeenCalledWith({ nome });
        });
    });

    // 8. Testes para `buscarPorId`
    describe('buscarPorId', () => {
        it('deve retornar o grupo pelo ID', async () => {
            const id = '123';
            const grupo = { _id: id, nome: 'Grupo1' };
            mockFindById.mockResolvedValue(grupo);

            const result = await grupoRepository.buscarPorId(id);
            expect(result).toEqual(grupo);
            expect(mockFindById).toHaveBeenCalledWith(id);
        });

        it('deve lançar erro se o grupo não for encontrado', async () => {
            const id = '123';
            mockFindById.mockResolvedValue(null);

            await expect(grupoRepository.buscarPorId(id)).rejects.toThrow('Grupo não encontrado(a).');
            await expect(grupoRepository.buscarPorId(id)).rejects.toHaveProperty('statusCode', 404);
            await expect(grupoRepository.buscarPorId(id)).rejects.toHaveProperty('errorType', 'resourceNotFound');
        });
    });

    // 9. Testes para `buscarPorPermissao`
    describe('buscarPorPermissao', () => {
        it('deve retornar rotas por permissões', async () => {
            const permissoes = [
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
            ];
            const rotas = [
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
            ];
            mockFind.mockResolvedValue(rotas);

            const result = await grupoRepository.buscarPorPermissao(permissoes);
            expect(result).toEqual(rotas);
            expect(mockFind).toHaveBeenCalledWith({
                $or: [
                    { rota: 'rota1', dominio: 'dominio1' },
                    { rota: 'rota2', dominio: 'dominio2' },
                ],
            });
        });

        it('deve retornar um array vazio se nenhuma rota for encontrada', async () => {
            const permissoes = [
                { rota: 'rota1', dominio: 'dominio1' },
                { rota: 'rota2', dominio: 'dominio2' },
            ];
            const rotas = [];
            mockFind.mockResolvedValue(rotas);

            const result = await grupoRepository.buscarPorPermissao(permissoes);
            expect(result).toEqual([]);
            expect(mockFind).toHaveBeenCalledWith({
                $or: [
                    { rota: 'rota1', dominio: 'dominio1' },
                    { rota: 'rota2', dominio: 'dominio2' },
                ],
            });
        });
    });

    // 10. Testes para `listar`
    describe('listar', () => {
        it('deve listar grupos com filtros', async () => {
            const req = {
                params: {},
                query: {
                    nome: 'Grupo1',
                    descricao: 'Descricao1',
                    ativo: 'true',
                    unidade: 'unidade1',
                    page: 1,
                    limite: 10,
                },
            };
            const grupos = { docs: [{ nome: 'Grupo1' }], totalDocs: 1, limit: 10, page: 1, totalPages: 1 };

            mockPaginate.mockResolvedValue(grupos);

            const result = await grupoRepository.listar(req);
            expect(result).toEqual(grupos);
            expect(mockGrupoFilterBuilder.comNome).toHaveBeenCalledWith('Grupo1');
            expect(mockGrupoFilterBuilder.comDescricao).toHaveBeenCalledWith('Descricao1');
            expect(mockGrupoFilterBuilder.comAtivo).toHaveBeenCalledWith('true');
            expect(mockGrupoFilterBuilder.comUnidade).toHaveBeenCalledWith('unidade1');
            expect(mockGrupoFilterBuilder.build).toHaveBeenCalled();
            expect(mockPaginate).toHaveBeenCalledWith(
                {
                    nome: { $regex: 'Grupo1', $options: 'i' },
                    descricao: { $regex: 'Descricao1', $options: 'i' },
                    ativo: true,
                    unidades: { $in: ['unidade1'] },
                },
                {
                    page: 1,
                    limit: 10,
                    populate: ['permissoes', 'unidades'],
                    sort: { nome: 1 },
                }
            );
        });

        it('deve lançar erro interno se filterBuilder.build não for uma função', async () => {
            const req = {
                params: {},
                query: {
                    nome: 'Grupo1',
                    descricao: 'Descricao1',
                    ativo: 'true',
                    page: 1,
                    limite: 10,
                },
            };

            // Simule que 'build' não é uma função
            mockGrupoFilterBuilder.build = 'not a function';

            await expect(grupoRepository.listar(req)).rejects.toThrow(/Erro interno no servidor/);
            await expect(grupoRepository.listar(req)).rejects.toHaveProperty('statusCode', 500);
            await expect(grupoRepository.listar(req)).rejects.toHaveProperty('errorType', 'internalServerError');
        });

        it('deve lidar com valores de ativo diferentes de "true" e "false"', async () => {
            const req = {
                params: {},
                query: {
                    nome: 'Grupo1',
                    descricao: 'Descricao1',
                    ativo: 'maybe', // Valor inválido para 'ativo'
                    unidade: 'unidade1',
                    page: 1,
                    limite: 10,
                },
            };
            const grupos = { docs: [{ nome: 'Grupo1' }], totalDocs: 1, limit: 10, page: 1, totalPages: 1 };

            // Mock do método 'build' para refletir que 'ativo' não está definido devido ao valor inválido
            mockGrupoFilterBuilder.build.mockReturnValue({
                nome: { $regex: 'Grupo1', $options: 'i' },
                descricao: { $regex: 'Descricao1', $options: 'i' },
                unidades: { $in: ['unidade1'] },
            });

            mockPaginate.mockResolvedValue(grupos);

            const result = await grupoRepository.listar(req);
            expect(result).toEqual(grupos);
            expect(mockGrupoFilterBuilder.comNome).toHaveBeenCalledWith('Grupo1');
            expect(mockGrupoFilterBuilder.comDescricao).toHaveBeenCalledWith('Descricao1');
            expect(mockGrupoFilterBuilder.comAtivo).toHaveBeenCalledWith('maybe');
            expect(mockGrupoFilterBuilder.comUnidade).toHaveBeenCalledWith('unidade1');
            expect(mockGrupoFilterBuilder.build).toHaveBeenCalled();
            expect(mockPaginate).toHaveBeenCalledWith(
                {
                    nome: { $regex: 'Grupo1', $options: 'i' },
                    descricao: { $regex: 'Descricao1', $options: 'i' },
                    unidades: { $in: ['unidade1'] },
                },
                {
                    page: 1,
                    limit: 10,
                    populate: ['permissoes', 'unidades'],
                    sort: { nome: 1 },
                }
            );
        });

        it('deve listar grupos sem unidade', async () => {
            const req = {
                params: {},
                query: {
                    nome: 'Grupo1',
                    descricao: 'Descricao1',
                    ativo: 'true',
                    // unidade não fornecida
                    page: 1,
                    limite: 10,
                },
            };
            const grupos = { docs: [{ nome: 'Grupo1' }], totalDocs: 1, limit: 10, page: 1, totalPages: 1 };

            // Mock do método 'build' para omitir 'unidades'
            mockGrupoFilterBuilder.build.mockReturnValue({
                nome: { $regex: 'Grupo1', $options: 'i' },
                descricao: { $regex: 'Descricao1', $options: 'i' },
                ativo: true,
            });

            mockPaginate.mockResolvedValue(grupos);

            const result = await grupoRepository.listar(req);
            expect(result).toEqual(grupos);
            expect(mockGrupoFilterBuilder.comNome).toHaveBeenCalledWith('Grupo1');
            expect(mockGrupoFilterBuilder.comDescricao).toHaveBeenCalledWith('Descricao1');
            expect(mockGrupoFilterBuilder.comAtivo).toHaveBeenCalledWith('true');
            expect(mockGrupoFilterBuilder.comUnidade).toHaveBeenCalledWith(undefined);
            expect(mockGrupoFilterBuilder.build).toHaveBeenCalled();
            expect(mockPaginate).toHaveBeenCalledWith(
                {
                    nome: { $regex: 'Grupo1', $options: 'i' },
                    descricao: { $regex: 'Descricao1', $options: 'i' },
                    ativo: true,
                },
                {
                    page: 1,
                    limit: 10,
                    populate: ['permissoes', 'unidades'],
                    sort: { nome: 1 },
                }
            );
        });

        it('deve retornar o grupo pelo ID quando o grupo existe', async () => {
            const id = '123';
            const grupo = { _id: id, nome: 'Grupo1', descricao: 'Descrição do Grupo1' };

            // Mock do método `findById` para resolver com o grupo existente
            // Deve retornar um objeto com métodos `populate` encadeados
            mockFindById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(grupo),
                }),
            });

            const req = {
                params: { id },
                query: {},
            };

            const result = await grupoRepository.listar(req);
            expect(result).toEqual(grupo);
            expect(mockFindById).toHaveBeenCalledWith(id);
        });

        it('deve lançar erro 404 se o grupo não for encontrado pelo ID', async () => {
            const id = '123';

            // Mock do método `findById` para resolver com null, simulando grupo não encontrado
            mockFindById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null),
                }),
            });

            const req = {
                params: { id },
                query: {},
            };

            await expect(grupoRepository.listar(req)).rejects.toThrow('Grupo não encontrado(a).');
            await expect(grupoRepository.listar(req)).rejects.toHaveProperty('statusCode', 404);
            await expect(grupoRepository.listar(req)).rejects.toHaveProperty('errorType', 'resourceNotFound');
        });

        it('deve lançar erro interno se ocorrer um erro inesperado', async () => {
            const req = {
                params: {},
                query: {
                    nome: 'Grupo1',
                    descricao: 'Descricao1',
                    ativo: 'true',
                    unidade: 'unidade1',
                    page: 1,
                    limite: 10,
                },
            };

            // Simule que 'build' lança um erro inesperado
            mockGrupoFilterBuilder.build.mockImplementation(() => {
                throw new Error('Erro inesperado');
            });

            await expect(grupoRepository.listar(req)).rejects.toThrow(/Erro interno no servidor/);
            await expect(grupoRepository.listar(req)).rejects.toHaveProperty('statusCode', 500);
            await expect(grupoRepository.listar(req)).rejects.toHaveProperty('errorType', 'internalServerError');
        });
    });

    // 11. Testes para `criar`
    describe('criar', () => {
        it('deve criar um novo grupo', async () => {
            const parsedData = { nome: 'Grupo1', descricao: 'Descrição do Grupo1' };
            const grupoSalvo = { _id: '123', ...parsedData };

            // Mock do método `save` para resolver com o grupo salvo
            mockSave.mockResolvedValue(grupoSalvo);

            const result = await grupoRepository.criar(parsedData);
            expect(result).toEqual(grupoSalvo);
            expect(mockSave).toHaveBeenCalled();
            expect(mockGrupoModel).toHaveBeenCalledWith(parsedData);
        });

        it('deve lançar erro se ocorrer um erro ao salvar o grupo', async () => {
            const parsedData = { nome: 'Grupo1', descricao: 'Descrição do Grupo1' };

            // Mock do método `save` para rejeitar com um erro
            mockSave.mockRejectedValue(new Error('Erro ao salvar'));

            await expect(grupoRepository.criar(parsedData)).rejects.toThrow('Erro ao salvar');
            await expect(grupoRepository.criar(parsedData)).rejects.toHaveProperty('message', 'Erro ao salvar');
        });

        it('deve lançar erro de validação se os dados forem inválidos', async () => {
            const parsedData = { /* dados inválidos */ };

            // Mock do método `save` para rejeitar com um erro de validação
            mockSave.mockRejectedValue(new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'Grupo',
                details: ['Nome é obrigatório'],
                customMessage: 'Nome é obrigatório',
            }));

            await expect(grupoRepository.criar(parsedData)).rejects.toThrow('Nome é obrigatório');
            await expect(grupoRepository.criar(parsedData)).rejects.toHaveProperty('statusCode', 400);
            await expect(grupoRepository.criar(parsedData)).rejects.toHaveProperty('errorType', 'validationError');
        });
    });

    // 12. Testes para `atualizar`
    describe('atualizar', () => {
        it('deve atualizar um grupo', async () => {
            const id = '123';
            const parsedData = { nome: 'Grupo1', descricao: 'Descrição atualizada' };
            const grupoAtualizado = { _id: id, ...parsedData };

            mockFindByIdAndUpdate.mockResolvedValue(grupoAtualizado);

            const result = await grupoRepository.atualizar(id, parsedData);
            expect(result).toEqual(grupoAtualizado);
            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(id, parsedData, { new: true });
        });

        it('deve lançar erro se o grupo não for encontrado', async () => {
            const id = '123';
            const parsedData = { nome: 'Grupo1', descricao: 'Descrição atualizada' };

            mockFindByIdAndUpdate.mockResolvedValue(null);

            await expect(grupoRepository.atualizar(id, parsedData)).rejects.toThrow('Grupo não encontrado(a).');
            await expect(grupoRepository.atualizar(id, parsedData)).rejects.toHaveProperty('statusCode', 404);
            await expect(grupoRepository.atualizar(id, parsedData)).rejects.toHaveProperty('errorType', 'resourceNotFound');
        });

        it('deve lançar erro interno se ocorrer um erro inesperado durante a atualização', async () => {
            const id = '123';
            const parsedData = { nome: 'Grupo1', descricao: 'Descrição atualizada' };

            mockFindByIdAndUpdate.mockRejectedValue(new Error('Erro inesperado'));

            await expect(grupoRepository.atualizar(id, parsedData)).rejects.toThrow(/Erro interno no servidor/);
            await expect(grupoRepository.atualizar(id, parsedData)).rejects.toHaveProperty('statusCode', 500);
            await expect(grupoRepository.atualizar(id, parsedData)).rejects.toHaveProperty('errorType', 'internalServerError');
        });
    });

    // 13. Testes para `deletar`
    describe('deletar', () => {
        it('deve deletar um grupo', async () => {
            const id = '123';
            const grupoDeletado = { _id: id, nome: 'Grupo1' };

            mockFindByIdAndDelete.mockResolvedValue(grupoDeletado);

            const result = await grupoRepository.deletar(id);
            expect(result).toEqual(grupoDeletado);
            expect(mockFindByIdAndDelete).toHaveBeenCalledWith(id);
        });

        it('deve lançar erro se o grupo não for encontrado', async () => {
            const id = '123';

            mockFindByIdAndDelete.mockResolvedValue(null);

            await expect(grupoRepository.deletar(id)).rejects.toThrow('Grupo não encontrado(a).');
            await expect(grupoRepository.deletar(id)).rejects.toHaveProperty('statusCode', 404);
            await expect(grupoRepository.deletar(id)).rejects.toHaveProperty('errorType', 'resourceNotFound');
        });

        it('deve lançar erro interno se ocorrer um erro inesperado durante a deleção', async () => {
            const id = '123';

            mockFindByIdAndDelete.mockRejectedValue(new Error('Erro inesperado'));

            await expect(grupoRepository.deletar(id)).rejects.toThrow(/Erro interno no servidor/);
            await expect(grupoRepository.deletar(id)).rejects.toHaveProperty('statusCode', 500);
            await expect(grupoRepository.deletar(id)).rejects.toHaveProperty('errorType', 'internalServerError');
        });
    });

    // 14. Testes para `verificarUsuariosAssociados`
    describe('verificarUsuariosAssociados', () => {
        it('deve retornar true se usuários estiverem associados ao grupo', async () => {
            const id = '123';
            const usuario = { grupos: [id] };
            UsuarioModel.findOne.mockResolvedValue(usuario);

            const result = await grupoRepository.verificarUsuariosAssociados(id);
            expect(result).toBe(true);
            expect(UsuarioModel.findOne).toHaveBeenCalledWith({ grupos: id });
        });

        it('deve retornar false se nenhum usuário estiver associado ao grupo', async () => {
            const id = '123';
            UsuarioModel.findOne.mockResolvedValue(null);

            const result = await grupoRepository.verificarUsuariosAssociados(id);
            expect(result).toBe(false);
            expect(UsuarioModel.findOne).toHaveBeenCalledWith({ grupos: id });
        });

        it('deve lançar erro se ocorrer um erro ao verificar usuários associados', async () => {
            const id = '123';

            UsuarioModel.findOne.mockRejectedValue(new Error('Erro no banco de dados'));

            await expect(grupoRepository.verificarUsuariosAssociados(id)).rejects.toThrow(/Erro interno no servidor/);
            await expect(grupoRepository.verificarUsuariosAssociados(id)).rejects.toHaveProperty('statusCode', 500);
            await expect(grupoRepository.verificarUsuariosAssociados(id)).rejects.toHaveProperty('errorType', 'internalServerError');
        });
    });
});
