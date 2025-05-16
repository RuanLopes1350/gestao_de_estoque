import { jest } from '@jest/globals';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import errorHandler from '../../../../utils/helpers/errorHandler.js';
import CustomError from '../../../../utils/helpers/CustomError.js';
import AuthenticationError from '../../../../utils/errors/AuthenticationError.js';
import TokenExpiredError from '../../../../utils/errors/TokenExpiredError.js';
import CommonResponse from '../../../../utils/helpers/CommonResponse.js';
import logger from '../../../../utils/logger.js';

// Spy on logger (if needed)

jest.mock('../../../../utils/helpers/CommonResponse.js');

describe('errorHandler', () => {
    let req;
    let res;
    const next = jest.fn();

    beforeEach(() => {
        req = { path: '/test', requestId: 'test-req-id' };
        res = {}; // dummy, CommonResponse.error is being called instead
        CommonResponse.error.mockClear();
    });

    it('should handle ZodError and return 400 validationError', () => {
        const fakeError = new ZodError([{ path: ['field'], message: 'Invalid value' }]);
        process.env.NODE_ENV = 'development';
        errorHandler(fakeError, req, res, next);

        expect(CommonResponse.error).toHaveBeenCalledWith(
            res,
            400,
            'validationError',
            null,
            [{ path: 'field', message: 'Invalid value' }],
            'Erro de validação. 1 campo(s) inválido(s).'
        );
    });

    it('should handle MongoDB duplicate key error and return 409 duplicateEntry', () => {
        const fakeError = { code: 11000, keyValue: { email: 'test@example.com' } };
        errorHandler(fakeError, req, res, next);

        expect(CommonResponse.error).toHaveBeenCalledWith(
            res,
            409,
            'duplicateEntry',
            'email',
            [{ path: 'email', message: 'O valor "test@example.com" já está em uso.' }],
            'Entrada duplicada no campo "email".'
        );
    });

    it('should handle Mongoose ValidationError and return 400 validationError', () => {
        const fakeMongooseError = new mongoose.Error.ValidationError();
        fakeMongooseError.errors = {
            name: { path: 'name', message: 'Name is required' },
            age: { path: 'age', message: 'Age must be a number' }
        };

        errorHandler(fakeMongooseError, req, res, next);
        const detalhes = [
            { path: 'name', message: 'Name is required' },
            { path: 'age', message: 'Age must be a number' }
        ];

        expect(CommonResponse.error).toHaveBeenCalledWith(
            res,
            400,
            'validationError',
            null,
            detalhes
        );
    });

    it('should handle AuthenticationError and return its status and message', () => {
        const fakeError = new AuthenticationError('Not authenticated', 401);
        errorHandler(fakeError, req, res, next);

        expect(CommonResponse.error).toHaveBeenCalledWith(
            res,
            fakeError.statusCode,
            'authenticationError',
            null,
            [{ message: fakeError.message }],
            fakeError.message
        );
    });

    it('should handle TokenExpiredError and return its status and message', () => {
        const fakeError = new TokenExpiredError('Token expired', 401);
        errorHandler(fakeError, req, res, next);

        expect(CommonResponse.error).toHaveBeenCalledWith(
            res,
            fakeError.statusCode,
            'authenticationError',
            null,
            [{ message: fakeError.message }],
            fakeError.message
        );
    });

    it("should handle CustomError with errorType 'tokenExpired'", () => {
        const fakeError = new CustomError('Session expired', {
            errorType: 'tokenExpired',
            statusCode: 401,
            customMessage: 'Seu token expirou. Faça login novamente.'
        });
        errorHandler(fakeError, req, res, next);

        expect(CommonResponse.error).toHaveBeenCalledWith(
            res,
            401,
            'tokenExpired',
            null,
            [{ message: 'Seu token expirou. Faça login novamente.' }],
            'Seu token expirou. Faça login novamente.'
        );
    });

    it('should handle operational errors', () => {
        const fakeError = new Error('Operational failure');
        fakeError.isOperational = true;
        fakeError.statusCode = 422;
        fakeError.errorType = 'operationalError';
        fakeError.details = [{ message: 'Detail info' }];
        fakeError.customMessage = 'Operacional Falhou';
        fakeError.field = 'someField';

        errorHandler(fakeError, req, res, next);
        expect(CommonResponse.error).toHaveBeenCalledWith(
            res,
            422,
            'operationalError',
            'someField',
            [{ message: 'Detail info' }],
            'Operacional Falhou'
        );
    });

    it('should handle non-operational errors as internal errors', () => {
        const fakeError = new Error('Internal error occurred');
        process.env.NODE_ENV = 'development';
        errorHandler(fakeError, req, res, next);

        // In development, the error details include message and stack.
        const callArgs = CommonResponse.error.mock.calls[0];
        expect(callArgs[0]).toBe(res);
        expect(callArgs[1]).toBe(500);
        expect(callArgs[2]).toBe('serverError');
        // We check that details contain the error message and stack.
        expect(callArgs[4][0].message).toBe(fakeError.message);
        expect(callArgs[4][0].stack).toBeDefined();
    });
});