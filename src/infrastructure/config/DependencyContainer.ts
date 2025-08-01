import { EventBus, InMemoryEventBus } from '../../domain/events/EventBus';
import { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import { UserRepository } from '../persistence/mongodb/UserRepository';
import { UserService } from '../../domain/services/UserService';
import { AuthServicePort } from '../../domain/ports/AuthServicePort';
import { AuthService } from '../web/express/AuthService';
import { KycServicePort } from '../../domain/ports/KycServicePort';
import { KycServiceMock } from '../web/express/KycServiceMock';
import { 
  UserRegisteredEventHandler, 
  UserKycVerifiedEventHandler, 
  UserKycRejectedEventHandler, 
  UserProfileUpdatedEventHandler 
} from '../../application/event-handlers/UserEventHandlers';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private eventBus!: EventBus;
  private userRepository!: UserRepositoryPort;
  private userService!: UserService;
  private authService!: AuthServicePort;
  private kycService!: KycServicePort;

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  private initializeServices(): void {    
    this.eventBus = new InMemoryEventBus();
    
    this.userRepository = new UserRepository(this.eventBus);
    
    this.userService = new UserService(this.userRepository);
    this.authService = new AuthService();
    this.kycService = new KycServiceMock();
    
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    this.eventBus.subscribe('UserRegisteredEvent', 
      new UserRegisteredEventHandler());
    this.eventBus.subscribe('UserKycVerifiedEvent', 
      new UserKycVerifiedEventHandler());
    this.eventBus.subscribe('UserKycRejectedEvent', 
      new UserKycRejectedEventHandler());
    this.eventBus.subscribe('UserProfileUpdatedEvent', 
      new UserProfileUpdatedEventHandler());
  }

  public getUserService(): UserService {
    return this.userService;
  }

  public getUserRepository(): UserRepositoryPort {
    return this.userRepository;
  }

  public getAuthService(): AuthServicePort {
    return this.authService;
  }

  public getKycService(): KycServicePort {
    return this.kycService;
  }

  public getEventBus(): EventBus {
    return this.eventBus;
  }
} 