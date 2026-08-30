import {
  AuthenticationType,
  httpClient,
  HttpMessageBody,
  HttpMethod,
  HttpRequest,
  QueryParams,
} from '@activepieces/pieces-common';
import {
  KandjiBlueprint,
  KandjiBlueprintPage,
  KandjiDevice,
  KandjiUser,
  KandjiUserPage,
} from './types';

const API_PATH = '/api/v1';
// Kandji caps every list endpoint at 300 records per request.
const MAX_PAGE_SIZE = 300;
// Users are cursor-paginated with no server-side "contains" search, so the
// dropdown walks a bounded number of pages instead of the whole directory.
const MAX_USER_PAGES = 4;

export type KandjiCredentials = {
  api_url: string;
  api_token: string;
};

export type KandjiQuery = Record<
  string,
  string | number | boolean | undefined | null
>;

export type KandjiApiCallParams = {
  auth: KandjiCredentials;
  method: HttpMethod;
  resourceUri: string;
  query?: KandjiQuery;
  body?: unknown;
};

// Tenants copy their API URL out of the web app in every shape going:
// 'accuhive.api.kandji.io', with a scheme, with a trailing slash, or with
// '/api/v1' already appended.
function baseUrl(apiUrl: string): string {
  const host = apiUrl
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .replace(/\/api\/v\d+$/i, '')
    .replace(/\/+$/, '');
  return `https://${host}${API_PATH}`;
}

async function apiCall<T extends HttpMessageBody>({
  auth,
  method,
  resourceUri,
  query,
  body,
}: KandjiApiCallParams): Promise<T> {
  const queryParams: QueryParams = {};
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      queryParams[key] = String(value);
    }
  }

  const request: HttpRequest = {
    method,
    url: `${baseUrl(auth.api_url)}${resourceUri}`,
    authentication: {
      type: AuthenticationType.BEARER_TOKEN,
      token: auth.api_token,
    },
    queryParams,
    body,
  };

  const response = await httpClient.sendRequest<T>(request);
  return response.body;
}

async function listDevices({
  auth,
  query,
  limit,
}: {
  auth: KandjiCredentials;
  query?: KandjiQuery;
  limit?: number;
}): Promise<KandjiDevice[]> {
  const target = limit ?? MAX_PAGE_SIZE;
  const devices: KandjiDevice[] = [];

  while (devices.length < target) {
    const pageSize = Math.min(MAX_PAGE_SIZE, target - devices.length);
    const page = await apiCall<KandjiDevice[]>({
      auth,
      method: HttpMethod.GET,
      resourceUri: '/devices',
      query: { ...query, limit: pageSize, offset: devices.length },
    });
    devices.push(...page);
    if (page.length < pageSize) {
      break;
    }
  }

  return devices;
}

async function listBlueprints({
  auth,
  name,
}: {
  auth: KandjiCredentials;
  name?: string;
}): Promise<KandjiBlueprint[]> {
  const page = await apiCall<KandjiBlueprintPage>({
    auth,
    method: HttpMethod.GET,
    resourceUri: '/blueprints',
    query: { name, limit: MAX_PAGE_SIZE },
  });
  return page.results ?? [];
}

async function listUsers(auth: KandjiCredentials): Promise<KandjiUser[]> {
  const users: KandjiUser[] = [];
  let cursor: string | undefined = undefined;

  for (let page = 0; page < MAX_USER_PAGES; page++) {
    const response: KandjiUserPage = await apiCall<KandjiUserPage>({
      auth,
      method: HttpMethod.GET,
      resourceUri: '/users',
      query: { sizePerPage: MAX_PAGE_SIZE, cursor },
    });
    users.push(...(response.results ?? []));
    cursor = nextCursor(response.next);
    if (!cursor) {
      break;
    }
  }

  return users;
}

function nextCursor(next: string | null | undefined): string | undefined {
  if (!next) {
    return undefined;
  }
  try {
    return new URL(next).searchParams.get('cursor') ?? undefined;
  } catch {
    return undefined;
  }
}

export const kandjiApi = {
  baseUrl,
  maxPageSize: MAX_PAGE_SIZE,
  call: apiCall,
  listDevices,
  listBlueprints,
  listUsers,
};
