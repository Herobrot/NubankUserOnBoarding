import { KycVerifyDTO } from '../dtos/KycVerifyDTO';
import { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import { KycServicePort } from '../../domain/ports/KycServicePort';
import { DomainKycStatus } from '../../shared/types/response.types';

export class VerifyKycUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly kycService: KycServicePort
  ) {}

  async execute(dto: KycVerifyDTO): Promise<DomainKycStatus> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    const status = await this.kycService.verifyIdentity(user, dto.documents);
    
    if (status === 'verified') {
      user.verifyKyc(dto.documents);
    } else if (status === 'rejected') {
      user.rejectKyc('Documentos rechazados por el servicio KYC');
    }
    
    await this.userRepository.save(user);
    await this.userRepository.publishEvents(user.domainEvents);
    
    return status;
  }
} 