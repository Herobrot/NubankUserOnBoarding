import { BaseRepository } from '../../../../src/domain/repositories/BaseRepository';
import { AggregateRoot } from '../../../../src/domain/aggregates/AggregateRoot';
import { DomainEvent } from '../../../../src/domain/events/DomainEvent';
import { EventBus } from '../../../../src/domain/events/EventBus';

// Clase concreta para testing de BaseRepository
class TestAggregate extends AggregateRoot {
  public id?: string;

  constructor(id?: string) {
    super();
    this.id = id;
  }

  public testApply(event: DomainEvent): void {
    this.apply(event);
  }
}

// Mock de DomainEvent para testing
class MockDomainEvent implements DomainEvent {
  constructor(
    public readonly eventId: string = 'test-event-id',
    public readonly occurredOn: Date = new Date(),
    public readonly eventType: string = 'MockEvent',
    public readonly aggregateId: string = 'test-aggregate-id',
    public readonly version: number = 1
  ) {}
}

// Función helper para crear eventos con versión correcta
function createMockEventWithVersion(aggregate: TestAggregate, eventId: string = 'test-event-id'): MockDomainEvent {
  return new MockDomainEvent(
    eventId,
    new Date(),
    'MockEvent',
    aggregate.id || 'test-aggregate-id',
    aggregate.version + 1 // La versión del evento debe ser la siguiente versión del agregado
  );
}

// Mock de EventBus para testing
class MockEventBus implements EventBus {
  public publishedEvents: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.publishedEvents.push(event);
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: any): void {
    // No implementado para testing
  }

  unsubscribe(eventType: string, handler: any): void {
    // No implementado para testing
  }

  clear(): void {
    this.publishedEvents = [];
  }
}

// Implementación concreta de BaseRepository para testing
class TestRepository extends BaseRepository<TestAggregate> {
  private readonly aggregates: Map<string, TestAggregate> = new Map();

  protected async saveToDatabase(aggregate: TestAggregate): Promise<TestAggregate> {
    const savedAggregate = new TestAggregate();
    // Simular guardado en base de datos
    this.aggregates.set(aggregate.id || 'temp-id', savedAggregate);
    return savedAggregate;
  }

