const fornecedorSchemas = {
    Fornecedor: {
        type: 'object',
        properties: {
            _id: { type: 'string', example: '60d5ecb54b24a12a5c8e4f1b' },
            nome: { type: 'string', example: 'Fornecedor ABC Ltda' },
            cnpj: { type: 'string', example: '12.345.678/0001-90' },
            email: { type: 'string', example: 'contato@fornecedorabc.com' },
            telefone: { type: 'string', example: '(11) 9999-9999' }
        }
    }
};

export default fornecedorSchemas;
