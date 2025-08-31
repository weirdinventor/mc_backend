export class DomainError extends Error {
  message: string;
  cause?: any;
  safeMessage?: string;
  code?: string;

  constructor(message: string, cause?: any, safeMessage?: string) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    this.safeMessage = safeMessage;
    this.message = message;
  }

  toJSON() {
    return Object.getOwnPropertyNames(this).reduce((alt: object, key: string) => {
      alt[key] = this[key];
      return alt;
    }, {});
  }
}
