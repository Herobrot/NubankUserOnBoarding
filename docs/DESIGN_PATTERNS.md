# Patrones de Diseño - NuBank User Onboarding

## 🎯 Introducción

Este documento describe los patrones de diseño implementados en el proyecto NuBank User Onboarding, explicando su propósito, implementación y beneficios.

## 🏗️ Patrones Arquitectónicos

### 1. Arquitectura Hexagonal (Puertos y Adaptadores)

**Propósito**: Separar la lógica de negocio de las tecnologías externas.

**Implementación**:
```typescript
// Puerto (Interfaz abstracta)
interface UserRepositoryPort {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
}

// Adaptador (Implementación concreta)
class UserRepository implements UserRepositoryPort {
  async create(user: User): Promise<User> {
    // Implementación específica con MongoDB
  }
}
```

**Beneficios**:
- ✅ Independencia de tecnologías
- ✅ Fácil testing
- ✅ Flexibilidad para cambios
- ✅ Separación clara de responsabilidades

### 2. Inyección de Dependencias

**Propósito**: Reducir el acoplamiento entre componentes.

**Implementación**:
```typescript
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authService: AuthServicePort
  ) {}

  async execute(dto: LoginUserDTO): Promise<{ user: User; token: string }> {
    // Lógica del caso de uso
  }
}
```

**Beneficios**:
- ✅ Desacoplamiento entre clases
- ✅ Fácil mock para testing
- ✅ Configuración flexible
- ✅ Reutilización de componentes

## 📦 Patrones de Creación

### 3. Factory Pattern (Implícito)

**Propósito**: Crear objetos complejos con validaciones.

**Implementación**:
```typescript
export class User {
  constructor(props: UserProps) {
    this.validateEmail(props.email);
    this.validatePassword(props.password);
    this.validateName(props.name);
    
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._kycStatus = props.kycStatus ?? 'pending';
  }
}
```

**Beneficios**:
- ✅ Validación centralizada
- ✅ Objetos válidos garantizados
- ✅ Lógica de creación encapsulada

### 4. Builder Pattern (Implícito)

**Propósito**: Construir objetos complejos paso a paso.

**Implementación**:
```typescript
// Uso del constructor con objeto de propiedades
const user = new User({
  name: "Juan Pérez",
  email: "juan@email.com",
  password: "secure123",
  kycStatus: "pending"
});
```

## 🔄 Patrones Estructurales

### 5. Adapter Pattern

**Propósito**: Permitir que interfaces incompatibles trabajen juntas.

**Implementación**:
```typescript
// Adaptador para MongoDB
export class UserRepository implements UserRepositoryPort {
  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      kycStatus: user.kycStatus,
    });
    return this.toDomain(doc); // Conversión de MongoDB a entidad
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

**Beneficios**:
- ✅ Conversión entre formatos de datos
- ✅ Abstracción de tecnologías externas
- ✅ Interfaz consistente

### 6. Facade Pattern

**Propósito**: Proporcionar una interfaz simplificada a un subsistema complejo.

**Implementación**:
```typescript
// Controlador como fachada
export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const user = await registerUserUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: [{ field: 'general', message: err.message }]
      });
    }
  }
}
```

**Beneficios**:
- ✅ Interfaz simplificada para clientes
- ✅ Encapsulación de complejidad
- ✅ Manejo centralizado de errores

## 🎭 Patrones de Comportamiento

### 7. Strategy Pattern

**Propósito**: Permitir diferentes algoritmos para la verificación KYC.

**Implementación**:
```typescript
// Estrategia de verificación
interface KycServicePort {
  verifyIdentity(user: User, documents: any): Promise<'pending' | 'verified' | 'rejected'>;
}

// Estrategia Mock (desarrollo)
export class KycServiceMock implements KycServicePort {
  async verifyIdentity(user: User, documents: any): Promise<'pending' | 'verified' | 'rejected'> {
    return 'verified'; // Siempre verificado para testing
  }
}

