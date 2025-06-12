import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUserUseCase';
import { AuthService } from '../../infrastructure/web/express/AuthService';
import { UserRepository } from '../../infrastructure/persistence/mongodb/UserRepository';

const userRepository = new UserRepository();
const authService = new AuthService();
const registerUserUseCase = new RegisterUserUseCase(userRepository, authService);
const loginUserUseCase = new LoginUserUseCase(userRepository, authService);

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const user = await registerUserUseCase.execute(req.body);
      res.status(201).json({ id: user.id, name: user.name, email: user.email });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { user, token } = await loginUserUseCase.execute(req.body);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
} 