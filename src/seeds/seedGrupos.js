import Grupo from '../models/Grupo.js';
import { seedRotas } from './seedRotas.js';
import getGlobalFakeMapping from './globalFakeMapping.js';

// Grupos padrão do sistema
const gruposPadrao = [
    {
        nome: 'Administradores',
        descricao: 'Grupo com acesso completo ao sistema',
        ativo: true,
        permissoes: [
            {
                rota: 'produtos',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: true,
                substituir: true,
                modificar: true,
                excluir: true
            },
            {
                rota: 'fornecedores',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: true,
                substituir: true,
                modificar: true,
                excluir: true
            },
            {
                rota: 'usuarios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: true,
                substituir: true,
                modificar: true,
                excluir: true
            },
            {
                rota: 'grupos',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: true,
                substituir: true,
                modificar: true,
                excluir: true
            },
            {
                rota: 'logs',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'relatorios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'dashboard',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            }
        ]
    },
    {
        nome: 'Gerentes',
        descricao: 'Grupo com acesso de gerenciamento ao estoque e relatórios',
        ativo: true,
        permissoes: [
            {
                rota: 'produtos',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: true,
                substituir: true,
                modificar: true,
                excluir: false
            },
            {
                rota: 'fornecedores',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: true,
                substituir: true,
                modificar: true,
                excluir: false
            },
            {
                rota: 'usuarios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'relatorios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'dashboard',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            }
        ]
    },
    {
        nome: 'Estoquistas',
        descricao: 'Grupo com acesso básico ao estoque',
        ativo: true,
        permissoes: [
            {
                rota: 'produtos',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: true, // Pode alterar quantidades
                excluir: false
            },
            {
                rota: 'fornecedores',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'dashboard',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            }
        ]
    },
    {
        nome: 'Auditores',
        descricao: 'Grupo com acesso somente de leitura para auditoria',
        ativo: true,
        permissoes: [
            {
                rota: 'produtos',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'fornecedores',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'usuarios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'logs',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'relatorios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'dashboard',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            }
        ]
    }
];

/**
 * Seed para criar grupos padrão do sistema
 */
async function seedGrupos() {
    try {
        console.log('🌱 Iniciando seed de grupos...');

        // Primeiro, garantir que as rotas existem
        await seedRotas();

        // Verificar se já existem grupos no banco
        const gruposExistentes = await Grupo.countDocuments();
        
        if (gruposExistentes > 0) {
            console.log('ℹ️  Grupos já existem no banco. Pulando seed...');
            const gruposExistentesData = await Grupo.find({});
            return gruposExistentesData;
        }

        const fakeMapping = getGlobalFakeMapping();
        
        // Combinar grupos padrão com grupos dinâmicos
        const todosGrupos = [...gruposPadrao];
        
        // Adicionar alguns grupos dinâmicos usando o fakeMapping
        const gruposDinamicos = gerarGruposDinamicos(fakeMapping, 2);
        todosGrupos.push(...gruposDinamicos);

        // Inserir grupos padrão e dinâmicos
        const gruposInseridos = await Grupo.insertMany(todosGrupos);
        
        console.log(`✅ ${gruposInseridos.length} grupos criados com sucesso!`);
        console.log('👥 Grupos criados:', gruposInseridos.map(g => g.nome).join(', '));

        // Exibir resumo das permissões
        console.log('\n📋 Resumo das permissões por grupo:');
        gruposInseridos.forEach(grupo => {
            console.log(`\n👥 ${grupo.nome}:`);
            grupo.permissoes.forEach(perm => {
                const acoes = [];
                if (perm.buscar) acoes.push('Consultar');
                if (perm.enviar) acoes.push('Criar');
                if (perm.substituir) acoes.push('Substituir');
                if (perm.modificar) acoes.push('Alterar');
                if (perm.excluir) acoes.push('Excluir');
                
                console.log(`   - ${perm.rota}: ${acoes.join(', ') || 'Nenhuma ação'}`);
            });
        });

        return gruposInseridos;

    } catch (error) {
        console.error('❌ Erro ao criar grupos padrão:', error);
        throw error;
    }
}

/**
 * Função para obter o ID de um grupo pelo nome
 * @param {String} nomeGrupo - Nome do grupo
 * @returns {String|null} - ID do grupo ou null se não encontrar
 */
async function obterIdGrupoPorNome(nomeGrupo) {
    try {
        const grupo = await Grupo.findOne({ nome: nomeGrupo }).lean();
        return grupo ? grupo._id.toString() : null;
    } catch (error) {
        console.error(`❌ Erro ao buscar grupo '${nomeGrupo}':`, error);
        return null;
    }
}

/**
 * Função para listar todos os grupos e suas permissões
 */
async function listarGruposEPermissoes() {
    try {
        const grupos = await Grupo.find({ ativo: true }).sort({ nome: 1 });
        
        console.log('👥 Grupos ativos no sistema:');
        grupos.forEach(grupo => {
            console.log(`\n📋 ${grupo.nome} - ${grupo.descricao}`);
            console.log(`   Total de permissões: ${grupo.permissoes.length}`);
            
            const rotasComPermissao = grupo.permissoes.map(p => p.rota).join(', ');
            console.log(`   Rotas com permissão: ${rotasComPermissao}`);
        });
        
        return grupos;
    } catch (error) {
        console.error('❌ Erro ao listar grupos e permissões:', error);
        throw error;
    }
}

/**
 * Função para gerar grupos dinamicamente usando globalFakeMapping
 */
function gerarGruposDinamicos(fakeMapping, quantidade = 3) {
    const grupos = [];
    
    for (let i = 0; i < quantidade; i++) {
        const grupo = {
            nome: `${fakeMapping.grupo.nome()}_${i + 1}`,
            descricao: fakeMapping.grupo.descricao(),
            ativo: fakeMapping.grupo.ativo(),
            data_criacao: fakeMapping.grupo.data_criacao(),
            data_atualizacao: fakeMapping.grupo.data_atualizacao(),
            permissoes: []
        };
        
        // Gera permissões aleatórias para o grupo
        const numPermissoes = Math.floor(Math.random() * 5) + 2; // 2-6 permissões
        for (let j = 0; j < numPermissoes; j++) {
            grupo.permissoes.push(fakeMapping.grupo.permissoes());
        }
        
        grupos.push(grupo);
    }
    
    return grupos;
}

export {
    seedGrupos,
    obterIdGrupoPorNome,
    listarGruposEPermissoes,
    gruposPadrao,
    gerarGruposDinamicos
};

export default seedGrupos;
