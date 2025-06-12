import { LoginUserDTO } from '../dtos/LoginUserDTO';
import { User } from '../../domain/entities/User';
import { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import { AuthServicePort } from '../../domain/ports/AuthServicePort';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authService: AuthServicePort
  ) {}

  async execute(dto: LoginUserDTO): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    const valid = await this.authService.comparePassword(dto.password, user.password);
    if (!valid) {
      throw new Error('Credenciales inválidas');
    }
    const token = this.authService.generateToken(user);
    return { user, token };
  }
} 