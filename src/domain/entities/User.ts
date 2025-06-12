export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  kycStatus?: 'pending' | 'verified' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id?: string;
  public name: string;
  public email: string;
  public password: string;
  public kycStatus: 'pending' | 'verified' | 'rejected';
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.kycStatus = props.kycStatus ?? 'pending';
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
} 