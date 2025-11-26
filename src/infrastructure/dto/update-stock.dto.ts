import { IsInt, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStockDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsIn(['increment', 'decrement'])
  operation: 'increment' | 'decrement';
}
