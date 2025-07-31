import { UserRepositoryPort } from '../../../domain/ports/UserRepositoryPort';
import { User } from '../../../domain/entities/User';
import { UserModel, UserDocument } from './UserModel';
import { BaseRepository } from '../../../domain/repositories/BaseRepository';

export class UserRepository extends BaseRepository<User> implements UserRepositoryPort {
  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      kycStatus: user.kycStatus,
    });
    return this.toDomain(doc);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async update(user: User): Promise<User> {
    const doc = await UserModel.findByIdAndUpdate(
      user.id,
      {
        name: user.name,
        email: user.email,
        password: user.password,
        kycStatus: user.kycStatus,
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!doc) throw new Error('Usuario no encontrado');
    return this.toDomain(doc);
  }

  async save(user: User): Promise<User> {
    return this.saveAggregate(user);
  }

  async publishEvents(events: any[]): Promise<void> {
    await super.publishEvents(events);
  }

  protected async saveToDatabase(user: User): Promise<User> {
    if (user.id) {
      return this.update(user);
    } else {
      return this.create(user);
    }
  }

  private toDomain(doc: UserDocument): User {
    return new User({
      id: (doc._id as string),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      kycStatus: doc.kycStatus,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
} 