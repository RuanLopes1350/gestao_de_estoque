import { z } from 'zod';
import mongoose from 'mongoose';

export const UsuarioQuerySchema = z.object({
    nome_usuario: z.string().min(1, "O nome para busca deve conter pelo menos 1 caractere").optional(),
    matricula: z.string().optional(),
    cargo: z.string().optional(),
    data_cadastro_inicio: z.string().optional(),
    data_cadastro_fim: z.string().optional(),
    page: z.string().optional(),
    limite: z.string().optional()
});

export const UsuarioMatriculaSchema = z.string().refine(matricula => {
    return mongoose.Types.ObjectId.isValid(matricula);
}, {
    message: 'Matricula do usuário inválida'
});