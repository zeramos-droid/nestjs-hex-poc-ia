import { Inject, Injectable } from '@nestjs/common';
import {
  IUpdateStockUseCase,
  IUpdateStockInput,
} from '../../domain/contracts/update-stock-use-case.interface';
import type { IProductRepository } from '../../domain/contracts/product-repository.interface';
import type { IProductResponseDTO } from '../../domain/contracts/dtos/product-response.dto';
import { Product } from '../../domain/entities/product.entity';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';
import { InvalidProductDataError } from '../../domain/errors/invalid-product-data.error';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import { PRODUCT_TOKENS } from '../config/tokens';

@Injectable()
export class UpdateStockUseCase implements IUpdateStockUseCase {
  constructor(
    @Inject(PRODUCT_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: IUpdateStockInput): Promise<IProductResponseDTO> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      throw new ProductNotFoundError(input.productId, 'id');
    }

    if (input.quantity <= 0) {
      throw InvalidProductDataError.forNegativeValue('quantity', input.quantity);
    }

    let updatedProduct: Product;

    try {
      if (input.operation === 'increment') {
        updatedProduct = product.incrementStock(input.quantity);
      } else {
        updatedProduct = product.decrementStock(input.quantity);
      }
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        throw error;
      }
      throw error;
    }

    const savedProduct = await this.productRepository.updateStock(
      input.productId,
      updatedProduct.stock,
    );

    return this.mapToDTO(savedProduct);
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
