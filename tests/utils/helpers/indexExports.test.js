// Test for utils/helpers/index.js exports
import * as Helpers from '../../../src/utils/helpers/index.js';
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
  errorHandler,
  messages,
  StatusService,
  asyncWrapper
} from '../../../src/utils/helpers/index.js';

describe('Helpers Index Exports', () => {
  describe('Named exports', () => {
    it('should export CommonResponse', () => {
      expect(CommonResponse).toBeDefined();
      expect(typeof CommonResponse).toBe('function');
    });

    it('should export CustomError', () => {
      expect(CustomError).toBeDefined();
      expect(typeof CustomError).toBe('function');
    });

    it('should export HttpStatusCodes', () => {
      expect(HttpStatusCodes).toBeDefined();
      expect(typeof HttpStatusCodes).toBe('object');
    });

    it('should export errorHandler', () => {
      expect(errorHandler).toBeDefined();
      expect(typeof errorHandler).toBe('function');
    });

    it('should export messages', () => {
      expect(messages).toBeDefined();
      expect(typeof messages).toBe('object');
    });

    it('should export StatusService', () => {
      expect(StatusService).toBeDefined();
      expect(typeof StatusService).toBe('function');
    });

    it('should export asyncWrapper', () => {
      expect(asyncWrapper).toBeDefined();
      expect(typeof asyncWrapper).toBe('function');
    });
  });

  describe('Namespace import', () => {
    it('should export all helpers through namespace import', () => {
      expect(Helpers.CommonResponse).toBeDefined();
      expect(Helpers.CustomError).toBeDefined();
      expect(Helpers.HttpStatusCodes).toBeDefined();
      expect(Helpers.errorHandler).toBeDefined();
      expect(Helpers.messages).toBeDefined();
      expect(Helpers.StatusService).toBeDefined();
      expect(Helpers.asyncWrapper).toBeDefined();
    });

    it('should have all exports accessible through Helpers namespace', () => {
      expect(typeof Helpers.CommonResponse).toBe('function');
      expect(typeof Helpers.CustomError).toBe('function');
      expect(typeof Helpers.HttpStatusCodes).toBe('object');
      expect(typeof Helpers.errorHandler).toBe('function');
      expect(typeof Helpers.messages).toBe('object');
      expect(typeof Helpers.StatusService).toBe('function');
      expect(typeof Helpers.asyncWrapper).toBe('function');
    });
  });

  describe('Exports functionality', () => {
    it('should export working CommonResponse', () => {
      const response = CommonResponse.success('Test message');
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', 'Test message');
    });

    it('should export working CustomError', () => {
      const error = new CustomError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
    });

    it('should export working HttpStatusCodes', () => {
      expect(HttpStatusCodes.OK).toBe(200);
      expect(HttpStatusCodes.BAD_REQUEST).toBe(400);
      expect(HttpStatusCodes.INTERNAL_SERVER_ERROR).toBe(500);
    });

    it('should export working messages object', () => {
      expect(messages).toHaveProperty('success');
      expect(messages).toHaveProperty('error');
      expect(typeof messages.success).toBe('object');
      expect(typeof messages.error).toBe('object');
    });

    it('should export working StatusService', () => {
      const statusService = new StatusService();
      expect(statusService).toBeDefined();
      expect(typeof statusService.isHealthy).toBe('function');
    });

    it('should export working asyncWrapper', () => {
      const mockFunction = jest.fn();
      const wrappedFunction = asyncWrapper(mockFunction);
      expect(typeof wrappedFunction).toBe('function');
    });
  });

  describe('Re-export verification', () => {
    it('should maintain consistency between named and namespace exports', () => {
      expect(CommonResponse).toBe(Helpers.CommonResponse);
      expect(CustomError).toBe(Helpers.CustomError);
      expect(HttpStatusCodes).toBe(Helpers.HttpStatusCodes);
      expect(errorHandler).toBe(Helpers.errorHandler);
      expect(messages).toBe(Helpers.messages);
      expect(StatusService).toBe(Helpers.StatusService);
      expect(asyncWrapper).toBe(Helpers.asyncWrapper);
    });
  });
});
