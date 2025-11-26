import { Inject, Injectable } from '@nestjs/common';
import { IDeleteProductUseCase } from '../../domain/contracts/delete-product-use-case.interface';
import type { IProductRepository } from '../../domain/contracts/product-repository.interface';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';
import { PRODUCT_TOKENS } from '../config/tokens';

@Injectable()
export class DeleteProductUseCase implements IDeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ProductNotFoundError(id, 'id');
    }

    await this.productRepository.delete(id);
  }
}
