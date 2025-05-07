import { Fornecedor } from "../models/Fornecedor";

class FornecedoresRepository {
    constructor({ model = Fornecedor} = {}) {
        this.model = model;
    }

    
}