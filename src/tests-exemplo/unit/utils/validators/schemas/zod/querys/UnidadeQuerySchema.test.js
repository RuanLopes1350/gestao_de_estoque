import mongoose from 'mongoose';
import { UnidadeIdSchema, UnidadeQuerySchema } from '../../../../../../../utils/validators/schemas/zod/querys/UnidadeQuerySchema.js';

describe("UnidadeIdSchema", () => {
    it("should validate a valid ObjectId", () => {
        const validId = new mongoose.Types.ObjectId().toString();
        const result = UnidadeIdSchema.safeParse(validId);
        expect(result.success).toBe(true);
    });

    it("should fail with an invalid ObjectId", () => {
        const invalidId = "12345";
        const result = UnidadeIdSchema.safeParse(invalidId);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toBe("ID inválido");
        }
    });
});

describe("UnidadeQuerySchema", () => {
    it("should apply default values for page and limite when not provided", () => {
        const input = {};
        const result = UnidadeQuerySchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.page).toBe(1);
            expect(result.data.limite).toBe(10);
        }
    });

    it("should trim the 'nome' and 'locallidade' fields", () => {
        const input = {
            nome: "  Teste Nome  ",
            locallidade: "  Teste Localidade  ",
        };
        const result = UnidadeQuerySchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.nome).toBe("Teste Nome");
            expect(result.data.locallidade).toBe("Teste Localidade");
        }
    });

    it("should accept valid 'ativo' values", () => {
        const validInputs = [
            { ativo: "true" },
            { ativo: "false" },
            {} // when not provided
        ];
        validInputs.forEach(input => {
            const result = UnidadeQuerySchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });

    it("should fail if 'ativo' is not 'true' or 'false'", () => {
        const input = { ativo: "yes" };
        const result = UnidadeQuerySchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toBe("Ativo deve ser 'true' ou 'false'");
        }
    });

    it("should convert 'page' and 'limite' from string to number", () => {
        const input = { page: "3", limite: "25" };
        const result = UnidadeQuerySchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.page).toBe(3);
            expect(result.data.limite).toBe(25);
        }
    });

    it("should fail if 'page' is not a positive integer", () => {
        const input = { page: "0" };
        const result = UnidadeQuerySchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toBe("Page deve ser um número inteiro maior que 0");
        }
    });

    it("should fail if 'limite' is not between 1 and 100", () => {
        const invalidInputs = [
            { limite: "0" },
            { limite: "101" }
        ];
        invalidInputs.forEach(input => {
            const result = UnidadeQuerySchema.safeParse(input);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe("Limite deve ser um número inteiro entre 1 e 100");
            }
        });
    });

    it("should fail if 'nome' is provided as an empty string (after trim)", () => {
        const input = { nome: "   " };
        const result = UnidadeQuerySchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toBe("Nome não pode ser vazio");
        }
    });

    it("should fail if 'locallidade' is provided as an empty string (after trim)", () => {
        const input = { locallidade: "   " };
        const result = UnidadeQuerySchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toBe("Localidade não pode ser vazio");
        }
    });
});