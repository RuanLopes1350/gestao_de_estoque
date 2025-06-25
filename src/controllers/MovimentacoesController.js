import MovimentacaoService from "../services/movimentacaoService.js";
import {
  MovimentacaoQuerySchema,
  MovimentacaoIdSchema,
} from "../utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js";
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
} from "../utils/helpers/index.js";
import LogMiddleware from "../middlewares/LogMiddleware.js";
import {
  MovimentacaoSchema,
  MovimentacaoUpdateSchema,
} from "../utils/validators/schemas/zod/MovimentacaoSchema.js";

class MovimentacoesController {
  constructor() {
    this.service = new MovimentacaoService();
  }

  async listarMovimentacoes(req, res) {
    console.log("Estou no listarMovimentacoes em MovimentacoesController");

    try {
      const { id } = req.params || {};
      if (id) {
        MovimentacaoIdSchema.parse(id);
      }

      const query = req.query || {};
      if (Object.keys(query).length !== 0) {
        await MovimentacaoQuerySchema.parseAsync(query);
      }

      const data = await this.service.listarMovimentacoes(req);

      // Verificar se a lista está vazia
      if (data.docs && data.docs.length === 0) {
        return CommonResponse.error(
          res,
          404,
          "resourceNotFound",
          "Movimentacao",
          [],
          "Nenhuma movimentação encontrada com os critérios informados."
        );
      }

      return CommonResponse.success(res, data);
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  async buscarMovimentacaoPorID(req, res) {
    console.log("Estou no buscarMovimentacaoPorID em MovimentacoesController");

    try {
      const { id } = req.params || {};
      const movId = MovimentacaoIdSchema.parse(id);
      const data = await this.service.buscarMovimentacaoPorID(movId);
      return CommonResponse.success(
        res,
        data,
        200,
        "Movimentação encontrada com sucesso."
      );
    } catch (error) {
      if (error.statusCode === 404 || error.message.includes("not found")) {
        return CommonResponse.error(
          res,
          404,
          "resourceNotFound",
          "Movimentacao",
          [],
          "Movimentação não encontrada. Verifique se o ID está correto."
        );
      }
      return CommonResponse.error(res, error);
    }
  }

  async buscarMovimentacoes(req, res) {
    console.log("Estou no buscarMovimentacoes em MovimentacoesController");
    console.log("Query params:", req.query);

    try {
      const query = req.query || {};
      const page = parseInt(query.page) || 1;
      const limite = Math.min(parseInt(query.limite) || 10, 100);

      let data = null;
      let tipoFiltro = null;

      // Verificar qual filtro foi passado
      if (query.tipo) {
        tipoFiltro = "tipo";
        data = await this.service.buscarMovimentacoesPorTipo(
          query.tipo,
          page,
          limite
        );
      } else if (query.data_inicio && query.data_fim) {
        tipoFiltro = "periodo";
        data = await this.service.buscarMovimentacoesPorPeriodo(
          query.data_inicio,
          query.data_fim,
          page,
          limite
        );
      } else if (query.produto) {
        tipoFiltro = "produto";
        data = await this.service.buscarMovimentacoesPorProduto(
          query.produto,
          page,
          limite
        );
      } else if (query.usuario) {
        tipoFiltro = "usuario";
        data = await this.service.buscarMovimentacoesPorUsuario(
          query.usuario,
          page,
          limite
        );
      } else {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "query",
          details: [],
          customMessage:
            "É necessário informar ao menos um parâmetro de busca: tipo, periodo, produto ou usuario.",
        });
      }

      // Verificar se a busca retornou resultados
      if (data.docs && data.docs.length === 0) {
        return CommonResponse.error(
          res,
          404,
          "resourceNotFound",
          "Movimentacao",
          [],
          `Nenhuma movimentação encontrada com o(a) ${tipoFiltro} informado.`
        );
      }

      return CommonResponse.success(
        res,
        data,
        200,
        "Movimentações encontradas com sucesso."
      );
    } catch (error) {
      console.error("Erro na busca de movimentações:", error);
      return CommonResponse.error(res, error);
    }
  }

