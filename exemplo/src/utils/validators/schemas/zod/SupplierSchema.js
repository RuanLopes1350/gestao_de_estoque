import { z } from "zod";

// Regex de CNPJ básico (aceita apenas números, pode melhorar para validar máscara/estrutura)
const cnpjRegex = /^\d{11,14}$/;

// Regex para telefone simples (apenas números, pode ser aprimorado)
const telefoneRegex = /^\d{8,15}$/;

// Esquema para endereço
const EnderecoSchema = z.object({
  logradouro: z.string().min(1, 'Logradouro é obrigatório').optional(),
  numero: z.string().min(1, 'Número é obrigatório').optional(),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório.').optional(),
  cidade: z.string().min(1, 'Cidade é obrigatória').optional(),
  estado: z.string().min(1, 'Estado é obrigatório').optional(),
  cep: z.string().min(1, 'CEP é obrigatório').optional(),
});

// Esquema principal de Supplier
const SupplierSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Formato de email inválido').optional(),
  ativo: z.boolean().default(false),
  cnpj: z.string()
    .min(11, 'CNPJ deve ter pelo menos 11 caracteres.')
    .max(18, 'CNPJ deve ter no máximo 18 caracteres.')
    .regex(cnpjRegex, 'CNPJ deve conter apenas números').optional(),
  telefone: z.string()
    .min(8, 'Telefone deve ter pelo menos 8 caracteres.')
    .max(15, 'Telefone deve ter no máximo 15 caracteres.')
    .regex(telefoneRegex, 'Telefone deve conter apenas números').optional(),
  endereco: EnderecoSchema,
});

// Esquema para atualização (todos opcionais, incluindo campos do endereço)
const SupplierUpdateSchema = SupplierSchema.partial({ deep: true });

export { SupplierSchema, SupplierUpdateSchema, EnderecoSchema };
