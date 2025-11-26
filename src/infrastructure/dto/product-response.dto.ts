import type { IProductResponseDTO } from '../../domain/contracts/dtos/product-response.dto';

export class ProductResponseDto implements IProductResponseDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  stock: number;
  sku: string;
  categoryId: string;
  isActive: boolean;
  isInStock: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}
