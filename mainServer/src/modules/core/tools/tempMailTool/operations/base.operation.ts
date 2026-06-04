export interface ITempMailOperation<TParams = unknown, TResponse = unknown> {
  execute(params: TParams): Promise<TResponse>;
}
