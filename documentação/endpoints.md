# Rotas Principais
1. Listar Movimentações
- Rota: `GET /movimentacoes`
- Descrição: Retorna todas as movimentações com paginação
- Parâmetros de query:
  - page: Número da página (padrão 1)
  - limite: Itens por página (padrão: 10, máx: 100)
- Exemplo: `GET /movimentacoes?page=2&limite=20`

2. Buscar Movimentação por ID