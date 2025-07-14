export class HttpException extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ServiceError extends HttpException {
  constructor(message = 'Something went wrong, try again') {
    super(message, 500);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}