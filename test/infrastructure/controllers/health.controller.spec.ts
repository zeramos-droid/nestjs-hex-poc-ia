import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '@/infrastructure/controllers/health.controller';
import { IGetHealthUseCase } from '@/domain/contracts/get-health-use-case.interface';
import { HEALTH_TOKENS } from '@/application/config/tokens';
import { MockFactory } from '../helpers/mock-factory';

describe('HealthController', () => {
  let controller: HealthController;
  let mockGetHealthUseCase: jest.Mocked<IGetHealthUseCase>;

  beforeEach(async () => {
    // Create mock use case
    mockGetHealthUseCase = {
      execute: jest.fn(),
    };

    // Create testing module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HEALTH_TOKENS.GET_HEALTH_USE_CASE,
          useValue: mockGetHealthUseCase,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', async () => {
      // Arrange
      const mockResponse = MockFactory.createMockHealthResponse();
      mockGetHealthUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.check();

      // Assert
      expect(result).toEqual(mockResponse);
      const executeMock = mockGetHealthUseCase.execute as jest.Mock;
      expect(executeMock).toHaveBeenCalledTimes(1);
    });

    it('should call use case without parameters', async () => {
      // Arrange
      const mockResponse = MockFactory.createMockHealthResponse();
      mockGetHealthUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      await controller.check();

      // Assert
      const executeMock = mockGetHealthUseCase.execute as jest.Mock;
      expect(executeMock).toHaveBeenCalledWith();
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const error = new Error('Health check failed');
      mockGetHealthUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.check()).rejects.toThrow('Health check failed');
      const executeMock = mockGetHealthUseCase.execute as jest.Mock;
      expect(executeMock).toHaveBeenCalledTimes(1);
    });

    it('should return data with correct structure', async () => {
      // Arrange
      const mockResponse = {
        status: 'Ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123.45,
        environment: 'test',
      };
      mockGetHealthUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.check();

      // Assert
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
      expect(result.status).toBe('Ok');
    });

    it('should handle synchronous response from use case', async () => {
      // Arrange
      const mockResponse = MockFactory.createMockHealthResponse();
      mockGetHealthUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const resultPromise = controller.check();

      // Assert
      expect(resultPromise).toBeInstanceOf(Promise);
      const result = await resultPromise;
      expect(result).toEqual(mockResponse);
    });

    it('should handle rejected promise immediately', async () => {
      // Arrange
      const error = new Error('Immediate rejection');
      mockGetHealthUseCase.execute.mockRejectedValue(error);

      // Act
      const resultPromise = controller.check();

      // Assert - verify it returns a promise that rejects
      await expect(resultPromise).rejects.toThrow('Immediate rejection');
    });
  });
});
