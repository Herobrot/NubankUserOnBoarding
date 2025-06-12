import { User, UserProps } from '../entities/User';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';

export class UserService {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async register(userProps: UserProps): Promise<User> {
    const user = new User(userProps);
    return this.userRepository.create(user);
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async update(user: User): Promise<User> {
    return this.userRepository.update(user);
  }
} 