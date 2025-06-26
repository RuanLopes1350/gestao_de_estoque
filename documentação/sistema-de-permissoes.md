# Sistema de Permissões - Gestão de Estoque

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Modelos de Dados](#modelos-de-dados)
4. [Como Funciona](#como-funciona)
5. [Configuração e Uso](#configuração-e-uso)
6. [Exemplos Práticos](#exemplos-práticos)
7. [API e Endpoints](#api-e-endpoints)
8. [Seeds e Dados Iniciais](#seeds-e-dados-iniciais)
9. [Troubleshooting](#troubleshooting)

## Visão Geral

O sistema de permissões da aplicação de gestão de estoque é baseado em um modelo híbrido que combina:

- **Permissões baseadas em grupos**: Usuários podem pertencer a grupos que definem permissões padrão
- **Permissões individuais**: Usuários podem ter permissões específicas que sobrescrevem as do grupo
- **Controle granular**: Permissões são definidas por rota e método HTTP (CRUD)
- **Domínios**: Suporte a múltiplos domínios/ambientes

### Características Principais

- ✅ **Herança de Permissões**: Usuários herdam permissões de seus grupos
- ✅ **Precedência Individual**: Permissões individuais têm prioridade sobre as do grupo
- ✅ **Controle CRUD**: Permissões específicas para buscar, enviar, substituir, modificar e excluir
- ✅ **Multi-domínio**: Suporte a diferentes domínios/ambientes
- ✅ **Validação Automática**: Prevenção de permissões duplicadas
- ✅ **Performance**: Consultas otimizadas com índices

## Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Usuário     │    │      Grupo      │    │      Rota       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Dados Básicos │    │ • Nome          │    │ • Nome da Rota  │
│ • Perfil        │    │ • Descrição     │    │ • Domínio       │
│ • Grupos[]      │◄──►│ • Permissões[]  │    │ • Métodos HTTP  │
│ • Permissões[]  │    │ • Ativo         │    │ • Ativo         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │   PermissionService     │
                    ├─────────────────────────┤
                    │ • hasPermission()       │
                    │ • getUserPermissions()  │
                    │ • verificarRotaExiste() │
                    └─────────────────────────┘
```

## Modelos de Dados

### Modelo Usuario

```javascript
{
  nome_usuario: String,
  email: String,
  matricula: String,
  perfil: ["administrador", "gerente", "estoquista"],
  grupos: [ObjectId], // Referência para grupos
  permissoes: [
    {
      rota: String,        // Nome da rota (ex: "produtos")
      dominio: String,     // Domínio (ex: "localhost")
      ativo: Boolean,      // Se a permissão está ativa
      buscar: Boolean,     // GET - Permissão para consultar
      enviar: Boolean,     // POST - Permissão para criar
      substituir: Boolean, // PUT - Permissão para substituir completamente
      modificar: Boolean,  // PATCH - Permissão para modificar parcialmente
      excluir: Boolean     // DELETE - Permissão para excluir
    }
  ]
}
```

### Modelo Grupo

```javascript
{
  nome: String,
  descricao: String,
  ativo: Boolean,
  permissoes: [
    {
      rota: String,        // Nome da rota
      dominio: String,     // Domínio
      ativo: Boolean,      // Se a permissão está ativa
      buscar: Boolean,     // GET
      enviar: Boolean,     // POST
      substituir: Boolean, // PUT
      modificar: Boolean,  // PATCH
      excluir: Boolean     // DELETE
    }
  ]
}
```

### Modelo Rota

```javascript
{
  rota: String,           // Nome da rota (ex: "produtos")
  dominio: String,        // Domínio (ex: "localhost")
  descricao: String,      // Descrição da rota
  metodos_permitidos: [String], // ["GET", "POST", "PUT", "PATCH", "DELETE"]
  ativo: Boolean,         // Se a rota está ativa
  requer_autenticacao: Boolean
}
```

## Como Funciona

### 1. Verificação de Permissões

O sistema segue uma hierarquia de verificação:

1. **Busca o usuário** com grupos populados
2. **Coleta permissões individuais** do usuário
3. **Coleta permissões dos grupos** do usuário
4. **Remove duplicatas** (permissões individuais têm precedência)
5. **Verifica a permissão específica** para rota, domínio e método

### 2. Precedência de Permissões

```
Permissões Individuais > Permissões do Grupo > Negado (padrão)
```

### 3. Mapeamento HTTP para CRUD

| Método HTTP | Campo na Permissão | Descrição |
|-------------|-------------------|-----------|
| GET | `buscar` | Consultar/listar recursos |
| POST | `enviar` | Criar novos recursos |
| PUT | `substituir` | Substituir recursos completamente |
| PATCH | `modificar` | Modificar recursos parcialmente |
| DELETE | `excluir` | Excluir recursos |

## Configuração e Uso

### 1. Criando um Grupo

```javascript
import Grupo from '../models/Grupo.js';

const novoGrupo = new Grupo({
  nome: "Gerentes",
  descricao: "Grupo com permissões de gerência",
  ativo: true,
  permissoes: [
    {
      rota: "produtos",
      dominio: "localhost",
      ativo: true,
      buscar: true,
      enviar: true,
      substituir: true,
      modificar: true,
      excluir: false
    },
    {
      rota: "usuarios",
      dominio: "localhost",
      ativo: true,
      buscar: true,
      enviar: false,
      substituir: false,
      modificar: true,
      excluir: false
    }
  ]
});

await novoGrupo.save();
```

### 2. Atribuindo Grupo a um Usuário

```javascript
import Usuario from '../models/Usuario.js';

const usuario = await Usuario.findById(userId);
usuario.grupos.push(grupoId);
await usuario.save();
```

### 3. Adicionando Permissão Individual

```javascript
const usuario = await Usuario.findById(userId);
usuario.permissoes.push({
  rota: "fornecedores",
  dominio: "localhost",
  ativo: true,
  buscar: true,
  enviar: true,
  substituir: false,
  modificar: true,
  excluir: true
});
await usuario.save();
```

### 4. Verificando Permissões

```javascript
import PermissionService from '../services/PermissionService.js';

const permissionService = new PermissionService();

// Verificar se usuário pode criar produtos
const podeCrear = await permissionService.hasPermission(
  userId,
  'produtos',     // rota
  'localhost',    // domínio
  'enviar'        // método (POST)
);

// Obter todas as permissões do usuário
const permissoes = await permissionService.getUserPermissions(userId);
```

## Exemplos Práticos

### Exemplo 1: Configuração de um Administrador

```javascript
// 1. Criar grupo de administradores
const grupoAdmin = new Grupo({
  nome: "Administradores",
  descricao: "Acesso total ao sistema",
  ativo: true,
  permissoes: [
    {
      rota: "usuarios",
      dominio: "localhost",
      ativo: true,
      buscar: true,
      enviar: true,
      substituir: true,
      modificar: true,
      excluir: true
    },
    {
      rota: "produtos",
      dominio: "localhost",
      ativo: true,
      buscar: true,
      enviar: true,
      substituir: true,
      modificar: true,
      excluir: true
    }
    // ... outras rotas
  ]
});

// 2. Criar usuário administrador
const adminUser = new Usuario({
  nome_usuario: "Admin Principal",
  email: "admin@empresa.com",
  matricula: "ADM001",
  perfil: "administrador",
  grupos: [grupoAdmin._id]
});
```

### Exemplo 2: Estoquista com Permissões Limitadas

```javascript
// 1. Criar grupo de estoquistas
const grupoEstoquista = new Grupo({
  nome: "Estoquistas",
  descricao: "Acesso limitado para gestão de estoque",
  ativo: true,
  permissoes: [
    {
      rota: "produtos",
      dominio: "localhost",
      ativo: true,
      buscar: true,
      enviar: true,
      substituir: false,
      modificar: true,
      excluir: false
    },
    {
      rota: "movimentacao",
      dominio: "localhost",
      ativo: true,
      buscar: true,
      enviar: true,
      substituir: false,
      modificar: true,
      excluir: false
    }
  ]
});

// 2. Usuário estoquista com permissão extra para excluir produtos
const estoquista = new Usuario({
  nome_usuario: "João Silva",
  email: "joao@empresa.com",
  matricula: "EST001",
  perfil: "estoquista",
  grupos: [grupoEstoquista._id],
  permissoes: [
    {
      rota: "produtos",
      dominio: "localhost",
      ativo: true,
      buscar: true,
      enviar: true,
      substituir: false,
      modificar: true,
      excluir: true // Permissão individual que sobrescreve a do grupo
    }
  ]
});
```

### Exemplo 3: Verificação em Middleware

```javascript
// middleware/permissionMiddleware.js
export const checkPermission = (rota, metodo) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id; // Do JWT
      const dominio = req.get('host') || 'localhost';
      
      const permissionService = new PermissionService();
      const hasPermission = await permissionService.hasPermission(
        userId,
        rota,
        dominio,
        metodo
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Permissão negada',
          message: `Usuário não tem permissão para ${metodo} em ${rota}`
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

// Uso nas rotas
app.get('/api/produtos', 
  authMiddleware,
  checkPermission('produtos', 'buscar'),
  produtoController.listar
);

app.post('/api/produtos', 
  authMiddleware,
  checkPermission('produtos', 'enviar'),
  produtoController.criar
);
```

## API e Endpoints

### Endpoints de Grupos

```
GET    /api/grupos                    # Listar grupos
POST   /api/grupos                    # Criar grupo
GET    /api/grupos/:id                # Obter grupo específico
PUT    /api/grupos/:id                # Atualizar grupo
DELETE /api/grupos/:id                # Excluir grupo
```

### Endpoints de Usuários (relacionados a permissões)

```
GET    /api/usuarios/:id/permissoes   # Obter permissões do usuário
POST   /api/usuarios/:id/grupos       # Adicionar usuário ao grupo
DELETE /api/usuarios/:id/grupos/:grupoId # Remover usuário do grupo
POST   /api/usuarios/:id/permissoes   # Adicionar permissão individual
PUT    /api/usuarios/:id/permissoes/:permissaoId # Atualizar permissão
DELETE /api/usuarios/:id/permissoes/:permissaoId # Remover permissão
```

### Exemplo de Response da API

```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "64f7a8b9c1234567890abcdef",
      "nome": "João Silva",
      "email": "joao@empresa.com",
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
          "rota": "produtos",
          "dominio": "localhost",
          "ativo": true,
          "buscar": true,
          "enviar": true,
          "substituir": false,
          "modificar": true,
          "excluir": true
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
    }
  }
}
```

## Seeds e Dados Iniciais

### Executando Seeds

```bash
# Executar todas as seeds
npm run seed

# Executar seed específica de permissões
npm run seed:permissions

# Limpar e repovoar banco (desenvolvimento)
node src/seeds/reseedPermissions.js
```

### Estrutura dos Seeds

O sistema inclui seeds automáticas para:

1. **Rotas** (`seedRotas.js`): Cria rotas padrão do sistema
2. **Grupos** (`seedGrupos.js`): Cria grupos com permissões pré-definidas
3. **Usuários** (`seedsUsuario.js`): Cria usuários e os atribui a grupos

### Configuração no globalFakeMapping

O arquivo `globalFakeMapping.js` centraliza a geração de dados fake:

```javascript
// Exemplo de configuração para grupos
grupos: {
  defaults: [
    {
      nome: "Administradores",
      descricao: "Acesso total ao sistema",
      ativo: true,
      permissoes: [
        {
          rota: "usuarios",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: true
        }
      ]
    }
  ],
  generate: (count) => {
    // Gera grupos dinâmicos
  }
}
```

## Troubleshooting

### Problemas Comuns

#### 1. Permissão Negada Inesperada

**Sintoma**: Usuário deveria ter permissão mas o sistema nega acesso.

**Soluções**:
```javascript
// Verificar permissões efetivas do usuário
const permissionService = new PermissionService();
const permissoes = await permissionService.getUserPermissions(userId);
console.log('Permissões efetivas:', permissoes.permissoes.efetivas);

// Verificar se o grupo está ativo
const usuario = await Usuario.findById(userId).populate('grupos');
console.log('Grupos ativos:', usuario.grupos.filter(g => g.ativo));
```

#### 2. Erro de Permissões Duplicadas

**Sintoma**: Erro ao salvar usuário/grupo com permissões duplicadas.

**Solução**: Garantir que combinação rota + domínio é única:
```javascript
// Remover duplicatas antes de salvar
const permissoesUnicas = permissoes.filter((permissao, index, self) => 
  index === self.findIndex(p => 
    p.rota === permissao.rota && p.dominio === permissao.dominio
  )
);
```

#### 3. Performance Lenta

**Sintoma**: Verificação de permissões muito lenta.

**Soluções**:
- Usar índices nos campos `rota` e `dominio`
- Implementar cache de permissões para usuários frequentes
- Otimizar consultas usando `.lean()` quando possível

#### 4. Grupo Inativo Ainda Concede Permissões

**Sintoma**: Usuário mantém permissões de grupo desativado.

**Solução**: Verificar filtro de grupos ativos no PermissionService:
```javascript
if (grupo.ativo && grupo.permissoes && grupo.permissoes.length > 0) {
  // Processar permissões apenas se grupo estiver ativo
}
```

### Debug e Monitoramento

#### Logs de Permissões

```javascript
// Adicionar logs detalhados no PermissionService
console.log(`Verificando permissão: usuário=${userId}, rota=${rota}, método=${metodo}`);
console.log(`Permissões encontradas:`, permissoesUnicas.length);
console.log(`Resultado:`, hasPermissao ? 'PERMITIDO' : 'NEGADO');
```

#### Validação de Integridade

```javascript
// Script para validar integridade das permissões
async function validarIntegridade() {
  const usuarios = await Usuario.find({}).populate('grupos');
  
  for (const usuario of usuarios) {
    // Verificar grupos existem
    const gruposValidos = usuario.grupos.filter(g => g !== null);
    if (gruposValidos.length !== usuario.grupos.length) {
      console.warn(`Usuário ${usuario._id} tem grupos inválidos`);
    }
    
    // Verificar permissões duplicadas
    const rotaDominio = new Set();
    for (const perm of usuario.permissoes) {
      const chave = `${perm.rota}_${perm.dominio}`;
      if (rotaDominio.has(chave)) {
        console.warn(`Usuário ${usuario._id} tem permissões duplicadas`);
      }
      rotaDominio.add(chave);
    }
  }
}
```

## Considerações de Segurança

1. **Sempre validar permissões** no backend, nunca confiar apenas no frontend
2. **Usar HTTPS** para proteger tokens de autenticação
3. **Implementar rate limiting** para endpoints de verificação de permissões
4. **Auditar alterações** de permissões (logs de auditoria)
5. **Revisar periodicamente** permissões concedidas
6. **Usar princípio do menor privilégio** - conceder apenas permissões necessárias

---

**Última atualização**: 26 de Junho de 2025  
**Versão**: 1.0.0  
**Autor**: Ruan Lopes