// Estrategia Real (producción)
export class KycServiceReal implements KycServicePort {
  async verifyIdentity(user: User, documents: any): Promise<'pending' | 'verified' | 'rejected'> {
    // Lógica real de verificación
    return await this.externalKycProvider.verify(documents);
  }
}
```

**Beneficios**:
- ✅ Intercambio de algoritmos
- ✅ Testing simplificado
- ✅ Configuración por entorno

### 8. Template Method Pattern

**Propósito**: Definir el esqueleto de un algoritmo en una clase base.

**Implementación**:
```typescript
// Patrón implícito en casos de uso
export class RegisterUserUseCase {
  async execute(dto: RegisterUserDTO): Promise<User> {
    // 1. Validar entrada
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // 2. Crear entidad
    const user = new User({
      name: dto.name,
      email: dto.email,
      password: dto.password
    });

    // 3. Procesar datos
    const hashedPassword = await this.authService.hashPassword(user.password);
    user.password = hashedPassword;

    // 4. Persistir
    const savedUser = await this.userRepository.create(user);
    
    // 5. Retornar resultado
    return savedUser;
  }
}
```

**Beneficios**:
- ✅ Estructura consistente
- ✅ Reutilización de lógica común
- ✅ Fácil mantenimiento

## 🗄️ Patrones de Persistencia

### 9. Repository Pattern

**Propósito**: Abstraer la lógica de acceso a datos.

**Implementación**:
```typescript
// Interfaz del repositorio
interface UserRepositoryPort {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

// Implementación con MongoDB
export class UserRepository implements UserRepositoryPort {
  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      kycStatus: user.kycStatus,
    });
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  // ... otros métodos
}
```

**Beneficios**:
- ✅ Abstracción de la base de datos
- ✅ Fácil cambio de tecnología
- ✅ Testing simplificado
- ✅ Lógica de acceso centralizada

### 10. Data Mapper Pattern

**Propósito**: Separar objetos de dominio de la lógica de persistencia.

**Implementación**:
```typescript
export class UserRepository {
  // Mapeo de documento a entidad
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

  // Mapeo de entidad a documento
  private toDocument(user: User): Partial<UserDocument> {
    return {
      name: user.name,
      email: user.email,
      password: user.password,
      kycStatus: user.kycStatus,
      updatedAt: new Date(),
    };
  }
}
```

**Beneficios**:
- ✅ Separación clara de responsabilidades
- ✅ Conversión explícita de datos
- ✅ Independencia de esquemas de base de datos

## 🌐 Patrones Web

### 11. Middleware Pattern

**Propósito**: Procesar requests HTTP de forma modular.

**Implementación**:
```typescript
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  (async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false,
          message: 'Token de autenticación requerido' 
        });
      }
      
      const token = authHeader.split(' ')[1];
      const userPayload = await authService.verifyToken(token);
      
      if (!userPayload?.id) {
        return res.status(401).json({ 
          success: false,
          message: 'Token de autenticación inválido' 
        });
      }
      
      const user = await userRepository.findById(userPayload.id);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Usuario no encontrado' 
        });
      }
      
      (req as any).user = user;
      next();
    } catch (error) {
      console.error('Error en authMiddleware:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Error de autenticación' 
      });
    }
  })();
}
```

**Beneficios**:
- ✅ Procesamiento modular
- ✅ Reutilización de lógica
- ✅ Pipeline de requests
- ✅ Separación de responsabilidades

### 12. DTO Pattern (Data Transfer Object)

**Propósito**: Transferir datos entre capas sin exponer entidades internas.

**Implementación**:
```typescript
// DTOs de entrada
export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface KycVerifyDTO {
  userId: string;
  documents: {
    dni?: {
      number: string;
      type: string;
      frontImage: string;
      backImage: string;
    };
    selfie?: {
      imageUrl: string;
    };
    proofOfAddress?: {
      documentType: string;
      imageUrl: string;
    };
  };
}

