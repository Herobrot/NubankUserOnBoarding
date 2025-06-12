import { RegisterUserDTO } from '../dtos/RegisterUserDTO';
import { User } from '../../domain/entities/User';
import { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import { AuthServicePort } from '../../domain/ports/AuthServicePort';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authService: AuthServicePort
  ) {}

  async execute(dto: RegisterUserDTO): Promise<User> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('El correo ya está registrado');
    }
    const hashedPassword = await this.authService.hashPassword(dto.password);
    const user = new User({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });
    return this.userRepository.create(user);
  }
} 