import { EventHandler } from '../../domain/events/EventBus';
import { UserRegisteredEvent, 
  UserKycVerifiedEvent, 
  UserKycRejectedEvent, 
  UserProfileUpdatedEvent } from '../../domain/events/UserEvents';

export class UserRegisteredEventHandler 
implements EventHandler<UserRegisteredEvent> {
  async handle(event: UserRegisteredEvent): Promise<void> {
    console.log(`Usuario registrado: ${event.email} - ${event.name}`);
    // Aquí se enviará un email de bienvenida, crear un perfil inicial, etc.
  }
}

export class UserKycVerifiedEventHandler 
implements EventHandler<UserKycVerifiedEvent> {
  async handle(event: UserKycVerifiedEvent): Promise<void> {
    console.log(`KYC verificado para usuario: ${event.aggregateId}`);
    // Aquí se enviará una notificación, activar servicios adicionales, etc.
  }
}

export class UserKycRejectedEventHandler 
implements EventHandler<UserKycRejectedEvent> {
  async handle(event: UserKycRejectedEvent): Promise<void> {
    console.log(`KYC rechazado para usuario: ${event.aggregateId} 
      - Razón: ${event.reason}`);
    // Aquí se enviará una notificación al usuario, 
    // solicitar documentación adicional, etc.
  }
}

export class UserProfileUpdatedEventHandler 
implements EventHandler<UserProfileUpdatedEvent> {
  async handle(event: UserProfileUpdatedEvent): Promise<void> {
    console.log(`Perfil actualizado para usuario: ${event.aggregateId}`, 
      event.updatedFields);
    // Aquí se actualizarán sistemas externos, enviarán notificaciones, etc.
  }
} 