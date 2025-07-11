const UsuarioRepository = jest.fn().mockImplementation(() => ({
  listarUsuarios: jest.fn(),
  criarUsuario: jest.fn(),
  atualizarUsuario: jest.fn(),
  buscarPorId: jest.fn(),
  buscarPorMatricula: jest.fn(),
  deletarUsuario: jest.fn(),
  desativarUsuario: jest.fn(),
  reativarUsuario: jest.fn(),
  buscarPorEmail: jest.fn(),
  adicionarTokenRevogado: jest.fn(),
}));

export default UsuarioRepository;
