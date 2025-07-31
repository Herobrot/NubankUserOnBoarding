# Arquitectura Técnica - NuBank User Onboarding

## 🎯 Visión General

Este documento describe en detalle la arquitectura técnica del servicio de identidad y onboarding de NuBank, explicando las decisiones de diseño, patrones utilizados y la implementación de la Arquitectura Hexagonal.

## 🏗️ Arquitectura Hexagonal Detallada

### Principios Fundamentales

La Arquitectura Hexagonal (también conocida como Puertos y Adaptadores) se basa en tres principios fundamentales:

1. **Independencia**: El dominio no depende de tecnologías externas
2. **Testabilidad**: Fácil testing de la lógica de negocio
3. **Flexibilidad**: Cambio de tecnologías sin afectar el core

### Estructura de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACES (ADAPTADORES)                 │
│                    (Puertos de Entrada)                     │
├─────────────────────────────────────────────────────────────┤
│  Controllers │ Middlewares │ Routes │ External APIs        │
│     HTTP     │   Auth      │ Express│   Third Party        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION (CASOS DE USO)                │
│                    (Orquestadores)                          │
├─────────────────────────────────────────────────────────────┤
│  RegisterUserUseCase │ LoginUserUseCase │ VerifyKycUseCase  │
│  GetProfileUseCase   │                  │                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN (CORE)                          │
│                    (Lógica de Negocio)                      │
├─────────────────────────────────────────────────────────────┤
│  Entities │ Ports │ Domain Services │ Business Rules        │
│   User    │ Auth  │  UserService   │  Validation           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE (ADAPTADORES)                │
│                   (Puertos de Salida)                       │
├─────────────────────────────────────────────────────────────┤
│  MongoDB │ Express │ JWT │ External KYC Services           │
│  Repo    │ Server  │ Auth│   Mock/Real                     │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Capa de Dominio (Core)

### Entidades

#### User Entity
```typescript
export class User {
  private readonly _id?: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _kycStatus: 'pending' | 'verified' | 'rejected';
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this.validateEmail(props.email);
    this.validatePassword(props.password);
    this.validateName(props.name);
    
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._kycStatus = props.kycStatus ?? 'pending';
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters públicos
  get id(): string | undefined { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get kycStatus(): 'pending' | 'verified' | 'rejected' { return this._kycStatus; }

  // Métodos de negocio
  public updateKycStatus(status: 'pending' | 'verified' | 'rejected'): void {
    this._kycStatus = status;
    this._updatedAt = new Date();
  }

  public updateProfile(name: string, email: string): void {
    this.validateName(name);
    this.validateEmail(email);
    
    this._name = name;
    this._email = email;
    this._updatedAt = new Date();
  }

  // Validaciones privadas
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
  }

  private validateName(name: string): void {
    if (name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
  }
}
```

**Características de la Entidad User:**
- **Encapsulamiento**: Propiedades privadas con acceso controlado
- **Validaciones**: Reglas de negocio en el constructor y métodos
- **Inmutabilidad**: ID y fechas de creación son readonly
- **Comportamiento**: Métodos que encapsulan lógica de negocio

### Puertos (Interfaces)

#### UserRepositoryPort
```typescript
export interface UserRepositoryPort {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

#### AuthServicePort
```typescript
export interface AuthServicePort {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(user: User): string;
  verifyToken(token: string): Promise<{ id: string; email: string } | null>;
}
```

#### KycServicePort
```typescript
export interface KycServicePort {
  verifyIdentity(user: User, documents: any): Promise<'pending' | 'verified' | 'rejected'>;
}
```

**Beneficios de los Puertos:**
- **Contratos claros**: Definición explícita de métodos requeridos
- **Desacoplamiento**: El dominio no conoce implementaciones
- **Testabilidad**: Fácil mock de dependencias
- **Flexibilidad**: Múltiples implementaciones posibles

## 🔄 Capa de Aplicación

### Casos de Uso

#### RegisterUserUseCase
```typescript
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authService: AuthServicePort
  ) {}

  async execute(dto: RegisterUserDTO): Promise<User> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Crear nueva entidad User
    const user = new User({
      name: dto.name,
      email: dto.email,
      password: dto.password
    });

    // Hashear contraseña
    const hashedPassword = await this.authService.hashPassword(user.password);
    user.password = hashedPassword;

    // Persistir usuario
    const savedUser = await this.userRepository.create(user);
    
    return savedUser;
  }
}
```

#### LoginUserUseCase
```typescript
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authService: AuthServicePort
  ) {}

  async execute(dto: LoginUserDTO): Promise<{ user: User; token: string }> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const validPassword = await this.authService.comparePassword(dto.password, user.password);
    if (!validPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token JWT
    const token = this.authService.generateToken(user);
    
    return { user, token };
  }
}
```

#### VerifyKycUseCase
```typescript
export class VerifyKycUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly kycService: KycServicePort
  ) {}

  async execute(dto: KycVerifyDTO): Promise<'pending' | 'verified' | 'rejected'> {
    // Buscar usuario
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar identidad con servicio externo
    const status = await this.kycService.verifyIdentity(user, dto.documents);
    
    // Actualizar estado del usuario
    user.updateKycStatus(status);
    await this.userRepository.update(user);
    
    return status;
  }
}
```

**Características de los Casos de Uso:**
- **Orquestación**: Coordinan entidades y servicios
- **Lógica de aplicación**: Manejan flujos específicos
- **Inyección de dependencias**: Reciben puertos por constructor
- **Manejo de errores**: Errores específicos del dominio

### DTOs (Data Transfer Objects)

```typescript
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
```

**Propósito de los DTOs:**
- **Transferencia de datos**: Entre capas sin exponer entidades
- **Validación de entrada**: Estructura de datos esperada
- **Desacoplamiento**: No dependen de implementaciones internas

## 🔌 Capa de Infraestructura

### Adaptadores de Persistencia

#### UserRepository (MongoDB)
```typescript
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

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
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

