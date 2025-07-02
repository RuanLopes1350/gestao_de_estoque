// src/utils/validators/schemas/zod/querys/SupplierQuerySchema.js

import { z } from "zod";
import mongoose from 'mongoose';

export const SupplierIdSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
});

export const SupplierQuerySchema = z.object({
    nome: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Nome não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    email: z
        .union([z.string().email("Formato de email inválido"), z.undefined()])
        .optional(),
    ativo: z
        .string()
        .optional()
        .refine((value) => !value || value === "true" || value === "false", {
            message: "Ativo deve ser 'true' ou 'false'",
        }),
    cnpj: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "CNPJ não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    telefone: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Telefone não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    endereco: z.object({ 
        logradouro: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional()
    }).optional(),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: "Page deve ser um número inteiro maior que 0",
        }),
    limite: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => Number.isInteger(val) && val > 0 && val <= 100, {
            message: "Limite deve ser um número inteiro entre 1 e 100",
        }),
});
