import asyncWrapper from '../../middlewares/asyncWrapper.js';

describe('asyncWrapper', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: { test: 'data' } };
        res = { 
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis() 
        };
        next = jest.fn();
    });

    it('should execute the handler function successfully', async () => {
        const mockResult = { success: true };
        const handler = jest.fn().mockResolvedValue(mockResult);
        
        const wrappedHandler = asyncWrapper(handler);
        
        await wrappedHandler(req, res, next);
        
        expect(handler).toHaveBeenCalledWith(req, res, next);
        
        expect(next).not.toHaveBeenCalled();
    });

    it('should pass errors to the next middleware', async () => {
        const error = new Error('Test error');
        const handler = jest.fn().mockRejectedValue(error);
        
        const wrappedHandler = asyncWrapper(handler);
        
        await wrappedHandler(req, res, next);
        
        expect(handler).toHaveBeenCalledWith(req, res, next);
        
        expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous errors in the handler', async () => {
        const error = new Error('Sync error');
        const handler = jest.fn().mockImplementation(() => {
            throw error;
        });
        
        const wrappedHandler = asyncWrapper(handler);
        
        await wrappedHandler(req, res, next);
        
        expect(handler).toHaveBeenCalledWith(req, res, next);
        
        expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle handler returning a non-promise value', async () => {
        const mockResult = { data: 'simple value' };
        const handler = jest.fn().mockReturnValue(mockResult);
        
        const wrappedHandler = asyncWrapper(handler);
        
        await wrappedHandler(req, res, next);
        
        expect(handler).toHaveBeenCalledWith(req, res, next);
        
        expect(next).not.toHaveBeenCalled();
    });

    it('should work with async functions that use await', async () => {
        const mockResult = { success: true };
        const handler = jest.fn().mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return mockResult;
        });
        
        const wrappedHandler = asyncWrapper(handler);
        
        await wrappedHandler(req, res, next);
        
        expect(handler).toHaveBeenCalledWith(req, res, next);
        
        expect(next).not.toHaveBeenCalled();
    });
});