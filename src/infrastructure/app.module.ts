import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './controllers/health.controller';
import { NestConfigEnvironmentService } from './services/nest-config-environment.service';
import { GetHealthUseCase } from '../application/use-cases/get-health.use-case';
import {
  HEALTH_TOKENS,
  INFRASTRUCTURE_TOKENS,
} from '../application/config/tokens';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
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
