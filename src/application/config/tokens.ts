export const HEALTH_TOKENS = {
  GET_HEALTH_USE_CASE: Symbol('IGetHealthUseCase'),
};

export const PRODUCT_TOKENS = {
  PRODUCT_REPOSITORY: Symbol('IProductRepository'),
  CREATE_PRODUCT_USE_CASE: Symbol('ICreateProductUseCase'),
  GET_PRODUCT_BY_ID_USE_CASE: Symbol('IGetProductByIdUseCase'),
  GET_PRODUCTS_USE_CASE: Symbol('IGetProductsUseCase'),
  UPDATE_PRODUCT_USE_CASE: Symbol('IUpdateProductUseCase'),
  DELETE_PRODUCT_USE_CASE: Symbol('IDeleteProductUseCase'),
  UPDATE_STOCK_USE_CASE: Symbol('IUpdateStockUseCase'),
};

export const INFRASTRUCTURE_TOKENS = {
  ENVIRONMENT_SERVICE: Symbol('IEnvironmentService'),
};
