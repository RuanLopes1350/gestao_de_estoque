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
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "message": "Token renovado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
``` <!-- atualizado -->

### Logout
`POST http://localhost:5011/auth/logout`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
``` <!-- atualizado -->

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
``` <!-- atualizado -->

### Revogar Token
`POST http://localhost:5011/auth/revoke/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "message": "Token revogado com sucesso"
}
``` <!-- atualizado -->

## PRODUTOS

### Criar Produto
`POST http://localhost:5011/api/produtos`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

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
  "id_fornecedor": 548,
  "marca": "Bosch",
  "descricao": "Pastilha de freio para veículos nacionais"
}
```

**Response (201):**
```json
{
  "error": false,
  "code": 201,
  "message": 201,
  "data": {
    "nome_produto": "Pastilha de Freio Dianteira",
    "descricao": "Pastilha de freio para veículos nacionais",
    "preco": 89.9,
    "marca": "Bosch",
    "custo": 45,
    "categoria": "C",
    "estoque": 25,
    "estoque_min": 5,
    "data_ultima_entrada": "2025-07-07T19:02:30.090Z",
    "status": true,
    "id_fornecedor": 548,
    "codigo_produto": "PF001",
    "_id": "686c19c68acd55b88614e1ff",
    "data_cadastro": "2025-07-07T19:02:30.138Z",
    "data_ultima_atualizacao": "2025-07-07T19:02:30.138Z"
  },
  "errors": []
}
``` <!-- atualizado -->

### Listar Produtos
`GET http://localhost:5011/api/produtos/`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Requisição bem-sucedida",
  "data": {
    "docs": [
      {
        "_id": "686c144cdd83d42d47a8bf5d",
        "nome_produto": "Ergonômico Algodão Salgadinhos",
        "descricao": "Discover the cow-like agility of our Bicicleta, perfect for fine users",
        "preco": 8256.39,
        "marca": "Braga-Souza",
        "custo": 5779.472999999999,
        "categoria": "A",
        "estoque": 21,
        "estoque_min": 10,
        "data_ultima_entrada": "2025-07-07T18:39:08.685Z",
        "status": true,
        "id_fornecedor": 548,
        "codigo_produto": "DIS-6322",
        "data_cadastro": "2025-07-07T18:39:08.718Z",
        "data_ultima_atualizacao": "2025-07-07T18:39:08.718Z",
        "nome_fornecedor": "Mercado Atacado Brasil"
      }
    ],
    "totalDocs": 500,
    "limit": 10,
    "totalPages": 50,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  },
  "errors": []
}
``` <!-- atualizado -->

### Buscar Produto por ID
`GET http://localhost:5011/api/produtos/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Exemplo:**
`GET http://localhost:5011/api/produtos/686c19c68acd55b88614e1ff`

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Produto encontrado com sucesso.",
  "data": {
    "_id": "686c19c68acd55b88614e1ff",
    "nome_produto": "Pastilha de Freio Dianteira",
    "descricao": "Pastilha de freio para veículos nacionais",
    "preco": 89.9,
    "marca": "Bosch",
    "custo": 45,
    "categoria": "C",
    "estoque": 25,
    "estoque_min": 5,
    "data_ultima_entrada": "2025-07-07T19:02:30.090Z",
    "status": true,
    "id_fornecedor": 548,
    "codigo_produto": "PF001",
    "data_cadastro": "2025-07-07T19:02:30.138Z",
    "data_ultima_atualizacao": "2025-07-07T19:02:30.138Z",
    "nome_fornecedor": "Mercado Atacado Brasil"
  },
  "errors": []
}
``` <!-- atualizado -->

### Produtos com Estoque Baixo
`GET http://localhost:5011/api/produtos/estoque-baixo`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Produtos com estoque baixo encontrados.",
  "data": [
    {
      "_id": "686c19c68acd55b88614e1ff",
      "nome_produto": "Produto com Estoque Baixo",
      "categoria": "C",
      "estoque": 3,
      "estoque_min": 5
    }
  ],
  "errors": []
}
```

**Response (404 - quando não há produtos com estoque baixo):**
```json
{
  "error": true,
  "code": 404,
  "message": "Nenhum produto com estoque baixo encontrado.",
  "data": null,
  "errors": []
}
``` <!-- atualizado -->

### Buscar Produtos
`GET http://localhost:5011/api/produtos/busca?nome=Pastilha`

`GET http://localhost:5011/api/produtos/busca?categoria=Freios`

