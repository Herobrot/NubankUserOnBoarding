// Configuración global para Jest
import { jest } from '@jest/globals';

// Configurar timeouts más largos para pruebas de integración
jest.setTimeout(10000);

// Configurar variables de entorno para pruebas
process.env.NODE_ENV = 'test';

// Limpiar mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
}); 