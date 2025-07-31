import { AggregateRoot } from '../aggregates/AggregateRoot';
import { UserRegisteredEvent, UserKycVerifiedEvent, UserKycRejectedEvent, UserProfileUpdatedEvent } from '../events/UserEvents';
import { DomainKycStatus } from '../../shared/types/response.types';

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  kycStatus?: DomainKycStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends AggregateRoot {
  public readonly id?: string;
  private _name: string;
  private _email: string;
  private readonly _password: string;
  private _kycStatus: DomainKycStatus;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    super();
    this.id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._kycStatus = props.kycStatus ?? 'pending';
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get password(): string { return this._password; }
  get kycStatus(): DomainKycStatus { return this._kycStatus; }
  get updatedAt(): Date { return this._updatedAt; }

  // Métodos de dominio
  public register(): void {
    if (this.id) {
      throw new Error('Usuario ya registrado');
    }
    
    this.apply(new UserRegisteredEvent(
      this.id || 'temp-id',
      this._email,
      this._name
    ));
  }

  public verifyKyc(kycData: any): void {
    if (this._kycStatus === 'verified') {
      throw new Error('KYC ya está verificado');
    }

    this._kycStatus = 'verified';
    this._updatedAt = new Date();

    this.apply(new UserKycVerifiedEvent(
      this.id!,
      kycData
    ));
  }

  public rejectKyc(reason: string): void {
    if (this._kycStatus === 'rejected') {
      throw new Error('KYC ya está rechazado');
    }

    this._kycStatus = 'rejected';
    this._updatedAt = new Date();

    this.apply(new UserKycRejectedEvent(
      this.id!,
      reason
    ));
  }

  public updateProfile(updates: Partial<{ name: string; email: string }>): void {
    const updatedFields: Partial<{ name: string; email: string }> = {};

    if (updates.name && updates.name !== this._name) {
      this._name = updates.name;
      updatedFields.name = updates.name;
    }

    if (updates.email && updates.email !== this._email) {
      this._email = updates.email;
      updatedFields.email = updates.email;
    }

    if (Object.keys(updatedFields).length > 0) {
      this._updatedAt = new Date();
      this.apply(new UserProfileUpdatedEvent(
        this.id!,
        updatedFields
      ));
    }
  }

  public toProps(): UserProps {
    return {
      id: this.id,
      name: this._name,
      email: this._email,
      password: this._password,
      kycStatus: this._kycStatus,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt
    };
  }
} 