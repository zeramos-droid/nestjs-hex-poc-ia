import { Inject, Injectable } from '@nestjs/common';
import { ICreateProductUseCase } from '../../domain/contracts/create-product-use-case.interface';
import type { IProductRepository } from '../../domain/contracts/product-repository.interface';
import type { ICreateProductDTO } from '../../domain/contracts/dtos/create-product.dto';
import type { IProductResponseDTO } from '../../domain/contracts/dtos/product-response.dto';
import { Product } from '../../domain/entities/product.entity';
import { Price } from '../../domain/value-objects/price.value-object';
import { ProductCode } from '../../domain/value-objects/product-code.value-object';
import { DuplicateProductCodeError } from '../../domain/errors/duplicate-product-code.error';
import { PRODUCT_TOKENS } from '../config/tokens';

@Injectable()
export class CreateProductUseCase implements ICreateProductUseCase {
  constructor(
    @Inject(PRODUCT_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: ICreateProductDTO): Promise<IProductResponseDTO> {
    const skuExists = await this.productRepository.existsBySku(input.sku);
    if (skuExists) {
      throw new DuplicateProductCodeError(input.sku);
    }

    const price = Price.create(input.price, input.currency);
    const productCode = ProductCode.create(input.sku);

    const product = Product.create(
      crypto.randomUUID(),
      input.name,
      input.description,
      productCode,
      price,
      input.stock,
      input.categoryId,
    );

    const savedProduct = await this.productRepository.create(product);

    return this.mapToDTO(savedProduct);
  }

  private mapToDTO(product: Product): IProductResponseDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku.getValue(),
      price: product.price.value,
      currency: product.price.currency,
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
