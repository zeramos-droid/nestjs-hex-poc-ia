import { Inject, Injectable } from '@nestjs/common';
import { IUpdateProductUseCase, IUpdateProductInput } from '../../domain/contracts/update-product-use-case.interface';
import type { IProductRepository } from '../../domain/contracts/product-repository.interface';
import type { IProductResponseDTO } from '../../domain/contracts/dtos/product-response.dto';
import { Product } from '../../domain/entities/product.entity';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';
import { PRODUCT_TOKENS } from '../config/tokens';

@Injectable()
export class UpdateProductUseCase implements IUpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: IUpdateProductInput): Promise<IProductResponseDTO> {
    const existingProduct = await this.productRepository.findById(input.id);

    if (!existingProduct) {
      throw new ProductNotFoundError(input.id, 'id');
    }

    let updatedProduct = existingProduct;

    if (input.data.name !== undefined) {
      updatedProduct = updatedProduct.updateName(input.data.name);
    }

    if (input.data.description !== undefined) {
      updatedProduct = updatedProduct.updateDescription(input.data.description);
    }

    if (input.data.price !== undefined) {
      updatedProduct = updatedProduct.updatePrice(input.data.price);
    }

    if (input.data.stock !== undefined) {
      updatedProduct = updatedProduct.updateStock(input.data.stock);
    }

    if (input.data.categoryId !== undefined) {
      updatedProduct = updatedProduct.updateCategory(input.data.categoryId);
    }

    const savedProduct = await this.productRepository.update(
      input.id,
      updatedProduct,
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
