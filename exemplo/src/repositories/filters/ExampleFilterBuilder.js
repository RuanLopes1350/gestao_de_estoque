// src/repositories/filters/ExampleFilterBuilder.js

class ExampleFilterBuilder {
    constructor() {
        this.filtros = {};
    }

    comNome(nome) {
        if (nome) {
            this.filtros.nome = { $regex: nome, $options: 'i' };
        }
        return this;
    }

    comCodigo(codigo) {
        if (codigo) {
            this.filtros.codigo = { $regex: codigo, $options: 'i' };
        }
        return this;
    }

    comDescricao(descricao) {
        if (descricao) {
            this.filtros.descricao = { $regex: descricao, $options: 'i' };
        }
        return this;
    }

    build() {
        return this.filtros;
    }
}

export default ExampleFilterBuilder;
