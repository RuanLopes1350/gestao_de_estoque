// src/utils/validators/schemas/zod/ExampleSchema.js

import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';

const ExampleSchema = z.object({
  nome: z.string().min(1, 'Campo nome é obrigatório.'),
  codigo: z.string().min(1, 'Campo codigo é obrigatório.'),
  descricao: z.string().min(1, 'Campo descrição é obrigatório.'),
});

const ExampleUpdateSchema = ExampleSchema.partial();

export { ExampleSchema, ExampleUpdateSchema };
