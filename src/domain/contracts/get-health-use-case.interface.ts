import { IHealthResponseDTO } from './dtos/health-response.dto';

export interface IGetHealthUseCase {
  execute(): Promise<IHealthResponseDTO>;
}
