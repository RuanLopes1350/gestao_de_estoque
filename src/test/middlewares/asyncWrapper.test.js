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

  it('should execute handler and not call next on success', async () => {
    // Usando mockImplementation com retorno de Promise.resolve
    const handler = jest.fn().mockImplementation(() => Promise.resolve('success'));
    
    const wrappedHandler = asyncWrapper(handler);
    await wrappedHandler(req, res, next);
    
    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error when Promise rejects', async () => {
    // Usando mockImplementation com retorno de Promise.reject
    const handler = jest.fn().mockImplementation(() => 
      Promise.reject({ message: 'Erro simulado' })
    );
    
    const wrappedHandler = asyncWrapper(handler);
    await wrappedHandler(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toEqual({ message: 'Erro simulado' });
  });

  it('should work with non-promise return values', async () => {
    const handler = jest.fn().mockImplementation(() => 'Valor normal');
    
    const wrappedHandler = asyncWrapper(handler);
    await wrappedHandler(req, res, next);
    
    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });
});