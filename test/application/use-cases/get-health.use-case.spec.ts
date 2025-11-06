import { GetHealthUseCase } from '@/application/use-cases/get-health.use-case';
import { IEnvironmentService } from '@/domain/contracts/environment-service.interface';
import { MockFactory } from '../../infrastructure/helpers/mock-factory';

describe('GetHealthUseCase', () => {
  let useCase: GetHealthUseCase;
  let mockEnvironmentService: jest.Mocked<IEnvironmentService>;

  beforeEach(() => {
    // Create mock using factory
    mockEnvironmentService = MockFactory.createMockEnvironmentService();

    // Create use case instance
    useCase = new GetHealthUseCase(mockEnvironmentService);
  });

  describe('execute', () => {
    it('should return health status with correct data', async () => {
      // Arrange
      mockEnvironmentService.getNodeEnv.mockReturnValue('test');
      const startTime = Date.now();

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('Ok');
      expect(result.environment).toBe('test');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();

      // Verify timestamp is valid ISO string
      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(startTime);
    });

    it('should call environmentService.getNodeEnv', async () => {
      // Act
      await useCase.execute();

      // Assert
      expect(mockEnvironmentService.getNodeEnv).toHaveBeenCalledTimes(1);
    });

    it('should return current process uptime', async () => {
      // Act
      const result = await useCase.execute();

      // Assert
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return ISO formatted timestamp', async () => {
      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should work with different environments', async () => {
      // Test development
      mockEnvironmentService.getNodeEnv.mockReturnValue('development');
      let result = await useCase.execute();
      expect(result.environment).toBe('development');

      // Test production
      mockEnvironmentService.getNodeEnv.mockReturnValue('production');
      result = await useCase.execute();
      expect(result.environment).toBe('production');
    });
  });
});
