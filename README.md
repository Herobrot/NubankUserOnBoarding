# Servicio de Identidad y Onboarding - NuBank

## 📋 Descripción General

Este proyecto implementa un servicio de identidad y onboarding para NuBank utilizando **Arquitectura Hexagonal (Puertos y Adaptadores)** con **TypeScript** y **Node.js**. El servicio maneja el registro de usuarios, autenticación JWT, verificación de identidad (KYC) y gestión de perfiles de usuario.

## 🏗️ Arquitectura del Sistema

### Bounded Context: Identity & Onboarding

Este proyecto representa un **Bounded Context** específico dentro del dominio de NuBank:

- **Contexto**: Gestión de identidad y verificación de usuarios
- **Responsabilidades**: 
  - Registro y autenticación de usuarios
  - Verificación de identidad (KYC)
  - Gestión de perfiles de usuario
- **Límites**: Se enfoca únicamente en la identidad del usuario, no en transacciones financieras

### Arquitectura Hexagonal (Puertos y Adaptadores)

La arquitectura implementada sigue el patrón **Hexagonal** que proporciona:

- **Independencia de tecnologías**: El dominio no depende de frameworks externos
- **Testabilidad**: Fácil testing de la lógica de negocio
- **Flexibilidad**: Cambio de tecnologías sin afectar el core
- **Separación de responsabilidades**: Clara distinción entre capas

#### Capas de la Arquitectura:

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACES (ADAPTADORES)                 │
├─────────────────────────────────────────────────────────────┤
│  Controllers │ Middlewares │ Routes │ External APIs        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION (CASOS DE USO)                │
├─────────────────────────────────────────────────────────────┤
│  RegisterUserUseCase │ LoginUserUseCase │ VerifyKycUseCase  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN (CORE)                          │
├─────────────────────────────────────────────────────────────┤
│  Entities │ Ports │ Domain Services │ Business Rules        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE (ADAPTADORES)                │
├─────────────────────────────────────────────────────────────┤
│  MongoDB │ Express │ JWT │ External KYC Services           │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
src/
├── domain/                    # 🎯 CAPA DE DOMINIO (Core)
│   ├── entities/             # Entidades del dominio
│   │   └── User.ts          # Entidad principal del usuario
│   ├── ports/               # Puertos (interfaces abstractas)
│   │   ├── AuthServicePort.ts
│   │   ├── KycServicePort.ts
│   │   └── UserRepositoryPort.ts
│   └── services/            # Servicios del dominio
│       └── UserService.ts   # Lógica de negocio pura
├── application/              # 🔄 CAPA DE APLICACIÓN
│   ├── use-cases/           # Casos de uso (orquestadores)
│   │   ├── RegisterUserUseCase.ts
│   │   ├── LoginUserUseCase.ts
│   │   ├── VerifyKycUseCase.ts
│   │   └── GetProfileUseCase.ts
│   └── dtos/                # Objetos de transferencia de datos
│       ├── RegisterUserDTO.ts
│       ├── LoginUserDTO.ts
│       └── KycVerifyDTO.ts
├── infrastructure/           # 🔌 CAPA DE INFRAESTRUCTURA
│   ├── persistence/         # Adaptadores de persistencia
│   │   └── mongodb/
│   │       ├── UserModel.ts
│   │       └── UserRepository.ts
│   └── web/                # Adaptadores web
│       └── express/
│           ├── AuthService.ts
│           ├── KycServiceMock.ts
│           └── server.ts
└── interfaces/              # 🌐 CAPA DE INTERFACES
    ├── controllers/         # Controladores HTTP
    │   ├── AuthController.ts
    │   ├── KycController.ts
    │   └── UserController.ts
    ├── middlewares/         # Middlewares de Express
    │   └── authMiddleware.ts
    └── routes/             # Definición de rutas
        ├── AuthRouter.ts
        ├── KycRouter.ts
        └── UserRouter.ts
```

## 🎯 Patrones de Diseño Implementados

### 1. Arquitectura Hexagonal (Puertos y Adaptadores)

**Propósito**: Separar la lógica de negocio de las tecnologías externas.

**Implementación**:
- **Puertos**: Interfaces abstractas en `domain/ports/`
- **Adaptadores**: Implementaciones concretas en `infrastructure/`

```typescript
// Puerto (Interfaz)
interface UserRepositoryPort {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
}

// Adaptador (Implementación)
class UserRepository implements UserRepositoryPort {
  async create(user: User): Promise<User> {
    // Implementación con MongoDB
  }
}
```

### 2. Inyección de Dependencias

**Propósito**: Reducir el acoplamiento entre componentes.

**Implementación**: Los casos de uso reciben sus dependencias por constructor:

```typescript
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authService: AuthServicePort
  ) {}
}
```

### 3. Repository Pattern

**Propósito**: Abstraer la lógica de acceso a datos.

**Implementación**:
- **Interfaz**: `UserRepositoryPort` define los contratos
- **Implementación**: `UserRepository` maneja MongoDB
- **Beneficios**: Fácil cambio de base de datos, testing simplificado

### 4. Use Case Pattern

**Propósito**: Encapsular la lógica de aplicación específica.

**Características**:
- Un caso de uso por operación de negocio
- Orquesta las entidades y servicios del dominio
- Maneja la lógica de aplicación (no de negocio)

### 5. DTO Pattern

**Propósito**: Transferir datos entre capas sin exponer entidades internas.

**Implementación**: Objetos planos para entrada/salida de casos de uso.

## 🔒 Encapsulamiento y Principios SOLID

### Encapsulamiento

**Entidad User**:
```typescript
export class User {
  // Propiedades privadas con acceso controlado
  private readonly _id?: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _kycStatus: 'pending' | 'verified' | 'rejected';

