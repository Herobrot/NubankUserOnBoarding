import { Request, Response } from 'express';
import { GetProfileUseCase } from '../../application/use-cases/GetProfileUseCase';
import { UserRepository } from '../../infrastructure/persistence/mongodb/UserRepository';

const userRepository = new UserRepository();
const getProfileUseCase = new GetProfileUseCase(userRepository);

export class UserController {
  static me(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ message: 'No autenticado' });
        return;
      }
      res.json({ id: user.id, name: user.name, email: user.email, kycStatus: user.kycStatus });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
} 