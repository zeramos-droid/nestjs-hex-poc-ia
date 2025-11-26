import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../orm/product.entity';
import { ProductController } from '../controllers/product.controller';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { UpdateStockUseCase } from '../../application/use-cases/update-stock.use-case';
import { PRODUCT_TOKENS } from '../../application/config/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_TOKENS.PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    {
      provide: PRODUCT_TOKENS.CREATE_PRODUCT_USE_CASE,
      useClass: CreateProductUseCase,
    },
    {
      provide: PRODUCT_TOKENS.GET_PRODUCT_BY_ID_USE_CASE,
      useClass: GetProductByIdUseCase,
    },
    {
      provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
      useClass: GetProductsUseCase,
    },
    {
      provide: PRODUCT_TOKENS.UPDATE_PRODUCT_USE_CASE,
      useClass: UpdateProductUseCase,
    },
    {
      provide: PRODUCT_TOKENS.DELETE_PRODUCT_USE_CASE,
      useClass: DeleteProductUseCase,
    },
    {
      provide: PRODUCT_TOKENS.UPDATE_STOCK_USE_CASE,
      useClass: UpdateStockUseCase,
    },
  ],
  exports: [
    PRODUCT_TOKENS.PRODUCT_REPOSITORY,
    PRODUCT_TOKENS.CREATE_PRODUCT_USE_CASE,
    PRODUCT_TOKENS.GET_PRODUCT_BY_ID_USE_CASE,
    PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
    PRODUCT_TOKENS.UPDATE_PRODUCT_USE_CASE,
    PRODUCT_TOKENS.DELETE_PRODUCT_USE_CASE,
    PRODUCT_TOKENS.UPDATE_STOCK_USE_CASE,
  ],
})
export class ProductModule {}
