# API - Sistema de Gestão de Estoque Automotivo

## AUTENTICAÇÃO

### Login
`POST http://localhost:5011/auth/login`

**Request Body:**
```json
{
  "matricula": "ADM0001",
  "senha": "Admin@123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "usuario": {
    "id": "686c12577770446a1ee99b80",
    "nome_usuario": "Administrador",
    "email": "admin@sistema.com",
    "matricula": "ADM0001",
    "perfil": "administrador"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Usuários de Teste Disponíveis:**
- **Admin**: matricula: `ADM0001`, senha: `Admin@123`
- **Gerente**: matricula: `USR0001`, senha: `Senha123`
- **Estoquista**: matricula: `USR0003`, senha: `Senha123`
```

### Refresh Token
`POST http://localhost:5011/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Logout
`POST http://localhost:5011/auth/logout`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

### Revogar Token
`POST http://localhost:5011/auth/revoke/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

## PRODUTOS

### Criar Produto
`POST http://localhost:5011/api/produtos`

**Request Body:**
```json
{
  "nome_produto": "Pastilha de Freio Dianteira",
  "categoria": "Freios",
  "codigo_produto": "PF001",
  "preco": 89.90,
  "custo": 45.00,
  "estoque": 25,
  "estoque_min": 5,
  "id_fornecedor": 1,
  "marca": "Bosch",
  "descricao": "Pastilha de freio para veículos nacionais"
}
```

### Listar Produtos
`GET http://localhost:5011/api/produtos/`

**Response (200):**
```json
{
  "produtos": [
    {
      "id": "60d5ecb74f8e4b2b3c8d6e7f",
      "nome_produto": "Pastilha de Freio Dianteira",
      "categoria": "Freios",
      "codigo_produto": "PF001",
      "preco": 89.90,
      "custo": 45.00,
      "estoque": 25,
      "estoque_min": 5,
      "status": true,
      "id_fornecedor": 1,
      "marca": "Bosch",
      "descricao": "Pastilha de freio para veículos nacionais",
      "data_cadastro": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### Buscar Produto por ID
`GET http://localhost:5011/api/produtos/:id`

### Produtos com Estoque Baixo
`GET http://localhost:5011/api/produtos/estoque-baixo`

### Buscar Produtos
`GET http://localhost:5011/api/produtos/busca?nome_produto=freio`

`GET http://localhost:5011/api/produtos/busca?categoria=Freios`

`GET http://localhost:5011/api/produtos/busca?codigo_produto=PF001`

`GET http://localhost:5011/api/produtos/busca?marca=Bosch`

### Atualizar Produto
`PATCH http://localhost:5011/api/produtos/:id`

### Desativar Produto
`PATCH http://localhost:5011/api/produtos/desativar/:id`

### Reativar Produto
`PATCH http://localhost:5011/api/produtos/reativar/:id`

### Deletar Produto
`DELETE http://localhost:5011/api/produtos/:id`

## USUÁRIOS

### Criar Usuário
`POST http://localhost:5011/api/usuarios`

**Request Body:**
```json
{
  "nome_usuario": "João Silva",
  "email": "joao@teste.com",
  "matricula": "USR001",
  "perfil": "estoquista"
}
```

### Listar Usuários
`GET http://localhost:5011/api/usuarios`

**Response (200):**
```json
{
  "usuarios": [
    {
      "id": "60d5ecb74f8e4b2b3c8d6e7f",
      "nome_usuario": "João Silva",
      "email": "joao@teste.com",
      "matricula": "USR001",
      "perfil": "estoquista",
      "ativo": true,
      "senha_definida": false,
      "online": false,
      "grupos": [],
      "data_cadastro": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### Buscar Usuário por ID
`GET http://localhost:5011/api/usuarios/:id`

**Exemplo:**
`GET http://localhost:5011/api/usuarios/686c08cb0deaf53dca07ea68`

### Buscar por Matrícula
`GET http://localhost:5011/api/usuarios/busca/:matricula`

**Exemplo:**
`GET http://localhost:5011/api/usuarios/busca/ADM0001`

### Desativar Usuário
`PATCH http://localhost:5011/api/usuarios/desativar/:id`

### Reativar Usuário
`PATCH http://localhost:5011/api/usuarios/reativar/:id`

### Atualizar Usuário
`PATCH http://localhost:5011/api/usuarios/:matricula`

### Deletar Usuário
`DELETE http://localhost:5011/api/usuarios/:matricula`

## FORNECEDORES

### Listar Fornecedores
`GET http://localhost:5011/api/fornecedores`

