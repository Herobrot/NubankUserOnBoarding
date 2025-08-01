import { User, UserProps } from '../../../../src/domain/entities/User';
import { UserRegisteredEvent, UserKycVerifiedEvent, UserKycRejectedEvent, UserProfileUpdatedEvent } from '../../../../src/domain/events/UserEvents';

describe('User Entity', () => {
  let userProps: UserProps;

  beforeEach(() => {
    userProps = {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'password123'
    };
  });

  describe('Constructor', () => {
    it('debería crear un usuario con propiedades básicas', () => {
      const user = new User(userProps);

      expect(user.name).toBe('Juan Pérez');
      expect(user.email).toBe('juan.perez@example.com');
      expect(user.password).toBe('password123');
      expect(user.kycStatus).toBe('pending');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('debería crear un usuario con ID existente', () => {
      const userWithId = new User({
        ...userProps,
        id: 'user-123'
      });

      expect(userWithId.id).toBe('user-123');
    });

    it('debería crear un usuario con estado KYC específico', () => {
      const userWithKyc = new User({
        ...userProps,
        kycStatus: 'verified'
      });

      expect(userWithKyc.kycStatus).toBe('verified');
    });

    it('debería crear un usuario con fechas específicas', () => {
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');
      
      const userWithDates = new User({
        ...userProps,
        createdAt,
        updatedAt
      });

      expect(userWithDates.createdAt).toBe(createdAt);
      expect(userWithDates.updatedAt).toBe(updatedAt);
    });
  });

  describe('Getters', () => {
    it('debería retornar las propiedades correctas', () => {
      const user = new User(userProps);

      expect(user.name).toBe('Juan Pérez');
      expect(user.email).toBe('juan.perez@example.com');
      expect(user.password).toBe('password123');
      expect(user.kycStatus).toBe('pending');
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('register()', () => {
    it('debería registrar un usuario y emitir evento', () => {
      const user = new User(userProps);

      user.register();

      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
      expect(events[0].eventType).toBe('UserRegisteredEvent');
    });

    it('debería lanzar error si el usuario ya está registrado', () => {
      const user = new User({
        ...userProps,
        id: 'user-123'
      });

      expect(() => user.register()).toThrow('Usuario ya registrado');
    });
  });

  describe('verifyKyc()', () => {
    it('debería verificar KYC y emitir evento', () => {
      const user = new User({
        ...userProps,
        id: 'user-123'
      });

      const kycData = { documentNumber: '12345678', documentType: 'DNI' };
      user.verifyKyc(kycData);

      expect(user.kycStatus).toBe('verified');
      
      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserKycVerifiedEvent);
      expect(events[0].eventType).toBe('UserKycVerifiedEvent');
    });

    it('debería lanzar error si KYC ya está verificado', () => {
      const user = new User({
        ...userProps,
        id: 'user-123',
        kycStatus: 'verified'
      });

      expect(() => user.verifyKyc({})).toThrow('KYC ya está verificado');
    });
  });

  describe('rejectKyc()', () => {
    it('debería rechazar KYC y emitir evento', () => {
      const user = new User({
        ...userProps,
        id: 'user-123'
      });

      const reason = 'Documento ilegible';
      user.rejectKyc(reason);

      expect(user.kycStatus).toBe('rejected');
      
      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserKycRejectedEvent);
      expect(events[0].eventType).toBe('UserKycRejectedEvent');
    });

    it('debería lanzar error si KYC ya está rechazado', () => {
      const user = new User({
        ...userProps,
        id: 'user-123',
        kycStatus: 'rejected'
      });

      expect(() => user.rejectKyc('Razón')).toThrow('KYC ya está rechazado');
    });
  });

  describe('updateProfile()', () => {
    it('debería actualizar nombre y emitir evento', () => {
      const user = new User({
        ...userProps,
        id: 'user-123'
      });

      user.updateProfile({ name: 'María García' });

      expect(user.name).toBe('María García');
      
      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserProfileUpdatedEvent);
      expect(events[0].eventType).toBe('UserProfileUpdatedEvent');
    });

    it('debería actualizar email y emitir evento', () => {
      const user = new User({
        ...userProps,
        id: 'user-123'
      });

      user.updateProfile({ email: 'maria.garcia@example.com' });

      expect(user.email).toBe('maria.garcia@example.com');
      
      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserProfileUpdatedEvent);
    });

    it('debería actualizar múltiples campos y emitir evento', () => {
      const user = new User({
        ...userProps,
        id: 'user-123'
      });

      user.updateProfile({
        name: 'María García',
        email: 'maria.garcia@example.com'
      });

      expect(user.name).toBe('María García');
      expect(user.email).toBe('maria.garcia@example.com');
      
      const events = user.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserProfileUpdatedEvent);
    });

    it('no debería emitir evento si no hay cambios', () => {
      const user = new User({
        ...userProps,
        id: 'user-123'
      });

      user.updateProfile({ name: 'Juan Pérez' }); // Mismo nombre

      const events = user.domainEvents;
      expect(events).toHaveLength(0);
    });

    it('no debería emitir evento si no se proporcionan actualizaciones', () => {
      const user = new User({
        ...userProps,
        id: 'user-123'
      });

      user.updateProfile({});

      const events = user.domainEvents;
      expect(events).toHaveLength(0);
    });
  });

  describe('toProps()', () => {
    it('debería retornar las propiedades del usuario', () => {
      const user = new User({
        ...userProps,
        id: 'user-123',
        kycStatus: 'verified'
      });

      const props = user.toProps();

      expect(props).toEqual({
        id: 'user-123',
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123',
        kycStatus: 'verified',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    });
  });

  describe('Version y Eventos', () => {
    it('debería incrementar la versión al aplicar eventos', () => {
      const user = new User(userProps);

      expect(user.version).toBe(0);

      user.register();
      expect(user.version).toBe(1);

      // Crear un nuevo usuario con ID para verificar KYC
      const userWithId = new User({
        ...userProps,
        id: 'user-123'
      });
      userWithId.verifyKyc({});
      expect(userWithId.version).toBe(1);
    });

    it('debería limpiar eventos después de clearEvents()', () => {
      const user = new User(userProps);

      user.register();
      expect(user.domainEvents).toHaveLength(1);

      user.clearEvents();
      expect(user.domainEvents).toHaveLength(0);
    });
  });
}); 