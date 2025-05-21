import { z } from 'zod';

export const LoginSchema = z.object({
    matricula: z.string().min(1, 'Matrícula não pode ser vazia'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export const UsuarioSchema = z.object({
    nome_usuario: z.string().min(3, 'Nome do usuário deve ter pelo menos 3 caracteres'),
    matricula: z.string().min(1, 'Matrícula não pode ser vazia'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    cargo: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
    data_cadastro: z.date().optional().or(z.string().datetime()),
    data_ultima_atualizacao: z.date().optional().or(z.string().datetime())
});

export const UsuarioUpdateSchema = UsuarioSchema.partial();
