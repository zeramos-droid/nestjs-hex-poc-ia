import { IProductResponseDTO } from './product-response.dto';

export interface IPaginationMetaDTO {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPaginationResultDTO<T = IProductResponseDTO> {
  data: T[];
  meta: IPaginationMetaDTO;
}
