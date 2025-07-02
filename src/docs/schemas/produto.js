const produtoSchemas = {
    Produto: {
        type: 'object',
        properties: {
            _id: { type: 'string', example: '60d5ecb54b24a12a5c8e4f1a' },
            nome: { type: 'string', example: 'Notebook Dell' },
            codigo: { type: 'string', example: 'NB001' },
            categoria: { type: 'string', example: 'Eletrônicos' },
            quantidade_estoque: { type: 'integer', example: 15 },
            preco_unitario: { type: 'number', example: 2500.00 },
            descricao: { type: 'string', example: 'Notebook Dell Inspiron 15' },
            fornecedor: { type: 'string', example: '60d5ecb54b24a12a5c8e4f1b' }
        }
    }
};

export default produtoSchemas;
