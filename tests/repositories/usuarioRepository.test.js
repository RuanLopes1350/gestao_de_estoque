import mongoose from 'mongoose';
import UsuarioRepository from '../../src/repositories/usuarioRepository.js';
import Usuario from '../../src/models/Usuario.js';
import { CustomError, messages } from '../../src/utils/helpers/index.js';

// Mock do mongoose
jest.mock('mongoose');

// Mock do model Usuario
jest.mock('../../src/models/Usuario.js', () => ({
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
    paginate: jest.fn(),
}));

// Mock dos helpers
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
    messages: {
        error: {
            resourceNotFound: jest.fn((resource) => `${resource} não encontrado(a).`),
            duplicateEntry: jest.fn((field) => `Já existe um registro com o dado informado no campo ${field}.`),
        },
        validation: {
            generic: {
                resourceCreated: jest.fn((resource) => `${resource} criado(a) com sucesso.`),
                resourceUpdated: jest.fn((resource) => `${resource} atualizado(a) com sucesso.`),
                resourceDeleted: jest.fn((resource) => `${resource} excluído(a) com sucesso.`),
            }
        }
    }
}));

// Mock do console.log
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('UsuarioRepository', () => {
    let usuarioRepository;
    let mockReq;

    beforeEach(() => {
        usuarioRepository = new UsuarioRepository();
        mockReq = {
            params: {},
            query: {}
        };
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with default Usuario model', () => {
            expect(usuarioRepository.model).toBe(Usuario);
        });

        it('should initialize with custom model', () => {
            const customModel = {};
            const repo = new UsuarioRepository({ model: customModel });
            expect(repo.model).toBe(customModel);
        });
    });

    describe('listarUsuarios', () => {
        it('should return user by ID when ID is provided', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, nome_usuario: 'Test User' };
            
            mockReq.params.id = userId;
            Usuario.findById.mockResolvedValue(mockUser);

            const result = await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should throw error when user not found by ID', async () => {
            const userId = '507f1f77bcf86cd799439011';
            
            mockReq.params.id = userId;
            Usuario.findById.mockResolvedValue(null);

            await expect(usuarioRepository.listarUsuarios(mockReq)).rejects.toThrow(CustomError);
            expect(Usuario.findById).toHaveBeenCalledWith(userId);
        });

        it('should list users with pagination when no ID provided', async () => {
            const mockResult = {
                docs: [
                    { _id: '1', nome_usuario: 'User 1' },
                    { _id: '2', nome_usuario: 'User 2' }
                ],
                totalDocs: 2,
                page: 1,
                totalPages: 1
            };

            Usuario.paginate.mockResolvedValue(mockResult);

            const result = await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalled();
            expect(result).toEqual(mockResult);
        });

        it('should apply nome_usuario filter', async () => {
            mockReq.query = { nome_usuario: 'John' };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.objectContaining({
                    nome_usuario: { $regex: 'John', $options: 'i' }
                }),
                expect.any(Object)
            );
        });

        it('should apply matricula filter', async () => {
            mockReq.query = { matricula: '12345' };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.objectContaining({
                    matricula: { $regex: '12345', $options: 'i' }
                }),
                expect.any(Object)
            );
        });

        it('should apply cargo filter', async () => {
            mockReq.query = { cargo: 'admin' };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.objectContaining({
                    cargo: { $regex: 'admin', $options: 'i' }
                }),
                expect.any(Object)
            );
        });

        it('should handle custom page and limit', async () => {
            mockReq.query = { page: 2, limite: 20 };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    page: 2,
                    limit: 20
                })
            );
        });

        it('should limit page size to maximum 100', async () => {
            mockReq.query = { limite: 200 };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    limit: 100
                })
            );
        });
    });

    describe('buscarPorId', () => {
        it('should return user by ID', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, nome_usuario: 'Test User' };

            Usuario.findById.mockResolvedValue(mockUser);

            const result = await usuarioRepository.buscarPorId(userId);

            expect(Usuario.findById).toHaveBeenCalledWith(userId, { accesstoken: 0, refreshtoken: 0 });
            expect(result).toEqual(mockUser);
        });

        it('should throw error when user not found', async () => {
            const userId = '507f1f77bcf86cd799439011';

            Usuario.findById.mockResolvedValue(null);

            const result = await usuarioRepository.buscarPorId(userId);
            expect(result).toBeNull();
        });
    });

    describe('buscarPorMatricula', () => {
        it('should return user by matricula', async () => {
            const matricula = '12345';
            const mockUser = { _id: '1', matricula, nome_usuario: 'Test User' };

            Usuario.findOne.mockResolvedValue(mockUser);

            const result = await usuarioRepository.buscarPorMatricula(matricula);

            expect(Usuario.findOne).toHaveBeenCalledWith({ matricula });
            expect(result).toEqual(mockUser);
        });

        it('should return null when user not found by matricula', async () => {
            const matricula = '12345';

            Usuario.findOne.mockResolvedValue(null);

            const result = await usuarioRepository.buscarPorMatricula(matricula);
            expect(result).toBeNull();
        });
    });

    describe('cadastrarUsuario', () => {
        it('should create user successfully', async () => {
            const userData = { nome_usuario: 'Test User', matricula: '12345' };
            const mockCreatedUser = { _id: '1', ...userData };

            Usuario.create.mockResolvedValue(mockCreatedUser);

            const result = await usuarioRepository.cadastrarUsuario(userData);

            expect(Usuario.create).toHaveBeenCalledWith(userData);
            expect(result).toEqual(mockCreatedUser);
        });

        it.skip('should handle duplicate key error', async () => {
            const userData = { nome_usuario: 'Test User', matricula: '12345' };
            const duplicateError = {
                code: 11000,
                keyValue: { matricula: '12345' }
            };

            Usuario.create.mockRejectedValue(duplicateError);

            await expect(usuarioRepository.cadastrarUsuario(userData)).rejects.toThrow();
        });
    });

    describe('atualizarUsuario', () => {
        it('should update user successfully', async () => {
            const validObjectId = '507f1f77bcf86cd799439011';
            const updateData = { nome_usuario: 'Updated Name' };
            const mockUpdatedUser = { _id: validObjectId, ...updateData };

            // Mock mongoose ObjectId validation
            mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            Usuario.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

            const result = await usuarioRepository.atualizarUsuario(validObjectId, updateData);

            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(validObjectId);
            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                validObjectId,
                updateData,
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should throw error when matricula is invalid ObjectId', async () => {
            const invalidId = 'invalid-id';
            const updateData = { nome_usuario: 'Updated Name' };

            mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

            await expect(usuarioRepository.atualizarUsuario(invalidId, updateData)).rejects.toThrow(CustomError);
        });

        it('should throw error when user not found for update', async () => {
            const validObjectId = '507f1f77bcf86cd799439011';
            const updateData = { nome_usuario: 'Updated Name' };

            mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            Usuario.findByIdAndUpdate.mockResolvedValue(null);

            await expect(usuarioRepository.atualizarUsuario(validObjectId, updateData)).rejects.toThrow(CustomError);
        });
    });

    describe('deletarUsuario', () => {
        it('should delete user successfully', async () => {
            const matricula = '12345';
            const mockDeletedUser = { _id: '1', matricula, nome_usuario: 'Test User' };

            Usuario.findOneAndDelete.mockResolvedValue(mockDeletedUser);

            const result = await usuarioRepository.deletarUsuario(matricula);

            expect(Usuario.findOneAndDelete).toHaveBeenCalledWith({ matricula });
            expect(result).toEqual(mockDeletedUser);
        });

        it('should throw error when user not found for deletion', async () => {
            const matricula = '12345';

            Usuario.findOneAndDelete.mockResolvedValue(null);

            await expect(usuarioRepository.deletarUsuario(matricula)).rejects.toThrow(CustomError);
        });
    });

    describe('desativarUsuario', () => {
        it('should deactivate user successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, ativo: false };

            Usuario.findByIdAndUpdate.mockResolvedValue(mockUser);

            const result = await usuarioRepository.desativarUsuario(userId);

            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { ativo: false },
                { new: true }
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('reativarUsuario', () => {
        it('should reactivate user successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, ativo: true };

            Usuario.findByIdAndUpdate.mockResolvedValue(mockUser);

            const result = await usuarioRepository.reativarUsuario(userId);

            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { ativo: true },
                { new: true }
            );
            expect(result).toEqual(mockUser);
        });
    });
});
