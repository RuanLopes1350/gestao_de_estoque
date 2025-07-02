// Validação para troca de senha ⇢ Zod
import { z } from 'zod';

export const ResetPasswordSchema = z
  .object({
    senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
    confirmacao: z.string().min(6, 'Confirmação deve ter ao menos 6 caracteres.'),
    codigo_recupera_senha: z
      .string()
      .length(4, 'Código deve ter 4 caracteres.')
      .optional(),
  })
  .refine((data) => data.senha === data.confirmacao, {
    message: 'As senhas não conferem.',
    path: ['confirmacao'],
  });
