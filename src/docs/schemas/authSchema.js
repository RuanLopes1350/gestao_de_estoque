import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

// Definição original do authSchemas
const authSchemas = {
  RespostaRecuperaSenha: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "Mensagem indicando o status da recuperação de senha",
        example: "Email enviado com sucesso para recuperação de senha"
      }
    },
  },
  RequisicaoRecuperaSenha: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        description: "Endereço de email do usuário para recuperação de senha",
      }
    },
    required: ["email"]
  },
  loginPost: {
    type: "object",
    properties: {
      email: { type: "string", description: "Email do usuário" },
      senha: { type: "string", description: "Senha do usuário" }
    },
    required: ["email", "senha"]
  },
  RespostaPass: {
    type: "object",
    properties: {
      accesstoken: { type: "string", description: "Token de acesso do usuário" },
      domain: { type: "string", description: "Domínio do usuário" },
      path: { type: "string", description: "Caminho do recurso" },
      metodo: { type: "string", description: "Método HTTP utilizado" }
    },
  },
};

const addExamples = async () => {
  for (const key of Object.keys(authSchemas)) {
    const schema = authSchemas[key];
    if (schema.properties) {
      for (const [propKey, propertySchema] of Object.entries(schema.properties)) {
        propertySchema.example = await generateExample(propertySchema, propKey);
      }
    }
    schema.example = await generateExample(schema);
  }
};

await addExamples();

export default authSchemas;
