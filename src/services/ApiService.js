import { ApiConfig } from "../config/ApiConfig";

const buildUrl = (path, pathParams, query) => {
  let resolvedPath = path;

  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(String(value)));
    });
  }

  const url = new URL(resolvedPath, ApiConfig.host);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
};

const normalizeBody = (body) => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  return typeof body === "string" ? body : JSON.stringify(body);
};

const buildHeaders = (body, headers) => {
  const baseHeaders = headers ? { ...headers } : {};

  if (body instanceof FormData) {
    return baseHeaders;
  }

  return {
    "Content-Type": "application/json",
    ...baseHeaders,
  };
};

export const ApiService = {
  async request(endpointKey, options = {}) {
    const endpoint = ApiConfig.endpoints[endpointKey];

    if (!endpoint) {
      throw new Error(`Endpoint not found: ${endpointKey}`);
    }

    const {
      pathParams,
      query,
      body,
      headers,
      signal,
    } = options;

    const url = buildUrl(endpoint.path, pathParams, query);
    const normalizedBody = normalizeBody(body);

    const response = await fetch(url, {
      method: endpoint.method,
      headers: buildHeaders(normalizedBody, headers),
      body: normalizedBody,
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed (${response.status}): ${errorText}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  },
};
