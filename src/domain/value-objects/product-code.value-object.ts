interface IProductCodeSchemaValueObject {
  code: string;
}

export class ProductCode {
  private static readonly CODE_PATTERN = /^[A-Z0-9]{3,4}-[A-Z0-9]{3,6}$/;
  private static readonly PREFIX_PATTERN = /^[A-Z0-9]{3,4}$/;
  private static readonly SUFFIX_PATTERN = /^[A-Z0-9]{3,6}$/;
  private static readonly MIN_LENGTH = 7; // MIN: XXX-XXX
  private static readonly MAX_LENGTH = 11; // MAX: XXXX-XXXXXX

  private constructor(private readonly _entity: IProductCodeSchemaValueObject) {}

  static create(code: string): ProductCode {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length < this.MIN_LENGTH) {
      throw new Error(
        `Product code is too short. Minimum length: ${this.MIN_LENGTH}`,
      );
    }

    if (normalizedCode.length > this.MAX_LENGTH) {
      throw new Error(
        `Product code is too long. Maximum length: ${this.MAX_LENGTH}`,
      );
    }

    if (!this.CODE_PATTERN.test(normalizedCode)) {
      throw new Error(
        `Invalid product code format. Expected format: XXX-XXXX or XXXX-XXXXXX (alphanumeric). Received: ${code}`,
      );
    }

    return new ProductCode({
      code: normalizedCode,
    });
  }

  static createFromParts(prefix: string, suffix: string): ProductCode {
    const normalizedPrefix = prefix.trim().toUpperCase();
    const normalizedSuffix = suffix.trim().toUpperCase();

    if (!this.PREFIX_PATTERN.test(normalizedPrefix)) {
      throw new Error(
        `Invalid prefix format. Expected 3-4 alphanumeric characters. Received: ${prefix}`,
      );
    }

    if (!this.SUFFIX_PATTERN.test(normalizedSuffix)) {
      throw new Error(
        `Invalid suffix format. Expected 3-6 alphanumeric characters. Received: ${suffix}`,
      );
    }

    const fullCode = `${normalizedPrefix}-${normalizedSuffix}`;
    return new ProductCode({
      code: fullCode,
    });
  }

  static generate(category: string, sequence: number): ProductCode {
    if (!category || category.trim().length === 0) {
      throw new Error('Category cannot be empty');
    }

    if (sequence < 0) {
      throw new Error('Sequence number cannot be negative');
    }

    if (sequence > 999999) {
      throw new Error('Sequence number cannot exceed 999999');
    }

    const normalizedCategory = category.trim().toUpperCase();
    const prefix = this.generatePrefix(normalizedCategory);
    const suffix = sequence.toString().padStart(6, '0');

    return this.createFromParts(prefix, suffix);
  }

  static createFromPersistence(schema: IProductCodeSchemaValueObject): ProductCode {
    return new ProductCode(schema);
  }

  private static generatePrefix(category: string): string {
    // Take first 4 characters or pad with 'X' if shorter
    const sanitized = category.replace(/[^A-Z0-9]/g, '');
    
    if (sanitized.length === 0) {
      return 'PROD';
    }

    if (sanitized.length >= 4) {
      return sanitized.substring(0, 4);
    }

    return sanitized.padEnd(4, 'X');
  }

  get value(): string {
    return this._entity.code;
  }

  getPrefix(): string {
    return this._entity.code.split('-')[0];
  }

  getSuffix(): string {
    return this._entity.code.split('-')[1];
  }

  getCategory(): string {
    return this.getPrefix();
  }

  getSequence(): number {
    const suffix = this.getSuffix();
    return parseInt(suffix, 10);
  }

  equals(other: ProductCode): boolean {
    return this._entity.code === other.value;
  }

  startsWith(prefix: string): boolean {
    const normalizedPrefix = prefix.trim().toUpperCase();
    return this._entity.code.startsWith(normalizedPrefix);
  }

  matches(pattern: string): boolean {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(this._entity.code);
    } catch {
      return false;
    }
  }

  belongsToCategory(category: string): boolean {
    const normalizedCategory = category.trim().toUpperCase();
    const categoryPrefix = ProductCode.generatePrefix(normalizedCategory);
    return this.getPrefix() === categoryPrefix;
  }

  isSequential(other: ProductCode): boolean {
    if (this.getPrefix() !== other.getPrefix()) {
      return false;
    }

    const thisSequence = this.getSequence();
    const otherSequence = other.getSequence();

    return Math.abs(thisSequence - otherSequence) === 1;
  }

  next(): ProductCode {
    const currentSequence = this.getSequence();
    return ProductCode.generate(this.getPrefix(), currentSequence + 1);
  }

  previous(): ProductCode {
    const currentSequence = this.getSequence();
    
    if (currentSequence === 0) {
      throw new Error('Cannot get previous code for sequence 0');
    }

    return ProductCode.generate(this.getPrefix(), currentSequence - 1);
  }

  toString(): string {
    return this._entity.code;
  }

  toJSON(): IProductCodeSchemaValueObject {
    return { ...this._entity };
  }
}
