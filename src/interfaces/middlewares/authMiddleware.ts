import { Request, Response, NextFunction } from 'express';
import { DependencyContainer } from '../../infrastructure/config/DependencyContainer';
import { 
  createErrorResponse,
  createGeneralError,
  ErrorResponse
} from '../../shared/types/response.types';

const container = DependencyContainer.getInstance();

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  (async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        const response: ErrorResponse = createErrorResponse(
          'Token de autenticación requerido',
          [createGeneralError('Header de autorización Bearer requerido')]
        );
        return res.status(401).json(response);
      }
      
      const token = authHeader.split(' ')[1];
      const authService = container.getAuthService();
      const userRepository = container.getUserRepository();
      
      const userPayload = await authService.verifyToken(token);
      
      if (!userPayload?.id) {
        const response: ErrorResponse = createErrorResponse(
          'Token de autenticación inválido',
          [createGeneralError('El token proporcionado no es válido')]
        );
        return res.status(401).json(response);
      }
      
      // Obtener usuario real de la base de datos
      const user = await userRepository.findById(userPayload.id);
      if (!user) {
        const response: ErrorResponse = createErrorResponse(
          'Usuario no encontrado',
          [createGeneralError('El usuario asociado al token no existe')]
        );
        return res.status(401).json(response);
      }
      
      (req as any).user = user;
      next();
    } catch (error) {
      console.error('Error en authMiddleware:', error);
      const response: ErrorResponse = createErrorResponse(
        'Error de autenticación',
        [createGeneralError('Error interno durante la verificación del token')]
      );
      return res.status(401).json(response);
    }
  })();
} 