import { 
  UserRegisteredEvent, 
  UserKycVerifiedEvent, 
  UserKycRejectedEvent, 
  UserProfileUpdatedEvent 
} from '../../../../src/domain/events/UserEvents';

describe('UserEvents', () => {
  describe('UserRegisteredEvent', () => {
    it('debería crear un evento de registro de usuario', () => {
      const event = new UserRegisteredEvent(
        'user-123',
        'juan.perez@example.com',
        'Juan Pérez'
      );

      expect(event.aggregateId).toBe('user-123');
      expect(event.email).toBe('juan.perez@example.com');
      expect(event.name).toBe('Juan Pérez');
      expect(event.eventType).toBe('UserRegisteredEvent');
      expect(event.version).toBe(1);
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
    });

    it('debería crear un evento con versión específica', () => {
      const event = new UserRegisteredEvent(
        'user-123',
        'juan.perez@example.com',
        'Juan Pérez',
        5
      );

      expect(event.version).toBe(5);
    });

    it('debería manejar diferentes datos de usuario', () => {
      const event1 = new UserRegisteredEvent(
        'user-1',
        'user1@example.com',
        'Usuario 1'
      );

      const event2 = new UserRegisteredEvent(
        'user-2',
        'user2@example.com',
        'Usuario 2'
      );

      expect(event1.email).toBe('user1@example.com');
      expect(event1.name).toBe('Usuario 1');
      expect(event2.email).toBe('user2@example.com');
      expect(event2.name).toBe('Usuario 2');
    });
  });

  describe('UserKycVerifiedEvent', () => {
    it('debería crear un evento de verificación KYC', () => {
      const kycData = {
        documentNumber: '12345678',
        documentType: 'DNI',
        verificationDate: new Date(),
        verifiedBy: 'system'
      };

      const event = new UserKycVerifiedEvent('user-123', kycData);

      expect(event.aggregateId).toBe('user-123');
      expect(event.kycData).toBe(kycData);
      expect(event.eventType).toBe('UserKycVerifiedEvent');
      expect(event.version).toBe(1);
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
    });

    it('debería manejar diferentes tipos de datos KYC', () => {
      const kycData1 = { documentNumber: '12345678', documentType: 'DNI' };
      const kycData2 = { 
        documentNumber: '87654321', 
        documentType: 'PASSPORT',
        additionalInfo: 'Extra data'
      };

      const event1 = new UserKycVerifiedEvent('user-1', kycData1);
      const event2 = new UserKycVerifiedEvent('user-2', kycData2);

      expect(event1.kycData).toEqual(kycData1);
      expect(event2.kycData).toEqual(kycData2);
    });

    it('debería crear un evento con versión específica', () => {
      const kycData = { documentNumber: '12345678' };
      const event = new UserKycVerifiedEvent('user-123', kycData, 3);

      expect(event.version).toBe(3);
    });
  });

  describe('UserKycRejectedEvent', () => {
    it('debería crear un evento de rechazo KYC', () => {
      const reason = 'Documento ilegible o incompleto';

      const event = new UserKycRejectedEvent('user-123', reason);

      expect(event.aggregateId).toBe('user-123');
      expect(event.reason).toBe(reason);
      expect(event.eventType).toBe('UserKycRejectedEvent');
      expect(event.version).toBe(1);
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
    });

    it('debería manejar diferentes razones de rechazo', () => {
      const reason1 = 'Documento expirado';
      const reason2 = 'Información inconsistente';
      const reason3 = 'Documento no válido';

      const event1 = new UserKycRejectedEvent('user-1', reason1);
      const event2 = new UserKycRejectedEvent('user-2', reason2);
      const event3 = new UserKycRejectedEvent('user-3', reason3);

      expect(event1.reason).toBe(reason1);
      expect(event2.reason).toBe(reason2);
      expect(event3.reason).toBe(reason3);
    });

    it('debería crear un evento con versión específica', () => {
      const event = new UserKycRejectedEvent('user-123', 'Test reason', 7);

      expect(event.version).toBe(7);
    });
  });

  describe('UserProfileUpdatedEvent', () => {
    it('debería crear un evento de actualización de perfil', () => {
      const updatedFields = {
        name: 'María García',
        email: 'maria.garcia@example.com'
      };

      const event = new UserProfileUpdatedEvent('user-123', updatedFields);

      expect(event.aggregateId).toBe('user-123');
      expect(event.updatedFields).toEqual(updatedFields);
      expect(event.eventType).toBe('UserProfileUpdatedEvent');
      expect(event.version).toBe(1);
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
    });

    it('debería manejar actualización solo del nombre', () => {
      const updatedFields = { name: 'Nuevo Nombre' };

      const event = new UserProfileUpdatedEvent('user-123', updatedFields);

      expect(event.updatedFields).toEqual(updatedFields);
      expect(event.updatedFields.email).toBeUndefined();
    });

    it('debería manejar actualización solo del email', () => {
      const updatedFields = { email: 'nuevo@example.com' };

      const event = new UserProfileUpdatedEvent('user-123', updatedFields);

      expect(event.updatedFields).toEqual(updatedFields);
      expect(event.updatedFields.name).toBeUndefined();
    });

    it('debería manejar actualización parcial de campos', () => {
      const updatedFields = { name: 'Solo Nombre' };

      const event = new UserProfileUpdatedEvent('user-123', updatedFields);

      expect(event.updatedFields.name).toBe('Solo Nombre');
      expect(event.updatedFields.email).toBeUndefined();
    });

    it('debería crear un evento con versión específica', () => {
      const updatedFields = { name: 'Test Name' };
      const event = new UserProfileUpdatedEvent('user-123', updatedFields, 10);

      expect(event.version).toBe(10);
    });
  });

  describe('Propiedades comunes de eventos', () => {
    it('debería generar IDs únicos para cada evento', () => {
      const event1 = new UserRegisteredEvent('user-1', 'email1@test.com', 'User 1');
      const event2 = new UserKycVerifiedEvent('user-2', {});
      const event3 = new UserKycRejectedEvent('user-3', 'reason');
      const event4 = new UserProfileUpdatedEvent('user-4', { name: 'User 4' });

      const eventIds = [event1.eventId, event2.eventId, event3.eventId, event4.eventId];
      const uniqueIds = new Set(eventIds);

      expect(uniqueIds.size).toBe(4);
    });

    it('debería establecer fechas de ocurrencia diferentes', () => {
      const beforeEvents = new Date();
      
      // Pequeña pausa
      setTimeout(() => {}, 1);
      
      const event1 = new UserRegisteredEvent('user-1', 'email1@test.com', 'User 1');
      const event2 = new UserKycVerifiedEvent('user-2', {});
      
      // Pequeña pausa
      setTimeout(() => {}, 1);
      
      const event3 = new UserKycRejectedEvent('user-3', 'reason');
      const event4 = new UserProfileUpdatedEvent('user-4', { name: 'User 4' });
      
      const afterEvents = new Date();

      [event1, event2, event3, event4].forEach(event => {
        expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(beforeEvents.getTime());
        expect(event.occurredOn.getTime()).toBeLessThanOrEqual(afterEvents.getTime());
      });
    });

    it('debería tener propiedades correctas', () => {
      const event = new UserRegisteredEvent('user-123', 'test@example.com', 'Test User');

      expect(event.email).toBe('test@example.com');
      expect(event.name).toBe('Test User');
      expect(event.aggregateId).toBe('user-123');
      expect(event.eventType).toBe('UserRegisteredEvent');
    });
  });

  describe('Casos edge', () => {
    it('debería manejar strings vacíos en eventos', () => {
      const event1 = new UserRegisteredEvent('user-123', '', '');
      const event2 = new UserKycRejectedEvent('user-123', '');

      expect(event1.email).toBe('');
      expect(event1.name).toBe('');
      expect(event2.reason).toBe('');
    });

    it('debería manejar objetos vacíos en datos KYC', () => {
      const event = new UserKycVerifiedEvent('user-123', {});

      expect(event.kycData).toEqual({});
    });

    it('debería manejar objetos vacíos en campos actualizados', () => {
      const event = new UserProfileUpdatedEvent('user-123', {});

      expect(event.updatedFields).toEqual({});
    });

    it('debería manejar caracteres especiales en razones de rechazo', () => {
      const reason = 'Razón con caracteres especiales: áéíóú ñ @#$%^&*()';
      const event = new UserKycRejectedEvent('user-123', reason);

      expect(event.reason).toBe(reason);
    });
  });
}); 