// DTOs de salida
export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  kycStatus: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Beneficios**:
- ✅ Contratos claros entre capas
- ✅ Validación de entrada
- ✅ Serialización controlada
- ✅ Desacoplamiento

## 🔒 Patrones de Seguridad

### 13. Decorator Pattern (Implícito)

**Propósito**: Agregar funcionalidad de autenticación a endpoints.

**Implementación**:
```typescript
// Decorador de autenticación
router.post('/verify', authMiddleware, KycController.verify);
router.get('/me', authMiddleware, UserController.me);
```

**Beneficios**:
- ✅ Funcionalidad agregada sin modificar código
- ✅ Composición flexible
- ✅ Separación de responsabilidades

### 14. Chain of Responsibility Pattern

**Propósito**: Procesar requests a través de una cadena de middlewares.

**Implementación**:
```typescript
// Cadena de middlewares
app.use(cors());                    // 1. CORS
app.use(express.json());            // 2. Parse JSON
app.use('/api/v1/auth', AuthRouter); // 3. Rutas de auth
app.use('/api/v1/kyc', KycRouter);   // 4. Rutas de KYC (con auth)
app.use('/api/v1/users', UserRouter); // 5. Rutas de usuarios (con auth)
```

**Beneficios**:
- ✅ Procesamiento secuencial
- ✅ Agregar/quitar pasos fácilmente
- ✅ Responsabilidades separadas

## 🧪 Patrones de Testing

### 15. Mock Pattern

**Propósito**: Simular dependencias externas para testing.

**Implementación**:
```typescript
// Mock del servicio KYC
export class KycServiceMock implements KycServicePort {
  async verifyIdentity(user: User, documents: any): Promise<'pending' | 'verified' | 'rejected'> {
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock: siempre retorna verificado
    return 'verified';
  }
}

// Mock del repositorio para testing
export class MockUserRepository implements UserRepositoryPort {
  private users: User[] = [];

  async create(user: User): Promise<User> {
    const newUser = { ...user, id: `mock-${Date.now()}` };
    this.users.push(newUser);
    return newUser;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  // ... otros métodos
}
```

**Beneficios**:
- ✅ Testing aislado
- ✅ Control de comportamiento
- ✅ Tests rápidos y confiables

## 📊 Beneficios de los Patrones Implementados

### Mantenibilidad
- ✅ Código organizado y estructurado
- ✅ Responsabilidades claras
- ✅ Fácil localización de cambios

### Testabilidad
- ✅ Dependencias inyectables
- ✅ Mocks fáciles de crear
- ✅ Testing aislado por capas

### Flexibilidad
- ✅ Cambio de tecnologías sin afectar el core
- ✅ Nuevas funcionalidades sin modificar código existente
- ✅ Configuración por entorno

### Escalabilidad
- ✅ Arquitectura preparada para crecimiento
- ✅ Separación clara de responsabilidades
- ✅ Fácil agregar nuevos patrones

## 🔮 Patrones Futuros

### Event Sourcing
```typescript
interface DomainEvent {
  eventId: string;
  aggregateId: string;
  eventType: string;
  timestamp: Date;
  data: any;
}

interface UserRegisteredEvent extends DomainEvent {
  eventType: 'UserRegistered';
  data: {
    userId: string;
    email: string;
    name: string;
  };
}
```

### CQRS (Command Query Responsibility Segregation)
```typescript
// Comandos
class RegisterUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {}
}

// Consultas
class GetUserProfileQuery {
  constructor(public readonly userId: string) {}
}
```

### Observer Pattern
```typescript
interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}

class UserRegisteredHandler implements EventHandler {
  async handle(event: UserRegisteredEvent): Promise<void> {
    // Enviar email de bienvenida
    await this.emailService.sendWelcomeEmail(event.data.email);
  }
}
```

## 📚 Referencias

- [Design Patterns - Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns)
- [Patterns of Enterprise Application Architecture - Martin Fowler](https://martinfowler.com/books/eaa.html)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://domainlanguage.com/ddd/) 