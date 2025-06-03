import FornecedorFilterBuilder from '../../../repositories/filters/FornecedorFilterBuilder.js';

describe('FornecedorFilterBuilder', () => {
    let fornecedorFilterBuilder;

    beforeEach(() => {
        fornecedorFilterBuilder = new FornecedorFilterBuilder();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        test('deve inicializar com filtros vazios', () => {
            const filtros = fornecedorFilterBuilder.build();
            expect(filtros).toEqual({});
        });
    });

    describe('comNome', () => {
        test('deve adicionar filtro de nome quando valor é válido', () => {
            fornecedorFilterBuilder.comNome('Fornecedor A');
            const filtros = fornecedorFilterBuilder.build();

            expect(filtros).toHaveProperty('nome_fornecedor');
            expect(filtros.nome_fornecedor).toEqual({ $regex: 'Fornecedor A', $options: 'i' });
        });

        test('não deve adicionar filtro de nome quando valor é vazio', () => {
            fornecedorFilterBuilder.comNome('');
            const filtros = fornecedorFilterBuilder.build();

            expect(filtros).not.toHaveProperty('nome_fornecedor');
        });
    });

    describe('comCnpj', () => {
        test('deve adicionar filtro de CNPJ quando valor é válido', () => {
            fornecedorFilterBuilder.comCnpj('12.345.678/0001-99');
            const filtros = fornecedorFilterBuilder.build();

            expect(filtros).toHaveProperty('cnpj');
            expect(filtros.cnpj).toEqual({ $regex: '12.345.678/0001-99', $options: 'i' });
        });

        test('não deve adicionar filtro de CNPJ quando valor é vazio', () => {
            fornecedorFilterBuilder.comCnpj('');
            const filtros = fornecedorFilterBuilder.build();

            expect(filtros).not.toHaveProperty('cnpj');
        });
    });

    describe('comEmail', () => {
        test('deve adicionar filtro de email quando valor é válido', () => {
            fornecedorFilterBuilder.comEmail('teste@exemplo.com');
            const filtros = fornecedorFilterBuilder.build();

            expect(filtros).toHaveProperty('email');
            expect(filtros.email).toEqual({ $regex: 'teste@exemplo.com', $options: 'i' });
        });

        test('não deve adicionar filtro de email quando valor é vazio', () => {
            fornecedorFilterBuilder.comEmail('');
            const filtros = fornecedorFilterBuilder.build();

            expect(filtros).not.toHaveProperty('email');
        });
    });

    describe('comTelefone', () => {
        test('deve adicionar filtro de telefone quando valor é válido', () => {
            fornecedorFilterBuilder.comTelefone('11999999999');
            const filtros = fornecedorFilterBuilder.build();

            expect(filtros).toHaveProperty('telefone');
            expect(filtros.telefone).toEqual({ $regex: '11999999999', $options: 'i' });
        });
    });

    describe('comCidade', () => {
        test('deve adicionar filtro de cidade no array endereco', () => {
            fornecedorFilterBuilder.comCidade('São Paulo');
            const filtros = fornecedorFilterBuilder.build();

            expect(filtros).toHaveProperty('endereco.cidade');
            expect(filtros['endereco.cidade']).toEqual({ $regex: 'São Paulo', $options: 'i' });
        });
    });

    describe('comEstado', () => {
        test('deve adicionar filtro de estado no array endereco', () => {
            fornecedorFilterBuilder.comEstado('SP');
            const filtros = fornecedorFilterBuilder.build();

            expect(filtros).toHaveProperty('endereco.estado');
            expect(filtros['endereco.estado']).toEqual({ $regex: 'SP', $options: 'i' });
        });
    });

    test('deve permitir encadeamento de filtros', () => {
        const filtros = fornecedorFilterBuilder
            .comNome('Fornecedor A')
            .comCnpj('12345678000199')
            .comEmail('teste@exemplo.com')
            .comTelefone('11999999999')
            .comCidade('São Paulo')
            .comEstado('SP')
            .build();

        expect(filtros).toEqual({
            nome_fornecedor: { $regex: 'Fornecedor A', $options: 'i' },
            cnpj: { $regex: '12345678000199', $options: 'i' },
            email: { $regex: 'teste@exemplo.com', $options: 'i' },
            telefone: { $regex: '11999999999', $options: 'i' },
            'endereco.cidade': { $regex: 'São Paulo', $options: 'i' },
            'endereco.estado': { $regex: 'SP', $options: 'i' },
        });
    });
});
