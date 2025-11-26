import { IUseCase } from './use-case.interface';
import { IProductResponseDTO } from './dtos/product-response.dto';

export interface IGetProductByIdUseCase
  extends IUseCase<string, IProductResponseDTO> {}
