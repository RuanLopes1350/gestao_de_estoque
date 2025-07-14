// tests/repositories/filters/UsuarioFilterBuilder.test.js

import UsuarioFilterBuilder from '../../../src/repositories/filters/UsuarioFilterBuilder.js';

describe('UsuarioFilterBuilder', () => {
    let filterBuilder;

    beforeEach(() => {
        filterBuilder = new UsuarioFilterBuilder();
    });

    describe('Constructor', () => {
        test('should initialize with empty filters object', () => {
            expect(filterBuilder.filters).toEqual({});
        });
    });

    describe('comNome', () => {
        test('should add nome filter when nome is provided', () => {
            const result = filterBuilder.comNome('João');
            
            expect(result).toBe(filterBuilder); // Should return this for chaining
            expect(filterBuilder.filters.nome_usuario).toEqual({
                $regex: 'João',
                $option: 'i'
            });
        });

        test('should not add nome filter when nome is empty string', () => {
            filterBuilder.comNome('');
            
            expect(filterBuilder.filters.nome_usuario).toBeUndefined();
        });

        test('should not add nome filter when nome is only whitespace', () => {
            filterBuilder.comNome('   ');
            
            expect(filterBuilder.filters.nome_usuario).toBeUndefined();
        });

        test('should not add nome filter when nome is null', () => {
            filterBuilder.comNome(null);
            
            expect(filterBuilder.filters.nome_usuario).toBeUndefined();
        });

        test('should not add nome filter when nome is undefined', () => {
            filterBuilder.comNome(undefined);
            
            expect(filterBuilder.filters.nome_usuario).toBeUndefined();
        });

        test('should trim nome before adding filter', () => {
            filterBuilder.comNome('  João  ');
            
            expect(filterBuilder.filters.nome_usuario).toEqual({
                $regex: '  João  ',
                $option: 'i'
            });
        });
    });

    describe('comMatricula', () => {
        test('should add matricula filter when matricula is provided', () => {
            const result = filterBuilder.comMatricula('12345');
            
            expect(result).toBe(filterBuilder); // Should return this for chaining
            expect(filterBuilder.filters.matricula).toEqual({
                $regex: '12345',
                $option: 'i'
            });
        });

        test('should not add matricula filter when matricula is empty string', () => {
            filterBuilder.comMatricula('');
            
            expect(filterBuilder.filters.matricula).toBeUndefined();
        });

        test('should not add matricula filter when matricula is only whitespace', () => {
            filterBuilder.comMatricula('   ');
            
            expect(filterBuilder.filters.matricula).toBeUndefined();
        });

        test('should not add matricula filter when matricula is null', () => {
            filterBuilder.comMatricula(null);
            
            expect(filterBuilder.filters.matricula).toBeUndefined();
        });

        test('should not add matricula filter when matricula is undefined', () => {
            filterBuilder.comMatricula(undefined);
            
            expect(filterBuilder.filters.matricula).toBeUndefined();
        });
    });

    describe('comEmail', () => {
        test('should add email filter when email is provided', () => {
            const result = filterBuilder.comEmail('test@example.com');
            
            expect(result).toBe(filterBuilder); // Should return this for chaining
            expect(filterBuilder.filters.email).toEqual({
                $regex: 'test@example.com',
                $option: 'i'
            });
        });

        test('should not add email filter when email is empty string', () => {
            filterBuilder.comEmail('');
            
            expect(filterBuilder.filters.email).toBeUndefined();
        });

        test('should not add email filter when email is only whitespace', () => {
            filterBuilder.comEmail('   ');
            
            expect(filterBuilder.filters.email).toBeUndefined();
        });

        test('should not add email filter when email is null', () => {
            filterBuilder.comEmail(null);
            
            expect(filterBuilder.filters.email).toBeUndefined();
        });

        test('should not add email filter when email is undefined', () => {
            filterBuilder.comEmail(undefined);
            
            expect(filterBuilder.filters.email).toBeUndefined();
        });
    });

    describe('comCargo', () => {
        test('should add cargo filter when cargo is provided', () => {
            const result = filterBuilder.comCargo('Desenvolvedor');
            
            expect(result).toBe(filterBuilder); // Should return this for chaining
            expect(filterBuilder.filters.cargo).toEqual({
                $regex: 'Desenvolvedor',
                $option: 'i'
            });
        });

        test('should not add cargo filter when cargo is empty string', () => {
            filterBuilder.comCargo('');
            
            expect(filterBuilder.filters.cargo).toBeUndefined();
        });

        test('should not add cargo filter when cargo is only whitespace', () => {
            filterBuilder.comCargo('   ');
            
            expect(filterBuilder.filters.cargo).toBeUndefined();
        });

        test('should not add cargo filter when cargo is null', () => {
            filterBuilder.comCargo(null);
            
            expect(filterBuilder.filters.cargo).toBeUndefined();
        });

        test('should not add cargo filter when cargo is undefined', () => {
            filterBuilder.comCargo(undefined);
            
            expect(filterBuilder.filters.cargo).toBeUndefined();
        });
    });

    describe('comStatus', () => {
        test('should add status filter when status is provided', () => {
            const result = filterBuilder.comStatus('ativo');
            
            expect(result).toBe(filterBuilder); // Should return this for chaining
            expect(filterBuilder.filters.status).toEqual({
                $regex: 'ativo',
                $option: 'i'
            });
        });

        test('should not add status filter when status is empty string', () => {
            filterBuilder.comStatus('');
            
            expect(filterBuilder.filters.status).toBeUndefined();
        });

        test('should not add status filter when status is only whitespace', () => {
            filterBuilder.comStatus('   ');
            
            expect(filterBuilder.filters.status).toBeUndefined();
        });

        test('should not add status filter when status is null', () => {
            filterBuilder.comStatus(null);
            
            expect(filterBuilder.filters.status).toBeUndefined();
        });

        test('should not add status filter when status is undefined', () => {
            filterBuilder.comStatus(undefined);
            
            expect(filterBuilder.filters.status).toBeUndefined();
        });
    });

    describe('build', () => {
        test('should return empty filters object when no filters applied', () => {
            const result = filterBuilder.build();
            
            expect(result).toEqual({});
        });

        test('should return filters object with applied filters', () => {
            filterBuilder
                .comNome('João')
                .comEmail('joao@example.com')
                .comStatus('ativo');
            
            const result = filterBuilder.build();
            
            expect(result).toEqual({
                nome_usuario: { $regex: 'João', $option: 'i' },
                email: { $regex: 'joao@example.com', $option: 'i' },
                status: { $regex: 'ativo', $option: 'i' }
            });
        });
    });

    describe('Method chaining', () => {
        test('should allow method chaining for all filter methods', () => {
            const result = filterBuilder
                .comNome('João Silva')
                .comMatricula('12345')
                .comEmail('joao@example.com')
                .comCargo('Desenvolvedor')
                .comStatus('ativo')
                .build();
            
            expect(result).toEqual({
                nome_usuario: { $regex: 'João Silva', $option: 'i' },
                matricula: { $regex: '12345', $option: 'i' },
                email: { $regex: 'joao@example.com', $option: 'i' },
                cargo: { $regex: 'Desenvolvedor', $option: 'i' },
                status: { $regex: 'ativo', $option: 'i' }
            });
        });

        test('should allow partial filter building', () => {
            const result = filterBuilder
                .comNome('João')
                .comStatus('ativo')
                .build();
            
            expect(result).toEqual({
                nome_usuario: { $regex: 'João', $option: 'i' },
                status: { $regex: 'ativo', $option: 'i' }
            });
        });
    });

    describe('Edge cases', () => {
        test('should handle special characters in filter values', () => {
            filterBuilder.comNome('João@Silva#123');
            
            expect(filterBuilder.filters.nome_usuario).toEqual({
                $regex: 'João@Silva#123',
                $option: 'i'
            });
        });

        test('should handle numeric values as strings', () => {
            filterBuilder.comMatricula('123456789');
            
            expect(filterBuilder.filters.matricula).toEqual({
                $regex: '123456789',
                $option: 'i'
            });
        });

        test('should handle unicode characters', () => {
            filterBuilder.comNome('José António');
            
            expect(filterBuilder.filters.nome_usuario).toEqual({
                $regex: 'José António',
                $option: 'i'
            });
        });
    });
});
