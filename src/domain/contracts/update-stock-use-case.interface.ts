import { IUseCase } from './use-case.interface';
import { IProductResponseDTO } from './dtos/product-response.dto';

export interface IUpdateStockInput {
  productId: string;
  quantity: number;
  operation: 'increment' | 'decrement';
}

export interface IUpdateStockUseCase
  extends IUseCase<IUpdateStockInput, IProductResponseDTO> {}
