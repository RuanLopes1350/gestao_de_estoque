import { z } from 'zod';

export const LoginSchema = z.object({
    matricula: z.string().min(7, 'Matrícula deve conter no minimo 7 caracteres'),
    senha: z.string().min(7, 'Senha deve ter pelo menos 7 caracteres')
})
/*
// Schema exclusivo para validar apenas a matrícula por parâmetro 
export const UsuarioIdSchema = z
  .string()
  .min(7, 'Matrícula deve conter no mínimo 7 caracteres')
  .max(7, 'Matrícula deve conter no máximo 7 caracteres');
*/

export const UsuarioSchema = z.object({
    nome_usuario: z.string().min(3).regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome do usuário deve possuir pelo menos 3 caracteres, não pode conter caracteres especiais ou numeros. Apenas letras.'),
    email: z.string().email('Email inválido').min(5, 'Email deve conter no mínimo 5 caracteres').max(100, 'Email deve conter no máximo 100 caracteres'),
    perfil: z.enum(['administrador', 'gerente', 'vendedor', 'estoquista'], {
        errorMap: () => ({ message: 'Perfil deve ser um dos seguintes: administrador, gerente, vendedor ou estoquista.' })
    }),
    matricula: z.string().min(7, 'Matrícula deve conter no minimo 7 caracteres').max(7, 'Matrícula deve conter no máximo 7 caracteres'),
    senha: z.string()
        .min(7, 'Senha deve ter pelo menos 7 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiuscula.')
        .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minuscula.')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um numero.'),
});

export const UsuarioUpdateSchema = UsuarioSchema.partial();
