import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../../domain/entities/User';
import { AuthServicePort } from '../../../domain/ports/AuthServicePort';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

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

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      return new User({
        id: payload.id,
        name: '',
        email: payload.email,
        password: '',
      });
    } catch {
      return null;
    }
  }
} 