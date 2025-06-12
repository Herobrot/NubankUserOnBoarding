import { User } from '../entities/User';

export interface AuthServicePort {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(user: User): string;
  verifyToken(token: string): Promise<User | null>;
} 