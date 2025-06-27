const movimentacaoSchemas = {
    Movimentacao: {
        type: 'object',
        properties: {
            _id: { type: 'string', example: '60d5ecb54b24a12a5c8e4f1c' },
            produto: { type: 'string', example: '60d5ecb54b24a12a5c8e4f1a' },
            tipo: { type: 'string', enum: ['entrada', 'saida'], example: 'entrada' },
            quantidade: { type: 'integer', example: 10 },
            data_movimentacao: { type: 'string', format: 'date-time' },
            observacao: { type: 'string', example: 'Compra de estoque' }
        }
    }
};

export default movimentacaoSchemas;
