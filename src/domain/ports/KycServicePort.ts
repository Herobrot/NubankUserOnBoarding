import { User } from '../entities/User';
import { DomainKycStatus } from '../../shared/types/response.types';

export interface KycServicePort {
  verifyIdentity(user: User, documents: any): 
  Promise<DomainKycStatus>;
}