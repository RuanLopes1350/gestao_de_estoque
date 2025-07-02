import { UsuarioIdSchema, UsuarioQuerySchema } from '../../../../../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema';
import mongoose from 'mongoose';

describe('UsuarioIdSchema', () => {
    it('should validate a correct ObjectId', () => {
        const validId = new mongoose.Types.ObjectId().toString();
        expect(() => UsuarioIdSchema.parse(validId)).not.toThrow();
    });

    it('should invalidate an incorrect ObjectId', () => {
        const invalidId = '12345';
        expect(() => UsuarioIdSchema.parse(invalidId)).toThrow("ID inválido");
    });
});

describe('UsuarioQuerySchema', () => {
    // Objeto base válido para evitar duplicação
    const baseValidQuery = {
        nome: 'John Doe',
        email: 'john.doe@example.com',
        ativo: 'true',
        grupo: 'admin',
        unidade: 'unit1',
        page: '2',
        limite: '20'
    };

    it('should validate a correct query object', () => {
        expect(() => UsuarioQuerySchema.parse(baseValidQuery)).not.toThrow();
    });

    it('should invalidate an empty nome', () => {
        const query = { ...baseValidQuery, nome: '' };
        expect(() => UsuarioQuerySchema.parse(query)).toThrow("Nome não pode ser vazio");
    });

    it('should invalidate an incorrect email format', () => {
        const query = { ...baseValidQuery, email: 'invalid-email' };
        expect(() => UsuarioQuerySchema.parse(query)).toThrow("Formato de email inválido");
    });

    it('should invalidate an incorrect ativo value', () => {
        const query = { ...baseValidQuery, ativo: 'yes' };
        expect(() => UsuarioQuerySchema.parse(query)).toThrow("Ativo deve ser 'true' ou 'false'");
    });

    it('should invalidate a non-integer page value', () => {
        const query = { ...baseValidQuery, page: 'abc' };
        expect(() => UsuarioQuerySchema.parse(query)).toThrow("Page deve ser um número inteiro maior que 0");
    });

    it('should invalidate a page value less than 1', () => {
        const query = { ...baseValidQuery, page: '0' };
        expect(() => UsuarioQuerySchema.parse(query)).toThrow("Page deve ser um número inteiro maior que 0");
    });

    it('should invalidate a limite value greater than 100', () => {
        const query = { ...baseValidQuery, limite: '101' };
        expect(() => UsuarioQuerySchema.parse(query)).toThrow("Limite deve ser um número inteiro entre 1 e 100");
    });

    it('should invalidate a limite value less than 1', () => {
        const query = { ...baseValidQuery, limite: '0' };
        expect(() => UsuarioQuerySchema.parse(query)).toThrow("Limite deve ser um número inteiro entre 1 e 100");
    });
});
