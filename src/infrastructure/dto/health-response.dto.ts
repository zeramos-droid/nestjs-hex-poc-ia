import { IHealthResponseDTO } from '../../domain/contracts/dtos/health-response.dto';

export class HealthResponseDto implements IHealthResponseDTO {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}
