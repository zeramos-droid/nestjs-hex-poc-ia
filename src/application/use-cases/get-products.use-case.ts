import { Inject, Injectable } from '@nestjs/common';
import { IGetProductsUseCase } from '../../domain/contracts/get-products-use-case.interface';
import type { IProductRepository } from '../../domain/contracts/product-repository.interface';
import type { IProductFiltersDTO } from '../../domain/contracts/dtos/product-filters.dto';
import type { IPaginationResultDTO } from '../../domain/contracts/dtos/pagination-result.dto';
import type { IProductResponseDTO } from '../../domain/contracts/dtos/product-response.dto';
import { PRODUCT_TOKENS } from '../config/tokens';

@Injectable()
export class GetProductsUseCase implements IGetProductsUseCase {
  constructor(
    @Inject(PRODUCT_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    filters: IProductFiltersDTO,
  ): Promise<IPaginationResultDTO<IProductResponseDTO>> {
    return await this.productRepository.findAll(filters);
  }
}
