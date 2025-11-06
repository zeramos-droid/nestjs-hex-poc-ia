import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './controllers/health.controller';
import { NestConfigEnvironmentService } from './services/nest-config-environment.service';
import { GetHealthUseCase } from '../application/use-cases/get-health.use-case';
import {
  HEALTH_TOKENS,
  INFRASTRUCTURE_TOKENS,
} from '../application/config/tokens';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: INFRASTRUCTURE_TOKENS.ENVIRONMENT_SERVICE,
      useClass: NestConfigEnvironmentService,
    },
    {
      provide: HEALTH_TOKENS.GET_HEALTH_USE_CASE,
      useClass: GetHealthUseCase,
    },
  ],
})
export class AppModule {}
