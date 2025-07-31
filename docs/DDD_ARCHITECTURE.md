# Arquitectura DDD con Eventos de Dominio

## Descripción General

Este proyecto implementa Domain-Driven Design (DDD) con arquitectura hexagonal, incluyendo eventos de dominio y agregados para el onboarding de usuarios de NuBank.

## Estructura de la Arquitectura

### 1. Dominio (Domain Layer)

#### Agregados (Aggregates)
- **AggregateRoot**: Clase base para todos los agregados
- **User**: Agregado principal que maneja la lógica de negocio de usuarios

#### Eventos de Dominio (Domain Events)
- **DomainEvent**: Interfaz base para todos los eventos
- **BaseDomainEvent**: Clase abstracta con implementación común
- **UserEvents**: Eventos específicos del dominio de usuario:
  - `UserRegisteredEvent`: Usuario registrado
  - `UserKycVerifiedEvent`: KYC verificado
  - `UserKycRejectedEvent`: KYC rechazado
  - `UserProfileUpdatedEvent`: Perfil actualizado

#### Puertos (Ports)
- **UserRepositoryPort**: Contrato para repositorio de usuarios
- **EventStorePort**: Contrato para almacén de eventos
- **AuthServicePort**: Contrato para autenticación
- **KycServicePort**: Contrato para verificación KYC

### 2. Aplicación (Application Layer)

#### Casos de Uso (Use Cases)
- **RegisterUserUseCase**: Registro de usuarios
- **LoginUserUseCase**: Autenticación de usuarios
- **VerifyKycUseCase**: Verificación KYC
- **GetProfileUseCase**: Obtención de perfil

#### Manejadores de Eventos (Event Handlers)
- **UserRegisteredEventHandler**: Maneja eventos de registro
- **UserKycVerifiedEventHandler**: Maneja eventos de KYC verificado
- **UserKycRejectedEventHandler**: Maneja eventos de KYC rechazado
- **UserProfileUpdatedEventHandler**: Maneja eventos de actualización de perfil

### 3. Infraestructura (Infrastructure Layer)

#### Persistencia
- **UserRepository**: Implementación MongoDB del repositorio de usuarios
- **BaseRepository**: Clase base para repositorios con manejo de eventos

#### Web
- **AuthService**: Servicio de autenticación
- **KycServiceMock**: Mock del servicio KYC

#### Configuración
- **DependencyContainer**: Contenedor de inyección de dependencias

### 4. Interfaces (Interface Layer)

#### Controladores
- **AuthController**: Controlador de autenticación
- **UserController**: Controlador de usuarios
- **KycController**: Controlador de KYC

## Flujo de Eventos

1. **Registro de Usuario**:
   - Se crea una instancia de `User`
   - Se ejecuta `user.register()` que dispara `UserRegisteredEvent`
   - Se guarda en la base de datos
   - Se publican los eventos al bus de eventos
   - Los manejadores procesan los eventos

2. **Verificación KYC**:
   - Se obtiene el usuario del repositorio
   - Se ejecuta `user.verifyKyc()` o `user.rejectKyc()`
   - Se disparan eventos correspondientes
   - Se actualiza en la base de datos
   - Se publican los eventos

## Ventajas de esta Arquitectura

1. **Desacoplamiento**: Los eventos permiten que diferentes partes del sistema reaccionen sin conocer los detalles
2. **Escalabilidad**: Los eventos pueden ser procesados de forma asíncrona
3. **Trazabilidad**: Todos los cambios importantes se registran como eventos
4. **Testabilidad**: Cada componente puede ser probado de forma aislada
5. **Mantenibilidad**: La lógica de negocio está encapsulada en los agregados

## Patrones Implementados

- **Aggregate Pattern**: Los agregados encapsulan la lógica de negocio
- **Event Sourcing**: Los eventos representan el historial de cambios
- **CQRS**: Separación de comandos (modificaciones) y consultas
- **Hexagonal Architecture**: Separación clara entre dominio, aplicación e infraestructura
- **Dependency Injection**: Inyección de dependencias a través del contenedor

## Configuración

El sistema utiliza un `DependencyContainer` que:
- Configura el bus de eventos en memoria
- Registra los manejadores de eventos
- Proporciona instancias de servicios y repositorios
- Maneja la inyección de dependencias

## Próximos Pasos

1. Implementar un almacén de eventos persistente
2. Agregar más manejadores de eventos para integraciones externas
3. Implementar proyecciones para consultas optimizadas
4. Agregar validaciones de dominio más robustas
5. Implementar manejo de errores más sofisticado 