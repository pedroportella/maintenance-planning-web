export class ServiceConfigurationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ServiceConfigurationError";
    this.code = code;
  }
}

export class PlannerServiceRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PlannerServiceRequestError";
    this.code = "backend-request-failed";
    this.status = status;
  }
}
