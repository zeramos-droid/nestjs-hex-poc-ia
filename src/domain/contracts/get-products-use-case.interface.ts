import { IUseCase } from './use-case.interface';
import { IProductFiltersDTO } from './dtos/product-filters.dto';
import { IProductResponseDTO } from './dtos/product-response.dto';
import { IPaginationResultDTO } from './dtos/pagination-result.dto';

export interface IGetProductsUseCase
  extends IUseCase<IProductFiltersDTO, IPaginationResultDTO<IProductResponseDTO>> {}
