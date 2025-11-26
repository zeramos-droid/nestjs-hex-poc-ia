import { Inject, Injectable } from '@nestjs/common';
import { IGetProductByIdUseCase } from '../../domain/contracts/get-product-by-id-use-case.interface';
import type { IProductRepository } from '../../domain/contracts/product-repository.interface';
import type { IProductResponseDTO } from '../../domain/contracts/dtos/product-response.dto';
import { Product } from '../../domain/entities/product.entity';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';
import { PRODUCT_TOKENS } from '../config/tokens';

@Injectable()
export class GetProductByIdUseCase implements IGetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<IProductResponseDTO> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ProductNotFoundError(id, 'id');
    }

    return this.mapToDTO(product);
  }

  private mapToDTO(product: Product): IProductResponseDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: product.price,
      formattedPrice: product.getFormattedPrice(),
      stock: product.stock,
      categoryId: product.categoryId,
      isActive: product.isActive,
      isInStock: product.isInStock(),
      isLowStock: product.isLowStock(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
