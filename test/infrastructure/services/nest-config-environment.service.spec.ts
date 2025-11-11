import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { mock } from 'jest-mock-extended';
import { NestConfigEnvironmentService } from '@/infrastructure/services/nest-config-environment.service';

describe('NestConfigEnvironmentService', () => {
  let service: NestConfigEnvironmentService;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Create mock ConfigService with proper typing
    mockConfigService = mock<ConfigService>();

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NestConfigEnvironmentService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<NestConfigEnvironmentService>(
      NestConfigEnvironmentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have configService injected', () => {
    expect(service['configService']).toBeDefined();
    expect(service['configService']).toBe(mockConfigService);
  });

  describe('getNodeEnv', () => {
    it('should return NODE_ENV from config', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.getNodeEnv();

      expect(result).toBe('production');
      const getMock = mockConfigService.get as jest.Mock;
      expect(getMock).toHaveBeenCalledWith('NODE_ENV');
    });

    it('should return default value when NODE_ENV is not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getNodeEnv();

      expect(result).toBe('development');
    });

    it('should return empty string as is when explicitly set', () => {
      mockConfigService.get.mockReturnValue('');

      const result = service.getNodeEnv();

      expect(result).toBe('development');
    });
  });

  describe('getPort', () => {
    it('should return PORT as number from config', () => {
      mockConfigService.get.mockReturnValue('4000');

      const result = service.getPort();

      expect(result).toBe(4000);
      const getMock = mockConfigService.get as jest.Mock;
      expect(getMock).toHaveBeenCalledWith('PORT');
    });

    it('should return default port 3000 when PORT is not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getPort();

      expect(result).toBe(3000);
    });

    it('should parse PORT string to number', () => {
      mockConfigService.get.mockReturnValue('8080');

      const result = service.getPort();

      expect(typeof result).toBe('number');
      expect(result).toBe(8080);
    });

    it('should return 3000 when PORT is empty string', () => {
      mockConfigService.get.mockReturnValue('');

      const result = service.getPort();

      expect(result).toBe(3000);
    });

    it('should handle PORT with whitespace', () => {
      mockConfigService.get.mockReturnValue('  5000  ');

      const result = service.getPort();

      expect(result).toBe(5000);
    });

    it('should handle PORT as 0', () => {
      mockConfigService.get.mockReturnValue('0');

      const result = service.getPort();

      expect(result).toBe(0);
    });
  });

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is development', () => {
      mockConfigService.get.mockReturnValue('development');

      const result = service.isDevelopment();

      expect(result).toBe(true);
    });

    it('should return false when NODE_ENV is not development', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.isDevelopment();

      expect(result).toBe(false);
    });

    it('should return true when NODE_ENV is not set (default)', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.isDevelopment();

      expect(result).toBe(true);
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.isProduction();

      expect(result).toBe(true);
    });

    it('should return false when NODE_ENV is not production', () => {
      mockConfigService.get.mockReturnValue('development');

      const result = service.isProduction();

      expect(result).toBe(false);
    });
  });

  describe('isTest', () => {
    it('should return true when NODE_ENV is test', () => {
      mockConfigService.get.mockReturnValue('test');

      const result = service.isTest();

      expect(result).toBe(true);
    });

    it('should return false when NODE_ENV is not test', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.isTest();

      expect(result).toBe(false);
    });
  });
});
