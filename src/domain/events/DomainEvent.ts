export interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly version: number;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventType: string;
  public readonly aggregateId: string;
  public readonly version: number;

  constructor(aggregateId: string, version: number = 1) {
    this.eventId = this.generateEventId();
    this.occurredOn = new Date();
    this.eventType = this.constructor.name;
    this.aggregateId = aggregateId;
    this.version = version;
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2,9)}`;
  }
} 