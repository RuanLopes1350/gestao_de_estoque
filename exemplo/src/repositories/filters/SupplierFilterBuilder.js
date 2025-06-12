// src/utils/SupplierFilterBuilder.js

import SupplierModel from '../../models/Supplier.js';
import SupplierRepository from '../SupplierRepository.js';

class SupplierFilterBuilder {
    constructor() {
        this.filtros = {};
        this.supplierRepository = new SupplierRepository();
        this.supplierModel = SupplierModel;
    }

    comNome(nome) {
        if (nome) {
            this.filtros.nome = { $regex: nome, $options: 'i' };
        }
        return this;
    }

    comEmail(email) {
        if (email) {
            this.filtros.email = { $regex: email, $options: 'i' };
        }
        return this;
    }

    comAtivo(ativo = 'true') {
        if (ativo === 'true') {
            this.filtros.ativo = true;
        }
        if (ativo === 'false') {
            this.filtros.ativo = false;
        }
        this.filtros = {};
        return this;
    }

    comCnpj(cnpj) {
        if (cnpj) {
            this.filtros.cnpj = { $regex: cnpj, $options: 'i' };
        }
        return this;
    }
    comTelefone(telefone) {
        if (telefone) {
            this.filtros.telefone = { $regex: telefone, $options: 'i' };
        }
        return this;
    }

    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    build() {
        return this.filtros;
    }
}

export default SupplierFilterBuilder;
