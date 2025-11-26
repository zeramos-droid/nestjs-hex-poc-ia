interface IProductSchema {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private constructor(private readonly _entity: IProductSchema) {}

  static create(
    id: string,
    name: string,
    description: string,
    price: number,
    stock: number,
    sku: string,
    categoryId: string,
  ): Product {
    if (!name || name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }

    if (price < 0) {
      throw new Error('Product price cannot be negative');
    }

    if (stock < 0) {
      throw new Error('Product stock cannot be negative');
    }

    if (!sku || sku.trim().length === 0) {
      throw new Error('Product SKU cannot be empty');
    }

    const now = new Date();
    return new Product({
      id,
      name: name.trim(),
      description: description.trim(),
      price,
      stock,
      sku: sku.trim().toUpperCase(),
      categoryId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createFromPersistence(schema: IProductSchema): Product {
    return new Product(schema);
  }

  get id(): string {
    return this._entity.id;
  }

  get name(): string {
    return this._entity.name;
  }

  get description(): string {
    return this._entity.description;
  }

  get price(): number {
    return this._entity.price;
  }

  get stock(): number {
    return this._entity.stock;
  }

  get sku(): string {
    return this._entity.sku;
  }

  get categoryId(): string {
    return this._entity.categoryId;
  }

  get isActive(): boolean {
    return this._entity.isActive;
  }

  get createdAt(): Date {
    return this._entity.createdAt;
  }

  get updatedAt(): Date {
    return this._entity.updatedAt;
  }

  updateName(newName: string): Product {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }

    return new Product({
      ...this._entity,
      name: newName.trim(),
      updatedAt: new Date(),
    });
  }

  updateDescription(newDescription: string): Product {
    return new Product({
      ...this._entity,
      description: newDescription.trim(),
      updatedAt: new Date(),
    });
  }

  updatePrice(newPrice: number): Product {
    if (newPrice < 0) {
      throw new Error('Product price cannot be negative');
    }

    return new Product({
      ...this._entity,
      price: newPrice,
      updatedAt: new Date(),
    });
  }

  updateStock(newStock: number): Product {
    if (newStock < 0) {
      throw new Error('Product stock cannot be negative');
    }

    return new Product({
      ...this._entity,
      stock: newStock,
      updatedAt: new Date(),
    });
  }

  incrementStock(amount: number): Product {
    if (amount <= 0) {
      throw new Error('Stock increment amount must be positive');
    }

    return this.updateStock(this._entity.stock + amount);
  }

  decrementStock(amount: number): Product {
    if (amount <= 0) {
      throw new Error('Stock decrement amount must be positive');
    }

    const newStock = this._entity.stock - amount;
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    return this.updateStock(newStock);
  }

  updateCategory(newCategoryId: string): Product {
    if (!newCategoryId || newCategoryId.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }

    return new Product({
      ...this._entity,
      categoryId: newCategoryId.trim(),
      updatedAt: new Date(),
    });
  }

  activate(): Product {
    if (this._entity.isActive) {
      return this;
    }

    return new Product({
      ...this._entity,
      isActive: true,
      updatedAt: new Date(),
    });
  }

  deactivate(): Product {
    if (!this._entity.isActive) {
      return this;
    }

    return new Product({
      ...this._entity,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  getFormattedPrice(): string {
    return `$${this._entity.price.toFixed(2)}`;
  }

  isExpensive(threshold: number = 1000): boolean {
    return this._entity.price > threshold;
  }

  isInStock(): boolean {
    return this._entity.stock > 0;
  }

  isLowStock(threshold: number = 10): boolean {
    return this._entity.stock > 0 && this._entity.stock <= threshold;
  }

  isOutOfStock(): boolean {
    return this._entity.stock === 0;
  }

  canBePurchased(quantity: number): boolean {
    return this._entity.isActive && this._entity.stock >= quantity;
  }

  toJSON(): IProductSchema {
    return { ...this._entity };
  }
}
