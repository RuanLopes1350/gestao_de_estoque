// src/tests/unit/utils/validators/schemas/zod/PermissaoValidation.test.js

import { PermissaoSchema, PermissoesArraySchema } from '../../../../../../utils/validators/schemas/zod/PermissaoValidation.js';
import { ZodError } from 'zod';

describe('PermissaoSchema', () => {
    it('deve validar um objeto de permissão válido', () => {
        const validPermission = {
            rota: 'someRoute',
            dominio: 'someDomain',
            ativo: true,
            buscar: true,
            enviar: false,
            substituir: true,
            modificar: false,
            excluir: true,
        };
        expect(() => PermissaoSchema.parse(validPermission)).not.toThrow();
    });

    it('deve validar um objeto de permissão sem domínio', () => {
        const validPermission = {
            rota: 'someRoute',
            // dominio é opcional agora
            ativo: true,
            buscar: true,
            enviar: false,
            substituir: true,
            modificar: false,
            excluir: true,
        };
        expect(() => PermissaoSchema.parse(validPermission)).not.toThrow();
    });

    it('deve invalidar um objeto de permissão inválido', () => {
        const invalidPermission = {
            rota: 'someRoute',
            dominio: 'someDomain',
            ativo: 'true', // deveria ser booleano
        };
        expect(() => PermissaoSchema.parse(invalidPermission)).toThrow(ZodError);
    });

    it('deve invalidar um objeto de permissão sem rota', () => {
        const invalidPermission = {
            dominio: 'someDomain',
            ativo: true,
            buscar: true,
        };
        expect(() => PermissaoSchema.parse(invalidPermission)).toThrow(ZodError);
    });
});

describe('PermissoesArraySchema', () => {
    it('deve validar um array de permissões únicas', () => {
        const validPermissionsArray = [
            { rota: 'route1', dominio: 'domain1', ativo: true },
            { rota: 'route2', dominio: 'domain2', buscar: true },
        ];
        expect(() => PermissoesArraySchema.parse(validPermissionsArray)).not.toThrow();
    });

    it('deve invalidar um array com permissões duplicadas', () => {
        const invalidPermissionsArray = [
            { rota: 'route1', dominio: 'domain1', ativo: true },
            { rota: 'route1', dominio: 'domain1', buscar: true },
        ];
        expect(() => PermissoesArraySchema.parse(invalidPermissionsArray)).toThrow('Permissões duplicadas: rota + domínio devem ser únicos dentro do array.');
    });

    it('deve validar um array com domínios diferentes para a mesma rota', () => {
        const validPermissionsArray = [
            { rota: 'route1', dominio: 'domain1', ativo: true },
            { rota: 'route1', dominio: 'domain2', buscar: true },
        ];
        expect(() => PermissoesArraySchema.parse(validPermissionsArray)).not.toThrow();
    });

    it('deve validar um array com domínio indefinido', () => {
        const validPermissionsArray = [
            { rota: 'route1', ativo: true },
            { rota: 'route2', buscar: true },
        ];
        expect(() => PermissoesArraySchema.parse(validPermissionsArray)).not.toThrow();
    });

    it('deve invalidar um array com domínios indefinidos duplicados', () => {
        const invalidPermissionsArray = [
            { rota: 'route1', ativo: true },
            { rota: 'route1', buscar: true },
        ];
        expect(() => PermissoesArraySchema.parse(invalidPermissionsArray)).toThrow('Permissões duplicadas: rota + domínio devem ser únicos dentro do array.');
    });

    // **Testes Adicionais para Cobertura Completa**

    it('deve invalidar um array com uma permissão sem rota', () => {
        const invalidPermissionsArray = [
            { dominio: 'domain1', ativo: true },
            { rota: 'route2', dominio: 'domain2', buscar: true },
        ];
        expect(() => PermissoesArraySchema.parse(invalidPermissionsArray)).toThrow(ZodError);
    });

    it('deve invalidar um array com uma permissão sem rota e domínio', () => {
        const invalidPermissionsArray = [
            { ativo: true },
            { rota: 'route2', dominio: 'domain2', buscar: true },
        ];
        expect(() => PermissoesArraySchema.parse(invalidPermissionsArray)).toThrow(ZodError);
    });

    it('deve invalidar um array com tipos incorretos', () => {
        const invalidPermissionsArray = [
            { rota: 'route1', dominio: 'domain1', ativo: 'yes' }, // ativo deveria ser booleano
            { rota: 'route2', dominio: 'domain2', buscar: 'true' }, // buscar deveria ser booleano
        ];
        expect(() => PermissoesArraySchema.parse(invalidPermissionsArray)).toThrow(ZodError);
    });

    it('deve validar um array vazio', () => {
        const validPermissionsArray = [];
        expect(() => PermissoesArraySchema.parse(validPermissionsArray)).not.toThrow();
    });
});
