import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import type { ICreateProductUseCase } from '../../domain/contracts/create-product-use-case.interface';
import type { IGetProductByIdUseCase } from '../../domain/contracts/get-product-by-id-use-case.interface';
import type { IGetProductsUseCase } from '../../domain/contracts/get-products-use-case.interface';
import type { IUpdateProductUseCase } from '../../domain/contracts/update-product-use-case.interface';
import type { IDeleteProductUseCase } from '../../domain/contracts/delete-product-use-case.interface';
import type { IUpdateStockUseCase } from '../../domain/contracts/update-stock-use-case.interface';
import { PRODUCT_TOKENS } from '../../application/config/tokens';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductFiltersDto } from '../dto/product-filters.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { UpdateStockDto } from '../dto/update-stock.dto';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';
import { DuplicateProductCodeError } from '../../domain/errors/duplicate-product-code.error';
import { InvalidProductDataError } from '../../domain/errors/invalid-product-data.error';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import { ProductNotAvailableError } from '../../domain/errors/product-not-available.error';
import type { ICreateProductDTO } from '../../domain/contracts/dtos/create-product.dto';
import type { IUpdateProductDTO } from '../../domain/contracts/dtos/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    @Inject(PRODUCT_TOKENS.CREATE_PRODUCT_USE_CASE)
    private readonly createProductUseCase: ICreateProductUseCase,
    @Inject(PRODUCT_TOKENS.GET_PRODUCT_BY_ID_USE_CASE)
    private readonly getProductByIdUseCase: IGetProductByIdUseCase,
    @Inject(PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE)
    private readonly getProductsUseCase: IGetProductsUseCase,
    @Inject(PRODUCT_TOKENS.UPDATE_PRODUCT_USE_CASE)
    private readonly updateProductUseCase: IUpdateProductUseCase,
    @Inject(PRODUCT_TOKENS.DELETE_PRODUCT_USE_CASE)
    private readonly deleteProductUseCase: IDeleteProductUseCase,
    @Inject(PRODUCT_TOKENS.UPDATE_STOCK_USE_CASE)
    private readonly updateStockUseCase: IUpdateStockUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product successfully created',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product with SKU already exists',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    try {
      const domainDto: ICreateProductDTO = {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        sku: createProductDto.sku,
        categoryId: createProductDto.categoryId,
      };

      return await this.createProductUseCase.execute(domainDto);
    } catch (error) {
      if (error instanceof DuplicateProductCodeError) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      if (error instanceof InvalidProductDataError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    try {
      return await this.getProductByIdUseCase.execute(id);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'inStock', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'price', 'createdAt', 'updatedAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products list',
  })
  async findAll(@Query() filters: ProductFiltersDto) {
    return await this.getProductsUseCase.execute(filters);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product successfully updated',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product data',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    try {
      const domainDto: IUpdateProductDTO = {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price: updateProductDto.price,
        stock: updateProductDto.stock,
        categoryId: updateProductDto.categoryId,
        isActive: updateProductDto.isActive,
      };

      return await this.updateProductUseCase.execute({ id, data: domainDto });
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof InvalidProductDataError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.deleteProductUseCase.execute(id);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }

  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update product stock' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock successfully updated',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid stock data or insufficient stock',
  })
  async updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<ProductResponseDto> {
    try {
      return await this.updateStockUseCase.execute({
        productId: id,
        quantity: updateStockDto.quantity,
        operation: updateStockDto.operation,
      });
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (
        error instanceof InvalidProductDataError ||
        error instanceof InsufficientStockError ||
        error instanceof ProductNotAvailableError
      ) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }
}
