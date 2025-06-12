import { Request, Response } from 'express';
import { VerifyKycUseCase } from '../../application/use-cases/VerifyKycUseCase';
import { UserRepository } from '../../infrastructure/persistence/mongodb/UserRepository';
import { KycServiceMock } from '../../infrastructure/web/express/KycServiceMock';

const userRepository = new UserRepository();
const kycService = new KycServiceMock();
const verifyKycUseCase = new VerifyKycUseCase(userRepository, kycService);

export class KycController {
  static verify(req: Request, res: Response) {
    (async () => {
      try {
        const user = (req as any).user;
        const status = await verifyKycUseCase.execute({ userId: user.id, documents: req.body.documents });
        res.json({ status });
      } catch (err: any) {
        res.status(400).json({ message: err.message });
      }
    })();
  }
} 