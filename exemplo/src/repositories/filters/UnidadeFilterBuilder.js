import UnidadeModel from '../../models/Unidade.js';

class UnidadeFilterBuilder {
    constructor() {
        this.filtros = {};
    }

    comNome(nome) {
        if (nome) {
            this.filtros.nome = { $regex: nome, $options: 'i' }; // Filtro para nome usando regex (case-insensitive)
        }
        return this;
    }

    comLocalidade(localidade) {
        if (localidade) {
            this.filtros.localidade = { $regex: localidade, $options: 'i' }; // Filtro para localidade usando regex (case-insensitive)
        }
        return this;
    }

    comAtivo(ativo) {
        if (ativo === 'true') {
            this.filtros.ativo = true;
        } else if (ativo === 'false') {
            this.filtros.ativo = false;
        }
        return this;
    }

    build() {
        return this.filtros;
    }
}

export default UnidadeFilterBuilder;
