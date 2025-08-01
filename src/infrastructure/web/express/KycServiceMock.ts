import { KycServicePort } from '../../../domain/ports/KycServicePort';
import { User } from '../../../domain/entities/User';
import { DomainKycStatus } from '../../../shared/types/response.types';

export class KycServiceMock implements KycServicePort {
  async verifyIdentity(user: User, documents: any): Promise<DomainKycStatus> {
    return 'verified' as DomainKycStatus;
  }
} 