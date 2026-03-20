export type FieldErrors = Record<string, string>;

export class HttpError extends Error {
  statusCode: number;
  fieldErrors?: FieldErrors;

  constructor(
    statusCode: number,
    message: string,
    fieldErrors?: FieldErrors
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;

    if (fieldErrors) {
      this.fieldErrors = fieldErrors;
    }
  }
}