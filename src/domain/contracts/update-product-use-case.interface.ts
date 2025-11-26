import { IUseCase } from './use-case.interface';
import { IUpdateProductDTO } from './dtos/update-product.dto';
import { IProductResponseDTO } from './dtos/product-response.dto';

export interface IUpdateProductInput {
  id: string;
  data: IUpdateProductDTO;
}

export interface IUpdateProductUseCase
  extends IUseCase<IUpdateProductInput, IProductResponseDTO> {}