  // Método para testing
  clear(): void {
    this.aggregates.clear();
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let eventBus: MockEventBus;

  beforeEach(() => {
    eventBus = new MockEventBus();
    repository = new TestRepository(eventBus);
  });

  afterEach(() => {
    eventBus.clear();
    repository.clear();
  });

  describe('Constructor', () => {
    it('debería crear una instancia de BaseRepository', () => {
      expect(repository).toBeInstanceOf(TestRepository);
      expect(repository).toBeInstanceOf(BaseRepository);
    });
  });

  describe('publishEvents', () => {
    it('debería publicar eventos en el EventBus', async () => {
      const event1 = new MockDomainEvent('event-1');
      const event2 = new MockDomainEvent('event-2');
      const events = [event1, event2];

      await repository['publishEvents'](events);

      expect(eventBus.publishedEvents).toHaveLength(2);
      expect(eventBus.publishedEvents[0]).toBe(event1);
      expect(eventBus.publishedEvents[1]).toBe(event2);
    });

    it('debería manejar array vacío de eventos', async () => {
      await repository['publishEvents']([]);

      expect(eventBus.publishedEvents).toHaveLength(0);
    });

    it('debería publicar eventos secuencialmente', async () => {
      const event1 = new MockDomainEvent('event-1');
      const event2 = new MockDomainEvent('event-2');
      const event3 = new MockDomainEvent('event-3');
      const events = [event1, event2, event3];

      await repository['publishEvents'](events);

      expect(eventBus.publishedEvents).toHaveLength(3);
      expect(eventBus.publishedEvents[0]).toBe(event1);
      expect(eventBus.publishedEvents[1]).toBe(event2);
      expect(eventBus.publishedEvents[2]).toBe(event3);
    });
  });

  describe('saveAggregate', () => {
    it('debería guardar un agregado y publicar sus eventos', async () => {
      const aggregate = new TestAggregate();
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-1'));
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-2'));

      expect(aggregate.domainEvents).toHaveLength(2);

      const savedAggregate = await repository['saveAggregate'](aggregate);

      expect(savedAggregate).toBeInstanceOf(TestAggregate);
      expect(aggregate.domainEvents).toHaveLength(0); // Eventos limpiados
      expect(eventBus.publishedEvents).toHaveLength(2); // Eventos publicados
    });

    it('debería limpiar eventos después de guardar', async () => {
      const aggregate = new TestAggregate();
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-1'));

      await repository['saveAggregate'](aggregate);

      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it('debería manejar agregado sin eventos', async () => {
      const aggregate = new TestAggregate();

      const savedAggregate = await repository['saveAggregate'](aggregate);

      expect(savedAggregate).toBeInstanceOf(TestAggregate);
      expect(eventBus.publishedEvents).toHaveLength(0);
    });

    it('debería mantener la versión del agregado después de guardar', async () => {
      const aggregate = new TestAggregate();
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-1'));
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-2'));

      const originalVersion = aggregate.version;
      expect(originalVersion).toBe(2);

      await repository['saveAggregate'](aggregate);

      expect(aggregate.version).toBe(originalVersion); // La versión se mantiene
    });
  });

  describe('Integración', () => {
    it('debería manejar el flujo completo de guardado con eventos', async () => {
      const aggregate = new TestAggregate();
      
      // Aplicar múltiples eventos
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-1'));
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-2'));
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-3'));

      expect(aggregate.domainEvents).toHaveLength(3);
      expect(aggregate.version).toBe(3);

      // Guardar agregado
      const savedAggregate = await repository['saveAggregate'](aggregate);

      // Verificar que se guardó correctamente
      expect(savedAggregate).toBeInstanceOf(TestAggregate);
      
      // Verificar que los eventos se limpiaron
      expect(aggregate.domainEvents).toHaveLength(0);
      
      // Verificar que los eventos se publicaron
      expect(eventBus.publishedEvents).toHaveLength(3);
      expect(eventBus.publishedEvents[0].eventId).toBe('event-1');
      expect(eventBus.publishedEvents[1].eventId).toBe('event-2');
      expect(eventBus.publishedEvents[2].eventId).toBe('event-3');
    });

    it('debería manejar múltiples guardados secuenciales', async () => {
      const aggregate1 = new TestAggregate();
      const aggregate2 = new TestAggregate();

      aggregate1.testApply(createMockEventWithVersion(aggregate1, 'event-1'));
      aggregate2.testApply(createMockEventWithVersion(aggregate2, 'event-2'));

      await repository['saveAggregate'](aggregate1);
      await repository['saveAggregate'](aggregate2);

      expect(eventBus.publishedEvents).toHaveLength(2);
      expect(eventBus.publishedEvents[0].eventId).toBe('event-1');
      expect(eventBus.publishedEvents[1].eventId).toBe('event-2');
    });

    it('debería mantener la consistencia entre eventos y versión', async () => {
      const aggregate = new TestAggregate();

      // Aplicar eventos
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-1'));
      aggregate.testApply(createMockEventWithVersion(aggregate, 'event-2'));

      expect(aggregate.domainEvents).toHaveLength(2);
      expect(aggregate.version).toBe(2);

      // Guardar
      await repository['saveAggregate'](aggregate);

      // Verificar que los eventos se publicaron en el orden correcto
      expect(eventBus.publishedEvents).toHaveLength(2);
      expect(eventBus.publishedEvents[0].version).toBe(1);
      expect(eventBus.publishedEvents[1].version).toBe(2);
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar errores en la publicación de eventos', async () => {
      // Mock de EventBus que lanza error
      const errorEventBus: EventBus = {
        async publish(event: DomainEvent): Promise<void> {
          throw new Error('Error publishing event');
        },
        subscribe<T extends DomainEvent>(eventType: string, handler: any): void {},
        unsubscribe(eventType: string, handler: any): void {}
      };

      const errorRepository = new TestRepository(errorEventBus);
      const aggregate = new TestAggregate();
      aggregate.testApply(new MockDomainEvent('event-1'));

      await expect(errorRepository['publishEvents']([new MockDomainEvent('event-1')]))
        .rejects.toThrow('Error publishing event');
    });

    it('debería manejar errores en saveToDatabase', async () => {
      // Implementación que lanza error
      class ErrorRepository extends BaseRepository<TestAggregate> {
        protected async saveToDatabase(aggregate: TestAggregate): Promise<TestAggregate> {
          throw new Error('Database error');
        }
      }

      const errorRepository = new ErrorRepository(eventBus);
      const aggregate = new TestAggregate();

      await expect(errorRepository['saveAggregate'](aggregate))
        .rejects.toThrow('Database error');
    });
  });

  describe('Casos edge', () => {
    it('debería manejar agregado con muchos eventos', async () => {
      const aggregate = new TestAggregate();
      const events = [];

      // Crear muchos eventos
      for (let i = 0; i < 100; i++) {
        events.push(createMockEventWithVersion(aggregate, `event-${i}`));
        aggregate.testApply(events[i]);
      }

      expect(aggregate.domainEvents).toHaveLength(100);

      await repository['saveAggregate'](aggregate);

      expect(aggregate.domainEvents).toHaveLength(0);
      expect(eventBus.publishedEvents).toHaveLength(100);
    });

    it('debería manejar eventos con diferentes tipos', async () => {
      const aggregate = new TestAggregate();
      
      // Crear eventos con tipos específicos
      const event1 = new MockDomainEvent('event-1', new Date(), 'EventType1', aggregate.id || 'test-aggregate-id', 1);
      const event2 = new MockDomainEvent('event-2', new Date(), 'EventType2', aggregate.id || 'test-aggregate-id', 2);
      const event3 = new MockDomainEvent('event-3', new Date(), 'EventType1', aggregate.id || 'test-aggregate-id', 3);

      aggregate.testApply(event1);
      aggregate.testApply(event2);
      aggregate.testApply(event3);

      await repository['saveAggregate'](aggregate);

      expect(eventBus.publishedEvents).toHaveLength(3);
      expect(eventBus.publishedEvents[0].eventType).toBe('EventType1');
      expect(eventBus.publishedEvents[1].eventType).toBe('EventType2');
      expect(eventBus.publishedEvents[2].eventType).toBe('EventType1');
    });
  });
}); 