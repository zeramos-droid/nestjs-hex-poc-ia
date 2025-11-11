import { Inject, Injectable } from '@nestjs/common';
import { IGetHealthUseCase } from '../../domain/contracts/get-health-use-case.interface';
import { IHealthResponseDTO } from '../../domain/contracts/dtos/health-response.dto';
import type { IEnvironmentService } from '../../domain/contracts/environment-service.interface';
import { INFRASTRUCTURE_TOKENS } from '../config/tokens';

@Injectable()
export class GetHealthUseCase implements IGetHealthUseCase {
  constructor(
    @Inject(INFRASTRUCTURE_TOKENS.ENVIRONMENT_SERVICE)
    private readonly environmentService: IEnvironmentService,
  ) {}

  execute(): Promise<IHealthResponseDTO> {
    return Promise.resolve({
      status: 'Ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.environmentService.getNodeEnv(),
    });
  }
}
