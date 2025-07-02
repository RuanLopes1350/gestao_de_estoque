import { UnidadeSchema, UnidadeUpdateSchema } from '../../../../../../utils/validators/schemas/zod/UnidadeSchema.js';

describe('UnidadeSchema', () => {
    it('parses valid data correctly', () => {
        const validData = { nome: 'Unidade 1', localidade: 'Localidade 1', ativo: false };
        const result = UnidadeSchema.parse(validData);
        expect(result).toEqual(validData);
    });

    it('applies default value for "ativo" when not provided', () => {
        const validData = { nome: 'Unidade 1', localidade: 'Localidade 1' };
        const result = UnidadeSchema.parse(validData);
        expect(result.ativo).toBe(true);
    });

    it('throws an error when "nome" is missing', () => {
        const invalidData = { localidade: 'Localidade 1', ativo: true };
        expect(() => UnidadeSchema.parse(invalidData)).toThrowError(/O campo nome é obrigatório/);
    });

    it('throws an error when "localidade" is missing', () => {
        const invalidData = { nome: 'Unidade 1', ativo: true };
        expect(() => UnidadeSchema.parse(invalidData)).toThrowError(/O campo localidade é obrigatório/);
    });

    it('throws an error when "nome" is an empty string', () => {
        const invalidData = { nome: '', localidade: 'Localidade 1', ativo: true };
        expect(() => UnidadeSchema.parse(invalidData)).toThrowError(/Este campo é obrigatório/);
    });

    it('throws an error when "localidade" is an empty string', () => {
        const invalidData = { nome: 'Unidade 1', localidade: '', ativo: true };
        expect(() => UnidadeSchema.parse(invalidData)).toThrowError(/Este campo é obrigatório/);
    });
});

describe('UnidadeUpdateSchema', () => {
    it('parses partial data correctly', () => {
        const partialData = { nome: 'Unidade Atualizada' };
        const result = UnidadeUpdateSchema.parse(partialData);
        expect(result.nome).toBe('Unidade Atualizada');
        // When not provided, "localidade" is undefined and "ativo" should default to true
        expect(result.localidade).toBeUndefined();
        expect(result.ativo).toBe(true);
    });

    it('applies defaults when no data is provided', () => {
        const result = UnidadeUpdateSchema.parse({});
        // Nome and localidade remain undefined because they are partial,
        // but "ativo" should default to true from the base schema.
        expect(result.nome).toBeUndefined();
        expect(result.localidade).toBeUndefined();
        expect(result.ativo).toBe(true);
    });
});