**Características del Repository:**
- **Conversión de datos**: `toDomain()` convierte documentos a entidades
- **Manejo de errores**: Errores específicos de persistencia
- **Transacciones**: Operaciones atómicas cuando sea necesario

### Adaptadores de Servicios

#### AuthService (JWT)
```typescript
export class AuthService implements AuthServicePort {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async verifyToken(token: string): Promise<{ id: string; email: string } | null> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      return { id: payload.id, email: payload.email };
    } catch {
      return null;
    }
  }
}
```

#### KycServiceMock
```typescript
export class KycServiceMock implements KycServicePort {
  async verifyIdentity(user: User, documents: any): Promise<'pending' | 'verified' | 'rejected'> {
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock: siempre retorna verificado
    return 'verified';
  }
}
```

## 🌐 Capa de Interfaces

### Controladores

#### AuthController
```typescript
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

  static async login(req: Request, res: Response) {
    try {
      const { user, token } = await loginUserUseCase.execute(req.body);
      res.json({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: user.kycStatus === 'verified'
        }
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
  }
}
```

**Características de los Controladores:**
- **Manejo de HTTP**: Conversión entre HTTP y casos de uso
- **Serialización**: Conversión de entidades a JSON
- **Manejo de errores**: Respuestas HTTP apropiadas
- **Validación de entrada**: Verificación de datos de entrada

### Middlewares

#### AuthMiddleware
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

## 🔄 Flujos de Datos

### Flujo de Registro
```
1. HTTP Request → AuthController.register()
2. AuthController → RegisterUserUseCase.execute()
3. RegisterUserUseCase → UserRepository.findByEmail()
4. RegisterUserUseCase → AuthService.hashPassword()
5. RegisterUserUseCase → UserRepository.create()
6. UserRepository → MongoDB (UserModel)
7. UserRepository → toDomain() → User Entity
8. RegisterUserUseCase → User Entity
9. AuthController → JSON Response
```

### Flujo de Login
```
1. HTTP Request → AuthController.login()
2. AuthController → LoginUserUseCase.execute()
3. LoginUserUseCase → UserRepository.findByEmail()
4. LoginUserUseCase → AuthService.comparePassword()
5. LoginUserUseCase → AuthService.generateToken()
6. LoginUserUseCase → { user, token }
7. AuthController → JSON Response
```

### Flujo de KYC
```
1. HTTP Request (con token) → KycController.verify()
2. AuthMiddleware → AuthService.verifyToken()
3. AuthMiddleware → UserRepository.findById()
4. AuthMiddleware → Adjunta user al request
5. KycController → VerifyKycUseCase.execute()
6. VerifyKycUseCase → KycService.verifyIdentity()
7. VerifyKycUseCase → User.updateKycStatus()
8. VerifyKycUseCase → UserRepository.update()
9. KycController → JSON Response
```

## 🧪 Testing Strategy

### Unit Tests
- **Entidades**: Validaciones y comportamiento de negocio
- **Casos de uso**: Lógica de orquestación
- **Servicios**: Lógica de dominio

### Integration Tests
- **Repositories**: Persistencia de datos
- **Controllers**: Manejo de HTTP
- **Middlewares**: Autenticación

### E2E Tests
- **Flujos completos**: Registro → Login → KYC
- **APIs**: Endpoints completos

## 🔒 Seguridad

### Autenticación JWT
- **Tokens**: 7 días de expiración
- **Payload**: ID y email del usuario
- **Verificación**: Middleware en cada request protegido

### Validación de Datos
- **Entrada**: Validación en entidades y DTOs
- **Salida**: Serialización controlada
- **Sanitización**: Limpieza de datos de entrada

### Encriptación
- **Contraseñas**: Bcrypt con salt rounds 10
- **Tokens**: JWT con secret key
- **HTTPS**: En producción

## 📊 Monitoreo y Logging

### Logging
```typescript
// Errores de autenticación
console.error('Error en authMiddleware:', error);

// Intentos de KYC
console.log(`KYC verification for user ${userId}: ${status}`);

// Performance
console.time('kyc-verification');
// ... operación
console.timeEnd('kyc-verification');
```

### Métricas
- **Usuarios registrados**: Contador por día
- **Tasa de éxito KYC**: Porcentaje de verificaciones exitosas
- **Tiempo de respuesta**: Promedio por endpoint
- **Errores**: Frecuencia y tipos

## 🔮 Evolución de la Arquitectura

### Mejoras Futuras

1. **Event Sourcing**
   ```typescript
   // Eventos de dominio
   interface UserRegisteredEvent {
     userId: string;
     email: string;
     timestamp: Date;
   }
   ```

2. **CQRS (Command Query Responsibility Segregation)**
   ```typescript
   // Comandos
   class RegisterUserCommand { ... }
   
   // Consultas
   class GetUserProfileQuery { ... }
   ```

3. **Microservicios**
   - **Auth Service**: Solo autenticación
   - **User Service**: Gestión de usuarios
   - **KYC Service**: Verificación de identidad

4. **GraphQL**
   ```graphql
   type User {
     id: ID!
     name: String!
     email: String!
     kycStatus: KYCStatus!
   }
   ```

## 📚 Referencias

- [Arquitectura Hexagonal - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design - Eric Evans](https://domainlanguage.com/ddd/)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID) 