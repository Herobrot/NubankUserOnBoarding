import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUserUseCase';
import { DependencyContainer } from '../../infrastructure/config/DependencyContainer';
import { 
  RegisterApiResponse, 
  LoginApiResponse,
  createSuccessResponse,
  createErrorResponse,
  createGeneralError
} from '../../shared/types/response.types';

const container = DependencyContainer.getInstance();

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const registerUserUseCase = new RegisterUserUseCase(
        container.getUserRepository(),
        container.getAuthService()
      );
      
      const user = await registerUserUseCase.execute(req.body);
      
      const response: RegisterApiResponse = createSuccessResponse(
        'Usuario registrado exitosamente',
        {
          user: {
            id: user.id!,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      );
      
      res.status(201).json(response);
    } catch (err: any) {
      const response: RegisterApiResponse = createErrorResponse(
        'Error de validación',
        [createGeneralError(err.message)]
      );
      res.status(400).json(response);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const loginUserUseCase = new LoginUserUseCase(
        container.getUserRepository(),
        container.getAuthService()
      );
      
      const { user, token } = await loginUserUseCase.execute(req.body);
      
      const response: LoginApiResponse = createSuccessResponse(
        'Login exitoso',
        {
          user: {
            id: user.id!,
            name: user.name,
            email: user.email,
            isVerified: user.kycStatus === 'verified',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        }
      );
      
      res.json(response);
    } catch (err: any) {
      const response: LoginApiResponse = createErrorResponse(
        'Credenciales inválidas',
        [createGeneralError(err.message || 'Error de autenticación')]
      );
      res.status(400).json(response);
    }
  }
} 