**Response (200):**
```json
{
  "fornecedores": [
    {
      "id": "60d5ecb74f8e4b2b3c8d6e7f",
      "nome_fornecedor": "Auto Peças Sul",
      "cnpj": "12.345.678/0001-90",
      "telefone": "(11) 99999-9999",
      "email": "contato@autopecassul.com",
      "endereco": "Rua das Peças, 123",
      "ativo": true
    }
  ]
}
```

### Buscar Fornecedor por Nome
`GET http://localhost:5011/api/fornecedores?nome_fornecedor=Auto Peças Sul`

### Buscar Fornecedor por CNPJ
`GET http://localhost:5011/api/fornecedores?cnpj=12.345.678/0001-90`

### Criar Fornecedor
`POST http://localhost:5011/api/fornecedores`

**Request Body:**
```json
{
  "nome_fornecedor": "Auto Peças Norte",
  "cnpj": "98.765.432/0001-10",
  "telefone": "(11) 88888-8888",
  "email": "contato@autopecasnorte.com",
  "endereco": "Av. das Peças, 456"
}
```

### Atualizar Fornecedor
`PATCH http://localhost:5011/api/fornecedores/:id`

### Deletar Fornecedor
`DELETE http://localhost:5011/api/fornecedores/:id`

## MOVIMENTAÇÕES

### Listar Movimentações
`GET http://localhost:5011/api/movimentacoes/`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limite` (opcional): Itens por página (padrão: 10)

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Requisição bem-sucedida",
  "data": {
    "docs": [
      {
        "_id": "686c12597770446a1ee99de0",
        "tipo": "saida",
        "destino": "Venda",
        "data_movimentacao": "2025-07-07T18:30:49.331Z",
        "id_usuario": {
          "_id": "686c12577770446a1ee99b85",
          "nome_usuario": "Deneval Macedo",
          "email": "usuario5@sistema.com",
          "matricula": "USR0005",
          "perfil": "estoquista"
        },
        "nome_usuario": "Deneval Macedo",
        "status": true,
        "produtos": [
          {
            "produto_ref": {
              "_id": "686c12577770446a1ee99cb4",
              "nome_produto": "Gostoso Concreto Carro",
              "preco": 3622.39,
              "marca": "Barros Comércio",
              "codigo_produto": "MER-1137"
            },
            "id_produto": 4718,
            "codigo_produto": "MER-1137",
            "nome_produto": "Gostoso Concreto Carro",
            "quantidade_produtos": 5,
            "preco": 3622.39,
            "custo": 2535.673,
            "id_fornecedor": 47,
            "nome_fornecedor": "Distribuidora Central Ltda"
          }
        ],
        "data_cadastro": "2025-07-07T18:30:49.349Z",
        "data_ultima_atualizacao": "2025-07-07T18:31:47.751Z"
      }
    ],
    "totalDocs": 42,
    "limit": 10,
    "totalPages": 5,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  },
  "errors": []
}
```

### Criar Movimentação
`POST http://localhost:5011/api/movimentacoes/`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Request Body:**
```json
{
  "tipo": "entrada",
  "destino": "Estoque Principal",
  "data_movimentacao": "2025-07-07T20:00:00.000Z",
  "id_produto": "686c12577770446a1ee99bc2",
  "nome_usuario": "Administrador",
  "produtos": [
    {
      "produto_ref": "686c12577770446a1ee99bc2",
      "id_produto": 471,
      "codigo_produto": "DIS-9441",
      "nome_produto": "Fantástico Borracha Sapatos",
      "quantidade_produtos": 25,
      "preco": 4201.69,
      "custo": 2941.18,
      "id_fornecedor": 47,
      "nome_fornecedor": "Distribuidora Central Ltda"
    }
  ]
}
```

**Response (201):**
```json
{
  "error": false,
  "code": 201,
  "message": 201,
  "data": {
    "tipo": "entrada",
    "destino": "Estoque Principal",
    "data_movimentacao": "2025-07-07T20:00:00.000Z",
    "nome_usuario": "Administrador",
    "status": true,
    "produtos": [
      {
        "produto_ref": "686c12577770446a1ee99bc2",
        "id_produto": 471,
        "codigo_produto": "DIS-9441",
        "nome_produto": "Fantástico Borracha Sapatos",
        "quantidade_produtos": 25,
        "preco": 4201.69,
        "custo": 2941.18,
        "id_fornecedor": 47,
        "nome_fornecedor": "Distribuidora Central Ltda",
        "_id": "686c13f03bdc5422de03e77c"
      }
    ],
    "_id": "686c13f03bdc5422de03e77b",
    "data_cadastro": "2025-07-07T18:37:36.201Z",
    "data_ultima_atualizacao": "2025-07-07T18:37:36.201Z"
  },
  "errors": []
}
```

