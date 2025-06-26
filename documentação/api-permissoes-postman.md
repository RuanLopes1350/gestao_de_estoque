# API de Permissões - Guia Postman

## Índice
1. [Configuração Inicial](#configuração-inicial)
2. [Autenticação](#autenticação)
3. [Gerenciamento de Grupos](#gerenciamento-de-grupos)
4. [Gerenciamento de Usuários](#gerenciamento-de-usuários)
5. [Gerenciamento de Permissões](#gerenciamento-de-permissões)
6. [Consultas de Permissões](#consultas-de-permissões)
7. [Exemplos de Workflows Completos](#exemplos-de-workflows-completos)
8. [Troubleshooting](#troubleshooting)

## Configuração Inicial

### Variáveis de Ambiente (Postman)
Crie as seguintes variáveis no Postman:

```
BASE_URL: http://localhost:3000/api
TOKEN: (será preenchido após login)
USER_ID: (ID do usuário logado)
GRUPO_ID: (ID de grupo para testes)
```

### Headers Padrão
```
Content-Type: application/json
Authorization: Bearer {{TOKEN}}
```

## Autenticação

### Login (Obter Token)
```http
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "senha": "123456"
}
```

**Resposta:**
```json
{
    "message": "Login realizado com sucesso",
    "usuario": {
        "id": "685d9df7cea29658a6186708",
        "nome_usuario": "Ruan Lopes",
        "email": "ruan.lopes@email.com",
        "matricula": "ADM1350",
        "perfil": "administrador"
    },
    "accessToken": "ACCESS_TOKEN",
    "refreshToken": "REFRESH_TOKEN"
}
```

**Script de Post-Response (Postman):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("TOKEN", response.data.token);
    pm.environment.set("USER_ID", response.data.usuario.id);
}
```

## Gerenciamento de Grupos

### 1. Criar Grupo
```http
POST {{BASE_URL}}/grupos
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nome": "Gerentes de Estoque",
  "descricao": "Grupo com permissões de gerência para estoque",
  "ativo": true,
  "permissoes": [
    {
      "rota": "produtos",
      "dominio": "localhost",
      "ativo": true,
      "buscar": true,
      "enviar": true,
      "substituir": true,
      "modificar": true,
      "excluir": false
    },
    {
      "rota": "movimentacao",
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

### 2. Listar Grupos
```http
GET {{BASE_URL}}/grupos
Authorization: Bearer {{TOKEN}}
```

**Com filtros:**
```http
GET {{BASE_URL}}/grupos?ativo=true&page=1&limit=10
Authorization: Bearer {{TOKEN}}
```

### 3. Buscar Grupo por ID
```http
GET {{BASE_URL}}/grupos/{{GRUPO_ID}}
Authorization: Bearer {{TOKEN}}
```

### 4. Atualizar Grupo
```http
PATCH {{BASE_URL}}/grupos/{{GRUPO_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "descricao": "Descrição atualizada do grupo"
}
```

### 5. Ativar/Desativar Grupo
```http
# Ativar
PATCH {{BASE_URL}}/grupos/{{GRUPO_ID}}/ativar
Authorization: Bearer {{TOKEN}}

# Desativar
PATCH {{BASE_URL}}/grupos/{{GRUPO_ID}}/desativar
Authorization: Bearer {{TOKEN}}
```

### 6. Deletar Grupo
```http
DELETE {{BASE_URL}}/grupos/{{GRUPO_ID}}
Authorization: Bearer {{TOKEN}}
```

## Gerenciamento de Usuários

### 1. Criar Usuário
```http
POST {{BASE_URL}}/usuarios
Content-Type: application/json

{
  "nome_usuario": "João Silva",
  "email": "joao.silva@empresa.com",
  "matricula": "EST001",
  "senha": "senha123",
  "perfil": "estoquista",
  "ativo": true
}
```

### 2. Listar Usuários
```http
GET {{BASE_URL}}/usuarios
Authorization: Bearer {{TOKEN}}
```

### 3. Buscar Usuário por ID
```http
GET {{BASE_URL}}/usuarios/{{USER_ID}}
Authorization: Bearer {{TOKEN}}
```

### 4. Atualizar Usuário
```http
PATCH {{BASE_URL}}/usuarios/{{USER_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nome_usuario": "João Silva Santos",
  "perfil": "gerente"
}
```

## Gerenciamento de Permissões

### 1. Adicionar Permissão a Grupo
```http
POST {{BASE_URL}}/grupos/{{GRUPO_ID}}/permissoes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "rota": "fornecedores",
  "dominio": "localhost",
  "ativo": true,
  "buscar": true,
  "enviar": true,
  "substituir": false,
  "modificar": true,
  "excluir": false
}
```

### 2. Remover Permissão de Grupo
```http
DELETE {{BASE_URL}}/grupos/{{GRUPO_ID}}/permissoes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "rota": "fornecedores",
  "dominio": "localhost"
}
```

### 3. Adicionar Usuário a Grupo
```http
POST {{BASE_URL}}/usuarios/grupos/adicionar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "usuarioId": "{{USER_ID}}",
  "grupoId": "{{GRUPO_ID}}"
}
```

### 4. Remover Usuário de Grupo
```http
POST {{BASE_URL}}/usuarios/grupos/remover
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "usuarioId": "{{USER_ID}}",
  "grupoId": "{{GRUPO_ID}}"
}
```

### 5. Adicionar Permissão Individual a Usuário
```http
POST {{BASE_URL}}/usuarios/{{USER_ID}}/permissoes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

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

### 6. Remover Permissão Individual de Usuário
```http
DELETE {{BASE_URL}}/usuarios/{{USER_ID}}/permissoes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "rota": "relatorios",
  "dominio": "localhost"
}
```

## Consultas de Permissões

### 1. Obter Permissões de Usuário
```http
GET {{BASE_URL}}/usuarios/{{USER_ID}}/permissoes
Authorization: Bearer {{TOKEN}}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "64f7a8b9c1234567890abcdef",
      "nome": "João Silva",
      "email": "joao.silva@empresa.com",
      "perfil": "estoquista"
    },
    "grupos": [
      {
        "id": "64f7a8b9c1234567890abcd12",
        "nome": "Estoquistas",
        "ativo": true
      }
    ],
    "permissoes": {
      "individuais": [
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
      ],
      "grupos": [
        {
          "rota": "produtos",
          "dominio": "localhost",
          "ativo": true,
          "buscar": true,
          "enviar": true,
          "substituir": false,
          "modificar": true,
          "excluir": false,
          "grupo": "Estoquistas"
        }
      ],
      "efetivas": [
        {
          "rota": "relatorios",
          "dominio": "localhost",
          "ativo": true,
          "buscar": true,
          "enviar": false,
          "substituir": false,
          "modificar": false,
          "excluir": false
        },
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
  }
}
```

## Exemplos de Workflows Completos

### Workflow 1: Configurar Novo Departamento

#### Passo 1: Criar Grupo para o Departamento
```http
POST {{BASE_URL}}/grupos
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nome": "Departamento Financeiro",
  "descricao": "Grupo para usuários do departamento financeiro",
  "ativo": true,
  "permissoes": [
    {
      "rota": "relatorios",
      "dominio": "localhost",
      "ativo": true,
      "buscar": true,
      "enviar": false,
      "substituir": false,
      "modificar": false,
      "excluir": false
    },
    {
      "rota": "movimentacao",
      "dominio": "localhost",
      "ativo": true,
      "buscar": true,
      "enviar": false,
      "substituir": false,
      "modificar": false,
      "excluir": false
    }
  ]
}
```

#### Passo 2: Criar Usuário do Departamento
```http
POST {{BASE_URL}}/usuarios
Content-Type: application/json

{
  "nome_usuario": "Maria Financeiro",
  "email": "maria.financeiro@empresa.com",
  "matricula": "FIN001",
  "senha": "senha123",
  "perfil": "gerente",
  "ativo": true
}
```

#### Passo 3: Adicionar Usuário ao Grupo
```http
POST {{BASE_URL}}/usuarios/grupos/adicionar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "usuarioId": "NEW_USER_ID",
  "grupoId": "NEW_GRUPO_ID"
}
```

#### Passo 4: Adicionar Permissão Específica ao Usuário
```http
POST {{BASE_URL}}/usuarios/NEW_USER_ID/permissoes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "rota": "fornecedores",
  "dominio": "localhost",
  "ativo": true,
  "buscar": true,
  "enviar": true,
  "substituir": false,
  "modificar": true,
  "excluir": false
}
```

### Workflow 2: Auditoria de Permissões

#### Passo 1: Listar Todos os Grupos
```http
GET {{BASE_URL}}/grupos
Authorization: Bearer {{TOKEN}}
```

#### Passo 2: Verificar Permissões de Usuários Específicos
```http
GET {{BASE_URL}}/usuarios/{{USER_ID}}/permissoes
Authorization: Bearer {{TOKEN}}
```

#### Passo 3: Listar Usuários por Perfil
```http
GET {{BASE_URL}}/usuarios?perfil=administrador
Authorization: Bearer {{TOKEN}}
```

### Workflow 3: Gerenciamento de Permissões Temporárias

#### Passo 1: Criar Grupo Temporário
```http
POST {{BASE_URL}}/grupos
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nome": "Auditoria Temporária",
  "descricao": "Grupo temporário para auditoria",
  "ativo": true,
  "permissoes": [
    {
      "rota": "todos",
      "dominio": "localhost",
      "ativo": true,
      "buscar": true,
      "enviar": false,
      "substituir": false,
      "modificar": false,
      "excluir": false
    }
  ]
}
```

#### Passo 2: Adicionar Usuário ao Grupo Temporário
```http
POST {{BASE_URL}}/usuarios/grupos/adicionar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "usuarioId": "{{USER_ID}}",
  "grupoId": "TEMP_GRUPO_ID"
}
```

#### Passo 3: Remover do Grupo Após Período
```http
POST {{BASE_URL}}/usuarios/grupos/remover
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "usuarioId": "{{USER_ID}}",
  "grupoId": "TEMP_GRUPO_ID"
}
```

#### Passo 4: Desativar Grupo Temporário
```http
PATCH {{BASE_URL}}/grupos/TEMP_GRUPO_ID/desativar
Authorization: Bearer {{TOKEN}}
```

## Collection Postman Completa

### Scripts de Pré-requisitos

**Script para Authenticação Automática:**
```javascript
// Pre-request Script para requests que precisam de autenticação
if (!pm.environment.get("TOKEN")) {
    pm.execution.setNextRequest("Login");
}
```

**Script para Logs:**
```javascript
// Test Script para logging
console.log("Response:", pm.response.json());
pm.test("Status code is success", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
```

### Variáveis Dinâmicas

```javascript
// Para extrair IDs de responses
pm.test("Extract IDs", function () {
    const response = pm.response.json();
    if (response.data && response.data._id) {
        pm.environment.set("LAST_CREATED_ID", response.data._id);
    }
});
```

## Troubleshooting

### Problemas Comuns

#### 1. Token Expirado
**Sintoma:** Status 401 - Unauthorized

**Solução:**
1. Fazer novo login
2. Verificar se o token está sendo enviado corretamente
3. Verificar validade do token

#### 2. Permissão Duplicada
**Sintoma:** Status 400 - "Esta permissão já existe"

**Solução:**
1. Verificar permissões existentes antes de adicionar
2. Usar endpoint de atualização em vez de criação

#### 3. Usuário/Grupo Não Encontrado
**Sintoma:** Status 404 - "Recurso não encontrado"

**Solução:**
1. Verificar se o ID está correto
2. Confirmar que o recurso existe na base de dados

#### 4. Dados Inválidos
**Sintoma:** Status 400 - Validation Error

**Solução:**
1. Verificar estrutura do JSON
2. Confirmar campos obrigatórios
3. Validar tipos de dados

### Logs e Debug

#### Headers de Debug
```
X-Debug: true
X-Request-ID: {{$guid}}
```

#### Validação de Permissões
```http
# Endpoint para verificar permissão específica (se implementado)
GET {{BASE_URL}}/usuarios/{{USER_ID}}/permissoes/verificar?rota=produtos&metodo=buscar
Authorization: Bearer {{TOKEN}}
```

### Scripts Úteis para Postman

#### Cleanup de Dados de Teste
```javascript
// Script para limpar dados de teste
pm.sendRequest({
    url: pm.environment.get("BASE_URL") + "/grupos/" + pm.environment.get("TEST_GRUPO_ID"),
    method: 'DELETE',
    header: {
        'Authorization': 'Bearer ' + pm.environment.get("TOKEN")
    }
}, function (err, response) {
    console.log("Cleanup completed");
});
```

#### Validação de Response
```javascript
pm.test("Response has correct structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('success');
    pm.expect(response).to.have.property('data');
    if (response.success) {
        pm.expect(response.data).to.not.be.null;
    }
});
```

## Schemas de Validação

### Schema para Criação de Grupo
```json
{
  "type": "object",
  "required": ["nome", "descricao"],
  "properties": {
    "nome": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100
    },
    "descricao": {
      "type": "string",
      "minLength": 10,
      "maxLength": 500
    },
    "ativo": {
      "type": "boolean",
      "default": true
    },
    "permissoes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["rota"],
        "properties": {
          "rota": {"type": "string"},
          "dominio": {"type": "string", "default": "localhost"},
          "ativo": {"type": "boolean", "default": true},
          "buscar": {"type": "boolean", "default": false},
          "enviar": {"type": "boolean", "default": false},
          "substituir": {"type": "boolean", "default": false},
          "modificar": {"type": "boolean", "default": false},
          "excluir": {"type": "boolean", "default": false}
        }
      }
    }
  }
}
```

### Schema para Criação de Usuário
```json
{
  "type": "object",
  "required": ["nome_usuario", "email", "matricula", "senha"],
  "properties": {
    "nome_usuario": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "matricula": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20
    },
    "senha": {
      "type": "string",
      "minLength": 6
    },
    "perfil": {
      "type": "string",
      "enum": ["administrador", "gerente", "estoquista"],
      "default": "estoquista"
    },
    "ativo": {
      "type": "boolean",
      "default": true
    }
  }
}
```

---

**Última atualização**: 26 de Junho de 2025  
**Versão**: 1.0.0  
**Autor**: Ruan Lopes
