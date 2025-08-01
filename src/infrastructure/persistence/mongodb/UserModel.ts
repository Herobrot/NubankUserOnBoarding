import { Schema, Document, model } from 'mongoose';
import { DomainKycStatus } from '../../../shared/types/response.types';

const KYC_STATUS_VALUES: DomainKycStatus[] = ['pending', 'verified', 'rejected'];

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  kycStatus: DomainKycStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  kycStatus: { type: String, enum: KYC_STATUS_VALUES, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserModel = model<UserDocument>('User', UserSchema); 