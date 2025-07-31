import { Request, Response } from 'express';
import { VerifyKycUseCase } from '../../application/use-cases/VerifyKycUseCase';
import { DependencyContainer } from '../../infrastructure/config/DependencyContainer';
import { 
  KycVerificationApiResponse,
  createSuccessResponse,
  createErrorResponse,
  createGeneralError,
  createFieldError,
  ApiKycStatus,
  mapDomainKycStatusToApi
} from '../../shared/types/response.types';

const container = DependencyContainer.getInstance();

export class KycController {
  static async verify(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user) {
        const response: KycVerificationApiResponse = createErrorResponse(
          'Usuario no autenticado',
          [createGeneralError('Token de autenticación requerido')]
        );
        res.status(401).json(response);
        return;
      }

      if (!req.body.documents) {
        const response: KycVerificationApiResponse = createErrorResponse(
          'Error en la verificación',
          [createFieldError('documents', 'Documentos requeridos para la verificación KYC')]
        );
        res.status(400).json(response);
        return;
      }

      const verifyKycUseCase = new VerifyKycUseCase(
        container.getUserRepository(),
        container.getKycService()
      );

      const status = await verifyKycUseCase.execute({ 
        userId: user.id, 
        documents: req.body.documents 
      });

      // Mapear el status del dominio al formato de la API
      const apiStatus: ApiKycStatus = mapDomainKycStatusToApi(status);

      let message: string;
      if (status === 'verified') {
        message = 'Verificación KYC aprobada';
      } else if (status === 'rejected') {
        message = 'Verificación KYC rechazada';
      } else {
        message = 'Documentos recibidos para verificación';
      }

      const response: KycVerificationApiResponse = createSuccessResponse(
        message,
        {
          message,
          verificationId: `ver_${Date.now()}_${user.id}`,
          status: apiStatus,
          estimatedTime: status === 'pending' ? '24-48 horas' : 'Completada'
        }
      );

      res.json(response);
    } catch (err: any) {
      console.error('Error en KycController.verify:', err);
      const response: KycVerificationApiResponse = createErrorResponse(
        'Error en la verificación',
        [createGeneralError(err.message || 'Error interno del servidor')]
      );
      res.status(400).json(response);
    }
  }
} 