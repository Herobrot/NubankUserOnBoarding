import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../infrastructure/web/express/AuthService';
import { UserRepository } from '../../infrastructure/persistence/mongodb/UserRepository';

const authService = new AuthService();
const userRepository = new UserRepository();

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  (async () => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    const token = authHeader.split(' ')[1];
    const userPayload = await authService.verifyToken(token);
    if (!userPayload || !userPayload.id) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    // Obtener usuario real de la base de datos
    const user = await userRepository.findById(userPayload.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    (req as any).user = user;
    next();
  })().catch(next);
} 