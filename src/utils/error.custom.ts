export class CustomError extends Error {
  public message: any;
  public code: number;

  constructor(msg: any, code: number) {
    super(msg);
    this.message = msg;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
