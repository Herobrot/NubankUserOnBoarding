import { User } from '../entities/User';
import { TokenVerificationResponse } from '../../shared/types/response.types';

export interface AuthServicePort {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(user: User): string;
  verifyToken(token: string): Promise<TokenVerificationResponse | null>;
} 