// PermissionService.test.js

// 1. Mock do módulo UsuarioRepository antes de qualquer importação
jest.mock('../../../repositories/UsuarioRepository.js');

// 2. Agora, importe os módulos após definir o mock
import PermissionService from '../../../services/PermissionService.js';
import UsuarioRepository from '../../../repositories/UsuarioRepository.js';

describe('PermissionService', () => {
    let buscarPorIdMock;
    let permissionService;

    beforeEach(() => {
        jest.resetAllMocks();
        buscarPorIdMock = jest.fn();
        UsuarioRepository.mockImplementation(() => ({
            buscarPorId: buscarPorIdMock
        }));

        // Agora podemos instanciar a classe normalmente
        permissionService = new PermissionService();
    });

    it('deve retornar true se o usuário tiver permissão', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [{ rota, dominio, ativo: true, [metodo]: true }],
            grupos: []
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(true);
        expect(buscarPorIdMock).toHaveBeenCalledWith(userId, { grupos: true });
    });

    it('deve retornar false se o usuário não tiver permissão (método false)', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [{ rota, dominio, ativo: true, [metodo]: false }],
            grupos: []
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
        expect(buscarPorIdMock).toHaveBeenCalledWith(userId, { grupos: true });
    });

    it('deve retornar false se o usuário não for encontrado', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        buscarPorIdMock.mockResolvedValue(null);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
        expect(buscarPorIdMock).toHaveBeenCalledWith(userId, { grupos: true });
    });

    it('deve retornar true se o usuário tiver permissão através de um grupo', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [],
            grupos: [{ permissoes: [{ rota, dominio, ativo: true, [metodo]: true }] }]
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(true);
        expect(buscarPorIdMock).toHaveBeenCalledWith(userId, { grupos: true });
    });

    it('deve retornar false se ocorrer um erro (ex: erro no banco)', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        buscarPorIdMock.mockRejectedValue(new Error('Database error'));

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
        expect(buscarPorIdMock).toHaveBeenCalledWith(userId, { grupos: true });
    });

    it('deve retornar false se a permissão existir, mas não estiver ativa, mesmo que o método seja true', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [{ rota, dominio, ativo: false, [metodo]: true }],
            grupos: []
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
        expect(buscarPorIdMock).toHaveBeenCalledWith(userId, { grupos: true });
    });

    it('deve retornar false se a rota não corresponder', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [{ rota: 'outraRota', dominio, ativo: true, [metodo]: true }],
            grupos: []
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
    });

    it('deve retornar false se o dominio não corresponder', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [{ rota, dominio: 'http://outrodominio.com', ativo: true, [metodo]: true }],
            grupos: []
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
    });

    it('deve retornar false se o método não corresponder', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [{ rota, dominio, ativo: true, enviar: true }],
            grupos: []
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
    });

    // Caso adicional: permissão existe, porém o campo do método não está definido.
    it('deve retornar false se a chave do método não estiver definida na permissão', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [{ rota, dominio, ativo: true }], // não existe [metodo]
            grupos: []
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
    });

    // Novo teste: nenhuma permissão
    it('deve retornar false se o usuário não tiver nenhuma permissão e nenhum grupo', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [],
            grupos: []
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
    });

    // Novo teste: permissões duplicadas (para cobrir o ramo em que combinacoes.has(chave) é true)
    it('deve ignorar permissões duplicadas', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';

        const usuario = {
            permissoes: [
                { rota, dominio, ativo: true, [metodo]: true },
                { rota, dominio, ativo: true, [metodo]: true } // permissão duplicada
            ],
            grupos: []
        };

        buscarPorIdMock.mockResolvedValue(usuario);

        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(true);
    });

    it('deve retornar false se o usuário não tiver permissoes definidas e o grupo também não tiver permissoes definidas', async () => {
        const userId = 'user1';
        const rota = 'usuarios';
        const dominio = 'http://localhost:3000';
        const metodo = 'buscar';
    
        // Usuário sem a propriedade permissoes
        // Grupo definido, mas sem a propriedade permissoes
        const usuario = {
            grupos: [{}]
        };
    
        buscarPorIdMock.mockResolvedValue(usuario);
    
        const result = await permissionService.hasPermission(userId, rota, dominio, metodo);
        expect(result).toBe(false);
        // Esse teste garante que caímos no ramo "|| []" tanto para usuario.permissoes
        // quanto para grupo.permissoes
    });
    
});