### Buscar Movimentação por ID
`GET http://localhost:5011/api/movimentacoes/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

### Buscar Movimentações
`GET http://localhost:5011/api/movimentacoes/busca?nome_produto=Pastilha`

`GET http://localhost:5011/api/movimentacoes/busca?tipo=entrada`

`GET http://localhost:5011/api/movimentacoes/busca?nome_usuario=João`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

### Filtro Avançado de Movimentações
`GET http://localhost:5011/api/movimentacoes/filtro?dataInicio=2024-01-01&dataFim=2024-01-31&tipo=SAIDA`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

### Atualizar Movimentação
`PATCH http://localhost:5011/api/movimentacoes/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Request Body (campos opcionais):**
```json
{
  "tipo": "entrada",
  "destino": "Transferência",
  "data_movimentacao": "2025-07-07T20:00:00.000Z",
  "nome_usuario": "Novo Usuario",
  "produtos": [
    {
      "produto_ref": "686c12577770446a1ee99bc2",
      "id_produto": 471,
      "codigo_produto": "DIS-9441",
      "nome_produto": "Fantástico Borracha Sapatos",
      "quantidade_produtos": 30,
      "preco": 4201.69,
      "custo": 2941.18,
      "id_fornecedor": 47,
      "nome_fornecedor": "Distribuidora Central Ltda"
    }
  ]
}
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Movimentação atualizada com sucesso.",
  "data": {
    "_id": "686c12597770446a1ee99de0",
    "tipo": "entrada",
    "destino": "Transferência",
    "data_movimentacao": "2025-07-07T18:30:49.331Z",
    "id_usuario": {
      "_id": "686c12577770446a1ee99b85",
      "nome_usuario": "Deneval Macedo",
      "email": "usuario5@sistema.com",
      "matricula": "USR0005",
      "perfil": "estoquista",
      "ativo": false,
      "grupos": ["685da7e3eb630432f26b0514"]
    },
    "nome_usuario": "Deneval Macedo",
    "status": true,
    "produtos": [
      {
        "produto_ref": {
          "_id": "686c12577770446a1ee99cb4",
          "nome_produto": "Gostoso Concreto Carro",
          "preco": 3622.39,
          "marca": "Barros Comércio",
          "codigo_produto": "MER-1137"
        },
        "id_produto": 4718,
        "codigo_produto": "MER-1137",
        "nome_produto": "Gostoso Concreto Carro",
        "quantidade_produtos": 5,
        "preco": 3622.39,
        "custo": 2535.673,
        "id_fornecedor": 47,
        "nome_fornecedor": "Distribuidora Central Ltda"
      }
    ],
    "data_cadastro": "2025-07-07T18:30:49.349Z",
    "data_ultima_atualizacao": "2025-07-07T18:34:52.382Z"
  },
  "errors": []
}
```

### Desativar Movimentação
`PATCH http://localhost:5011/api/movimentacoes/desativar/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "movimentação desativada com sucesso.",
  "data": {
    "_id": "686c12597770446a1ee99de0",
    "tipo": "saida",
    "destino": "Venda",
    "data_movimentacao": "2025-07-07T18:30:49.331Z",
    "id_usuario": "686c12577770446a1ee99b85",
    "nome_usuario": "Deneval Macedo",
    "status": false,
    "produtos": [
      {
        "produto_ref": "686c12577770446a1ee99cb4",
        "id_produto": 4718,
        "codigo_produto": "MER-1137",
        "nome_produto": "Gostoso Concreto Carro",
        "quantidade_produtos": 5,
        "preco": 3622.39,
        "custo": 2535.673,
        "id_fornecedor": 47,
        "nome_fornecedor": "Distribuidora Central Ltda"
      }
    ],
    "data_cadastro": "2025-07-07T18:30:49.349Z",
    "data_ultima_atualizacao": "2025-07-07T18:31:36.194Z"
  },
  "errors": []
}
```

### Reativar Movimentação
`PATCH http://localhost:5011/api/movimentacoes/reativar/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "movimentação reativada com sucesso.",
  "data": {
    "_id": "686c12597770446a1ee99de0",
    "tipo": "saida",
    "destino": "Venda",
    "data_movimentacao": "2025-07-07T18:30:49.331Z",
    "id_usuario": "686c12577770446a1ee99b85",
    "nome_usuario": "Deneval Macedo",
    "status": true,
    "produtos": [
      {
        "produto_ref": "686c12577770446a1ee99cb4",
        "id_produto": 4718,
        "codigo_produto": "MER-1137",
        "nome_produto": "Gostoso Concreto Carro",
        "quantidade_produtos": 5,
        "preco": 3622.39,
        "custo": 2535.673,
        "id_fornecedor": 47,
        "nome_fornecedor": "Distribuidora Central Ltda"
      }
    ],
    "data_cadastro": "2025-07-07T18:30:49.349Z",
    "data_ultima_atualizacao": "2025-07-07T18:31:47.751Z"
  },
  "errors": []
}
```

### Deletar Movimentação
`DELETE http://localhost:5011/api/movimentacoes/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Observações sobre Movimentações:**
- **Ordem das rotas PATCH**: As rotas específicas `/desativar/:id` e `/reativar/:id` devem vir ANTES da rota genérica `/:id` para evitar conflitos
- **Campos obrigatórios para criação**: `tipo`, `destino`, `id_produto`, `nome_usuario`, `produtos[]`
- **Tipos válidos**: "entrada" ou "saida"
- **Campo data_movimentacao**: Deve ser fornecido em formato ISO 8601 ou será usado o valor padrão
- **Relacionamentos**: As respostas incluem dados populados de usuário (`id_usuario`) e produto (`produto_ref`) quando disponíveis
- **Validação**: O schema `MovimentacaoUpdateSchema` é usado para atualizações (campos opcionais) e `MovimentacaoSchema` para criação

