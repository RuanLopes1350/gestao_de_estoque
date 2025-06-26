const logsRoutes = {
  '/logs': {
    get: {
      tags: ['Logs'],
      summary: 'Buscar logs do sistema',
      description: 'Endpoint para buscar logs de auditoria e atividades do sistema com filtros opcionais. Permite rastreamento de ações de usuários, alterações no sistema e monitoramento de atividades.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Número da página para paginação dos resultados'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Quantidade de logs por página (máximo 100)'
        },
        {
          name: 'nivel',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['INFO', 'WARNING', 'ERROR', 'DEBUG']
          },
          description: 'Filtrar por nível do log'
        },
        {
          name: 'usuario_id',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Filtrar logs por ID do usuário'
        },
        {
          name: 'modulo',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['AUTH', 'PRODUTOS', 'FORNECEDORES', 'USUARIOS', 'MOVIMENTACOES', 'SISTEMA']
          },
          description: 'Filtrar por módulo do sistema'
        },
        {
          name: 'acao',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Filtrar por tipo de ação realizada'
        },
        {
          name: 'data_inicio',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início para filtro por período (formato: YYYY-MM-DD)'
        },
        {
          name: 'data_fim',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de fim para filtro por período (formato: YYYY-MM-DD)'
        },
        {
          name: 'search',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Busca textual na mensagem do log'
        }
      ],
      responses: {
        '200': {
          description: 'Lista de logs retornada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LogsListResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/logs/{id}': {
    get: {
      tags: ['Logs'],
      summary: 'Buscar log específico',
      description: 'Endpoint para buscar detalhes de um log específico por ID. Retorna informações completas sobre uma entrada de log específica.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID único do log'
        }
      ],
      responses: {
        '200': {
          description: 'Detalhes do log retornados com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LogDetailsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '404': {
          $ref: '#/components/responses/NotFound'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/logs/auditoria': {
    get: {
      tags: ['Logs'],
      summary: 'Buscar logs de auditoria',
      description: 'Endpoint especializado para buscar logs de auditoria do sistema, incluindo alterações de dados críticos, acessos administrativos e operações sensíveis.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Número da página para paginação'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Quantidade de logs por página'
        },
        {
          name: 'usuario_id',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Filtrar por ID do usuário que executou a ação'
        },
        {
          name: 'tabela',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['produtos', 'fornecedores', 'usuarios', 'movimentacoes']
          },
          description: 'Filtrar por tabela afetada'
        },
        {
          name: 'operacao',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['CREATE', 'UPDATE', 'DELETE']
          },
          description: 'Filtrar por tipo de operação'
        },
        {
          name: 'data_inicio',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início para filtro por período'
        },
        {
          name: 'data_fim',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de fim para filtro por período'
        }
      ],
      responses: {
        '200': {
          description: 'Logs de auditoria retornados com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuditLogsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/logs/sistema': {
    get: {
      tags: ['Logs'],
      summary: 'Buscar logs de sistema',
      description: 'Endpoint para buscar logs relacionados ao funcionamento do sistema, incluindo erros, warnings e informações de debug.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Número da página para paginação'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Quantidade de logs por página'
        },
        {
          name: 'nivel',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['INFO', 'WARNING', 'ERROR', 'DEBUG']
          },
          description: 'Filtrar por nível de severidade'
        },
        {
          name: 'componente',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Filtrar por componente do sistema'
        },
        {
          name: 'data_inicio',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início para filtro por período'
        },
        {
          name: 'data_fim',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de fim para filtro por período'
        }
      ],
      responses: {
        '200': {
          description: 'Logs de sistema retornados com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SystemLogsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/logs/estatisticas': {
    get: {
      tags: ['Logs'],
      summary: 'Obter estatísticas de logs',
      description: 'Endpoint para obter estatísticas e métricas dos logs do sistema, incluindo contadores por tipo, usuário, módulo e período.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'periodo',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['hoje', 'semana', 'mes', 'trimestre', 'ano', 'customizado'],
            default: 'mes'
          },
          description: 'Período para geração das estatísticas'
        },
        {
          name: 'data_inicio',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início (obrigatório se período = customizado)'
        },
        {
          name: 'data_fim',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de fim (obrigatório se período = customizado)'
        },
        {
          name: 'agrupar_por',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['usuario', 'modulo', 'nivel', 'dia', 'hora']
          },
          description: 'Critério de agrupamento para estatísticas detalhadas'
        }
      ],
      responses: {
        '200': {
          description: 'Estatísticas de logs retornadas com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LogStatsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/logs/exportar': {
    post: {
      tags: ['Logs'],
      summary: 'Exportar logs',
      description: 'Endpoint para exportar logs do sistema em diferentes formatos (CSV, JSON, PDF). Permite aplicar filtros específicos e gerar relatórios personalizados.',
      security: [
        {
          BearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ExportLogsRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Arquivo de exportação gerado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ExportLogsResponse'
              }
            },
            'text/csv': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'application/pdf': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '422': {
          $ref: '#/components/responses/ValidationError'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/logs/limpeza': {
    delete: {
      tags: ['Logs'],
      summary: 'Limpeza de logs antigos',
      description: 'Endpoint administrativo para limpeza de logs antigos do sistema. Remove logs baseado em critérios de idade e tipo. **Ação irreversível - use com cautela.**',
      security: [
        {
          BearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CleanupLogsRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Limpeza de logs executada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CleanupLogsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '422': {
          $ref: '#/components/responses/ValidationError'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  }
};

export default logsRoutes;
