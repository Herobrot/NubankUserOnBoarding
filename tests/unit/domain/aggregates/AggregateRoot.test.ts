import { AggregateRoot } from '../../../../src/domain/aggregates/AggregateRoot';
import { DomainEvent } from '../../../../src/domain/events/DomainEvent';

// Clase concreta para testing de AggregateRoot
class TestAggregate extends AggregateRoot {
  public testApply(event: DomainEvent): void {
    this.apply(event);
  }

  public testAddDomainEvent(event: DomainEvent): void {
    this.addDomainEvent(event);
  }

  public testIncrementVersion(): void {
    this.incrementVersion();
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

describe('AggregateRoot', () => {
  let aggregate: TestAggregate;

  beforeEach(() => {
    aggregate = new TestAggregate();
  });

  describe('Constructor', () => {
    it('debería inicializar con versión 0 y sin eventos', () => {
      expect(aggregate.version).toBe(0);
      expect(aggregate.domainEvents).toHaveLength(0);
    });
  });

  describe('domainEvents', () => {
    it('debería retornar una copia de los eventos de dominio', () => {
      const event1 = new MockDomainEvent('event-1');
      const event2 = new MockDomainEvent('event-2');

      aggregate.testAddDomainEvent(event1);
      aggregate.testAddDomainEvent(event2);

      const events = aggregate.domainEvents;
      expect(events).toHaveLength(2);
      expect(events[0]).toBe(event1);
      expect(events[1]).toBe(event2);

      // Verificar que es una copia
      events.push(new MockDomainEvent('event-3'));
      expect(aggregate.domainEvents).toHaveLength(2);
    });
  });

  describe('version', () => {
    it('debería retornar la versión actual del agregado', () => {
      expect(aggregate.version).toBe(0);
      
      aggregate.testIncrementVersion();
      expect(aggregate.version).toBe(1);
      
      aggregate.testIncrementVersion();
      expect(aggregate.version).toBe(2);
    });
  });

  describe('addDomainEvent', () => {
    it('debería agregar un evento de dominio', () => {
      const event = new MockDomainEvent();
      
      aggregate.testAddDomainEvent(event);
      
      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate.domainEvents[0]).toBe(event);
    });

    it('debería agregar múltiples eventos de dominio', () => {
      const event1 = new MockDomainEvent('event-1');
      const event2 = new MockDomainEvent('event-2');
      const event3 = new MockDomainEvent('event-3');
      
      aggregate.testAddDomainEvent(event1);
      aggregate.testAddDomainEvent(event2);
      aggregate.testAddDomainEvent(event3);
      
      expect(aggregate.domainEvents).toHaveLength(3);
      expect(aggregate.domainEvents[0]).toBe(event1);
      expect(aggregate.domainEvents[1]).toBe(event2);
      expect(aggregate.domainEvents[2]).toBe(event3);
    });
  });

  describe('incrementVersion', () => {
    it('debería incrementar la versión en 1', () => {
      expect(aggregate.version).toBe(0);
      
      aggregate.testIncrementVersion();
      expect(aggregate.version).toBe(1);
      
      aggregate.testIncrementVersion();
      expect(aggregate.version).toBe(2);
    });
  });

  describe('clearEvents', () => {
    it('debería limpiar todos los eventos de dominio', () => {
      const event1 = new MockDomainEvent('event-1');
      const event2 = new MockDomainEvent('event-2');
      
      aggregate.testAddDomainEvent(event1);
      aggregate.testAddDomainEvent(event2);
      
      expect(aggregate.domainEvents).toHaveLength(2);
      
      aggregate.clearEvents();
      
      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it('debería mantener la versión al limpiar eventos', () => {
      aggregate.testIncrementVersion();
      aggregate.testIncrementVersion();
      
      const event = new MockDomainEvent();
      aggregate.testAddDomainEvent(event);
      
      expect(aggregate.version).toBe(2);
      
      aggregate.clearEvents();
      
      expect(aggregate.version).toBe(2);
      expect(aggregate.domainEvents).toHaveLength(0);
    });
  });

  describe('apply', () => {
    it('debería agregar un evento y incrementar la versión', () => {
      const event = new MockDomainEvent();
      
      aggregate.testApply(event);
      
      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate.domainEvents[0]).toBe(event);
      expect(aggregate.version).toBe(1);
    });

    it('debería aplicar múltiples eventos y mantener el conteo de versión', () => {
      const event1 = new MockDomainEvent('event-1');
      const event2 = new MockDomainEvent('event-2');
      const event3 = new MockDomainEvent('event-3');
      
      aggregate.testApply(event1);
      aggregate.testApply(event2);
      aggregate.testApply(event3);
      
      expect(aggregate.domainEvents).toHaveLength(3);
      expect(aggregate.version).toBe(3);
      expect(aggregate.domainEvents[0]).toBe(event1);
      expect(aggregate.domainEvents[1]).toBe(event2);
      expect(aggregate.domainEvents[2]).toBe(event3);
    });

    it('debería mantener la consistencia entre eventos y versión', () => {
      // Aplicar algunos eventos
      aggregate.testApply(new MockDomainEvent('event-1'));
      aggregate.testApply(new MockDomainEvent('event-2'));
      
      expect(aggregate.domainEvents).toHaveLength(2);
      expect(aggregate.version).toBe(2);
      
      // Limpiar eventos
      aggregate.clearEvents();
      
      expect(aggregate.domainEvents).toHaveLength(0);
      expect(aggregate.version).toBe(2); // La versión se mantiene
      
      // Aplicar más eventos
      aggregate.testApply(new MockDomainEvent('event-3'));
      aggregate.testApply(new MockDomainEvent('event-4'));
      
      expect(aggregate.domainEvents).toHaveLength(2);
      expect(aggregate.version).toBe(4);
    });
  });

  describe('Integración', () => {
    it('debería manejar correctamente el flujo completo de eventos', () => {
      // Estado inicial
      expect(aggregate.version).toBe(0);
      expect(aggregate.domainEvents).toHaveLength(0);
      
      // Aplicar eventos
      aggregate.testApply(new MockDomainEvent('event-1'));
      aggregate.testApply(new MockDomainEvent('event-2'));
      
      // Verificar estado
      expect(aggregate.version).toBe(2);
      expect(aggregate.domainEvents).toHaveLength(2);
      
      // Limpiar eventos
      aggregate.clearEvents();
      
      // Verificar estado después de limpiar
      expect(aggregate.version).toBe(2);
      expect(aggregate.domainEvents).toHaveLength(0);
      
      // Aplicar más eventos
      aggregate.testApply(new MockDomainEvent('event-3'));
      
      // Verificar estado final
      expect(aggregate.version).toBe(3);
      expect(aggregate.domainEvents).toHaveLength(1);
    });
  });
}); 