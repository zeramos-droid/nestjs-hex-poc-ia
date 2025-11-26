import { IsString, IsNotEmpty, IsNumber, Min, IsInt } from 'class-validator';
import type { ICreateProductDTO } from '../../domain/contracts/dtos/create-product.dto';

export class CreateProductDto implements ICreateProductDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
