
// Se quiser mockar totalmente os Models para evitar abrir conexões Mongoose:
jest.mock('../../../../models/Grupo.js', () => ({}));
jest.mock('../../../../models/Unidade.js', () => ({}));
jest.mock('../../../../models/Usuario.js', () => ({}));
// Caso algum outro model (ex.: Rota.js) seja carregado indiretamente e inicie conexão:
jest.mock('../../../../models/Rota.js', () => ({}));

import mongoose from 'mongoose'; // Importa para que possamos desconectar ao final, se necessário
import UsuarioFilterBuilder from '../../../../repositories/filters/UsuarioFilterBuilder.js';

describe('UsuarioFilterBuilder (Jest)', () => {
    let builder;

    beforeEach(() => {
        builder = new UsuarioFilterBuilder();
    });

    afterEach(() => {
        // Reseta todos os mocks/spies do Jest após cada teste
        jest.clearAllMocks();
    });

    describe('comNome', () => {
        test('deve setar filtro de nome quando comNome é chamado', () => {
            builder.comNome('John');
            const filtros = builder.build();

            expect(filtros).toHaveProperty('nome');
            expect(filtros.nome).toEqual({ $regex: 'John', $options: 'i' });
        });

        test('não deve setar filtro de nome se for vazio ou undefined', () => {
            builder.comNome('');
            builder.comNome(undefined);
            const filtros = builder.build();
            expect(filtros).not.toHaveProperty('nome');
        });
    });

    describe('comEmail', () => {
        test('deve setar filtro de email quando comEmail é chamado', () => {
            builder.comEmail('teste@example.com');
            const filtros = builder.build();

            expect(filtros).toHaveProperty('email');
            expect(filtros.email).toEqual({ $regex: 'teste@example.com', $options: 'i' });
        });

        test('não deve setar filtro de email se for vazio ou undefined', () => {
            builder.comEmail('');
            builder.comEmail(undefined);
            const filtros = builder.build();
            expect(filtros).not.toHaveProperty('email');
        });
    });

    describe('comAtivo', () => {
        test('deve setar ativo como true quando valor é "true"', () => {
            builder.comAtivo('true');
            const filtros = builder.build();
            expect(filtros).toHaveProperty('ativo', true);
        });

        test('deve setar ativo como false quando valor é "false"', () => {
            builder.comAtivo('false');
            const filtros = builder.build();
            expect(filtros).toHaveProperty('ativo', false);
        });

        test('não deve setar ativo quando valor é inválido', () => {
            builder.comAtivo('invalido');
            const filtros = builder.build();
            expect(filtros).not.toHaveProperty('ativo');
        });

        test('não deve setar ativo quando valor é undefined', () => {
            builder.comAtivo(undefined);
            const filtros = builder.build();
            expect(filtros).not.toHaveProperty('ativo');
        });
    });

    describe('comGrupo', () => {
        test('deve setar filtro de grupos com 1 grupo encontrado', async () => {
            // Espionar o método "buscarPorNome" da instância real
            jest
                .spyOn(builder.grupoRepository, 'buscarPorNome')
                .mockResolvedValueOnce({ _id: 'group1' });

            await builder.comGrupo('admin');
            const filtros = builder.build();

            expect(builder.grupoRepository.buscarPorNome).toHaveBeenCalledWith('admin');
            expect(filtros).toHaveProperty('grupos');
            expect(filtros.grupos).toEqual({ $in: ['group1'] });
        });

        test('deve setar filtro de grupos com array quando vários grupos são encontrados', async () => {
            jest
                .spyOn(builder.grupoRepository, 'buscarPorNome')
                .mockResolvedValueOnce([{ _id: 'group1' }, { _id: 'group2' }]);

            await builder.comGrupo('user');
            const filtros = builder.build();

            expect(builder.grupoRepository.buscarPorNome).toHaveBeenCalledWith('user');
            expect(filtros).toHaveProperty('grupos', { $in: ['group1', 'group2'] });
        });

        test('deve setar filtro de grupos vazio quando nenhum grupo for encontrado', async () => {
            jest.spyOn(builder.grupoRepository, 'buscarPorNome').mockResolvedValueOnce(null);

            await builder.comGrupo('desconhecido');
            const filtros = builder.build();

            expect(builder.grupoRepository.buscarPorNome).toHaveBeenCalledWith('desconhecido');
            expect(filtros).toHaveProperty('grupos', { $in: [] });
        });

        test('não deve modificar os filtros se grupo for falsy', async () => {
            // Passando um valor falsy (ex.: null)
            await builder.comGrupo(null);
            const filtros = builder.build();
            expect(filtros).not.toHaveProperty('grupos');
        });
    });

    describe('comUnidade', () => {
        test('deve setar filtro de unidades com 1 unidade encontrada', async () => {
            jest
                .spyOn(builder.unidadeRepository, 'buscarPorNome')
                .mockResolvedValueOnce({ _id: 'unit1' });

            await builder.comUnidade('central');
            const filtros = builder.build();

            expect(builder.unidadeRepository.buscarPorNome).toHaveBeenCalledWith('central');
            expect(filtros).toHaveProperty('unidades', { $in: ['unit1'] });
        });

        test('deve setar filtro de unidades com array quando várias unidades são encontradas', async () => {
            jest
                .spyOn(builder.unidadeRepository, 'buscarPorNome')
                .mockResolvedValueOnce([{ _id: 'unit1' }, { _id: 'unit2' }]);

            await builder.comUnidade('office');
            const filtros = builder.build();

            expect(builder.unidadeRepository.buscarPorNome).toHaveBeenCalledWith('office');
            expect(filtros).toHaveProperty('unidades', { $in: ['unit1', 'unit2'] });
        });

        test('deve setar filtro de unidades vazio quando nenhuma unidade for encontrada', async () => {
            jest.spyOn(builder.unidadeRepository, 'buscarPorNome').mockResolvedValueOnce(null);

            await builder.comUnidade('desconhecida');
            const filtros = builder.build();

            expect(builder.unidadeRepository.buscarPorNome).toHaveBeenCalledWith('desconhecida');
            expect(filtros).toHaveProperty('unidades', { $in: [] });
        });

        test('não deve modificar os filtros se unidade for falsy', async () => {
            await builder.comUnidade('');
            const filtros = builder.build();
            expect(filtros).not.toHaveProperty('unidades');
        });
    });

    describe('escapeRegex', () => {
        test('deve escapar caracteres especiais corretamente', () => {
            const input = 'a+b(c)';
            const escaped = builder.escapeRegex(input);
            expect(escaped).toBe('a\\+b\\(c\\)');
        });

        test('deve retornar string vazia quando passada string vazia', () => {
            const escaped = builder.escapeRegex('');
            expect(escaped).toBe('');
        });
    });

    test('deve permitir encadeamento de filtros', async () => {
        // Espionar os métodos de busca
        jest.spyOn(builder.grupoRepository, 'buscarPorNome').mockResolvedValueOnce({ _id: 'group1' });
        jest.spyOn(builder.unidadeRepository, 'buscarPorNome').mockResolvedValueOnce({ _id: 'unit1' });

        // Métodos síncronos encadeados
        builder.comNome('John')
            .comEmail('john@example.com')
            .comAtivo('true');

        // Aguarde cada método assíncrono separadamente
        await builder.comGrupo('admin');
        await builder.comUnidade('central');

        const filtros = builder.build();

        expect(filtros.nome).toEqual({ $regex: 'John', $options: 'i' });
        expect(filtros.email).toEqual({ $regex: 'john@example.com', $options: 'i' });
        expect(filtros.ativo).toBe(true);
        expect(filtros.grupos).toEqual({ $in: ['group1'] });
        expect(filtros.unidades).toEqual({ $in: ['unit1'] });
    });

    // Após todos os testes, desconectamos o Mongoose para evitar handles abertos
    afterAll(async () => {
        await mongoose.disconnect();
    });
});
