import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../../domain/entities/User';
import { AuthServicePort } from '../../../domain/ports/AuthServicePort';

const JWT_SECRET = process.env.JWT_SECRET ?? 'LaBatallaYaHaAEmpezado';

export class AuthService implements AuthServicePort {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async verifyToken(token: string): Promise<{ id: string; email: string } | null> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      return {
        id: payload.id,
        email: payload.email
      };
    } catch {
      return null;
    }
  }
} 