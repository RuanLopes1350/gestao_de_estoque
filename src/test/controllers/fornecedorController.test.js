import FornecedorController from '../../controllers/FornecedorController.js';
import FornecedorService from '../../services/fornecedorService.js';
import { CommonResponse, HttpStatusCodes } from '../../utils/helpers/index.js';
import { FornecedorIdSchema } from '../../utils/validators/schemas/zod/querys/FornecedorQuerySchema.js';

jest.mock('../../services/fornecedorService.js');
jest.mock('../../utils/validators/schemas/zod/querys/FornecedorQuerySchema.js', () => ({
  FornecedorIdSchema: {
    parse: jest.fn()
  }
}));

jest.mock('../../utils/helpers/index.js', () => {
  const originalModule = jest.requireActual('../../utils/helpers/index.js');

  return {
    ...originalModule,
    CommonResponse: {
      success: jest.fn(),
      error: jest.fn(),
      created: jest.fn()
    },
    HttpStatusCodes: {
      OK: { code: 200 },
      CREATED: { code: 201 },
      BAD_REQUEST: { code: 400 },
      NOT_FOUND: { code: 404 }
    }
  };
});

describe('FornecedorController', () => {
  let fornecedorController;
  let mockService;
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      criar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn()
    };

    FornecedorService.mockImplementation(() => mockService);

    fornecedorController = new FornecedorController();

    req = { params: {}, query: {}, body: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe("criar", () => {
    it("deve chamar service.criar e CommonResponse.created em caso de sucesso", async () => {
      const fakeData = { id: 1, nome: "Fornecedor X" };
      req.body = { nome: "Fornecedor X" };

      controller.service.criar.mockResolvedValue(fakeData);
      CommonResponse.created.mockImplementation((res, data, code, message) => {
        res.status(code).json({ message, data });
        return res;
      });

      await controller.criar(req, res);

      expect(controller.service.criar).toHaveBeenCalledWith(req.body);
      expect(CommonResponse.created).toHaveBeenCalledWith(
        res,
        fakeData,
        HttpStatusCodes.CREATED.code,
        "Fornecedor adicionado"
      );
    });

    it("deve chamar CommonResponse.error em caso de erro", async () => {
      const error = new Error("Erro ao criar");
      req.body = {};
      controller.service.criar.mockRejectedValue(error);
      CommonResponse.error.mockImplementation((res, err) => {
        res.status(500).json({ error: err.message });
        return res;
      });

      await controller.criar(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, error);
    });
  });

  describe("listar", () => {
    it("deve chamar service.listar e CommonResponse.success", async () => {
      const fakeData = [{ id: 1, nome: "Fornecedor A" }];
      req = {}; // pode receber query, params etc.
      controller.service.listar.mockResolvedValue(fakeData);
      CommonResponse.success.mockImplementation((res, data) => {
        res.status(200).json(data);
        return res;
      });

      await controller.listar(req, res);

      expect(controller.service.listar).toHaveBeenCalledWith(req);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, fakeData);
    });
  });

  describe("buscarPorId", () => {
    it("deve validar id, chamar service.buscarPorId e CommonResponse.success", async () => {
      const fakeData = { id: "123", nome: "Fornecedor B" };
      req.params = { id: "123" };
      FornecedorIdSchema.parse = jest.fn(); // só mockar a validação para não dar erro
      controller.service.buscarPorId.mockResolvedValue(fakeData);
      CommonResponse.success.mockImplementation((res, data, code, message) => {
        res.status(code).json({ message, data });
        return res;
      });

      await controller.buscarPorId(req, res);

      expect(FornecedorIdSchema.parse).toHaveBeenCalledWith("123");
      expect(controller.service.buscarPorId).toHaveBeenCalledWith("123");
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        fakeData,
        200,
        "Fornecedor encontrado com sucesso."
      );
    });

    it("deve chamar CommonResponse.error se validar id falhar", async () => {
      const error = new Error("Id inválido");
      req.params = { id: "inválido" };
      FornecedorIdSchema.parse = jest.fn(() => {
        throw error;
      });
      CommonResponse.error.mockImplementation((res, err) => {
        res.status(400).json({ error: err.message });
        return res;
      });

      await controller.buscarPorId(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, error);
    });
  });

  describe("atualizar", () => {
    it("deve chamar service.atualizar e CommonResponse.success", async () => {
      const fakeData = { id: "123", nome: "Fornecedor Atualizado" };
      req.params = { id: "123" };
      req.body = { nome: "Fornecedor Atualizado" };
      controller.service.atualizar.mockResolvedValue(fakeData);
      CommonResponse.success.mockImplementation((res, data, code, message) => {
        res.status(code).json({ message, data });
        return res;
      });

      await controller.atualizar(req, res);

      expect(controller.service.atualizar).toHaveBeenCalledWith("123", req.body);
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        fakeData,
        HttpStatusCodes.OK.code,
        "Fornecedor atualizada com sucesso."
      );
    });

    it("deve chamar CommonResponse.error em caso de erro", async () => {
      const error = new Error("Erro ao atualizar");
      req.params = { id: "123" };
      req.body = {};
      controller.service.atualizar.mockRejectedValue(error);
      CommonResponse.error.mockImplementation((res, err) => {
        res.status(500).json({ error: err.message });
        return res;
      });

      await controller.atualizar(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, error);
    });
  });

  describe("deletar", () => {
    it("deve chamar service.deletar e CommonResponse.success", async () => {
      const fakeData = { id: "123" };
      req.params = { id: "123" };
      controller.service.deletar.mockResolvedValue(fakeData);
      CommonResponse.success.mockImplementation((res, data, code, message) => {
        res.status(code).json({ message, data });
        return res;
      });

      await controller.deletar(req, res);

      expect(controller.service.deletar).toHaveBeenCalledWith("123");
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        fakeData,
        HttpStatusCodes.OK.code,
        "Fornecedor eliminado com sucesso."
      );
    });

    it("deve chamar CommonResponse.error em caso de erro", async () => {
      const error = new Error("Erro ao deletar");
      req.params = { id: "123" };
      controller.service.deletar.mockRejectedValue(error);
      CommonResponse.error.mockImplementation((res, err) => {
        res.status(500).json({ error: err.message });
        return res;
      });

      await controller.deletar(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, error);
    });
  });
});
