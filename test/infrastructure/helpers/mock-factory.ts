import { mock } from 'jest-mock-extended';
import type { IHealthResponseDTO } from '@/domain/contracts/dtos/health-response.dto';
import type { IEnvironmentService } from '@/domain/contracts/environment-service.interface';

/**
 * Mock factory utilities for creating test data
 */

export class MockFactory {
  /**
   * Create a mock IEnvironmentService
   */
  static createMockEnvironmentService(): jest.Mocked<IEnvironmentService> {
    return mock<IEnvironmentService>({
      getNodeEnv: jest.fn().mockReturnValue('test'),
      getPort: jest.fn().mockReturnValue(3000),
      isDevelopment: jest.fn().mockReturnValue(false),
      isProduction: jest.fn().mockReturnValue(false),
      isTest: jest.fn().mockReturnValue(true),
    });
  }

  /**
   * Create a mock health response DTO
   */
  static createMockHealthResponse(): IHealthResponseDTO {
    return {
      status: 'Ok',
      timestamp: new Date().toISOString(),
      uptime: 100,
      environment: 'test',
    };
  }
}
