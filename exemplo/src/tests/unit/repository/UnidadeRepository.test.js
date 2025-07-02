import assert from 'assert';
import sinon from 'sinon';
import UnidadeRepository from '../../../repositories/UnidadeRepository.js';
import UnidadeModel from '../../../models/Unidade.js';
import UnidadeFilterBuilder from '../../../repositories/filters/UnidadeFilterBuilder.js';

describe('UnidadeRepository', () => {
    let unidadeRepository;
    let sandbox;

    beforeEach(() => {
        unidadeRepository = new UnidadeRepository();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('listar', () => {
        it('deve listar unidades por id', async () => {
            const req = { params: { id: '123' } };
            const mockUnit = { _id: '123', nome: 'Unit 1' };
            sandbox.stub(UnidadeModel, 'findById').resolves(mockUnit);

            const result = await unidadeRepository.listar(req);

            assert.deepStrictEqual(result, mockUnit, 'O resultado deve ser igual ao mockUnit');
            assert.strictEqual(UnidadeModel.findById.calledOnceWith('123'), true, 'findById deve ser chamado uma vez com id "123"');
        });

        it('deve listar unidades com filtros', async () => {
            const req = { query: { nome: 'Unit', localidade: 'Location', ativo: 'true', page: 1, limite: 10 } };
            const mockUnits = [{ _id: '123', nome: 'Unit 1' }];
            const mockPaginate = sandbox.stub(UnidadeModel, 'paginate').resolves(mockUnits);
            const mockFilterBuilder = sandbox.stub(UnidadeFilterBuilder.prototype, 'build').returns({ nome: 'Unit', localidade: 'Location', ativo: 'true' });

            const result = await unidadeRepository.listar(req);

            assert.deepStrictEqual(result, mockUnits, 'O resultado deve ser igual a mockUnits');
            assert.strictEqual(mockPaginate.calledOnce, true, 'paginate deve ser chamado uma vez');
            assert.strictEqual(mockFilterBuilder.calledOnce, true, 'build deve ser chamado uma vez');
        });

        it('deve tratar erros', async () => {
            const req = {};
            sandbox.stub(UnidadeModel, 'paginate').throws(new Error('Error'));

            try {
                await unidadeRepository.listar(req);
                assert.fail('A chamada deveria ter lançado um erro');
            } catch (error) {
                assert.strictEqual(error.message, 'Error', 'A mensagem do erro deve ser "Error"');
            }
        });
    });

    describe('criar', () => {
        it('deve criar uma unidade', async () => {
            const dadosUnidade = { nome: 'Unit 1', localidade: 'Location 1' }; // Adicionado 'localidade'
            const mockUnit = { _id: '123', nome: 'Unit 1', localidade: 'Location 1' };
            sandbox.stub(UnidadeModel.prototype, 'save').resolves(mockUnit); // Stub do método 'save'

            const result = await unidadeRepository.criar(dadosUnidade);

            assert.deepStrictEqual(result, mockUnit, 'O resultado deve ser igual ao mockUnit');
            assert.strictEqual(UnidadeModel.prototype.save.calledOnce, true, 'save deve ser chamado uma vez');
        });

        it('deve tratar erros ao criar uma unidade', async () => {
            const dadosUnidade = { nome: 'Unit 1', localidade: 'Location 1' }; // Adicionado 'localidade'
            sandbox.stub(UnidadeModel.prototype, 'save').throws(new Error('Error')); // Stub para lançar erro

            try {
                await unidadeRepository.criar(dadosUnidade);
                assert.fail('A chamada deveria ter lançado um erro');
            } catch (error) {
                assert.strictEqual(error.message, 'Error', 'A mensagem do erro deve ser "Error"');
            }
        });
    });

    describe('atualizar', () => {
        it('deve atualizar uma unidade', async () => {
            const id = '123';
            const dadosAtualizados = { nome: 'Updated Unit' };
            const mockUnit = { _id: '123', nome: 'Updated Unit' };
            sandbox.stub(UnidadeModel, 'findByIdAndUpdate').resolves(mockUnit);

            const result = await unidadeRepository.atualizar(id, dadosAtualizados);

            assert.deepStrictEqual(result, mockUnit, 'O resultado deve ser igual ao mockUnit');
            assert.strictEqual(
                UnidadeModel.findByIdAndUpdate.calledOnceWith(id, dadosAtualizados, { new: true }),
                true,
                'findByIdAndUpdate deve ser chamado uma vez com os parâmetros corretos'
            );
        });

        it('deve tratar erros ao atualizar uma unidade', async () => {
            const id = '123';
            const dadosAtualizados = { nome: 'Updated Unit' };
            sandbox.stub(UnidadeModel, 'findByIdAndUpdate').throws(new Error('Error'));

            try {
                await unidadeRepository.atualizar(id, dadosAtualizados);
                assert.fail('A chamada deveria ter lançado um erro');
            } catch (error) {
                assert.strictEqual(error.message, 'Error', 'A mensagem do erro deve ser "Error"');
            }
        });
    });

    describe('deletar', () => {
        it('deve deletar uma unidade', async () => {
            const id = '123';
            const mockUnit = { _id: '123', nome: 'Unit 1' };
            sandbox.stub(UnidadeModel, 'findByIdAndDelete').resolves(mockUnit);

            const result = await unidadeRepository.deletar(id);

            assert.deepStrictEqual(result, mockUnit, 'O resultado deve ser igual ao mockUnit');
            assert.strictEqual(UnidadeModel.findByIdAndDelete.calledOnceWith(id), true, 'findByIdAndDelete deve ser chamado uma vez com o id correto');
        });

        it('deve tratar erros ao deletar uma unidade', async () => {
            const id = '123';
            sandbox.stub(UnidadeModel, 'findByIdAndDelete').throws(new Error('Error'));

            try {
                await unidadeRepository.deletar(id);
                assert.fail('A chamada deveria ter lançado um erro');
            } catch (error) {
                assert.strictEqual(error.message, 'Error', 'A mensagem do erro deve ser "Error"');
            }
        });
    });

    describe('buscarUnidade', () => {
        it('deve encontrar uma unidade por nome e localidade', async () => {
            const nome = 'Unit 1';
            const localidade = 'Location 1';
            const mockUnit = { _id: '123', nome: 'Unit 1', localidade: 'Location 1' };
            sandbox.stub(UnidadeModel, 'findOne').resolves(mockUnit);

            const result = await UnidadeRepository.buscarUnidade(nome, localidade);

            assert.deepStrictEqual(result, mockUnit, 'O resultado deve ser igual ao mockUnit');
            assert.strictEqual(
                UnidadeModel.findOne.calledOnceWith({ nome, localidade }),
                true,
                'findOne deve ser chamado uma vez com os parâmetros corretos'
            );
        });




    });
});
