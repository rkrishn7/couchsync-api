export class ServiceError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ServiceError';
  }
}
