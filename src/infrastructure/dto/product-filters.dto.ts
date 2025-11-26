import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsInt,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { IProductFiltersDTO } from '../../domain/contracts/dtos/product-filters.dto';

export class ProductFiltersDto implements IProductFiltersDTO {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  inStock?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'price', 'createdAt', 'stock'])
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
