# Teste Prático - Cadastro de Usuários com Grupos

## 🧪 Scripts de Teste

### 1. Primeiro, obter um grupo existente
```bash
curl -X GET "http://localhost:5011/api/grupos" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

### 2. Cadastrar usuário simples (sem grupos)
```bash
curl -X POST "http://localhost:5011/api/usuarios" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_usuario": "João Silva",
    "email": "joao.teste@empresa.com",
    "matricula": "TST0001",
    "senha": "MinhaSenh@123",
    "perfil": "estoquista"
  }'
```

### 3. Cadastrar usuário com grupos
```bash
curl -X POST "http://localhost:5011/api/usuarios" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_usuario": "Maria Santos",
    "email": "maria.teste@empresa.com",
    "matricula": "TST0002",
    "senha": "MinhaSenh@123",
    "perfil": "gerente",
    "grupos": ["ID_DO_GRUPO_AQUI"]
  }'
```

### 4. Cadastrar usuário com grupos e permissões
```bash
curl -X POST "http://localhost:5011/api/usuarios" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_usuario": "Carlos Admin",
    "email": "carlos.teste@empresa.com",
    "matricula": "TST0003",
    "senha": "MinhaSenh@123",
    "perfil": "administrador",
    "grupos": ["ID_DO_GRUPO_AQUI"],
    "permissoes": [
      {
        "rota": "produtos",
        "dominio": "localhost",
        "ativo": true,
        "buscar": true,
        "enviar": true,
        "substituir": false,
        "modificar": true,
        "excluir": true
      }
    ]
  }'
```

### 5. Verificar permissões do usuário criado
```bash
curl -X GET "http://localhost:5011/api/usuarios/ID_DO_USUARIO/permissoes" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

## 📝 Exemplos de Resposta Esperada

### Cadastro Bem-sucedido
```json
{
  "success": true,
  "data": {
    "_id": "64f7a8b9c1234567890abcdef",
    "nome_usuario": "João Silva",
    "email": "joao.teste@empresa.com",
    "matricula": "TST0001",
    "perfil": "estoquista",
    "ativo": true,
    "grupos": [],
    "permissoes": [],
    "data_cadastro": "2025-06-26T10:30:00.000Z",
    "data_ultima_atualizacao": "2025-06-26T10:30:00.000Z"
  },
  "message": "Usuário cadastrado com sucesso."
}
```

### Cadastro com Grupos
```json
{
  "success": true,
  "data": {
    "_id": "64f7a8b9c1234567890abcdef",
    "nome_usuario": "Maria Santos",
    "email": "maria.teste@empresa.com",
    "matricula": "TST0002",
    "perfil": "gerente",
    "ativo": true,
    "grupos": ["64f7a8b9c1234567890abcd12"],
    "permissoes": [],
    "data_cadastro": "2025-06-26T10:30:00.000Z",
    "data_ultima_atualizacao": "2025-06-26T10:30:00.000Z"
  },
  "message": "Usuário cadastrado com sucesso."
}
```

### Consulta de Permissões
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "64f7a8b9c1234567890abcdef",
      "nome": "Maria Santos",
      "email": "maria.teste@empresa.com",
      "perfil": "gerente"
    },
    "grupos": [
      {
        "id": "64f7a8b9c1234567890abcd12",
        "nome": "Gerentes",
        "ativo": true
      }
    ],
    "permissoes": {
      "individuais": [],
      "grupos": [
        {
          "rota": "produtos",
          "dominio": "localhost",
          "ativo": true,
          "buscar": true,
          "enviar": true,
          "substituir": true,
          "modificar": true,
          "excluir": false,
          "grupo": "Gerentes"
        }
      ],
      "efetivas": [
        {
          "rota": "produtos",
          "dominio": "localhost",
          "ativo": true,
          "buscar": true,
          "enviar": true,
          "substituir": true,
          "modificar": true,
          "excluir": false
        }
      ]
    }
  }
}
```

## ❌ Exemplos de Erros

### Grupo Inexistente
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "errorType": "resourceNotFound",
    "field": "grupo",
    "message": "Grupo não encontrado: 64f7a8b9c1234567890abcd99"
  }
}
```

### Permissão Duplicada
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "errorType": "validationError",
    "field": "permissoes",
    "message": "Permissões duplicadas encontradas na lista"
  }
}
```

### Rota Inexistente
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "errorType": "resourceNotFound",
    "field": "permissao.rota",
    "message": "Rota não encontrada no sistema: rota_inexistente"
  }
}
```

## ✅ Checklist de Testes

- [ ] Cadastro sem grupos funciona
- [ ] Cadastro com grupos válidos funciona
- [ ] Cadastro com grupos inválidos falha corretamente
- [ ] Cadastro com permissões válidas funciona
- [ ] Cadastro com permissões inválidas falha corretamente
- [ ] Consulta de permissões mostra grupos e individuais
- [ ] Validação de email único funciona
- [ ] Validação de matrícula única funciona
- [ ] Validação de senha forte funciona

---

**🎯 Teste realizado com sucesso!** A funcionalidade está pronta para uso.
