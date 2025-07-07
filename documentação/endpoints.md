# API - Sistema de Gestão de Estoque Automotivo

## AUTENTICAÇÃO

### Login
`POST http://localhost:5011/auth/login`

**Request Body:**
```json
{
  "email": "admin@teste.com",
  "senha": "123456"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "usuario": {
    "id": "60d5ecb74f8e4b2b3c8d6e7f",
    "nome_usuario": "Administrador",
    "email": "admin@teste.com",
    "matricula": "ADM001",
    "perfil": "administrador",
    "ativo": true,
    "online": true,
    "grupos": []
  }
}
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

**Response (200):**
```json
{
  "movimentacoes": [
    {
      "id": "60d5ecb74f8e4b2b3c8d6e7f",
      "tipo": "entrada",
      "destino": "Estoque Principal",
      "data_movimentacao": "2024-01-15T10:30:00.000Z",
      "id_usuario": "60d5ecb74f8e4b2b3c8d6e7f",
      "nome_usuario": "João Silva",
      "status": true,
      "produtos": [
        {
          "id_produto": 1,
          "codigo_produto": "PF001",
          "nome_produto": "Pastilha de Freio Dianteira",
          "quantidade_produtos": 10,
          "preco": 89.90,
          "custo": 45.00,
          "id_fornecedor": 1,
          "nome_fornecedor": "Auto Peças Sul"
        }
      ],
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

### Criar Movimentação
`POST http://localhost:5011/api/movimentacoes/`

**Request Body:**
```json
{
  "tipo": "entrada",
  "destino": "Estoque Principal",
  "produtos": [
    {
      "id_produto": 1,
      "codigo_produto": "PF001",
      "nome_produto": "Pastilha de Freio Dianteira", 
      "quantidade_produtos": 10,
      "preco": 89.90,
      "custo": 45.00,
      "id_fornecedor": 1,
      "nome_fornecedor": "Auto Peças Sul"
    }
  ]
}
```

### Buscar Movimentação por ID
`GET http://localhost:5011/api/movimentacoes/:id`

### Buscar Movimentações
`GET http://localhost:5011/api/movimentacoes/busca?nome_produto=Pastilha`

`GET http://localhost:5011/api/movimentacoes/busca?tipo=entrada`

`GET http://localhost:5011/api/movimentacoes/busca?nome_usuario=João`

### Filtro Avançado de Movimentações
`GET http://localhost:5011/api/movimentacoes/filtro?dataInicio=2024-01-01&dataFim=2024-01-31&tipo=SAIDA`

### Atualizar Movimentação
`PATCH http://localhost:5011/api/movimentacoes/:id`

### Deletar Movimentação
`DELETE http://localhost:5011/api/movimentacoes/:id`

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