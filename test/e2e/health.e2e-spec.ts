import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/infrastructure/app.module';

describe('Health Check (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same global pipes as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return 200 OK with health status', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'Ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      const timestamp = new Date(response.body.timestamp as string);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(response.body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should return numeric uptime', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return test environment in test mode', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.environment).toBeDefined();
      expect(typeof response.body.environment).toBe('string');
    });

    it('should have correct content-type header', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
