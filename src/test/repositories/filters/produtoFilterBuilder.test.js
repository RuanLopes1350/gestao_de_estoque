import ProdutoFilterBuilder from '../../../repositories/filters/ProdutoFilterBuilder.js';

describe('ProdutoFilterBuilder', () => {
    let produtoFilterBuilder;

    beforeEach(() => {
        produtoFilterBuilder = new ProdutoFilterBuilder();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        test('deve inicializar com filtros vazios', () => {
            const filtros = produtoFilterBuilder.build();
            expect(filtros).toEqual({});
        });
    });

    describe('comNome', () => {
        test('deve adicionar filtro de nome quando valor é válido', () => {
            produtoFilterBuilder.comNome('Teclado');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('nome_produto');
            expect(filtros.nome_produto).toEqual({ $regex: 'Teclado', $options: 'i' });
        });

        test('não deve adicionar filtro de nome quando valor é vazio', () => {
            produtoFilterBuilder.comNome('');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).not.toHaveProperty('nome_produto');
        });

        test('não deve adicionar filtro de nome quando valor é undefined', () => {
            produtoFilterBuilder.comNome(undefined);
            const filtros = produtoFilterBuilder.build();

            expect(filtros).not.toHaveProperty('nome_produto');
        });
    });

    describe('comCategoria', () => {
        test('deve adicionar filtro de categoria quando valor é válido', () => {
            produtoFilterBuilder.comCategoria('A');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('categoria');
            expect(filtros.categoria).toEqual({ $regex: 'A', $options: 'i' });
        });

        test('não deve adicionar filtro de categoria quando valor é vazio', () => {
            produtoFilterBuilder.comCategoria('');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).not.toHaveProperty('categoria');
        });
    });

    describe('comCodigo', () => {
        test('deve adicionar filtro de código quando valor é válido', () => {
            produtoFilterBuilder.comCodigo('PROD123');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('codigo_produto');
            expect(filtros.codigo_produto).toEqual({ $regex: 'PROD123', $options: 'i' });
        });

        test('não deve adicionar filtro de código quando valor é vazio', () => {
            produtoFilterBuilder.comCodigo('');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).not.toHaveProperty('codigo_produto');
        });
    });

    describe('comPrecoMinimo', () => {
        test('deve adicionar filtro de preço mínimo quando valor é válido', () => {
            produtoFilterBuilder.comPrecoMinimo(100);
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('preco');
            expect(filtros.preco).toHaveProperty('$gte', 100);
        });

        test('deve adicionar filtro de preço mínimo quando valor é uma string numérica', () => {
            produtoFilterBuilder.comPrecoMinimo('50');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('preco');
            expect(filtros.preco).toHaveProperty('$gte', 50);
        });

        test('não deve adicionar filtro de preço mínimo quando valor não é numérico', () => {
            produtoFilterBuilder.comPrecoMinimo('abc');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).not.toHaveProperty('preco');
        });

        test('não deve adicionar filtro de preço mínimo quando valor é null', () => {
            produtoFilterBuilder.comPrecoMinimo(null);
            const filtros = produtoFilterBuilder.build();

            expect(filtros).not.toHaveProperty('preco');
        });
    });

    describe('comPrecoMaximo', () => {
        test('deve adicionar filtro de preço máximo quando valor é válido', () => {
            produtoFilterBuilder.comPrecoMaximo(500);
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('preco');
            expect(filtros.preco).toHaveProperty('$lte', 500);
        });

        test('deve manter ambos filtros quando preço mínimo e máximo são definidos', () => {
            produtoFilterBuilder.comPrecoMinimo(100);
            produtoFilterBuilder.comPrecoMaximo(500);
            const filtros = produtoFilterBuilder.build();

            expect(filtros.preco).toEqual({ $gte: 100, $lte: 500 });
        });
    });

    describe('comEstoqueMinimo', () => {
        test('deve adicionar filtro de estoque mínimo quando valor é válido', () => {
            produtoFilterBuilder.comEstoqueMinimo(10);
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('estoque');
            expect(filtros.estoque).toHaveProperty('$gte', 10);
        });
    });

    describe('comFornecedor', () => {
        test('deve adicionar filtro de fornecedor quando valor é válido', () => {
            produtoFilterBuilder.comFornecedor('123');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('id_fornecedor', '123');
        });

        test('não deve adicionar filtro de fornecedor quando valor é vazio', () => {
            produtoFilterBuilder.comFornecedor('');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).not.toHaveProperty('id_fornecedor');
        });
    });

    describe('comStatus', () => {
        test('deve adicionar filtro de status como true quando valor é "true"', () => {
            produtoFilterBuilder.comStatus('true');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('status', true);
        });

        test('deve adicionar filtro de status como false quando valor é "false"', () => {
            produtoFilterBuilder.comStatus('false');
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('status', false);
        });

        test('deve adicionar filtro de status diretamente quando valor é booleano', () => {
            produtoFilterBuilder.comStatus(true);
            const filtros = produtoFilterBuilder.build();

            expect(filtros).toHaveProperty('status', true);
        });

        test('não deve adicionar filtro de status quando valor é undefined', () => {
            produtoFilterBuilder.comStatus(undefined);
            const filtros = produtoFilterBuilder.build();

            expect(filtros).not.toHaveProperty('status');
        });
    });

    test('deve permitir encadeamento de filtros', () => {
        const filtros = produtoFilterBuilder
            .comNome('Teclado')
            .comCategoria('A')
            .comCodigo('TEC123')
            .comPrecoMinimo(50)
            .comPrecoMaximo(150)
            .comEstoqueMinimo(10)
            .comFornecedor('456')
            .comStatus(true)
            .build();

        expect(filtros).toEqual({
            nome_produto: { $regex: 'Teclado', $options: 'i' },
            categoria: { $regex: 'A', $options: 'i' },
            codigo_produto: { $regex: 'TEC123', $options: 'i' },
            preco: { $gte: 50, $lte: 150 },
            estoque: { $gte: 10 },
            id_fornecedor: '456',
            status: true
        });
    });
});