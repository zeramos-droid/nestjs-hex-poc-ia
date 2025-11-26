import { IUseCase } from './use-case.interface';
import { ICreateProductDTO } from './dtos/create-product.dto';
import { IProductResponseDTO } from './dtos/product-response.dto';

export interface ICreateProductUseCase
  extends IUseCase<ICreateProductDTO, IProductResponseDTO> {}
