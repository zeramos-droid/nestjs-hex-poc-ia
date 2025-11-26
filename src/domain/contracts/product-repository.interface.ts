import { Product } from '../entities/product.entity';
import { ICreateProductDTO } from './dtos/create-product.dto';
import { IUpdateProductDTO } from './dtos/update-product.dto';
import { IProductFiltersDTO } from './dtos/product-filters.dto';
import { IPaginationResultDTO } from './dtos/pagination-result.dto';
import { IProductResponseDTO } from './dtos/product-response.dto';

export interface IProductRepository {
  create(data: ICreateProductDTO): Promise<Product>;

  findById(id: string): Promise<Product | null>;

  findBySku(sku: string): Promise<Product | null>;

  findAll(filters: IProductFiltersDTO): Promise<IPaginationResultDTO<IProductResponseDTO>>;

  update(id: string, data: IUpdateProductDTO): Promise<Product>;

  delete(id: string): Promise<void>;

  existsBySku(sku: string): Promise<boolean>;

  existsBySkuExcludingId(sku: string, excludeId: string): Promise<boolean>;

  findByCategory(categoryId: string): Promise<Product[]>;

  findByCategoryPaginated(
    categoryId: string,
    filters: IProductFiltersDTO,
  ): Promise<IPaginationResultDTO<IProductResponseDTO>>;

  updateStock(id: string, quantity: number): Promise<Product>;

  incrementStock(id: string, quantity: number): Promise<Product>;

  decrementStock(id: string, quantity: number): Promise<Product>;

  findLowStockProducts(threshold?: number): Promise<Product[]>;

  findOutOfStockProducts(): Promise<Product[]>;

  countByCategory(categoryId: string): Promise<number>;

  countActiveProducts(): Promise<number>;

  bulkUpdatePrices(
    categoryId: string,
    percentageChange: number,
  ): Promise<number>;

  activateProduct(id: string): Promise<Product>;

  deactivateProduct(id: string): Promise<Product>;
}
