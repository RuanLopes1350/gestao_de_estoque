// /src/utils/TokenUtil.js
import jwt from 'jsonwebtoken';

class TokenUtil {
  /**
   * Gera um token de acesso JWT para o usuário (retorna Promise<string>)
   */
  generateAccessToken(id) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { id },
        process.env.JWT_SECRET_ACCESS_TOKEN,
        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m' },
        (err, token) => {
          if (err) {
            return reject(err);
          }
          resolve(token);
        }
      );
    });
  }

  /**
   * Gera um token de atualização JWT para o usuário (retorna Promise<string>)
   */
  generateRefreshToken(id) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { id },
        process.env.JWT_SECRET_REFRESH_TOKEN,
        { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d' },
        (err, token) => {
          if (err) {
            return reject(err);
          }
          resolve(token);
        }
      );
    });
  }

  /**
   * Gera token único para recuperação de senha com validade de 1 hora (retorna Promise<string>)
   */
  generatePasswordRecoveryToken(id) {
    // Definindo uma chave secreta explícita como fallback
    const secret = process.env.JWT_SECRET_PASSWORD_RECOVERY || 'senha_recovery_secret';

    return new Promise((resolve, reject) => {
      jwt.sign(
        { id },
        secret,
        { expiresIn: process.env.JWT_PASSWORD_RECOVERY_EXPIRATION || '1h' },
        (err, token) => {
          if (err) {
            return reject(err);
          }
          resolve(token);
        }
      );
    });
  }

  /**
   * Decodifica um token de acesso (Bearer) e retorna o payload.id ou rejeita com o erro
   */
  decodeAccessToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        process.env.JWT_SECRET_ACCESS_TOKEN,
        (err, decoded) => {
          if (err) {
            // Pode ser JsonWebTokenError, TokenExpiredError, etc.
            return reject(err);
          }

          // Se decodificou corretamente, retorna apenas o campo 'id'
          // (supondo que sempre haja um `id` no payload)
          resolve(decoded.id);
        }
      );
    });
  }

  /**
   * Decodifica um token de atualização (Bearer) e retorna o payload.id ou rejeita com o erro
   */
  decodeRefreshToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        process.env.JWT_SECRET_REFRESH_TOKEN,
        (err, decoded) => {
          if (err) {
            // Pode ser JsonWebTokenError, TokenExpiredError, etc.
            return reject(err);
          }

          // Se decodificou corretamente, retorna apenas o campo 'id'
          // (supondo que sempre haja um `id` no payload)
          resolve(decoded.id);
        }
      );
    });
  }

  /**
   * Decodifica um token de recuperação de senha e retorna o payload.id ou rejeita com o erro
   */
  decodePasswordRecoveryToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        process.env.JWT_SECRET_PASSWORD_RECOVERY || 'senha_recovery_secret',
        (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded.id);
        }
      );
    });
  }

}

export default new TokenUtil();