`GET http://localhost:5011/api/produtos/busca?codigo=PF001`

`GET http://localhost:5011/api/produtos/busca?marca=Bosch`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Parâmetros aceitos:**
- `nome`: Nome do produto
- `categoria`: Categoria do produto
- `codigo`: Código do produto
- `marca`: Marca do produto

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Produtos encontrados com sucesso.",
  "data": {
    "docs": [
      {
        "_id": "686c19c68acd55b88614e1ff",
        "nome_produto": "Pastilha de Freio Dianteira",
        "categoria": "C",
        "codigo_produto": "PF001",
        "preco": 89.9,
        "marca": "Bosch",
        "estoque": 25,
        "estoque_min": 5
      }
    ],
    "totalDocs": 1,
    "limit": 10,
    "totalPages": 1,
    "page": 1
  },
  "errors": []
}
``` <!-- atualizado -->

### Atualizar Produto
`PATCH http://localhost:5011/api/produtos/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Request Body (campos opcionais):**
```json
{
  "nome_produto": "Pastilha de Freio Dianteira Melhorada",
  "categoria": "Freios",
  "preco": 99.90,
  "custo": 55.00,
  "estoque": 30,
  "estoque_min": 8,
  "marca": "Bosch Premium",
  "descricao": "Pastilha de freio premium para veículos nacionais e importados"
}
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Produto atualizado com sucesso.",
  "data": {
    "_id": "686c19c68acd55b88614e1ff",
    "nome_produto": "Pastilha de Freio Dianteira Premium",
    "descricao": "Pastilha de freio para veículos nacionais",
    "preco": 99.9,
    "marca": "Bosch Premium",
    "custo": 55,
    "categoria": "C",
    "estoque": 30,
    "estoque_min": 5,
    "data_ultima_entrada": "2025-07-07T19:02:30.090Z",
    "status": true,
    "id_fornecedor": 548,
    "codigo_produto": "PF001",
    "data_cadastro": "2025-07-07T19:02:30.138Z",
    "data_ultima_atualizacao": "2025-07-07T19:11:57.210Z"
  },
  "errors": []
}
``` <!-- atualizado -->

### Desativar Produto
`PATCH http://localhost:5011/api/produtos/desativar/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Produto desativado com sucesso.",
  "data": {
    "_id": "686c19c68acd55b88614e1ff",
    "nome_produto": "Pastilha de Freio Dianteira Premium",
    "status": false,
    "data_ultima_atualizacao": "2025-07-07T19:12:05.439Z"
  },
  "errors": []
}
``` <!-- atualizado -->

### Reativar Produto
`PATCH http://localhost:5011/api/produtos/reativar/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Produto reativado com sucesso.",
  "data": {
    "_id": "686c19c68acd55b88614e1ff",
    "nome_produto": "Pastilha de Freio Dianteira Premium",
    "status": true,
    "data_ultima_atualizacao": "2025-07-07T19:12:10.884Z"
  },
  "errors": []
}
``` <!-- atualizado -->

### Deletar Produto
`DELETE http://localhost:5011/api/produtos/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

## USUÁRIOS

### Criar Usuário
`POST http://localhost:5011/api/usuarios`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Request Body:**
```json
{
  "nome_usuario": "João Silva",
  "email": "joao@teste.com",
  "matricula": "USR0010",
  "perfil": "estoquista"
}
```

**Observação:** A matrícula deve ter no mínimo 7 caracteres. <!-- atualizado -->

### Listar Usuários
`GET http://localhost:5011/api/usuarios`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Requisição bem-sucedida",
  "data": {
    "docs": [
      {
        "_id": "686c144bdd83d42d47a8bd7a",
        "nome_usuario": "Administrador",
        "email": "admin@sistema.com",
        "matricula": "ADM0001",
        "perfil": "administrador",
        "ativo": true,
        "senha_definida": true,
        "online": true,
        "grupos": [
          "685da7e3eb630432f26b0506"
        ],
        "permissoes": [],
        "data_cadastro": "2025-07-07T18:39:07.082Z",
        "data_ultima_atualizacao": "2025-07-07T19:02:05.364Z"
      }
    ],
    "totalDocs": 12,
    "limit": 10,
    "totalPages": 2,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  },
  "errors": []
}
``` <!-- atualizado -->

### Buscar Usuário por ID
`GET http://localhost:5011/api/usuarios/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Exemplo:**
`GET http://localhost:5011/api/usuarios/686c144bdd83d42d47a8bd7a` <!-- atualizado -->

