import { z } from 'zod';
import mongoose from 'mongoose';

export const ProdutoQuerySchema = z.object({
    nome: z.string().min(1, "O nome para busca deve conter pelo menos 1 caractere"),
    categoria: z.string().optional(),
    codigo_produto: z.string().optional(),
    preco_min: z.string().optional(),
    preco_max: z.string().optional(),
    estoque_min: z.string().optional(),
    id_fornecedor: z.string().optional(),
    status: z.string().optional(),
    page: z.string().optional(),
    limite: z.string().optional()
});

export const ProdutoIdSchema = z.string().refine(id => {
    return mongoose.Types.ObjectId.isValid(id);
}, {
    message: 'ID do produto inválido'
});