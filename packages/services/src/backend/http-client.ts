import { PlannerServiceRequestError } from "../errors";

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class BackendHttpClient {
  private readonly apiBaseUrl: string;
  private readonly fetchImpl: FetchLike;

  constructor(apiBaseUrl: string, fetchImpl: FetchLike = fetch) {
    this.apiBaseUrl = apiBaseUrl;
    this.fetchImpl = fetchImpl;
  }

  async getJson<TResponse>(
    path: string,
    expectedStatuses: readonly number[] = [200]
  ): Promise<TResponse> {
    return this.requestJson<TResponse>(path, { method: "GET" }, expectedStatuses);
  }

  async postJson<TRequest, TResponse>(
    path: string,
    body: TRequest,
    expectedStatuses: readonly number[] = [200]
  ): Promise<TResponse> {
    return this.requestJson<TResponse>(
      path,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      },
      expectedStatuses
    );
  }

  private async requestJson<TResponse>(
    path: string,
    init: RequestInit,
    expectedStatuses: readonly number[]
  ): Promise<TResponse> {
    const response = await this.fetchImpl(this.resolveUrl(path), {
      ...init,
      cache: "no-store"
    });

    if (!expectedStatuses.includes(response.status)) {
      const detail = await safeReadBody(response);
      throw new PlannerServiceRequestError(
        response.status,
        detail || `Backend request failed with status ${response.status}.`
      );
    }

    return (await response.json()) as TResponse;
  }

  private resolveUrl(path: string) {
    return new URL(path.replace(/^\/+/, ""), `${this.apiBaseUrl}/`).toString();
  }
}

async function safeReadBody(response: Response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