### Buscar por Matrícula
`GET http://localhost:5011/api/usuarios/busca/:matricula`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Exemplo:**
`GET http://localhost:5011/api/usuarios/busca/ADM0001` <!-- atualizado -->

### Desativar Usuário
`PATCH http://localhost:5011/api/usuarios/desativar/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Reativar Usuário
`PATCH http://localhost:5011/api/usuarios/reativar/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Atualizar Usuário
`PATCH http://localhost:5011/api/usuarios/:matricula`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Deletar Usuário
`DELETE http://localhost:5011/api/usuarios/:matricula`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

## FORNECEDORES

### Listar Fornecedores
`GET http://localhost:5011/api/fornecedores`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "error": false,
  "code": 200,
  "message": "Requisição bem-sucedida",
  "data": {
    "docs": [
      {
        "_id": "686c144cdd83d42d47a8bdbc",
        "nome_fornecedor": "Distribuidora Central Ltda",
        "cnpj": "12345678901234",
        "telefone": "1112345678",
        "email": "contato@distribuidoracentral.com.br",
        "status": true,
        "endereco": [
          {
            "logradouro": "Av. Paulista, 1000",
            "bairro": "Bela Vista",
            "cidade": "São Paulo",
            "estado": "SP",
            "cep": "01310100",
            "_id": "686c144cdd83d42d47a8bdbd"
          }
        ],
        "data_cadastro": "2025-07-07T18:39:08.520Z",
        "data_ultima_atualizacao": "2025-07-07T18:39:08.520Z"
      }
    ],
    "totalDocs": 2,
    "limit": 10,
    "totalPages": 1,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": false,
    "prevPage": null,
    "nextPage": null
  },
  "errors": []
}
``` <!-- atualizado -->

### Buscar Fornecedor por Nome
`GET http://localhost:5011/api/fornecedores?nome_fornecedor=Distribuidora Central`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Buscar Fornecedor por CNPJ
`GET http://localhost:5011/api/fornecedores?cnpj=12345678901234`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Criar Fornecedor
`POST http://localhost:5011/api/fornecedores`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Request Body:**
```json
{
  "nome_fornecedor": "Auto Peças Norte",
  "cnpj": "98765432000110",
  "telefone": "1188888888",
  "email": "contato@autopecasnorte.com",
  "endereco": [
    {
      "logradouro": "Av. das Peças, 456",
      "bairro": "Vila Industrial",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234567"
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
    "nome_fornecedor": "Auto Peças Norte",
    "cnpj": "98765432000110",
    "telefone": "1188888888",
    "email": "contato@autopecasnorte.com",
    "status": true,
    "endereco": [
      {
        "logradouro": "Av. das Peças, 456",
        "bairro": "Vila Industrial",
        "cidade": "São Paulo",
        "estado": "SP",
        "cep": "01234567",
        "_id": "686c19fe8acd55b88614e21e"
      }
    ],
    "_id": "686c19fe8acd55b88614e21d",
    "data_cadastro": "2025-07-07T19:03:26.178Z",
    "data_ultima_atualizacao": "2025-07-07T19:03:26.178Z"
  },
  "errors": []
}
``` <!-- atualizado -->

### Atualizar Fornecedor
`PATCH http://localhost:5011/api/fornecedores/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Deletar Fornecedor
`DELETE http://localhost:5011/api/fornecedores/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

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
  "error": false,
  "code": 200,
  "message": "Grupos listados com sucesso.",
  "data": {
    "docs": [
      {
        "_id": "685da7e3eb630432f26b0514",
        "nome": "Estoquistas",
        "descricao": "Grupo com acesso básico ao estoque",
        "ativo": true,
        "permissoes": [
          {
            "rota": "produtos",
            "dominio": "localhost",
            "ativo": true,
            "buscar": true,
            "enviar": false,
            "substituir": false,
            "modificar": true,
            "excluir": false,
            "_id": "685da7e3eb630432f26b0515"
          }
        ],
        "data_criacao": "2025-06-26T20:04:51.998Z",
        "data_atualizacao": "2025-06-26T20:04:51.998Z",
        "id": "685da7e3eb630432f26b0514"
      }
    ],
    "totalDocs": 3,
    "limit": 10,
    "totalPages": 1,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": false,
    "prevPage": null,
    "nextPage": null
  },
  "errors": []
}
``` <!-- atualizado -->

### Criar Grupo
`POST http://localhost:5011/api/grupos`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Request Body:**
```json
{
  "nome": "Vendedores",
  "descricao": "Grupo para equipe de vendas",
  "permissoes": [
    {
      "rota": "produtos",
      "dominio": "localhost",
      "ativo": true,
      "buscar": true,
      "enviar": false,
      "substituir": false,
      "modificar": false,
      "excluir": false
    },
    {
      "rota": "movimentacoes",
      "dominio": "localhost",
      "ativo": true,
      "buscar": true,
      "enviar": true,
      "substituir": false,
      "modificar": false,
      "excluir": false
    }
  ]
}
``` <!-- atualizado -->

