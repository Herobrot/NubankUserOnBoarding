import { KycVerifyDTO } from '../dtos/KycVerifyDTO';
import { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import { KycServicePort } from '../../domain/ports/KycServicePort';

export class VerifyKycUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly kycService: KycServicePort
  ) {}

  async execute(dto: KycVerifyDTO): Promise<'pending' | 'verified' | 'rejected'> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const status = await this.kycService.verifyIdentity(user, dto.documents);
    user.kycStatus = status;
    await this.userRepository.update(user);
    return status;
  }
} 