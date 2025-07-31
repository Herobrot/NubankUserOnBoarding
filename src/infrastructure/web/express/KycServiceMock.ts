import { KycServicePort } from '../../../domain/ports/KycServicePort';
import { User } from '../../../domain/entities/User';

export class KycServiceMock implements KycServicePort {
  async verifyIdentity(user: User, documents: any): Promise<'pending' | 'verified' | 'rejected'> {
    return 'verified';
  }
} 