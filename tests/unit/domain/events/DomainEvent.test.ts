import { BaseDomainEvent } from '../../../../src/domain/events/DomainEvent';

// Clase concreta para testing de BaseDomainEvent
class TestDomainEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly testData: string,
    version: number = 1
  ) {
    super(aggregateId, version);
  }
}

describe('BaseDomainEvent', () => {
  describe('Constructor', () => {
    it('debería crear un evento con propiedades básicas', () => {
      const event = new TestDomainEvent('aggregate-123', 'test-data');

      expect(event.aggregateId).toBe('aggregate-123');
      expect(event.version).toBe(1);
      expect(event.testData).toBe('test-data');
      expect(event.eventType).toBe('TestDomainEvent');
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
      expect(typeof event.eventId).toBe('string');
    });

    it('debería crear un evento con versión específica', () => {
      const event = new TestDomainEvent('aggregate-123', 'test-data', 5);

      expect(event.aggregateId).toBe('aggregate-123');
      expect(event.version).toBe(5);
      expect(event.testData).toBe('test-data');
    });

    it('debería generar IDs únicos para diferentes eventos', () => {
      const event1 = new TestDomainEvent('aggregate-1', 'data-1');
      const event2 = new TestDomainEvent('aggregate-2', 'data-2');

      expect(event1.eventId).not.toBe(event2.eventId);
      expect(event1.eventId).toBeDefined();
      expect(event2.eventId).toBeDefined();
    });

    it('debería establecer la fecha de ocurrencia al momento de creación', () => {
      const beforeCreation = new Date();
      
      // Pequeña pausa para asegurar diferencia de tiempo
      setTimeout(() => {}, 1);
      
      const event = new TestDomainEvent('aggregate-123', 'test-data');
      
      const afterCreation = new Date();

      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('eventId', () => {
    it('debería generar un ID único con formato correcto', () => {
      const event = new TestDomainEvent('aggregate-123', 'test-data');
      
      expect(event.eventId).toMatch(/^\d+-[a-z0-9]+$/);
      expect(event.eventId.length).toBeGreaterThan(10);
    });

    it('debería generar IDs diferentes para eventos creados en momentos diferentes', () => {
      const event1 = new TestDomainEvent('aggregate-1', 'data-1');
      
      // Simular paso del tiempo
      const originalDateNow = Date.now;
      let mockTime = Date.now();
      Date.now = jest.fn(() => {
        mockTime += 1000;
        return mockTime;
      });

      const event2 = new TestDomainEvent('aggregate-2', 'data-2');
      
      // Restaurar Date.now
      Date.now = originalDateNow;

      expect(event1.eventId).not.toBe(event2.eventId);
    });
  });

  describe('eventType', () => {
    it('debería usar el nombre de la clase como tipo de evento', () => {
      const event = new TestDomainEvent('aggregate-123', 'test-data');
      expect(event.eventType).toBe('TestDomainEvent');
    });

    it('debería mantener el tipo de evento consistente', () => {
      const event1 = new TestDomainEvent('aggregate-1', 'data-1');
      const event2 = new TestDomainEvent('aggregate-2', 'data-2');

      expect(event1.eventType).toBe('TestDomainEvent');
      expect(event2.eventType).toBe('TestDomainEvent');
    });
  });

  describe('aggregateId', () => {
    it('debería almacenar el ID del agregado correctamente', () => {
      const aggregateId = 'user-123';
      const event = new TestDomainEvent(aggregateId, 'test-data');

      expect(event.aggregateId).toBe(aggregateId);
    });

    it('debería permitir diferentes IDs de agregado', () => {
      const event1 = new TestDomainEvent('user-1', 'data-1');
      const event2 = new TestDomainEvent('user-2', 'data-2');

      expect(event1.aggregateId).toBe('user-1');
      expect(event2.aggregateId).toBe('user-2');
    });
  });

  describe('version', () => {
    it('debería usar versión 1 por defecto', () => {
      const event = new TestDomainEvent('aggregate-123', 'test-data');
      expect(event.version).toBe(1);
    });

    it('debería permitir versiones específicas', () => {
      const event = new TestDomainEvent('aggregate-123', 'test-data', 10);
      expect(event.version).toBe(10);
    });

    it('debería manejar versiones incrementales', () => {
      const event1 = new TestDomainEvent('aggregate-123', 'data-1', 1);
      const event2 = new TestDomainEvent('aggregate-123', 'data-2', 2);
      const event3 = new TestDomainEvent('aggregate-123', 'data-3', 3);

      expect(event1.version).toBe(1);
      expect(event2.version).toBe(2);
      expect(event3.version).toBe(3);
    });
  });

  describe('occurredOn', () => {
    it('debería establecer la fecha de ocurrencia al momento de creación', () => {
      const beforeEvent = new Date();
      
      const event = new TestDomainEvent('aggregate-123', 'test-data');
      
      const afterEvent = new Date();

      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(beforeEvent.getTime());
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(afterEvent.getTime());
    });

    it('debería tener fecha de ocurrencia válida', () => {
      const event = new TestDomainEvent('aggregate-123', 'test-data');
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.occurredOn.getTime()).toBeGreaterThan(0);
    });
  });

  describe('Propiedades', () => {
    it('debería tener propiedades correctas', () => {
      const event = new TestDomainEvent('aggregate-123', 'test-data');

      expect(event.eventId).toBeDefined();
      expect(typeof event.eventId).toBe('string');
      expect(event.aggregateId).toBe('aggregate-123');
      expect(event.version).toBe(1);
      expect(event.eventType).toBe('TestDomainEvent');
    });
  });

  describe('Herencia', () => {
    it('debería permitir crear eventos especializados', () => {
      class UserCreatedEvent extends BaseDomainEvent {
        constructor(
          aggregateId: string,
          public readonly email: string,
          public readonly name: string,
          version: number = 1
        ) {
          super(aggregateId, version);
        }
      }

      const event = new UserCreatedEvent('user-123', 'test@example.com', 'Test User');

      expect(event.aggregateId).toBe('user-123');
      expect(event.email).toBe('test@example.com');
      expect(event.name).toBe('Test User');
      expect(event.eventType).toBe('UserCreatedEvent');
      expect(event.version).toBe(1);
    });
  });
}); 