# Servicio de Identidad y Onboarding - NuBank

API RESTful para el servicio de identidad y onboarding implementada con Arquitectura Hexagonal.

## Tecnologías Principales

- Node.js
- TypeScript
- Express.js
- MongoDB (Mongoose)
- Arquitectura Hexagonal (Puertos y Adaptadores)

## Estructura del Proyecto

```
src/
├── domain/           # Capa de dominio (Core)
│   ├── entities/     # Entidades del dominio
│   ├── ports/        # Puertos (interfaces)
│   └── services/     # Servicios del dominio
├── application/      # Capa de aplicación
│   ├── use-cases/    # Casos de uso
│   └── dtos/         # Objetos de transferencia de datos
├── infrastructure/   # Capa de infraestructura
│   ├── persistence/  # Adaptadores de persistencia
│   ├── web/         # Adaptadores web (Express)
│   └── config/      # Configuraciones
└── interfaces/       # Capa de interfaces
    ├── controllers/  # Controladores
    ├── middlewares/ # Middlewares
    └── validators/  # Validadores
```

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB
- npm o yarn

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear archivo `.env` basado en `.env.example`
4. Configurar las variables de entorno necesarias

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Compila el proyecto
- `npm start`: Inicia el servidor en modo producción
- `npm test`: Ejecuta las pruebas
- `npm run test:watch`: Ejecuta las pruebas en modo watch
- `npm run test:coverage`: Genera reporte de cobertura de pruebas

## Documentación API

La documentación de la API está disponible en formato OpenAPI (Swagger) en:
```
http://localhost:4000/api-docs
```

## Endpoints Principales

- `POST /api/v1/auth/register`: Registro de nuevo usuario
- `POST /api/v1/auth/login`: Autenticación de usuarios
- `POST /api/v1/kyc/verify`: Verificación de identidad (KYC)
- `GET /api/v1/users/me`: Información del perfil del usuario

## Arquitectura

Este proyecto implementa la Arquitectura Hexagonal (también conocida como Puertos y Adaptadores), que separa la lógica de negocio de las tecnologías externas. Las principales capas son:

1. **Dominio**: Contiene la lógica de negocio pura y las entidades
2. **Aplicación**: Implementa los casos de uso y orquesta el flujo de la aplicación
3. **Infraestructura**: Proporciona implementaciones concretas para bases de datos, web, etc.
4. **Interfaces**: Maneja la interacción con el mundo exterior

## Licencia

ISC # NuBankUserOnboarding
