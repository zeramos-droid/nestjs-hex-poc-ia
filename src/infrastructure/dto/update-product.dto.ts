import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsInt,
  IsBoolean,
} from 'class-validator';
import type { IUpdateProductDTO } from '../../domain/contracts/dtos/update-product.dto';

export class UpdateProductDto implements IUpdateProductDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
