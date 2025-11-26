import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductRepository } from '../../domain/contracts/product-repository.interface';
import { Product } from '../../domain/entities/product.entity';
import type { IProductFiltersDTO } from '../../domain/contracts/dtos/product-filters.dto';
import type { IPaginationResultDTO } from '../../domain/contracts/dtos/pagination-result.dto';
import type { IProductResponseDTO } from '../../domain/contracts/dtos/product-response.dto';
import { ProductEntity } from '../orm/product.entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async create(product: Product): Promise<Product> {
    const entity = this.repository.create({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      categoryId: product.categoryId,
      isActive: product.isActive,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { sku: sku.toUpperCase() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(
    filters: IProductFiltersDTO,
  ): Promise<IPaginationResultDTO<IProductResponseDTO>> {
    const query = this.repository.createQueryBuilder('product');

    if (filters.search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.inStock === true) {
      query.andWhere('product.stock > 0');
    } else if (filters.inStock === false) {
      query.andWhere('product.stock = 0');
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';
    query.orderBy(`product.${sortBy}`, sortOrder);

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    query.skip((page - 1) * pageSize).take(pageSize);

    const [entities, total] = await query.getManyAndCount();
    const products = entities.map((entity) => this.toDomain(entity));

    return {
      data: products.map((product) => this.toDTO(product)),
      meta: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page < Math.ceil(total / pageSize),
        hasPreviousPage: page > 1,
      },
    };
  }

  async update(id: string, product: Product): Promise<Product> {
    await this.repository.update(id, {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      isActive: product.isActive,
      updatedAt: new Date(),
    });

    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Product with id ${id} not found after update`);
    }
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsBySku(sku: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { sku: sku.toUpperCase() },
    });
    return count > 0;
  }

  async existsBySkuExcludingId(sku: string, excludeId: string): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('product')
      .where('product.sku = :sku', { sku: sku.toUpperCase() })
      .andWhere('product.id != :excludeId', { excludeId });

    const count = await query.getCount();
    return count > 0;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const entities = await this.repository.find({ where: { categoryId } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByCategoryPaginated(
    categoryId: string,
    filters: IProductFiltersDTO,
  ): Promise<IPaginationResultDTO<IProductResponseDTO>> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const [entities, total] = await this.repository.findAndCount({
      where: { categoryId },
      skip,
      take: pageSize,
    });

    const products = entities.map((entity) => this.toDomain(entity));

    return {
      data: products.map((product) => this.toDTO(product)),
      meta: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page < Math.ceil(total / pageSize),
        hasPreviousPage: page > 1,
      },
    };
  }

  async countByCategory(categoryId: string): Promise<number> {
    return await this.repository.count({ where: { categoryId } });
  }

  async bulkUpdatePrices(
    categoryId: string,
    percentage: number,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(ProductEntity)
      .set({
        price: () => `price * ${1 + percentage / 100}`,
        updatedAt: new Date(),
      })
      .where('categoryId = :categoryId', { categoryId })
      .execute();

    return result.affected || 0;
  }

  async updateStock(productId: string, newStock: number): Promise<Product> {
    await this.repository.update(productId, {
      stock: newStock,
      updatedAt: new Date(),
    });

    const updated = await this.repository.findOne({ where: { id: productId } });
    if (!updated) {
      throw new Error(`Product with id ${productId} not found after stock update`);
    }
    return this.toDomain(updated);
  }

  async incrementStock(productId: string, amount: number): Promise<Product> {
    await this.repository.increment({ id: productId }, 'stock', amount);
    await this.repository.update(productId, { updatedAt: new Date() });

    const updated = await this.repository.findOne({ where: { id: productId } });
    if (!updated) {
      throw new Error(`Product with id ${productId} not found after increment`);
    }
    return this.toDomain(updated);
  }

  async decrementStock(productId: string, amount: number): Promise<Product> {
    await this.repository.decrement({ id: productId }, 'stock', amount);
    await this.repository.update(productId, { updatedAt: new Date() });

    const updated = await this.repository.findOne({ where: { id: productId } });
    if (!updated) {
      throw new Error(`Product with id ${productId} not found after decrement`);
    }
    return this.toDomain(updated);
  }

  async findLowStockProducts(threshold: number): Promise<Product[]> {
    const entities = await this.repository
      .createQueryBuilder('product')
      .where('product.stock > 0 AND product.stock <= :threshold', { threshold })
      .getMany();

    return entities.map((entity) => this.toDomain(entity));
  }

  async findOutOfStockProducts(): Promise<Product[]> {
    const entities = await this.repository.find({ where: { stock: 0 } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async activateProduct(productId: string): Promise<Product> {
    await this.repository.update(productId, {
      isActive: true,
      updatedAt: new Date(),
    });

    const updated = await this.repository.findOne({ where: { id: productId } });
    if (!updated) {
      throw new Error(`Product with id ${productId} not found after activation`);
    }
    return this.toDomain(updated);
  }

  async deactivateProduct(productId: string): Promise<Product> {
    await this.repository.update(productId, {
      isActive: false,
      updatedAt: new Date(),
    });

    const updated = await this.repository.findOne({ where: { id: productId } });
    if (!updated) {
      throw new Error(`Product with id ${productId} not found after deactivation`);
    }
    return this.toDomain(updated);
  }

  async countActiveProducts(): Promise<number> {
    return await this.repository.count({ where: { isActive: true } });
  }

  private toDomain(entity: ProductEntity): Product {
    return Product.createFromPersistence({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: typeof entity.price === 'string' ? parseFloat(entity.price) : entity.price,
      stock: entity.stock,
      sku: entity.sku,
      categoryId: entity.categoryId,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toDTO(product: Product): IProductResponseDTO {
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
