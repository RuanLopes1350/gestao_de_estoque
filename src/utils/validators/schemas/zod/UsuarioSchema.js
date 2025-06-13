import { z } from 'zod';

export const LoginSchema = z.object({
    matricula: z.string().min(4, 'Matrícula deve conter no minimo 4 caracteres'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export const UsuarioSchema = z.object({
    nome_usuario: z.string().min(3).regex(/^[A-Za-zÀ-ÿ\s]+$/,'Nome do usuário deve possuir pelo menos 3 caracteres, não pode conter caracteres especiais ou numeros. Apenas letras.'),
    matricula: z.string().min(4,'Matrícula deve conter no minimo 4 caracteres'),
    senha: z.string().min(6).regex(/[A-Z]/,'Senha deve conter pelo menos uma letra maiuscula.')
                            .regex(/[a-z]/,'Senha deve conter pelo menos uma letra minuscula.')
                            .regex(/[0-9]/,'Senha deve conter pelo menos um numero.'),
    cargo: z.string().min(4, 'Cargo deve ter pelo menos 4 caracteres'),
    data_cadastro: z.date().optional().or(z.string().datetime()),
    data_ultima_atualizacao: z.date().optional().or(z.string().datetime())
});

export const UsuarioUpdateSchema = UsuarioSchema.partial();
