import { User } from '../entities/User';

export interface KycServicePort {
  verifyIdentity(user: User, documents: any): Promise<'pending' | 'verified' | 'rejected'>;
} 