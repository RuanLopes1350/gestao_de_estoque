# Sistema de Logs - Gestão de Estoque Automotivo

## Visão Geral

O sistema de logs foi implementado para fornecer rastreabilidade completa das ações dos usuários no sistema de gestão de estoque de peças automotivas.

## Estrutura de Arquivos

```
logs/
├── ADM0001/                          # Pasta do usuário (matrícula)
│   ├── session_2024-06-18T09-30-45.log  # Sessão individual
│   ├── session_2024-06-18T14-22-10.log
│   └── session_2024-06-19T08-15-33.log
├── USR2563/
│   ├── session_2024-06-17T10-05-22.log
│   └── session_2024-06-18T11-45-07.log
└── SECURITY/                         # Logs de segurança
    └── failed_login_2024-06-18T10-30-22.log
```

## Tipos de Eventos Registrados

### 1. Eventos de Autenticação
- **LOGIN**: Login bem-sucedido
- **LOGOUT**: Logout do usuário
- **TOKEN_REVOKE**: Revogação de tokens

### 2. Eventos de Operação
- **CONSULTA_PRODUTOS**: Visualização de produtos
- **CADASTRO_PRODUTO**: Criação de novos produtos
- **ESTOQUE_MOVIMENTO**: Movimentações de estoque
- **USUARIO_ACAO**: Ações relacionadas a usuários

### 3. Eventos Críticos
- Alterações em quantidades de estoque
- Revogação de acessos
- Modificações em dados críticos

## Formato dos Logs

### Estrutura de Arquivo de Sessão
```json
{
  "inicioSessao": "2024-06-18T09:30:45.123Z",
  "fimSessao": "2024-06-18T10:15:22.456Z",
  "duracaoSessao": 2677,
  "usuario": {
    "id": "60d5ec49f1b2c72b1c8b4567",
    "matricula": "ADM0001",
    "nome": "João Silva",
    "perfil": "administrador"
  },
  "informacaoSistema": {
    "ip": "192.168.1.100",
    "sistemaOperacional": "Windows 10/11",
    "navegador": "Chrome",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
  },
  "eventos": [
    {
      "timestamp": "2024-06-18T09:30:45.123Z",
      "tipo": "LOGIN",
      "ip": "192.168.1.100",
      "metodo": "POST",
      "rota": "/auth/login",
      "dados": {
        "tipo": "login_sucesso",
        "matricula": "ADM0001"
      }
    },
    {
      "timestamp": "2024-06-18T09:32:15.789Z",
      "tipo": "CONSULTA_PRODUTOS",
      "ip": "192.168.1.100",
      "metodo": "GET",
      "rota": "/api/produtos",
      "dados": {
        "metodo": "GET",
        "rota": "/api/produtos",
        "params": {},
        "query": { "page": 1, "limit": 20 }
      }
    }
  ]
}
```

## Endpoints da API de Logs

### 1. Obter logs de um usuário
```http
GET /api/logs/usuario/{userId}?limit=10
```

**Permissões**: Próprio usuário ou administrador

**Exemplo de Resposta**:
```json
{
  "message": "Logs recuperados com sucesso",
  "data": [...],
  "total": 5
}
```

### 2. Buscar eventos específicos
```http
GET /api/logs/search?eventType=LOGIN&startDate=2024-06-01&endDate=2024-06-18
```

**Permissões**: Apenas administradores

### 3. Obter estatísticas
```http
GET /api/logs/statistics
```

**Permissões**: Apenas administradores

**Exemplo de Resposta**:
```json
{
  "message": "Estatísticas recuperadas com sucesso",
  "data": {
    "totalLogins": 125,
    "totalLogouts": 120,
    "movimentacoesEstoque": 45,
    "eventosCriticos": 3,
    "usuariosAtivos": 15
  }
}
```

### 4. Obter eventos críticos
```http
GET /api/logs/critical?days=7
```

**Permissões**: Apenas administradores

## Como Implementar Logs em Novas Rotas

### 1. Importar o LogMiddleware
```javascript
import LogMiddleware from '../middlewares/LogMiddleware.js';
```

### 2. Adicionar o middleware na rota
```javascript
router.post(
  "/produtos",
  LogMiddleware.log('CADASTRO_PRODUTO'),
  asyncWrapper(produtoController.cadastrarProduto.bind(produtoController))
);
```

### 3. Para eventos críticos no controller
```javascript
// No controller
LogMiddleware.logCriticalEvent(req.userId, 'ESTOQUE_ALTERACAO', {
  produto_id: produto._id,
  quantidade_anterior: produto.quantidade,
  quantidade_nova: novaQuantidade,
  motivo: 'Ajuste de inventário'
}, req);
```

## Tipos de Eventos Recomendados

### Sistema de Estoque
- `PRODUTO_CRIADO`: Novo produto cadastrado
- `PRODUTO_EDITADO`: Produto modificado
- `PRODUTO_REMOVIDO`: Produto removido/desativado
- `ESTOQUE_ENTRADA`: Entrada de mercadoria
- `ESTOQUE_SAIDA`: Saída de mercadoria
- `ESTOQUE_AJUSTE`: Ajuste manual de estoque

### Sistema de Usuários
- `USUARIO_CRIADO`: Novo usuário cadastrado
- `USUARIO_EDITADO`: Usuário modificado
- `USUARIO_DESATIVADO`: Usuário desativado
- `PERFIL_ALTERADO`: Mudança de perfil de usuário

### Sistema de Segurança
- `LOGIN_TENTATIVA_FALHA`: Tentativa de login falhada
- `TOKEN_EXPIRADO`: Token expirado usado
- `ACESSO_NEGADO`: Tentativa de acesso não autorizado

## Boas Práticas

1. **Não registre dados sensíveis**: Nunca inclua senhas ou tokens completos nos logs
2. **Seja específico**: Use tipos de eventos descritivos
3. **Inclua contexto**: Sempre que possível, inclua informações relevantes sobre a ação
4. **Rotação de logs**: Implemente limpeza automática de logs antigos
5. **Monitoramento**: Configure alertas para eventos críticos

## Segurança

- Logs são armazenados localmente no servidor
- Acesso aos logs é restrito por perfil de usuário
- Logs de tentativas de acesso são mantidos separadamente
- IPs e user-agents são registrados para auditoria

## Exemplos de Uso

### Rastrear movimentações de um produto específico
```javascript
const movimentacoes = LogMiddleware.searchEvents('ESTOQUE_MOVIMENTO', startDate, endDate);
const produtoEspecifico = movimentacoes.filter(m => 
  m.eventos.some(e => e.dados.produto === 'ID_DO_PRODUTO')
);
```

### Verificar atividade suspeita
```javascript
const loginsFalhas = LogMiddleware.searchEvents('LOGIN_TENTATIVA_FALHA');
const ipsComFalhas = loginsFalhas.map(l => l.eventos[0].ip);
```

### Auditoria de alterações por usuário
```javascript
const logsUsuario = LogMiddleware.getUserLogs('USER_ID', 50);
const alteracoesCriticas = logsUsuario.flatMap(s => 
  s.eventos.filter(e => e.dados.prioridade === 'CRITICA')
);
```
