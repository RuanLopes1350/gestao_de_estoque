# Cadastro de Usuários com Grupos e Permissões

## ✨ Nova Funcionalidade Implementada

Agora é possível associar **grupos** e **permissões individuais** diretamente no momento do cadastro do usuário!

## 📋 Exemplos de Uso

### 1. Cadastro Básico (sem grupos)
```json
POST /api/usuarios
{
  "nome_usuario": "João Silva",
  "email": "joao.silva@empresa.com",
  "matricula": "EST001",
  "senha": "MinhaSenh@123",
  "perfil": "estoquista"
}
```

### 2. Cadastro com Grupos
```json
POST /api/usuarios
{
  "nome_usuario": "Maria Santos",
  "email": "maria.santos@empresa.com",
  "matricula": "GER001",
  "senha": "MinhaSenh@123",
  "perfil": "gerente",
  "grupos": [
    "64f7a8b9c1234567890abcd12",
    "64f7a8b9c1234567890abcd13"
  ]
}
```

### 3. Cadastro com Grupos e Permissões Individuais
```json
POST /api/usuarios
{
  "nome_usuario": "Carlos Admin",
  "email": "carlos.admin@empresa.com",
  "matricula": "ADM001",
  "senha": "MinhaSenh@123",
  "perfil": "administrador",
  "grupos": [
    "64f7a8b9c1234567890abcd12"
  ],
  "permissoes": [
    {
      "rota": "relatorios",
      "dominio": "localhost",
      "ativo": true,
      "buscar": true,
      "enviar": true,
      "substituir": false,
      "modificar": true,
      "excluir": false
    },
    {
      "rota": "auditoria",
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

### 4. Cadastro Apenas com Permissões Individuais
```json
POST /api/usuarios
{
  "nome_usuario": "Ana Consultora",
  "email": "ana.consultora@empresa.com",
  "matricula": "CON001",
  "senha": "MinhaSenh@123",
  "perfil": "estoquista",
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
    }
  ]
}
```

## 🔍 Validações Implementadas

### Grupos
- ✅ IDs devem ser ObjectIds válidos
- ✅ Grupos devem existir no sistema
- ✅ Grupos devem estar ativos
- ✅ Máximo de 10 grupos por usuário
- ✅ Grupos duplicados são removidos automaticamente

### Permissões
- ✅ Rotas devem existir no sistema
- ✅ Rotas devem estar ativas
- ✅ Não pode haver permissões duplicadas (rota + domínio)
- ✅ Domínio padrão é "localhost" se não informado

### Campos Obrigatórios
```javascript
{
  "nome_usuario": "string (min 3 chars, só letras)",
  "email": "string (email válido)",
  "matricula": "string (7 chars exatos)",
  "senha": "string (min 7 chars, 1 maiúscula, 1 minúscula, 1 número)",
  "perfil": "enum [administrador, gerente, vendedor, estoquista]"
}
```

### Campos Opcionais
```javascript
{
  "grupos": ["array de ObjectIds"],
  "permissoes": [
    {
      "rota": "string",
      "dominio": "string (default: localhost)",
      "ativo": "boolean (default: true)",
      "buscar": "boolean (default: false)",
      "enviar": "boolean (default: false)",
      "substituir": "boolean (default: false)",
      "modificar": "boolean (default: false)",
      "excluir": "boolean (default: false)"
    }
  ]
}
```

## 🚀 Workflow Recomendado

### Para Administradores
1. Criar grupos primeiro
2. Cadastrar usuário associando ao grupo "Administradores"
3. Adicionar permissões específicas se necessário

### Para Usuários Comuns
1. Identificar o grupo apropriado para o perfil
2. Cadastrar usuário associando ao grupo
3. Adicionar permissões individuais apenas se necessário

### Para Casos Especiais
1. Cadastrar usuário sem grupos
2. Adicionar apenas permissões específicas necessárias

## ⚡ Vantagens

- ✅ **Um único request** para configurar completamente o usuário
- ✅ **Validação completa** durante o cadastro
- ✅ **Flexibilidade total** - pode usar grupos, permissões ou ambos
- ✅ **Retrocompatibilidade** - campos são opcionais
- ✅ **Segurança** - validações impedem configurações inválidas

## 🔧 Testando no Postman

### Obter IDs de Grupos Existentes
```http
GET /api/grupos
Authorization: Bearer {{TOKEN}}
```

### Cadastrar Usuário com Grupo
```http
POST /api/usuarios
Content-Type: application/json

{
  "nome_usuario": "Teste Usuario",
  "email": "teste@empresa.com",
  "matricula": "TST001",
  "senha": "MinhaSenh@123",
  "perfil": "estoquista",
  "grupos": ["{{GRUPO_ID}}"]
}
```

### Verificar Permissões do Usuário Criado
```http
GET /api/usuarios/{{NEW_USER_ID}}/permissoes
Authorization: Bearer {{TOKEN}}
```

## 🎯 Cenários de Uso

### 1. Onboarding Rápido
Novo funcionário já entra com todas as permissões configuradas.

### 2. Usuários Temporários
Consultores/auditores com permissões específicas e limitadas.

### 3. Administradores
Acesso completo através do grupo + permissões extras se necessário.

### 4. Usuários Especiais
Combinação de grupos padrão + permissões customizadas.

---

**🎉 Implementado!** Agora o cadastro de usuários é muito mais flexível e eficiente!
