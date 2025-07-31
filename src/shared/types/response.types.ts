// Tipos de estado KYC
export type KycStatus = 'APPROVED' | 'REJECTED' | 'PENDING' | 'NOT_SUBMITTED';

// Tipos de estado de respuesta
export type ResponseStatus = 'success' | 'error';

// Interfaz base para errores
export interface ApiError {
  field: string;
  message: string;
}

// Interfaz base para respuestas
export interface BaseApiResponse {
  success: boolean;
  message: string;
}

// Respuesta de error
export interface ErrorResponse extends BaseApiResponse {
  success: false;
  errors: ApiError[];
}

// Respuesta de éxito
export interface SuccessResponse<T = any> extends BaseApiResponse {
  success: true;
  data?: T;
}

// Tipos específicos de datos

// Usuario para respuestas
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  kycStatus?: KycStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Respuesta de autenticación
export interface AuthResponse {
  user: UserResponse;
  token?: string;
}

// Respuesta de verificación KYC
export interface KycVerificationResponse {
  message: string;
  verificationId: string;
  status: KycStatus;
  estimatedTime: string;
}

// Respuesta de registro
export interface RegisterResponse {
  user: UserResponse;
}

// Respuesta de login
export interface LoginResponse {
  user: UserResponse;
  token: string;
}

// Respuesta de perfil
export interface ProfileResponse {
  user: UserResponse;
}

// Tipos de respuesta específicos
export type RegisterApiResponse = SuccessResponse<RegisterResponse> | ErrorResponse;
export type LoginApiResponse = SuccessResponse<LoginResponse> | ErrorResponse;
export type ProfileApiResponse = SuccessResponse<ProfileResponse> | ErrorResponse;
export type KycVerificationApiResponse = SuccessResponse<KycVerificationResponse> | ErrorResponse;

// Helper para crear respuestas de error
export function createErrorResponse(message: string, errors: ApiError[]): ErrorResponse {
  return {
    success: false,
    message,
    errors
  };
}

// Helper para crear respuestas de éxito
export function createSuccessResponse<T>(message: string, data?: T): SuccessResponse<T> {
  return {
    success: true,
    message,
    data
  };
}

// Helper para crear error de campo específico
export function createFieldError(field: string, message: string): ApiError {
  return { field, message };
}

// Helper para crear error general
export function createGeneralError(message: string): ApiError {
  return { field: 'general', message };
}
