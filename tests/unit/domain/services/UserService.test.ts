import { UserService } from '../../../../src/domain/services/UserService';
import { User, UserProps } from '../../../../src/domain/entities/User';
import { UserRepositoryPort } from '../../../../src/domain/ports/UserRepositoryPort';
import { DomainEvent } from '../../../../src/domain/events/DomainEvent';
import { EventPublishResult } from '../../../../src/shared/types/response.types';

// Mock del UserRepositoryPort
class MockUserRepository implements UserRepositoryPort {
  private readonly users: Map<string, User> = new Map();
  private readonly usersByEmail: Map<string, User> = new Map();

  async create(user: User): Promise<User> {
    return this.save(user);
  }

  async save(user: User): Promise<User> {
    // Simular el comportamiento de BaseRepository:
    // 1. Crear una nueva instancia con ID si no existe
    const userToSave = new User({
      ...user.toProps(),
      id: user.id || `user-${Date.now()}-${Math.random().toString(36).substring(2,9)}`
    });
    
    // 2. Preservar todos los eventos del usuario original
    user.domainEvents.forEach(event => {
      userToSave['addDomainEvent'](event);
    });
    
    // 3. Guardar el usuario en el repositorio
    this.users.set(userToSave.id!, userToSave);
    this.usersByEmail.set(userToSave.email, userToSave);
    
    // 4. Limpiar eventos del usuario original (como lo haría BaseRepository)
    user.clearEvents();
    
    // 5. Retornar el usuario guardado
    return userToSave;
  }

  async update(user: User): Promise<User> {
    return this.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null;
  }

  async publishEvents(events: DomainEvent[]): Promise<EventPublishResult> {
    // Mock implementation
    return Promise.resolve();
  }

