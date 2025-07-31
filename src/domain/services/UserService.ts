import { User, UserProps } from '../entities/User';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';

export class UserService {
  constructor(
    private readonly userRepository: UserRepositoryPort
  ) {}

  async register(userProps: UserProps): Promise<User> {
    const user = new User(userProps);
    
    user.register();
    
    return this.userRepository.save(user);
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async update(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async verifyKyc(userId: string, kycData: any): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.verifyKyc(kycData);
    return this.userRepository.save(user);
  }

  async rejectKyc(userId: string, reason: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.rejectKyc(reason);
    return this.userRepository.save(user);
  }

  async updateProfile(userId: string, updates: Partial<{ name: string; email: string }>): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.updateProfile(updates);
    return this.userRepository.save(user);
  }
} 