### Buscar Grupo por ID
`GET http://localhost:5011/api/grupos/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Atualizar Grupo
`PATCH http://localhost:5011/api/grupos/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Deletar Grupo
`DELETE http://localhost:5011/api/grupos/:id`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Adicionar Usuário ao Grupo
`POST http://localhost:5011/api/grupos/:id/usuarios`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Request Body:**
```json
{
  "usuario_id": "686c144bdd83d42d47a8bd7a"
}
``` <!-- atualizado -->

### Remover Usuário do Grupo
`DELETE http://localhost:5011/api/grupos/:id/usuarios/:usuario_id`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

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
  "message": "Usuários online recuperados com sucesso",
  "data": [
    {
      "_id": "686c144bdd83d42d47a8bd7a",
      "nome_usuario": "Administrador",
      "email": "admin@sistema.com",
      "matricula": "ADM0001",
      "perfil": "administrador",
      "data_cadastro": "2025-07-07T18:39:07.082Z"
    },
    {
      "_id": "686c144bdd83d42d47a8bd80",
      "nome_usuario": "Janaína Melo",
      "email": "usuario3@sistema.com",
      "matricula": "USR0003",
      "perfil": "estoquista",
      "data_cadastro": "2024-09-05T13:51:05.495Z"
    }
  ],
  "total": 5,
  "timestamp": "2025-07-07T19:03:38.161Z"
}
``` <!-- atualizado -->

### Obter Logs de Usuário
`GET http://localhost:5011/api/logs/usuario/:userId`

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**Response (200):**
```json
{
  "logs": [
    {
      "sessionId": "session_123",
      "userId": "686c144bdd83d42d47a8bd7a",
      "action": "LOGIN",
      "details": {
        "ip": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "os": "Windows 10"
      },
      "timestamp": "2025-07-07T19:00:00.000Z"
    }
  ]
}
``` <!-- atualizado -->

### Buscar Eventos Específicos (Admin)
`GET http://localhost:5011/api/logs/search?action=LOGIN&startDate=2025-01-01&endDate=2025-12-31`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Obter Estatísticas de Logs (Admin)
`GET http://localhost:5011/api/logs/statistics`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

### Obter Eventos Críticos (Admin)
`GET http://localhost:5011/api/logs/critical`

**Headers:**
```
Authorization: Bearer your_jwt_token
``` <!-- atualizado -->

---

**Observações:**
- Todas as rotas protegidas (exceto `/auth/*`) requerem o header `Authorization: Bearer {token}`
- Rotas marcadas com "(Admin)" requerem privilégios de administrador
- Todas as ações relevantes são automaticamente registradas no sistema de logs
- O sistema mantém controle de usuários online em tempo real
- As respostas incluem informações de sessão e logs de auditoria quando aplicável

**Observações Específicas dos Testes:**
- **Produtos**: Todos os endpoints testados estão funcionando corretamente
- **Usuários**: Listagem e busca funcionam. Criação tem erro no middleware de log
- **Fornecedores**: Estrutura de endereço é um array de objetos
- **Grupos**: Sistema de permissões usa estrutura boolean (buscar, enviar, substituir, modificar, excluir)
- **Logs**: Endpoint de usuários online retorna estrutura diferente do documentado originalmente
- **Autenticação**: Refresh token pode ter problemas de validação
- **Estrutura de Resposta**: Padrão `{error: false, code: 200, message: "...", data: {...}, errors: []}` é usado consistentemente

**Campos de Validação:**
- **Matrícula de usuário**: Mínimo 7 caracteres
- **CNPJ**: Sem formatação, apenas números
- **Telefone**: Sem formatação, apenas números
- **Endereço de fornecedor**: Array de objetos com campos obrigatórios (logradouro, bairro, cidade, estado, cep)

**Paginação:**
- Padrão: `limit: 10, page: 1`
- Estrutura: `{docs: [...], totalDocs: n, limit: 10, totalPages: n, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: true, prevPage: null, nextPage: 2}`