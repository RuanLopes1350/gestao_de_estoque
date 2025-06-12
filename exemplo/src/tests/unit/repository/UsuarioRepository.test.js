import UsuarioRepository from '../../../repositories/UsuarioRepository.js';
import CustomError from '../../../utils/helpers/index.js'; // Assuming CustomError is exported here

// Create mock functions and objects for dependencies
const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockPaginate = jest.fn();
const mockSave = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockPopulate = jest.fn();
const mockRotaFind = jest.fn();

const UsuarioModelMock = {
    findOne: mockFindOne,
    findById: mockFindById,
    paginate: mockPaginate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
};

const GrupoModelMock = {};
const UnidadeModelMock = {};
const RotaModelMock = {
    find: mockRotaFind,
};

describe('UsuarioRepository', () => {
    let usuarioRepository;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        usuarioRepository = new UsuarioRepository({
            usuarioModel: UsuarioModelMock,
            grupoModel: GrupoModelMock,
            unidadeModel: UnidadeModelMock,
            rotaModel: RotaModelMock,
        });
    });

    describe('obterParesRotaDominioUnicos', () => {
        test('Should return unique pairs from permissions', async () => {
            const permissoes = [
                { rota: 'rotaA', dominio: 'dom1' },
                { rota: 'rotaA', dominio: 'dom1' },
                { rota: 'rotaB' },
                { rota: 'rotaB', dominio: null },
                { rota: 'rotaC', dominio: '' }
            ];
            const result = await usuarioRepository.obterParesRotaDominioUnicos(permissoes);
            expect(result).toEqual([
                { rota: 'rotaA', dominio: 'dom1' },
                { rota: 'rotaB', dominio: null },
                { rota: 'rotaC', dominio: '' }
            ]);
        });
    });

    describe('obterPermissoesDuplicadas', () => {
        test('Should return duplicated permissions', async () => {
            const permissoes = [
                { rota: 'rotaA', dominio: 'dom1' },
                { rota: 'rotaA', dominio: 'dom1' },
                { rota: 'rotaB', dominio: 'dom2' },
                { rota: 'rotaB', dominio: 'dom2' },
                { rota: 'rotaC', dominio: 'dom3' }
            ];
            // Build combinacoesRecebidas same as in repository: 
            const combinacoesRecebidas = permissoes.map(p => `${p.rota}_${p.dominio || 'undefined'}`);
            const result = await usuarioRepository.obterPermissoesDuplicadas(permissoes, combinacoesRecebidas);
            // The first occurrence is not duplicated, subsequent occurrences are returned.
            expect(result).toEqual([
                { rota: 'rotaA', dominio: 'dom1' },
                { rota: 'rotaB', dominio: 'dom2' }
            ]);
        });
    });

    describe('buscarPorEmail', () => {
        test('Should call findOne with email filter', async () => {
            const fakeUser = { email: 'test@example.com', senha: 'secret' };
            mockFindOne.mockReturnValueOnce({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(fakeUser),
                }),
            });
            const result = await usuarioRepository.buscarPorEmail('test@example.com');
            expect(mockFindOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(result).toEqual(fakeUser);
        });
    });



    describe('buscarPorId', () => {
        test('Should return user when found without tokens', async () => {
            const fakeUser = { _id: '123', toObject: () => ({ _id: '123' }) };
            const query = { select: jest.fn().mockReturnThis() };
            // Simulate findById returning a query that resolves to fakeUser
            mockFindById.mockReturnValueOnce(query);
            query.then = (cb) => cb(fakeUser);
            const result = await usuarioRepository.buscarPorId('123');
            expect(result).toEqual(fakeUser);
        });

        test('Should throw error if user is not found', async () => {
            const query = { select: jest.fn().mockReturnThis() };
            // Simulate findById returning a query that resolves to null
            mockFindById.mockReturnValueOnce(query);
            query.then = (cb) => cb(null);
            await expect(usuarioRepository.buscarPorId('nonexistent')).rejects.toThrow();
        });
    });

    describe('buscarPorPermissao', () => {
        test('Should return found routes', async () => {
            const permissoes = [
                { rota: 'rotaA', dominio: 'dom1' },
                { rota: 'rotaB' },
            ];
            const fakeRotas = [{ rota: 'rotaA', dominio: 'dom1' }];
            mockRotaFind.mockResolvedValueOnce(fakeRotas);
            const result = await usuarioRepository.buscarPorPermissao(permissoes);
            expect(mockRotaFind).toHaveBeenCalledWith({
                $or: [
                    { rota: 'rotaA', dominio: 'dom1' },
                    { rota: 'rotaB', dominio: null }
                ]
            });
            expect(result).toEqual(fakeRotas);
        });
    });

    describe('criar', () => {
        test('Should create a new user and save', async () => {
            const dadosUsuario = { email: 'new@example.com' };
            const fakeUserInstance = { save: mockSave };
            // Simulate the save method resolving to the new user
            mockSave.mockResolvedValueOnce(dadosUsuario);
            // Mock the model constructor to return fakeUserInstance
            function FakeUsuarioModel(data) {
                Object.assign(this, data);
                this.save = mockSave;
            }
            const repository = new UsuarioRepository({
                usuarioModel: FakeUsuarioModel,
                grupoModel: GrupoModelMock,
                unidadeModel: UnidadeModelMock,
                rotaModel: RotaModelMock,
            });
            const result = await repository.criar(dadosUsuario);
            expect(result).toEqual(dadosUsuario);
        });
    });

    describe('atualizar', () => {
        test('Should update user and return updated user', async () => {
            const updatedData = { email: 'updated@example.com' };
            const fakeUsuario = { _id: '123', toObject: () => ({ _id: '123' }), grupos: [], unidades: [] };
            // Simulate findByIdAndUpdate chain with populate and exec
            const fakeChain = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(fakeUsuario)
            };
            mockFindByIdAndUpdate.mockReturnValueOnce(fakeChain);
            const result = await usuarioRepository.atualizar('123', updatedData);
            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('123', updatedData, { new: true });
            expect(result).toEqual(fakeUsuario);
        });

        test('Should throw error if user to update is not found', async () => {
            const updatedData = { email: 'nonexistent@example.com' };
            const fakeChain = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null)
            };
            mockFindByIdAndUpdate.mockReturnValueOnce(fakeChain);
            await expect(usuarioRepository.atualizar('nonexistent', updatedData)).rejects.toThrow();
        });
    });

    describe('deletar', () => {
        test('Should delete user and return deleted user', async () => {
            const fakeUsuario = { _id: '123', email: 'delete@example.com' };
            mockFindByIdAndDelete.mockResolvedValueOnce(fakeUsuario);
            const result = await usuarioRepository.deletar('123');
            expect(mockFindByIdAndDelete).toHaveBeenCalledWith('123');
            expect(result).toEqual(fakeUsuario);
        });
    });
});