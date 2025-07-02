import { RotaIdSchema, RotaQuerySchema } from "../../../../../../../utils/validators/schemas/zod/querys/RotaQuerySchema.js";
import mongoose from "mongoose";

describe("RotaIdSchema", () => {
    it("should validate a valid ObjectId", () => {
        const validId = new mongoose.Types.ObjectId().toString();
        expect(() => RotaIdSchema.parse(validId)).not.toThrow();
    });

    it("should throw error for an invalid ObjectId", () => {
        const invalidId = "invalid-id";
        expect(() => RotaIdSchema.parse(invalidId)).toThrow("ID inválido");
    });
});

describe("RotaQuerySchema", () => {
    it("should transform and validate a complete valid query", () => {
        const input = {
            rota: "  minha-rota  ",
            dominio: "meudominio.com",
            ativo: "true",
            page: "3",
            limite: "25",
        };

        const result = RotaQuerySchema.parse(input);
        expect(result.rota).toBe("minha-rota");
        expect(result.dominio).toBe("meudominio.com");
        expect(result.ativo).toBe("true");
        expect(result.page).toBe(3);
        expect(result.limite).toBe(25);
    });

    it("should apply default values for page and limite if not provided", () => {
        const input = {
            rota: "rotaExemplo",
            dominio: "dominioExemplo.com",
            ativo: "false",
        };

        const result = RotaQuerySchema.parse(input);
        expect(result.page).toBe(1);
        expect(result.limite).toBe(10);
    });

    it("should fail if 'rota' is an empty string after trim", () => {
        const input = {
            rota: "   ",
            dominio: "dominio.com",
        };

        expect(() => RotaQuerySchema.parse(input)).toThrow("Rota não pode ser vazia");
    });

    it("should fail if 'dominio' is an empty string after trim", () => {
        const input = {
            rota: "rotaValida",
            dominio: "    ",
        };

        expect(() => RotaQuerySchema.parse(input)).toThrow("Domínio não pode ser vazio");
    });

    it("should fail if 'ativo' has a value other than 'true' or 'false'", () => {
        const input = {
            rota: "rotaValida",
            dominio: "dominio.com",
            ativo: "maybe",
        };

        expect(() => RotaQuerySchema.parse(input)).toThrow("Ativo deve ser 'true' ou 'false'");
    });

    it("should fail if 'page' is not a positive integer", () => {
        const input = {
            rota: "rotaValida",
            dominio: "dominio.com",
            page: "0",
        };

        expect(() => RotaQuerySchema.parse(input)).toThrow("Page deve ser um número inteiro maior que 0");
    });

    it("should fail if 'limite' is not between 1 and 100", () => {
        const input = {
            rota: "rotaValida",
            dominio: "dominio.com",
            limite: "150",
        };

        expect(() => RotaQuerySchema.parse(input)).toThrow("Limite deve ser um número inteiro entre 1 e 100");
    });
});