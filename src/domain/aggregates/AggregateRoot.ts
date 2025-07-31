import { DomainEvent } from '../events/DomainEvent';

export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];
  private _version: number = 0;

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  get version(): number {
    return this._version;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  protected incrementVersion(): void {
    this._version++;
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  protected apply(event: DomainEvent): void {
    this.addDomainEvent(event);
    this.incrementVersion();
  }
} 