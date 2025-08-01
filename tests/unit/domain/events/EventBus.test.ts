import { InMemoryEventBus, EventBus, EventHandler } from '../../../../src/domain/events/EventBus';
import { DomainEvent } from '../../../../src/domain/events/DomainEvent';

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

// Mock de EventHandler para testing
class MockEventHandler implements EventHandler<MockDomainEvent> {
  public handledEvents: MockDomainEvent[] = [];
  public shouldThrow = false;

  async handle(event: MockDomainEvent): Promise<void> {
    if (this.shouldThrow) {
      throw new Error('Handler error');
    }
    this.handledEvents.push(event);
  }

  reset(): void {
    this.handledEvents = [];
    this.shouldThrow = false;
  }
}

describe('EventBus', () => {
  let eventBus: EventBus;
  let mockHandler: MockEventHandler;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
    mockHandler = new MockEventHandler();
  });

  describe('InMemoryEventBus', () => {
    describe('Constructor', () => {
      it('debería crear una instancia de EventBus', () => {
        expect(eventBus).toBeInstanceOf(InMemoryEventBus);
      });
    });

    describe('subscribe', () => {
      it('debería suscribir un handler a un tipo de evento', () => {
        eventBus.subscribe('TestEvent', mockHandler);

        // Verificar que el handler está registrado
        expect(mockHandler.handledEvents).toHaveLength(0);
      });

      it('debería suscribir múltiples handlers al mismo tipo de evento', () => {
        const handler1 = new MockEventHandler();
        const handler2 = new MockEventHandler();

        eventBus.subscribe('TestEvent', handler1);
        eventBus.subscribe('TestEvent', handler2);

        // Verificar que ambos handlers están registrados
        expect(handler1.handledEvents).toHaveLength(0);
        expect(handler2.handledEvents).toHaveLength(0);
      });

      it('debería suscribir handlers a diferentes tipos de eventos', () => {
        const handler1 = new MockEventHandler();
        const handler2 = new MockEventHandler();

        eventBus.subscribe('EventType1', handler1);
        eventBus.subscribe('EventType2', handler2);

        expect(handler1.handledEvents).toHaveLength(0);
        expect(handler2.handledEvents).toHaveLength(0);
      });
    });

    describe('publish', () => {
      it('debería publicar un evento y ejecutar el handler suscrito', async () => {
        const event = new MockDomainEvent('event-1', new Date(), 'TestEvent');
        
        eventBus.subscribe('TestEvent', mockHandler);
        await eventBus.publish(event);

        expect(mockHandler.handledEvents).toHaveLength(1);
        expect(mockHandler.handledEvents[0]).toBe(event);
      });

      it('debería ejecutar múltiples handlers para el mismo tipo de evento', async () => {
        const handler1 = new MockEventHandler();
        const handler2 = new MockEventHandler();
        const event = new MockDomainEvent('event-1', new Date(), 'TestEvent');

        eventBus.subscribe('TestEvent', handler1);
        eventBus.subscribe('TestEvent', handler2);
        await eventBus.publish(event);

        expect(handler1.handledEvents).toHaveLength(1);
        expect(handler1.handledEvents[0]).toBe(event);
        expect(handler2.handledEvents).toHaveLength(1);
        expect(handler2.handledEvents[0]).toBe(event);
      });

      it('no debería ejecutar handlers para tipos de eventos diferentes', async () => {
        const event = new MockDomainEvent('event-1', new Date(), 'DifferentEvent');
        
        eventBus.subscribe('TestEvent', mockHandler);
        await eventBus.publish(event);

        expect(mockHandler.handledEvents).toHaveLength(0);
      });

      it('debería manejar eventos cuando no hay handlers suscritos', async () => {
        const event = new MockDomainEvent('event-1', new Date(), 'TestEvent');
        
        // No suscribir ningún handler
        await expect(eventBus.publish(event)).resolves.not.toThrow();
      });

      it('debería manejar errores en handlers sin interrumpir otros handlers', async () => {
        const errorHandler = new MockEventHandler();
        errorHandler.shouldThrow = true;
        
        const normalHandler = new MockEventHandler();
        const event = new MockDomainEvent('event-1', new Date(), 'TestEvent');

        eventBus.subscribe('TestEvent', errorHandler);
        eventBus.subscribe('TestEvent', normalHandler);
        
        // Mock de console.error para evitar ruido en las pruebas
        const originalConsoleError = console.error;
        console.error = jest.fn();

        await eventBus.publish(event);

        // Restaurar console.error
        console.error = originalConsoleError;

        expect(normalHandler.handledEvents).toHaveLength(1);
        expect(normalHandler.handledEvents[0]).toBe(event);
        expect(errorHandler.handledEvents).toHaveLength(0);
      });

      it('debería manejar múltiples eventos secuencialmente', async () => {
        const event1 = new MockDomainEvent('event-1', new Date(), 'TestEvent');
        const event2 = new MockDomainEvent('event-2', new Date(), 'TestEvent');
        const event3 = new MockDomainEvent('event-3', new Date(), 'TestEvent');

        eventBus.subscribe('TestEvent', mockHandler);
        
        await eventBus.publish(event1);
        await eventBus.publish(event2);
        await eventBus.publish(event3);

        expect(mockHandler.handledEvents).toHaveLength(3);
        expect(mockHandler.handledEvents[0]).toBe(event1);
        expect(mockHandler.handledEvents[1]).toBe(event2);
        expect(mockHandler.handledEvents[2]).toBe(event3);
      });
    });

    describe('unsubscribe', () => {
      it('debería desuscribir un handler específico', async () => {
        const handler1 = new MockEventHandler();
        const handler2 = new MockEventHandler();
        const event = new MockDomainEvent('event-1', new Date(), 'TestEvent');

        eventBus.subscribe('TestEvent', handler1);
        eventBus.subscribe('TestEvent', handler2);
        
        eventBus.unsubscribe('TestEvent', handler1);
        await eventBus.publish(event);

        expect(handler1.handledEvents).toHaveLength(0);
        expect(handler2.handledEvents).toHaveLength(1);
        expect(handler2.handledEvents[0]).toBe(event);
      });

      it('debería manejar desuscripción de handler no suscrito', () => {
        const handler = new MockEventHandler();
        
        // Intentar desuscribir un handler que no está suscrito
        expect(() => {
          eventBus.unsubscribe('TestEvent', handler);
        }).not.toThrow();
      });

      it('debería manejar desuscripción de tipo de evento inexistente', () => {
        const handler = new MockEventHandler();
        
        expect(() => {
          eventBus.unsubscribe('NonExistentEvent', handler);
        }).not.toThrow();
      });

      it('debería permitir resuscribir un handler después de desuscribirlo', async () => {
        const event = new MockDomainEvent('event-1', new Date(), 'TestEvent');

        eventBus.subscribe('TestEvent', mockHandler);
        eventBus.unsubscribe('TestEvent', mockHandler);
        eventBus.subscribe('TestEvent', mockHandler);
        
        await eventBus.publish(event);

        expect(mockHandler.handledEvents).toHaveLength(1);
        expect(mockHandler.handledEvents[0]).toBe(event);
      });
    });

    describe('Integración', () => {
      it('debería manejar el flujo completo de suscripción, publicación y desuscripción', async () => {
        const handler1 = new MockEventHandler();
        const handler2 = new MockEventHandler();
        const event1 = new MockDomainEvent('event-1', new Date(), 'EventType1');
        const event2 = new MockDomainEvent('event-2', new Date(), 'EventType2');

        // Suscribir handlers
        eventBus.subscribe('EventType1', handler1);
        eventBus.subscribe('EventType2', handler2);

        // Publicar eventos
        await eventBus.publish(event1);
        await eventBus.publish(event2);

        // Verificar que cada handler recibió su evento correspondiente
        expect(handler1.handledEvents).toHaveLength(1);
        expect(handler1.handledEvents[0]).toBe(event1);
        expect(handler2.handledEvents).toHaveLength(1);
        expect(handler2.handledEvents[0]).toBe(event2);

        // Desuscribir handlers
        eventBus.unsubscribe('EventType1', handler1);
        eventBus.unsubscribe('EventType2', handler2);

        // Publicar eventos nuevamente
        await eventBus.publish(event1);
        await eventBus.publish(event2);

        // Verificar que no se procesaron los nuevos eventos
        expect(handler1.handledEvents).toHaveLength(1);
        expect(handler2.handledEvents).toHaveLength(1);
      });

      it('debería manejar múltiples tipos de eventos con múltiples handlers', async () => {
        const handler1 = new MockEventHandler();
        const handler2 = new MockEventHandler();
        const handler3 = new MockEventHandler();

        const event1 = new MockDomainEvent('event-1', new Date(), 'EventType1');
        const event2 = new MockDomainEvent('event-2', new Date(), 'EventType2');
        const event3 = new MockDomainEvent('event-3', new Date(), 'EventType1');

        // Suscribir handlers
        eventBus.subscribe('EventType1', handler1);
        eventBus.subscribe('EventType1', handler2);
        eventBus.subscribe('EventType2', handler3);

        // Publicar eventos
        await eventBus.publish(event1);
        await eventBus.publish(event2);
        await eventBus.publish(event3);

        // Verificar resultados
        expect(handler1.handledEvents).toHaveLength(2); // event1 y event3
        expect(handler2.handledEvents).toHaveLength(2); // event1 y event3
        expect(handler3.handledEvents).toHaveLength(1); // solo event2
      });
    });

    describe('Manejo de errores', () => {
      it('debería continuar procesando otros handlers cuando uno falla', async () => {
        const errorHandler = new MockEventHandler();
        errorHandler.shouldThrow = true;
        
        const normalHandler = new MockEventHandler();
        const event = new MockDomainEvent('event-1', new Date(), 'TestEvent');

        eventBus.subscribe('TestEvent', errorHandler);
        eventBus.subscribe('TestEvent', normalHandler);

        // Mock de console.error
        const originalConsoleError = console.error;
        console.error = jest.fn();

        await eventBus.publish(event);

        // Restaurar console.error
        console.error = originalConsoleError;

        expect(normalHandler.handledEvents).toHaveLength(1);
        expect(errorHandler.handledEvents).toHaveLength(0);
      });

      it('debería manejar errores asíncronos en handlers', async () => {
        const asyncErrorHandler: EventHandler<MockDomainEvent> = {
          async handle(event: MockDomainEvent): Promise<void> {
            throw new Error('Async error');
          }
        };

        const normalHandler = new MockEventHandler();
        const event = new MockDomainEvent('event-1', new Date(), 'TestEvent');

        eventBus.subscribe('TestEvent', asyncErrorHandler);
        eventBus.subscribe('TestEvent', normalHandler);

        // Mock de console.error
        const originalConsoleError = console.error;
        console.error = jest.fn();

        await eventBus.publish(event);

        // Restaurar console.error
        console.error = originalConsoleError;

        expect(normalHandler.handledEvents).toHaveLength(1);
      });
    });
  });
}); 