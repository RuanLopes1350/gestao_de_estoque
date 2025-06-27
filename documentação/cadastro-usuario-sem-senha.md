# Sistema de Cadastro de Usuário sem Senha

## Visão Geral

O sistema agora permite que administradores cadastrem usuários sem definir senhas. Quando um usuário é cadastrado dessa forma, um código de segurança é gerado automaticamente. O usuário pode então usar esse código para definir sua própria senha através do endpoint de recuperação de senha já existente.

## Fluxo do Processo

### 1. Administrador Cadastra Usuário
- **Endpoint**: `POST /api/usuarios/cadastrar-sem-senha`
- **Autenticação**: Bearer Token (administrador)
- **Dados necessários**: nome_usuario, email, matricula, perfil (opcional)

### 2. Sistema Gera Código de Segurança
- Código de 6 dígitos gerado automaticamente
- Válido por 24 horas
- Usuário fica inativo até definir senha

### 3. Usuário Define Senha
- **Endpoint**: `POST /auth/redefinir-senha/codigo`
- **Sem autenticação** (endpoint público)
- **Dados necessários**: codigo, senha

### 4. Conta Ativada
- Usuário fica ativo após definir senha
- Pode fazer login normalmente

## Exemplos de Uso

### 1. Cadastrar Usuário (Administrador)

```bash
curl -X POST http://localhost:3000/api/usuarios/cadastrar-sem-senha \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_DE_ADMIN" \
  -d '{
    "nome_usuario": "João Silva",
    "email": "joao.silva@empresa.com",
    "matricula": "12345",
    "perfil": "estoquista"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "_id": "60f1234567890abcdef12345",
    "nome_usuario": "João Silva",
    "email": "joao.silva@empresa.com",
    "matricula": "12345",
    "perfil": "estoquista",
    "ativo": false,
    "senha_definida": false,
    "message": "Usuário cadastrado com sucesso. Código de segurança gerado: 123456",
    "instrucoes": "O usuário deve usar este código na endpoint '/auth/redefinir-senha/codigo' para definir sua senha."
  }
}
```

### 2. Usuário Define Senha

```bash
curl -X POST http://localhost:3000/auth/redefinir-senha/codigo \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "123456",
    "senha": "minhasenhasegura123"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Senha definida com sucesso! Sua conta está ativa e você já pode fazer login."
}
```

### 3. Login do Usuário

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "matricula": "12345",
    "senha": "minhasenhasegura123"
  }'
```

## Campos do Modelo Usuario

### Novos Campos Adicionados:
- `senha_definida`: Boolean que indica se a senha foi definida pelo usuário
- `senha`: Agora não é obrigatório inicialmente
- `codigo_recuperacao`: Código de segurança gerado
- `data_expiracao_codigo`: Data de expiração do código

### Comportamento:
- Usuários ficam `ativo: false` até definirem senha
- Campo `senha_definida: false` até a primeira definição
- Código expira em 24 horas
- Após definir senha: `ativo: true`, `senha_definida: true`

## Validações de Segurança

### No Login:
- Verifica se usuário está ativo
- Verifica se senha foi definida
- Mensagem específica para usuários que não definiram senha

### Na Definição de Senha:
- Valida código de segurança
- Verifica expiração do código
- Criptografa senha com bcrypt
- Ativa conta automaticamente

## Logs de Auditoria

O sistema registra eventos críticos:
- `USUARIO_CRIADO_SEM_SENHA`: Quando admin cadastra usuário
- Logs incluem matrícula, perfil, e quem criou
- Não registra o código por segurança

## Vantagens desta Abordagem

1. **Segurança**: Admin não precisa saber senhas dos usuários
2. **Reutilização**: Aproveita infraestrutura existente de recuperação
3. **UX**: Processo familiar para usuários
4. **Auditoria**: Controle completo de usuários ativos/inativos
5. **Flexibilidade**: Mesmo endpoint pode ser usado para recuperação tradicional

## Casos de Erro

### Código Inválido:
```json
{
  "message": "Código de recuperação inválido"
}
```

### Código Expirado:
```json
{
  "message": "Código de recuperação expirado"
}
```

### Tentativa de Login sem Senha Definida:
```json
{
  "message": "Usuário ainda não definiu sua senha. Use o código de segurança fornecido para definir sua senha."
}
```