  // Constructor que valida y encapsula
  constructor(props: UserProps) {
    this.validateEmail(props.email);
    this.validatePassword(props.password);
    // ... más validaciones
  }

  // Métodos públicos que controlan el acceso
  public updateKycStatus(status: 'pending' | 'verified' | 'rejected'): void {
    this._kycStatus = status;
    this._updatedAt = new Date();
  }
}
```

### Principios SOLID Aplicados

1. **S - Single Responsibility Principle**:
   - Cada clase tiene una responsabilidad única
   - `UserRepository`: Solo maneja persistencia
   - `AuthService`: Solo maneja autenticación

2. **O - Open/Closed Principle**:
   - Extensible sin modificar código existente
   - Nuevos adaptadores sin cambiar el dominio

3. **L - Liskov Substitution Principle**:
   - Cualquier implementación de `UserRepositoryPort` es intercambiable

4. **I - Interface Segregation Principle**:
   - Interfaces específicas para cada propósito
   - `AuthServicePort` solo métodos de autenticación

5. **D - Dependency Inversion Principle**:
   - Dependencias de abstracciones, no de implementaciones
   - Casos de uso dependen de puertos, no de adaptadores

## 🗄️ Persistencia de Datos

### MongoDB con Mongoose

**Modelo de Usuario**:
```typescript
const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  kycStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

**Características**:
- **Validación**: Esquemas de Mongoose para validación de datos
- **Índices**: Email único para evitar duplicados
- **Timestamps**: Seguimiento automático de fechas
- **Enums**: Estados de KYC restringidos

### Repository Pattern en Persistencia

```typescript
export class UserRepository implements UserRepositoryPort {
  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      kycStatus: user.kycStatus,
    });
    return this.toDomain(doc); // Conversión a entidad de dominio
  }

  private toDomain(doc: UserDocument): User {
    return new User({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      kycStatus: doc.kycStatus,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
```

## 🔐 Autenticación y Seguridad

### JWT (JSON Web Tokens)

**Generación de Tokens**:
```typescript
generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
```

**Verificación de Tokens**:
```typescript
async verifyToken(token: string): Promise<{ id: string; email: string } | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}
```

### Middleware de Autenticación

```typescript
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Extraer token del header
  // 2. Verificar token
  // 3. Buscar usuario en base de datos
  // 4. Adjuntar usuario al request
  // 5. Continuar o retornar error
}
```

## 🧪 Testing y Calidad de Código

### Estrategia de Testing

1. **Unit Tests**: Casos de uso y servicios del dominio
2. **Integration Tests**: Adaptadores y controladores
3. **E2E Tests**: Flujos completos de la aplicación

### Mock Services

**KycServiceMock**: Para desarrollo y testing
```typescript
export class KycServiceMock implements KycServicePort {
  async verifyIdentity(user: User, documents: any): Promise<'pending' | 'verified' | 'rejected'> {
    return 'verified'; // Siempre retorna verificado para testing
  }
}
```

## 🚀 Flujo de Datos

### Registro de Usuario
```
1. Request HTTP → AuthController.register()
2. AuthController → RegisterUserUseCase.execute()
3. RegisterUserUseCase → UserRepository.create()
4. UserRepository → MongoDB (UserModel)
5. Response: Usuario creado con ID
```

### Verificación KYC
```
1. Request HTTP (con token) → KycController.verify()
2. authMiddleware → Verifica token y adjunta usuario
3. KycController → VerifyKycUseCase.execute()
4. VerifyKycUseCase → KycService.verifyIdentity()
5. VerifyKycUseCase → UserRepository.update()
6. Response: Estado de verificación
```

## 📊 Métricas y Monitoreo

### Logging
- Errores de autenticación
- Intentos de KYC
- Performance de endpoints

### Métricas Clave
- Usuarios registrados por día
- Tasa de éxito de KYC
- Tiempo de respuesta de endpoints

## 🔧 Configuración y Despliegue

### Variables de Entorno
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/nubank
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Scripts de Desarrollo
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Compilación TypeScript
npm start        # Producción
npm test         # Ejecutar tests
```

## 📚 Documentación API

### Swagger/OpenAPI
- **URL**: `http://localhost:4000/api-docs`
- **Especificación**: `docs/openapi.yaml`
- **Autenticación**: Bearer Token JWT

### Endpoints Principales
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Autenticación
- `POST /api/v1/kyc/verify` - Verificación KYC
- `GET /api/v1/users/me` - Perfil de usuario

## 🎯 Beneficios de la Arquitectura

1. **Mantenibilidad**: Código organizado y fácil de entender
2. **Testabilidad**: Lógica de negocio aislada y testeable
3. **Flexibilidad**: Cambio de tecnologías sin afectar el core
4. **Escalabilidad**: Fácil agregar nuevas funcionalidades
5. **Independencia**: Dominio no depende de frameworks externos

## 🔮 Futuras Mejoras

1. **Event Sourcing**: Para auditoría completa de cambios
2. **CQRS**: Separación de comandos y consultas
3. **Microservicios**: División en servicios más pequeños
4. **GraphQL**: API más flexible para consultas complejas
5. **Redis**: Cache para mejorar performance

## 📄 Licencia

ISC License
