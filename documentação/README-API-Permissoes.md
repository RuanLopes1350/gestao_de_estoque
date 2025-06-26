# 🚀 Guia Rápido - APIs de Permissões

## 📋 O que você precisa saber

O sistema de permissões permite gerenciar:
- **Grupos** com permissões padrão
- **Usuários** com permissões individuais
- **Associações** entre usuários e grupos
- **Precedência**: Permissões individuais > Permissões do grupo

## 🛠️ Setup Rápido

### 1. Importar Collection no Postman
1. Abra o Postman
2. File > Import
3. Selecione o arquivo `Postman_Collection_Permissoes.json`
4. A collection será importada com todas as variáveis

### 2. Configurar Ambiente
As seguintes variáveis serão criadas automaticamente:
```
BASE_URL: http://localhost:5011/api
TOKEN: (preenchido após login)
USER_ID: (preenchido após login)
GRUPO_ID: (preenchido ao criar grupo)
```

### 3. Primeiro Uso
1. Execute "🔐 Autenticação > Login"
2. O token será salvo automaticamente
3. Pronto para usar todas as outras APIs!

## 🎯 Endpoints Principais

### Grupos
- `POST /grupos` - Criar grupo
- `GET /grupos` - Listar grupos
- `PATCH /grupos/:id` - Atualizar grupo
- `POST /grupos/:id/permissoes` - Adicionar permissão ao grupo

### Usuários
- `POST /usuarios` - Criar usuário
- `GET /usuarios` - Listar usuários
- `POST /usuarios/grupos/adicionar` - Adicionar usuário ao grupo
- `POST /usuarios/:id/permissoes` - Adicionar permissão individual

### Consultas
- `GET /usuarios/:id/permissoes` - Ver todas as permissões do usuário

## 💡 Exemplos Rápidos

### Criar um Grupo Básico
```json
POST /grupos
{
  "nome": "Estoquistas",
  "descricao": "Acesso básico ao estoque",
  "ativo": true,
  "permissoes": [
    {
      "rota": "produtos",
      "dominio": "localhost",
      "ativo": true,
      "buscar": true,
      "enviar": true,
      "substituir": false,
      "modificar": true,
      "excluir": false
    }
  ]
}
```

### Criar Usuário
```json
POST /usuarios
{
  "nome_usuario": "João Silva",
  "email": "joao@empresa.com",
  "matricula": "EST001",
  "senha": "123456",
  "perfil": "estoquista"
}
```

### Adicionar Usuário ao Grupo
```json
POST /usuarios/grupos/adicionar
{
  "usuarioId": "USER_ID_AQUI",
  "grupoId": "GRUPO_ID_AQUI"
}
```

### Dar Permissão Específica ao Usuário
```json
POST /usuarios/USER_ID/permissoes
{
  "rota": "relatorios",
  "dominio": "localhost",
  "ativo": true,
  "buscar": true,
  "enviar": false,
  "substituir": false,
  "modificar": false,
  "excluir": false
}
```

## 🔍 Estrutura de Permissões

Cada permissão tem 5 ações CRUD:
- `buscar` (GET) - Consultar/listar
- `enviar` (POST) - Criar
- `substituir` (PUT) - Substituir completamente
- `modificar` (PATCH) - Modificar parcialmente
- `excluir` (DELETE) - Excluir

## 🧪 Workflow de Teste Completo

A collection inclui um workflow completo que:
1. Cria um grupo departamental
2. Cria um usuário para o departamento
3. Associa o usuário ao grupo
4. Adiciona uma permissão específica
5. Verifica as permissões finais

Execute: `🧪 Testes e Workflows > Workflow Completo - Criar Departamento`

## 📊 Interpretando Respostas

### Consulta de Permissões
```json
{
  "usuario": { /* dados do usuário */ },
  "grupos": [ /* grupos do usuário */ ],
  "permissoes": {
    "individuais": [ /* permissões específicas do usuário */ ],
    "grupos": [ /* permissões herdadas dos grupos */ ],
    "efetivas": [ /* permissões finais (sem duplicatas) */ ]
  }
}
```

As **permissões efetivas** são o que realmente conta!

## ⚡ Dicas Importantes

1. **Sempre verificar o token** - Se expirar, refaça o login
2. **Permissões individuais têm precedência** - Elas sobrescrevem as do grupo
3. **Usar IDs corretos** - A collection salva IDs automaticamente
4. **Verificar permissões efetivas** - Para ver o resultado final
5. **Domínio padrão é "localhost"** - Pode ser omitido na maioria dos casos

## 🚨 Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| 401 Unauthorized | Token expirado/inválido | Refazer login |
| 400 Validation Error | Dados inválidos | Verificar estrutura JSON |
| 404 Not Found | ID incorreto | Verificar se recurso existe |
| 409 Conflict | Recurso duplicado | Usar outro nome/email |

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `sistema-de-permissoes.md` - Documentação técnica completa
- `api-permissoes-postman.md` - Guia detalhado com todos os endpoints

---

**🎉 Pronto para usar!** Importe a collection e comece a testar o sistema de permissões.
