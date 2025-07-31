import { BaseDomainEvent } from './DomainEvent';

export class UserRegisteredEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly email: string,
    public readonly name: string,
    version: number = 1
  ) {
    super(aggregateId, version);
  }
}

export class UserKycVerifiedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly kycData: any,
    version: number = 1
  ) {
    super(aggregateId, version);
  }
}

export class UserKycRejectedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly reason: string,
    version: number = 1
  ) {
    super(aggregateId, version);
  }
}

export class UserProfileUpdatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly updatedFields: Partial<{
      name: string;
      email: string;
    }>,
    version: number = 1
  ) {
    super(aggregateId, version);
  }
} 