import {
  AuthenticationType,
  httpClient,
  HttpMessageBody,
  HttpMethod,
  HttpRequest,
  QueryParams,
} from '@activepieces/pieces-common';
import {
  KandjiAuditEvent,
  KandjiAuditEventPage,
  KandjiBlueprint,
  KandjiBlueprintPage,
  KandjiDevice,
  KandjiUser,
  KandjiUserPage,
} from './types';

const API_PATH = '/api/v1';
// Kandji caps every list endpoint at 300 records per request.
const MAX_PAGE_SIZE = 300;
// Except the audit feed, which allows 500.
const MAX_AUDIT_PAGE_SIZE = 500;
// A poll asks for the events since the last one and gets a single short page.
// The cap bounds the exceptions: a burst of thousands of events, and the
// unbounded reads that have no start date to narrow them.
const MAX_AUDIT_PAGES = 4;
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
}: {
  auth: KandjiCredentials;
}): Promise<KandjiBlueprint[]> {
  const page = await apiCall<KandjiBlueprintPage>({
    auth,
    method: HttpMethod.GET,
    resourceUri: '/blueprints',
    query: { limit: MAX_PAGE_SIZE },
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

async function listAuditEvents({
  auth,
  since,
  maxPages = MAX_AUDIT_PAGES,
}: {
  auth: KandjiCredentials;
  since?: number;
  maxPages?: number;
}): Promise<KandjiAuditEvent[]> {
  const events: KandjiAuditEvent[] = [];
  let cursor: string | undefined = undefined;

  for (let page = 0; page < maxPages; page++) {
    const response: KandjiAuditEventPage = await apiCall<KandjiAuditEventPage>({
      auth,
      method: HttpMethod.GET,
      resourceUri: '/audit/events',
      query: {
        limit: MAX_AUDIT_PAGE_SIZE,
        // Oldest first from the start date, so that a burst longer than the
        // page budget is only delayed: every event left unread is newer than
        // the newest one returned, which is where a caller tracking the newest
        // event it has seen resumes. Newest first would move that mark past
        // them and lose them. With no start date nothing bounds the walk and
        // the caller only wants a recent sample, so read newest first.
        sort_by: since ? 'occurred_at' : '-occurred_at',
        start_date: since ? new Date(since).toISOString() : undefined,
        cursor,
      },
    });
    events.push(...(response.results ?? []));
    cursor = nextCursor(response.next);
    if (!cursor) {
      break;
    }
  }

  return events;
}

export const kandjiApi = {
  baseUrl,
  maxPageSize: MAX_PAGE_SIZE,
  call: apiCall,
  listDevices,
  listBlueprints,
  listUsers,
  listAuditEvents,
};
