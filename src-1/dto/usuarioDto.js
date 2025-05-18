import { z } from 'zod';

export const UsuarioSchema = z.object({
    nome_usuario: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
    matricula: z.string().min(1, 'Matrícula é obrigatória'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    cargo: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
});

export const UsuarioUpdateSchema = UsuarioSchema.partial();