  // Método para testing
  clear(): void {
    this.users.clear();
    this.usersByEmail.clear();
  }
}

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    userService = new UserService(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);

      expect(user).toBeInstanceOf(User);
      expect(user.name).toBe('Juan Pérez');
      expect(user.email).toBe('juan.perez@example.com');
      expect(user.password).toBe('password123');
      expect(user.kycStatus).toBe('pending');
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('debería emitir evento de registro al crear usuario', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);

      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('UserRegisteredEvent');
    });

    it('debería guardar el usuario en el repositorio', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);

      const savedUser = await mockRepository.findById(user.id!);
      expect(savedUser).toBeDefined();
      expect(savedUser!.name).toBe('Juan Pérez');
      expect(savedUser!.email).toBe('juan.perez@example.com');
    });
  });

  describe('getByEmail', () => {
    it('debería retornar un usuario por email', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const createdUser = await userService.register(userProps);
      const foundUser = await userService.getByEmail('juan.perez@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(createdUser.id);
      expect(foundUser!.name).toBe('Juan Pérez');
      expect(foundUser!.email).toBe('juan.perez@example.com');
    });

    it('debería retornar null si el usuario no existe', async () => {
      const foundUser = await userService.getByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });
  });

  describe('getById', () => {
    it('debería retornar un usuario por ID', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const createdUser = await userService.register(userProps);
      const foundUser = await userService.getById(createdUser.id!);

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(createdUser.id);
      expect(foundUser!.name).toBe('Juan Pérez');
      expect(foundUser!.email).toBe('juan.perez@example.com');
    });

    it('debería retornar null si el usuario no existe', async () => {
      const foundUser = await userService.getById('nonexistent-id');

      expect(foundUser).toBeNull();
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario existente', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      user.updateProfile({ name: 'María García' });

      const updatedUser = await userService.update(user);

      expect(updatedUser.name).toBe('María García');
      expect(updatedUser.email).toBe('juan.perez@example.com');
    });

    it('debería guardar los cambios en el repositorio', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      user.updateProfile({ name: 'María García' });

      await userService.update(user);

      const savedUser = await mockRepository.findById(user.id!);
      expect(savedUser!.name).toBe('María García');
    });
  });

  describe('verifyKyc', () => {
    it('debería verificar KYC de un usuario existente', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      const kycData = { documentNumber: '12345678', documentType: 'DNI' };

      const verifiedUser = await userService.verifyKyc(user.id!, kycData);

      expect(verifiedUser.kycStatus).toBe('verified');
      // El usuario debería tener tanto el evento de registro como el de verificación KYC
      expect(verifiedUser.domainEvents).toHaveLength(2);
      expect(verifiedUser.domainEvents[0].eventType).toBe('UserRegisteredEvent');
      expect(verifiedUser.domainEvents[1].eventType).toBe('UserKycVerifiedEvent');
    });

    it('debería lanzar error si el usuario no existe', async () => {
      const kycData = { documentNumber: '12345678' };

      await expect(userService.verifyKyc('nonexistent-id', kycData))
        .rejects.toThrow('Usuario no encontrado');
    });

    it('debería guardar el usuario verificado en el repositorio', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      const kycData = { documentNumber: '12345678' };

      await userService.verifyKyc(user.id!, kycData);

      const savedUser = await mockRepository.findById(user.id!);
      expect(savedUser!.kycStatus).toBe('verified');
    });
  });

  describe('rejectKyc', () => {
    it('debería rechazar KYC de un usuario existente', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      const reason = 'Documento ilegible';

      const rejectedUser = await userService.rejectKyc(user.id!, reason);

      expect(rejectedUser.kycStatus).toBe('rejected');
      // El usuario debería tener tanto el evento de registro como el de rechazo KYC
      expect(rejectedUser.domainEvents).toHaveLength(2);
      expect(rejectedUser.domainEvents[0].eventType).toBe('UserRegisteredEvent');
      expect(rejectedUser.domainEvents[1].eventType).toBe('UserKycRejectedEvent');
    });

    it('debería lanzar error si el usuario no existe', async () => {
      await expect(userService.rejectKyc('nonexistent-id', 'reason'))
        .rejects.toThrow('Usuario no encontrado');
    });

    it('debería guardar el usuario rechazado en el repositorio', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      const reason = 'Documento ilegible';

      await userService.rejectKyc(user.id!, reason);

      const savedUser = await mockRepository.findById(user.id!);
      expect(savedUser!.kycStatus).toBe('rejected');
    });
  });

  describe('updateProfile', () => {
    it('debería actualizar el perfil de un usuario existente', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      const updates = {
        name: 'María García',
        email: 'maria.garcia@example.com'
      };

      const updatedUser = await userService.updateProfile(user.id!, updates);

      expect(updatedUser.name).toBe('María García');
      expect(updatedUser.email).toBe('maria.garcia@example.com');
      // El usuario debería tener tanto el evento de registro como el de actualización de perfil
      expect(updatedUser.domainEvents).toHaveLength(2);
      expect(updatedUser.domainEvents[0].eventType).toBe('UserRegisteredEvent');
      expect(updatedUser.domainEvents[1].eventType).toBe('UserProfileUpdatedEvent');
    });

    it('debería actualizar solo el nombre', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      const updates = { name: 'María García' };

      const updatedUser = await userService.updateProfile(user.id!, updates);

      expect(updatedUser.name).toBe('María García');
      expect(updatedUser.email).toBe('juan.perez@example.com');
    });

    it('debería actualizar solo el email', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      const updates = { email: 'maria.garcia@example.com' };

      const updatedUser = await userService.updateProfile(user.id!, updates);

      expect(updatedUser.name).toBe('Juan Pérez');
      expect(updatedUser.email).toBe('maria.garcia@example.com');
    });

    it('debería lanzar error si el usuario no existe', async () => {
      const updates = { name: 'Nuevo Nombre' };

      await expect(userService.updateProfile('nonexistent-id', updates))
        .rejects.toThrow('Usuario no encontrado');
    });

    it('debería guardar los cambios en el repositorio', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      const updates = { name: 'María García' };

      await userService.updateProfile(user.id!, updates);

      const savedUser = await mockRepository.findById(user.id!);
      expect(savedUser!.name).toBe('María García');
    });

    it('no debería emitir evento si no hay cambios', async () => {
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      const updates = { name: 'Juan Pérez' }; // Mismo nombre

      const updatedUser = await userService.updateProfile(user.id!, updates);

      // Cuando no hay cambios, el usuario debería mantener solo el evento de registro
      // porque no se emite ningún evento nuevo
      expect(updatedUser.domainEvents).toHaveLength(1);
      expect(updatedUser.domainEvents[0].eventType).toBe('UserRegisteredEvent');
    });
  });

  describe('Integración', () => {
    it('debería manejar el flujo completo de registro y verificación KYC', async () => {
      // Registrar usuario
      const userProps: UserProps = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123'
      };

      const user = await userService.register(userProps);
      expect(user.kycStatus).toBe('pending');

      // Verificar KYC
      const kycData = { documentNumber: '12345678' };
      const verifiedUser = await userService.verifyKyc(user.id!, kycData);
      expect(verifiedUser.kycStatus).toBe('verified');

      // Actualizar perfil
      const updatedUser = await userService.updateProfile(user.id!, {
        name: 'María García'
      });
      expect(updatedUser.name).toBe('María García');
      expect(updatedUser.kycStatus).toBe('verified');
    });

    it('debería manejar múltiples usuarios independientemente', async () => {
      const user1Props: UserProps = {
        name: 'Usuario 1',
        email: 'user1@example.com',
        password: 'password1'
      };

      const user2Props: UserProps = {
        name: 'Usuario 2',
        email: 'user2@example.com',
        password: 'password2'
      };

      const user1 = await userService.register(user1Props);
      const user2 = await userService.register(user2Props);

      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).toBe('user1@example.com');
      expect(user2.email).toBe('user2@example.com');

      // Verificar que se pueden buscar independientemente
      const foundUser1 = await userService.getByEmail('user1@example.com');
      const foundUser2 = await userService.getByEmail('user2@example.com');

      expect(foundUser1!.id).toBe(user1.id);
      expect(foundUser2!.id).toBe(user2.id);
    });
  });
}); 