## GRUPOS E PERMISSÕES

### Listar Grupos
`GET http://localhost:5011/api/grupos`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "grupos": [
    {
      "id": "60d5ecb74f8e4b2b3c8d6e7f",
      "nome_grupo": "Vendedores",
      "descricao": "Grupo para vendedores",
      "ativo": true,
      "permissoes": [
        {
          "rota": "/api/produtos",
          "metodos": ["GET"],
          "dominio": "localhost"
        }
      ],
      "data_cadastro": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Criar Grupo
`POST http://localhost:5011/api/grupos`

**Request Body:**
```json
{
  "nome_grupo": "Vendedores",
  "descricao": "Grupo para equipe de vendas",
  "permissoes": [
    {
      "rota": "/api/produtos",
      "metodos": ["GET"],
      "dominio": "localhost"
    },
    {
      "rota": "/api/movimentacoes",
      "metodos": ["POST"],
      "dominio": "localhost"
    }
  ]
}
```

### Buscar Grupo por ID
`GET http://localhost:5011/api/grupos/:id`

### Atualizar Grupo
`PATCH http://localhost:5011/api/grupos/:id`

### Deletar Grupo
`DELETE http://localhost:5011/api/grupos/:id`

### Adicionar Usuário ao Grupo
`POST http://localhost:5011/api/grupos/:id/usuarios`

**Request Body:**
```json
{
  "usuario_id": "60d5ecb74f8e4b2b3c8d6e7f"
}
```

### Remover Usuário do Grupo
`DELETE http://localhost:5011/api/grupos/:id/usuarios/:usuario_id`

## LOGS E SESSÕES

### Listar Usuários Online
`GET http://localhost:5011/api/logs/online-users`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "usuariosOnline": [
    {
      "id": "60d5ecb74f8e4b2b3c8d6e7f",
      "nome_usuario": "João Silva",
      "email": "joao@teste.com",
      "matricula": "USR001",
      "perfil": "estoquista",
      "online": true
    }
  ],
  "total": 1
}
```

### Obter Logs de Usuário
`GET http://localhost:5011/api/logs/usuario/:userId`

**Response (200):**
```json
{
  "logs": [
    {
      "sessionId": "session_123",
      "userId": "60d5ecb74f8e4b2b3c8d6e7f",
      "action": "LOGIN",
      "details": {
        "ip": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "os": "Windows 10"
      },
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Buscar Eventos Específicos (Admin)
`GET http://localhost:5011/api/logs/search?action=LOGIN&startDate=2024-01-01&endDate=2024-01-31`

### Obter Estatísticas de Logs (Admin)
`GET http://localhost:5011/api/logs/statistics`

### Obter Eventos Críticos (Admin)
`GET http://localhost:5011/api/logs/critical`

---

**Observações:**
- Todas as rotas protegidas (exceto `/auth/*`) requerem o header `Authorization: Bearer {token}`
- Rotas marcadas com "(Admin)" requerem privilégios de administrador
- Todas as ações relevantes são automaticamente registradas no sistema de logs
- O sistema mantém controle de usuários online em tempo real
- As respostas incluem informações de sessão e logs de auditoria quando aplicável