import { Request, Response } from 'express';
import { GetProfileUseCase } from '../../application/use-cases/GetProfileUseCase';
import { DependencyContainer } from '../../infrastructure/config/DependencyContainer';
import { 
  ProfileApiResponse,
  createSuccessResponse,
  createErrorResponse,
  createGeneralError,
  KycStatus
} from '../../shared/types/response.types';

const container = DependencyContainer.getInstance();

export class UserController {
  static async me(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        const response: ProfileApiResponse = createErrorResponse(
          'Usuario no autenticado',
          [createGeneralError('Token de autenticación requerido')]
        );
        res.status(401).json(response);
        return;
      }

      const getProfileUseCase = new GetProfileUseCase(
        container.getUserRepository()
      );
      
      const userProfile = await getProfileUseCase.execute(user.id);
      
      if (!userProfile) {
        const response: ProfileApiResponse = createErrorResponse(
          'Usuario no encontrado',
          [createGeneralError('El usuario especificado no existe')]
        );
        res.status(404).json(response);
        return;
      }
      
      // Mapear el kycStatus al formato del OpenAPI
      let kycStatus: KycStatus;
      if (userProfile.kycStatus === 'verified') {
        kycStatus = 'APPROVED';
      } else if (userProfile.kycStatus === 'rejected') {
        kycStatus = 'REJECTED';
      } else if (userProfile.kycStatus === 'pending') {
        kycStatus = 'PENDING';
      } else {
        kycStatus = 'NOT_SUBMITTED';
      }
      
      const response: ProfileApiResponse = createSuccessResponse(
        'Perfil obtenido exitosamente',
        {
          user: {
            id: userProfile.id!,
            name: userProfile.name,
            email: userProfile.email,
            isVerified: userProfile.kycStatus === 'verified',
            kycStatus,
            createdAt: userProfile.createdAt,
            updatedAt: userProfile.updatedAt
          }
        }
      );
      
      res.json(response);
    } catch (err: any) {
      console.error('Error en UserController.me:', err);
      const response: ProfileApiResponse = createErrorResponse(
        'Error al obtener perfil de usuario',
        [createGeneralError(err.message || 'Error interno del servidor')]
      );
      res.status(400).json(response);
    }
  }
} 