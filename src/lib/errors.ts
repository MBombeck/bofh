export class ApiError extends Error {
  public readonly code: string;

  constructor(
    public readonly statusCode: number,
    code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}
