import { Controller, Get, Inject, HttpStatus, HttpCode } from '@nestjs/common';
import type { IGetHealthUseCase } from '../../domain/contracts/get-health-use-case.interface';
import { HEALTH_TOKENS } from '../../application/config/tokens';
import { HealthResponseDto } from '../dto/health-response.dto';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(HEALTH_TOKENS.GET_HEALTH_USE_CASE)
    private readonly getHealthUseCase: IGetHealthUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthResponseDto> {
    return this.getHealthUseCase.execute();
  }
}
