interface IPriceSchemaValueObject {
  amount: number;
  currency: string;
}

export class Price {
  private static readonly SUPPORTED_CURRENCIES = [
    'USD',
    'EUR',
    'GBP',
    'MXN',
    'CAD',
    'AUD',
  ];

  private static readonly MAX_DECIMALS = 2;
  private static readonly MIN_AMOUNT = 0;

  private constructor(private readonly _entity: IPriceSchemaValueObject) {}

  static create(amount: number, currency: string = 'USD'): Price {
    const normalizedCurrency = currency.toUpperCase();

    if (!this.SUPPORTED_CURRENCIES.includes(normalizedCurrency)) {
      throw new Error(
        `Invalid currency: ${currency}. Supported currencies: ${this.SUPPORTED_CURRENCIES.join(', ')}`,
      );
    }

    if (amount < this.MIN_AMOUNT) {
      throw new Error(
        `Price amount cannot be negative. Received: ${amount}`,
      );
    }

    if (!Number.isFinite(amount)) {
      throw new Error(`Price amount must be a valid number. Received: ${amount}`);
    }

    const roundedAmount = this.roundToDecimals(amount, this.MAX_DECIMALS);

    return new Price({
      amount: roundedAmount,
      currency: normalizedCurrency,
    });
  }

  static createFromPersistence(schema: IPriceSchemaValueObject): Price {
    return new Price(schema);
  }

  static zero(currency: string = 'USD'): Price {
    return this.create(0, currency);
  }

  private static roundToDecimals(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  get amount(): number {
    return this._entity.amount;
  }

  get currency(): string {
    return this._entity.currency;
  }

  getFormatted(): string {
    const symbol = this.getCurrencySymbol();
    return `${symbol}${this._entity.amount.toFixed(Price.MAX_DECIMALS)}`;
  }

  getFormattedWithCurrency(): string {
    return `${this._entity.currency} ${this._entity.amount.toFixed(Price.MAX_DECIMALS)}`;
  }

  private getCurrencySymbol(): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      MXN: '$',
      CAD: 'CA$',
      AUD: 'A$',
    };

    return symbols[this._entity.currency] || this._entity.currency;
  }

  equals(other: Price): boolean {
    return (
      this._entity.amount === other.amount &&
      this._entity.currency === other.currency
    );
  }

  isGreaterThan(other: Price): boolean {
    this.validateSameCurrency(other);
    return this._entity.amount > other.amount;
  }

  isGreaterThanOrEqual(other: Price): boolean {
    this.validateSameCurrency(other);
    return this._entity.amount >= other.amount;
  }

  isLessThan(other: Price): boolean {
    this.validateSameCurrency(other);
    return this._entity.amount < other.amount;
  }

  isLessThanOrEqual(other: Price): boolean {
    this.validateSameCurrency(other);
    return this._entity.amount <= other.amount;
  }

  isZero(): boolean {
    return this._entity.amount === 0;
  }

  isPositive(): boolean {
    return this._entity.amount > 0;
  }

  add(other: Price): Price {
    this.validateSameCurrency(other);
    return Price.create(
      this._entity.amount + other.amount,
      this._entity.currency,
    );
  }

  subtract(other: Price): Price {
    this.validateSameCurrency(other);
    const newAmount = this._entity.amount - other.amount;

    if (newAmount < 0) {
      throw new Error('Subtraction would result in negative price');
    }

    return Price.create(newAmount, this._entity.currency);
  }

  multiply(factor: number): Price {
    if (factor < 0) {
      throw new Error('Multiplication factor cannot be negative');
    }

    if (!Number.isFinite(factor)) {
      throw new Error('Multiplication factor must be a valid number');
    }

    return Price.create(
      this._entity.amount * factor,
      this._entity.currency,
    );
  }

  divide(divisor: number): Price {
    if (divisor <= 0) {
      throw new Error('Divisor must be greater than zero');
    }

    if (!Number.isFinite(divisor)) {
      throw new Error('Divisor must be a valid number');
    }

    return Price.create(
      this._entity.amount / divisor,
      this._entity.currency,
    );
  }

  applyDiscount(percentage: number): Price {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    const discountFactor = 1 - percentage / 100;
    return this.multiply(discountFactor);
  }

  applyTax(percentage: number): Price {
    if (percentage < 0) {
      throw new Error('Tax percentage cannot be negative');
    }

    const taxFactor = 1 + percentage / 100;
    return this.multiply(taxFactor);
  }

  calculatePercentageOf(total: Price): number {
    this.validateSameCurrency(total);

    if (total.isZero()) {
      return 0;
    }

    return (this._entity.amount / total.amount) * 100;
  }

  private validateSameCurrency(other: Price): void {
    if (this._entity.currency !== other.currency) {
      throw new Error(
        `Cannot compare prices with different currencies: ${this._entity.currency} vs ${other.currency}`,
      );
    }
  }

  toJSON(): IPriceSchemaValueObject {
    return { ...this._entity };
  }
}
