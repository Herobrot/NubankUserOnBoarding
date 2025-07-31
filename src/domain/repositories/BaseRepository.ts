import { AggregateRoot } from '../aggregates/AggregateRoot';
import { DomainEvent } from '../events/DomainEvent';
import { EventBus } from '../events/EventBus';

export abstract class BaseRepository<T extends AggregateRoot> {
  constructor(
    protected readonly eventBus: EventBus
  ) {}

  protected async publishEvents(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }

  protected async saveAggregate(aggregate: T): Promise<T> {
    const events = aggregate.domainEvents;
    aggregate.clearEvents();
    
    const savedAggregate = await this.saveToDatabase(aggregate);
    
    await this.publishEvents(events);
    
    return savedAggregate;
  }

  protected abstract saveToDatabase(aggregate: T): Promise<T>;
} 