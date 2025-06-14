// UsuarioService.test.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import UsuarioService from '../../../../src/services/UsuarioService.js';
import UsuarioRepository from '../../../../src/repositories/UsuarioRepository.js';
import CustomError from '../../../../src/utils/helpers/CustomError.js';
import { PermissoesArraySchema } from '../../../../src/utils/validators/schemas/zod/PermissaoValidation.js';

// Mock do Mongoose
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        model: jest.fn(),
    };
});

// Mock do UsuarioRepository
jest.mock('../../../../src/repositories/UsuarioRepository.js', () => {
    return jest.fn().mockImplementation(() => ({
        listar: jest.fn(),
        criar: jest.fn(),
        atualizar: jest.fn(),
        deletar: jest.fn(),
        buscarPorEmail: jest.fn(),
        buscarPorPermissao: jest.fn(),
        buscarPorId: jest.fn(),
        adicionarPermissoes: jest.fn(),
        removerPermissao: jest.fn(),
        atualizarPermissoes: jest.fn(),
    }));
});

describe('UsuarioService', () => {
    let usuarioService;
    let mockRepository;

    beforeEach(() => {
        mockRepository = new UsuarioRepository();
        usuarioService = new UsuarioService();
        usuarioService.repository = mockRepository;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    // ---------------------------------
    // listar
    // ---------------------------------
    describe('listar', () => {
        it('should list all users', async () => {
            const req = { query: {} };
            const expectedData = [{ id: 1, name: 'User1' }, { id: 2, name: 'User2' }];
            mockRepository.listar.mockResolvedValue(expectedData);

            const result = await usuarioService.listar(req);

            expect(result).toEqual(expectedData);
            expect(mockRepository.listar).toHaveBeenCalledWith(req);
        });
    });

    // ---------------------------------
    // criar
    // ---------------------------------
    describe('criar', () => {
        it('should create a new user', async () => {
            const inputData = {
                email: 'test@example.com',
                senha: 'password123',
                permissoes: [
                    { id: 'perm1', rota: '/rota1' },
                    { id: 'perm2', rota: '/rota2' },
                ],
                name: 'New User',
            };
            const hashedPassword = 'hashedPassword';

            mockRepository.buscarPorEmail.mockResolvedValue(null);
            mockRepository.buscarPorPermissao.mockResolvedValue(inputData.permissoes);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

            const expectedData = { id: 1, ...inputData, senha: hashedPassword };
            mockRepository.criar.mockResolvedValue(expectedData);

            const result = await usuarioService.criar(inputData);

            expect(mockRepository.buscarPorEmail).toHaveBeenCalledWith(inputData.email, null);
            expect(mockRepository.buscarPorPermissao).toHaveBeenCalledWith(inputData.permissoes);
            expect(result).toEqual(expectedData);
            expect(mockRepository.criar).toHaveBeenCalledWith({
                ...inputData,
                senha: hashedPassword,
                permissoes: inputData.permissoes,
            });
        });

        it('should throw error if repository returns fewer permissions than requested', async () => {
            const inputData = {
                email: 'mismatch@example.com',
                senha: 'password123',
                permissoes: [
                    { id: 'perm1', rota: '/rota1' },
                    { id: 'perm2', rota: '/rota2' },
                ],
                name: 'Mismatch User',
            };

            mockRepository.buscarPorEmail.mockResolvedValue(null);
            // Retorna somente um item, causando mismatch
            mockRepository.buscarPorPermissao.mockResolvedValue([inputData.permissoes[0]]);

            await expect(usuarioService.criar(inputData)).rejects.toThrow('Permissões inválidas.');
        });

        it('should create a new user with empty permissions array', async () => {
            const inputData = {
                email: 'empty@example.com',
                senha: 'noperms123',
                permissoes: [],
                name: 'No Perms User',
            };
            const hashedPassword = 'hashedEmpty';

            mockRepository.buscarPorEmail.mockResolvedValue(null);
            mockRepository.buscarPorPermissao.mockResolvedValue([]);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

            const expectedData = {
                id: 2,
                ...inputData,
                senha: hashedPassword,
                permissoes: [],
            };
            mockRepository.criar.mockResolvedValue(expectedData);

            const result = await usuarioService.criar(inputData);

            expect(mockRepository.buscarPorEmail).toHaveBeenCalledWith(inputData.email, null);
            expect(mockRepository.buscarPorPermissao).toHaveBeenCalledWith([]);
            expect(result).toEqual(expectedData);
            expect(mockRepository.criar).toHaveBeenCalledWith({
                ...inputData,
                senha: hashedPassword,
                permissoes: [],
            });
        });
    });

    // ---------------------------------
    // atualizar
    // ---------------------------------
    describe('atualizar', () => {
        it('should update an existing user', async () => {
            const userId = 1;
            const updateData = {
                email: 'updated@example.com',
                senha: 'newpassword',
                permissoes: [{ id: 'perm1', rota: '/rota1' }],
                name: 'Updated User',
            };

            mockRepository.buscarPorId.mockResolvedValue({ id: userId });
            mockRepository.buscarPorEmail.mockResolvedValue(null);
            mockRepository.buscarPorPermissao.mockResolvedValue(updateData.permissoes);

            const expectedData = { id: userId, ...updateData };
            mockRepository.atualizar.mockResolvedValue(expectedData);

            const result = await usuarioService.atualizar(userId, updateData);

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith(userId);
            expect(mockRepository.buscarPorEmail).toHaveBeenCalledWith(updateData.email, userId);
            expect(mockRepository.buscarPorPermissao).toHaveBeenCalledWith(updateData.permissoes);
            expect(result).toEqual(expectedData);
            expect(mockRepository.atualizar).toHaveBeenCalledWith(userId, {
                ...updateData,
                permissoes: updateData.permissoes,
            });
        });

        // Teste extra para cobrir branch sem email e permissoes
        it('should update user without changing email or permissions if not provided', async () => {
            const userId = 1;
            const existingUser = {
                id: userId,
                email: 'old@example.com',
                permissoes: [{ id: 'perm1', rota: '/rota1' }],
            };
            mockRepository.buscarPorId.mockResolvedValue(existingUser);

            const updateData = { name: 'Updated Name' }; // sem email e permissoes
            const updatedUser = { ...existingUser, name: 'Updated Name' };
            mockRepository.atualizar.mockResolvedValue(updatedUser);

            const result = await usuarioService.atualizar(userId, updateData);

            // Não chamou buscarPorEmail ou buscarPorPermissao
            expect(mockRepository.buscarPorEmail).not.toHaveBeenCalled();
            expect(mockRepository.buscarPorPermissao).not.toHaveBeenCalled();

            expect(result).toEqual(updatedUser);
            expect(mockRepository.atualizar).toHaveBeenCalledWith(userId, updateData);
        });
    });

    // ---------------------------------
    // deletar
    // ---------------------------------
    describe('deletar', () => {
        it('should delete an existing user', async () => {
            const userId = 1;
            mockRepository.buscarPorId.mockResolvedValue({ id: userId });
            const expectedData = { message: 'User deleted successfully' };
            mockRepository.deletar.mockResolvedValue(expectedData);

            const result = await usuarioService.deletar(userId);

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith(userId);
            expect(mockRepository.deletar).toHaveBeenCalledWith(userId);
            expect(result).toEqual(expectedData);
        });

        it('should throw an error if user does not exist when deleting', async () => {
            const userId = 999;
            mockRepository.buscarPorId.mockResolvedValue(null);

            await expect(usuarioService.deletar(userId)).rejects.toThrow('Recurso não encontrado em Usuário.');
        });
    });

    // ---------------------------------
    // adicionarPermissoes
    // ---------------------------------
    describe('adicionarPermissoes', () => {
        it('should add permissions to a user', async () => {
            const req = {
                params: { id: 1 },
                body: {
                    permissoes: [
                        { id: 'perm1', rota: '/rota1' },
                        { id: 'perm2', rota: '/rota2' },
                    ],
                },
            };

            PermissoesArraySchema.parse = jest.fn().mockReturnValue(req.body.permissoes);
            mockRepository.adicionarPermissoes.mockResolvedValue(req.body.permissoes);

            const result = await usuarioService.adicionarPermissoes(req);

            expect(PermissoesArraySchema.parse).toHaveBeenCalledWith(req.body.permissoes);
            expect(mockRepository.adicionarPermissoes).toHaveBeenCalledWith(req.params.id, req.body.permissoes);
            expect(result).toEqual(req.body.permissoes);
        });
    });

    // ---------------------------------
    // removerPermissao
    // ---------------------------------
    describe('removerPermissao', () => {
        it('should remove a permission from a user', async () => {
            const userId = 1;
            const permissaoId = 'perm1';
            const expectedData = ['perm2'];

            mockRepository.removerPermissao.mockResolvedValue(expectedData);

            const result = await usuarioService.removerPermissao(userId, permissaoId);

            expect(mockRepository.removerPermissao).toHaveBeenCalledWith(userId, permissaoId);
            expect(result).toEqual(expectedData);
        });
    });

    // ---------------------------------
    // atualizarPermissoes
    // ---------------------------------
    describe('atualizarPermissoes', () => {
        it('should update permissions of a user', async () => {
            const userId = 1;
            const permissoesData = [
                { id: 'perm1', rota: '/rota1' },
                { id: 'perm2', rota: '/rota2' },
            ];

            PermissoesArraySchema.parse = jest.fn().mockReturnValue(permissoesData);
            mockRepository.atualizarPermissoes.mockResolvedValue(permissoesData);

            const result = await usuarioService.atualizarPermissoes(userId, permissoesData);

            expect(PermissoesArraySchema.parse).toHaveBeenCalledWith(permissoesData);
            expect(mockRepository.atualizarPermissoes).toHaveBeenCalledWith(userId, permissoesData);
            expect(result).toEqual(permissoesData);
        });
    });

    // =============================
    // TESTES DIRETOS DOS MÉTODOS AUXILIARES
    // =============================
    describe('validatePermissions (direct)', () => {
        it('should return permissoesExistentes if they match exactly', async () => {
            const permsInput = [{ id: 'perm1', rota: '/rota1' }];
            mockRepository.buscarPorPermissao.mockResolvedValue(permsInput);

            const result = await usuarioService.validatePermissions(permsInput);

            expect(result).toEqual(permsInput);
            expect(mockRepository.buscarPorPermissao).toHaveBeenCalledWith(permsInput);
        });

        it('should handle empty array', async () => {
            mockRepository.buscarPorPermissao.mockResolvedValue([]);
            const result = await usuarioService.validatePermissions([]);
            expect(result).toEqual([]);
            expect(mockRepository.buscarPorPermissao).toHaveBeenCalledWith([]);
        });

        it('should convert non-array permissoes (string) to an empty array', async () => {
            const nonArrayInput = 'invalidPermissions';
            mockRepository.buscarPorPermissao.mockResolvedValue([]);

            const result = await usuarioService.validatePermissions(nonArrayInput);

            expect(result).toEqual([]);
            expect(mockRepository.buscarPorPermissao).toHaveBeenCalledWith([]);
        });

        it('should convert undefined permissoes to an empty array', async () => {
            mockRepository.buscarPorPermissao.mockResolvedValue([]);

            const result = await usuarioService.validatePermissions(undefined);

            expect(result).toEqual([]);
            expect(mockRepository.buscarPorPermissao).toHaveBeenCalledWith([]);
        });

        it('should convert null permissoes to an empty array', async () => {
            mockRepository.buscarPorPermissao.mockResolvedValue([]);

            const result = await usuarioService.validatePermissions(null);

            expect(result).toEqual([]);
            expect(mockRepository.buscarPorPermissao).toHaveBeenCalledWith([]);
        });

        it('should throw CustomError if mismatch in length', async () => {
            const permsInput = [{ id: 'perm1', rota: '/rota1' }];
            mockRepository.buscarPorPermissao.mockResolvedValue([]); // mismatch

            await expect(usuarioService.validatePermissions(permsInput)).rejects.toThrow(CustomError);
            await expect(usuarioService.validatePermissions(permsInput)).rejects.toThrow('Permissões inválidas.');
        });
    });

    describe('ensureUserExists (direct)', () => {
        it('should return the user if it exists', async () => {
            const userId = 10;
            const userMock = { id: userId, name: 'Exists' };
            mockRepository.buscarPorId.mockResolvedValue(userMock);

            const result = await usuarioService.ensureUserExists(userId);

            expect(result).toEqual(userMock);
            expect(mockRepository.buscarPorId).toHaveBeenCalledWith(userId);
        });

        it('should throw error if user does not exist', async () => {
            mockRepository.buscarPorId.mockResolvedValue(null);

            await expect(usuarioService.ensureUserExists(999)).rejects.toThrow(
                'Recurso não encontrado em Usuário.'
            );
        });
    });

    // =============================
    // TESTE DIRETO DO MÉTODO validateEmail
    // =============================
    describe('validateEmail (direct)', () => {
        it('should throw CustomError if email already exists', async () => {
            const email = 'existing@example.com';
            // Simula que o repositório encontrou um usuário com o email
            mockRepository.buscarPorEmail.mockResolvedValue({ id: 1, email });

            await expect(usuarioService.validateEmail(email)).rejects.toThrow('Email já está em uso.');
        });

        it('should not throw error if email does not exist', async () => {
            const email = 'new@example.com';
            mockRepository.buscarPorEmail.mockResolvedValue(null);

            // Como não há erro, o método resolve normalmente (retorna undefined)
            await expect(usuarioService.validateEmail(email)).resolves.toBeUndefined();
        });
    });
});
