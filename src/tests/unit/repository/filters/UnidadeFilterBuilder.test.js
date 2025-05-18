import assert from 'assert';
import UnidadeFilterBuilder from '../../../../../src/repositories/filters/UnidadeFilterBuilder.js';

describe('UnidadeFilterBuilder', () => {
    let builder;

    beforeEach(() => {
        builder = new UnidadeFilterBuilder();
    });

    it('deve inicializar com filtros vazios', () => {
        const filtros = builder.build();
        assert.deepStrictEqual(filtros, {}, 'Os filtros devem estar vazios');
    });

    it('deve adicionar filtro de nome quando comNome é chamado com um nome', () => {
        const name = 'testName';
        builder.comNome(name);
        const filtros = builder.build();
        assert.ok(filtros.hasOwnProperty('nome'), 'Deve possuir a propriedade "nome"');
        assert.deepStrictEqual(filtros.nome, { $regex: name, $options: 'i' }, 'O filtro "nome" deve estar correto');
    });

    it('não deve adicionar filtro de nome quando comNome é chamado com um nome vazio', () => {
        builder.comNome('');
        const filtros = builder.build();
        assert.ok(!filtros.hasOwnProperty('nome'), 'Não deve possuir a propriedade "nome"');
    });

    it('deve adicionar filtro de localidade quando comLocalidade é chamado com uma localidade', () => {
        const localidade = 'testLocalidade';
        builder.comLocalidade(localidade);
        const filtros = builder.build();
        assert.ok(filtros.hasOwnProperty('localidade'), 'Deve possuir a propriedade "localidade"');
        assert.deepStrictEqual(filtros.localidade, { $regex: localidade, $options: 'i' }, 'O filtro "localidade" deve estar correto');
    });

    it('não deve adicionar filtro de localidade quando comLocalidade é chamado com uma localidade vazia', () => {
        builder.comLocalidade('');
        const filtros = builder.build();
        assert.ok(!filtros.hasOwnProperty('localidade'), 'Não deve possuir a propriedade "localidade"');
    });

    it('deve adicionar filtro de ativo quando comAtivo é chamado com "true"', () => {
        builder.comAtivo('true');
        const filtros = builder.build();
        assert.strictEqual(filtros.ativo, true, 'O filtro "ativo" deve ser true');
    });

    it('deve adicionar filtro de ativo quando comAtivo é chamado com "false"', () => {
        builder.comAtivo('false');
        const filtros = builder.build();
        assert.strictEqual(filtros.ativo, false, 'O filtro "ativo" deve ser false');
    });

    it('não deve adicionar filtro de ativo quando comAtivo é chamado com um valor inválido', () => {
        builder.comAtivo('invalid');
        const filtros = builder.build();
        assert.ok(!filtros.hasOwnProperty('ativo'), 'Não deve possuir a propriedade "ativo"');
    });
});