  async cadastrarMovimentacao(req, res) {
    console.log("Estou no cadastrarMovimentacao em MovimentacoesController");
    console.log("data_movimentacao raw:", req.body.data_movimentacao);
    try {
      const input = {
        ...req.body,
        data_movimentacao: new Date(req.body.data_movimentacao),
      };
      console.log("data_movimentacao converted:", input.data_movimentacao);
      const parsedData = await MovimentacaoSchema.parseAsync(input);
      const data = await this.service.cadastrarMovimentacao(parsedData);
      return CommonResponse.created(
        res,
        data,
        HttpStatusCodes.CREATED.code,
        "Movimentação registrada com sucesso."
      );
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  async atualizarMovimentacao(req, res) {
    console.log("Estou no atualizarMovimentacao em MovimentacoesController");
    console.log("Dados recebidos:", JSON.stringify(req.body, null, 2));
    console.log("ID da movimentação:", req.params.id);

    try {
      const parsedData = await MovimentacaoSchema.parseAsync(req.body);
      const data = await this.service.cadastrarMovimentacao(parsedData);

      // Registra evento crítico de movimentação de estoque
      LogMiddleware.logCriticalEvent(
        req.userId,
        "ESTOQUE_MOVIMENTO",
        {
          produto: parsedData.produto,
          quantidade: parsedData.quantidade,
          tipo_movimentacao: parsedData.tipo_movimentacao,
          movimentacao_id: data._id,
        },
        req
      );

      return CommonResponse.created(
        res,
        data,
        HttpStatusCodes.CREATED.code,
        "Movimentação registrada com sucesso."
      );
    } catch (error) {
      return CommonResponse.error(res, error);
    }
  }

  async deletarMovimentacao(req, res) {
    console.log("Estou no deletarMovimentacao em MovimentacoesController");

    try {
      const { id } = req.params || {};
      if (!id) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "id",
          details: [],
          customMessage: "ID da movimentação é obrigatório para deletar.",
        });
      }

      try {
        MovimentacaoIdSchema.parse(id);
      } catch (error) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "id",
          details: [],
          customMessage: "ID da movimentação inválido.",
        });
      }

      const data = await this.service.deletarMovimentacao(id);
      return CommonResponse.success(
        res,
        data,
        200,
        "Movimentação excluída com sucesso."
      );
    } catch (error) {
      if (error.statusCode === 404) {
        return CommonResponse.error(
          res,
          error.statusCode,
          error.errorType,
          error.field,
          error.details,
          "Movimentação não encontrada. Verifique se o ID está correto."
        );
      }
      return CommonResponse.error(res, error);
    }
  }

  async filtrarMovimentacoesAvancado(req, res) {
    console.log(
      "Estou no filtrarMovimentacoesAvancado em MovimentacoesController"
    );

    try {
      // Extrair parâmetros de filtro da requisição
      const {
        tipo,
        destino,
        data,
        data_inicio,
        data_fim,
        id_usuario,
        nome_usuario,
        id_produto,
        codigo_produto,
        nome_produto,
        id_fornecedor,
        nome_fornecedor,
        quantidade_min,
        quantidade_max,
        page,
        limite,
      } = req.query;

      // Converter para o formato esperado pelo serviço
      const filtros = {
        tipo,
        destino,
        data,
        dataInicio: data_inicio,
        dataFim: data_fim,
        idUsuario: id_usuario,
        nomeUsuario: nome_usuario,
        idProduto: id_produto,
        codigoProduto: codigo_produto,
        nomeProduto: nome_produto,
        idFornecedor: id_fornecedor,
        nomeFornecedor: nome_fornecedor,
        quantidadeMin:
          quantidade_min !== undefined ? Number(quantidade_min) : undefined,
        quantidadeMax:
          quantidade_max !== undefined ? Number(quantidade_max) : undefined,
      };

      const opcoesPaginacao = {
        page,
        limite,
      };

      // Chamada ao service
      const resultado = await this.service.filtrarMovimentacoesAvancado(
        filtros,
        opcoesPaginacao
      );

      if (resultado.docs.length === 0) {
        return CommonResponse.error(
          res,
          404,
          "resourceNotFound",
          "Movimentacao",
          [],
          "Nenhuma movimentação encontrada com os critérios informados."
        );
      }

      return CommonResponse.success(
        res,
        resultado,
        200,
        "Movimentações encontradas com sucesso."
      );
    } catch (error) {
      console.error("Erro ao filtrar movimentações:", error);
      return CommonResponse.error(res, error);
    }
  }

  async desativarMovimentacao(req, res) {
      console.log('Estou no desativarMovimentacao em MovimentacoesController');
      try {
        const { id } = req.params || {};
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentação é obrigatório para desativar.'
            });
        }

        try {
          MovimentacaoIdSchema.parse(id);
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentação inválido.'
            });
        }

        const data = await this.service.desativarMovimentacao(id);
        return CommonResponse.success(res, data, 200, 'movimentação desativada com sucesso.');
    } catch (error) {
        if (error.statusCode === 404) {
            return CommonResponse.error(
                res,
                error.statusCode,
                error.errorType,
                error.field,
                error.details,
                'movimentação não encontrada. Verifique se o ID está correto.'
            );
        }
        return CommonResponse.error(res, error);
    }
  }

  async reativarMovimentacao(req, res) {
    console.log('Estou no reativarMovimentacao em MovimentacoesController');
    try {
      const { id } = req.params || {};
      if (!id) {
          throw new CustomError({
              statusCode: HttpStatusCodes.BAD_REQUEST.code,
              errorType: 'validationError',
              field: 'id',
              details: [],
              customMessage: 'ID da movimentação é obrigatório para desativar.'
          });
      }

      try {
        MovimentacaoIdSchema.parse(id);
      } catch (error) {
          throw new CustomError({
              statusCode: HttpStatusCodes.BAD_REQUEST.code,
              errorType: 'validationError',
              field: 'id',
              details: [],
              customMessage: 'ID da movimentação inválido.'
          });
      }

      const data = await this.service.reativarMovimentacao(id);
      return CommonResponse.success(res, data, 200, 'movimentação reativada com sucesso.');
  } catch (error) {
      if (error.statusCode === 404) {
          return CommonResponse.error(
              res,
              error.statusCode,
              error.errorType,
              error.field,
              error.details,
              'movimentação não encontrada. Verifique se o ID está correto.'
          );
      }
      return CommonResponse.error(res, error);
  }
}
}

export default MovimentacoesController;
