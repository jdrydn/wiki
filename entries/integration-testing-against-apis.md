# Integration Testing Against APIs

Integration tests that hit real, running services catch things unit tests never will. Schema drift, serialization bugs,
auth middleware that silently eats headers, validation rules that only exist in the database — mocks hide all of this.

## Why not mock?

Mocking HTTP responses is tempting — tests run fast, no infrastructure needed, deterministic by default. But mocked
tests answer the wrong question. They tell you "does my code work assuming the API behaves exactly like I think it
does?" instead of "does my code work against the actual API?"

The gaps are real:

| What mocks hide                                              | What happens in production               |
| ------------------------------------------------------------ | ---------------------------------------- |
| The API added a required field last week                     | `400 Bad Request` on every call          |
| Timestamps come back as strings, not Dates                   | Your date logic silently breaks          |
| Auth middleware rejects your token format                    | Works in tests, fails on deploy          |
| The API returns `{ errors: [...] }` not `{ error: "..." }`   | Your error handler shows a blank message |
| Pagination headers changed from `X-Total` to `X-Total-Count` | Infinite loading spinners                |

If your tests don't talk to the real service, you're testing your assumptions, not your code.

## Why I wrote `expect-asymmetric`

I got tired of it. Tired of mocking response bodies, tired of maintaining fake payloads that drifted from reality, tired
of tests that passed locally and broke against a deployed API because the mock was wrong in some subtle way you'd never
think to check.

The turning point was discovering that Jest and Vitest support
[asymmetric matchers](https://vitest.dev/api/expect.html#expect-anything) — objects you can drop into `toEqual()` that
match by shape instead of exact value. `expect.any(String)` and `expect.stringContaining()` are built in, but they're
blunt tools. "It's a string" is not the same as "it's a UUID". "It contains a date" is not the same as "it's an ISO 8601
timestamp from the last five seconds".

So I built a library of ~30 matchers that let you assert the _shape_ of values precisely — UUIDs, ISO dates, JWTs,
emails, numeric ranges, date tolerances — and compose them with `and`, `or`, and `not`. You drop them into `toEqual()`
exactly where you'd put a literal value, and they do the right thing.

<LinkBlock
  title="expect-asymmetric"
  description="Asymmetric matchers for expect (Jest/Vitest), written & published by @jdrydn"
  href="https://npm.im/expect-asymmetric"
  icon="npm" variant="npm" />

## Setup

Install the dependency:

::: code-group

```[npm]
npm install --save-dev expect-asymmetric
```

```[yarn]
yarn add -D expect-asymmetric
```

```[pnpm]
pnpm add -D expect-asymmetric
```

:::

Point your tests at a real running instance. A base URL from an environment variable keeps it flexible — for the sake of
this document, we have wrapped the HTTP client in a `makeRequest` function that returns `{ status, headers, data }` so
every test reads the same regardless of which library is used:

::: code-group

```ts [axios]
import axios from 'axios';

const baseURL = process.env.API_URL ?? 'http://localhost:3000';

async function makeRequest(method: string, path: string, bodyOrQuery?: unknown) {
  const hasBody = !['GET', 'HEAD'].includes(method);
  const res = await axios({
    method,
    baseURL,
    url: path,
    params: !hasBody ? bodyOrQuery : undefined,
    data: hasBody ? bodyOrQuery : undefined,
    responseType: 'json',
    validateStatus: () => true,
  });
  const headers = Object.fromEntries(Object.entries(res.headers).map(([k, v]) => [k, String(v)]));
  return { status: res.status, headers, data: res.data };
}
```

```ts [fetch]
const baseURL = process.env.API_URL ?? 'http://localhost:3000';

async function makeRequest(method: string, path: string, bodyOrQuery?: unknown) {
  const hasBody = !['GET', 'HEAD'].includes(method);
  const url = new URL(path, baseURL);
  if (!hasBody && bodyOrQuery) {
    Object.entries(bodyOrQuery as Record<string, string>).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url, {
    method,
    headers: hasBody ? { 'Content-Type': 'application/json' } : {},
    body: hasBody ? JSON.stringify(bodyOrQuery) : undefined,
  });
  const headers = Object.fromEntries(res.headers.entries());
  return { status: res.status, headers, data: await res.json() };
}
```

```ts [https]
import https from 'node:https';

const baseURL = process.env.API_URL ?? 'https://localhost:3000';

function makeRequest(method: string, path: string, bodyOrQuery?: unknown) {
  const hasBody = !['GET', 'HEAD'].includes(method);
  const url = new URL(path, baseURL);
  if (!hasBody && bodyOrQuery) {
    Object.entries(bodyOrQuery as Record<string, string>).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new Promise<{ status: number; headers: Record<string, string>; data: unknown }>((resolve, reject) => {
    const req = https.request(
      url,
      { method, headers: hasBody ? { 'Content-Type': 'application/json' } : {} },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const headers = Object.fromEntries(Object.entries(res.headers).map(([k, v]) => [k, String(v)]));
          resolve({ status: res.statusCode!, headers, data: JSON.parse(Buffer.concat(chunks).toString()) });
        });
      },
    );
    req.on('error', reject);
    if (hasBody && bodyOrQuery) req.write(JSON.stringify(bodyOrQuery));
    req.end();
  });
}
```

:::

## The problem with `expect.any()`

Say your API returns a user object after creation. You might write:

```ts
// Too loose — this passes even if id is "not-a-uuid" or createdAt is "yesterday"
expect(res.data).toEqual({
  id: expect.any(String),
  email: 'someone@example.com',
  name: 'Someone',
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
});
```

This tells you the fields exist and they're strings. It doesn't tell you the ID is actually a UUID, or that the
timestamps are valid ISO 8601 dates, or that `createdAt` is recent rather than stuck at some hardcoded epoch. You're
asserting the type, not the shape.

## Asserting response shapes with `expect-asymmetric`

`expect-asymmetric` gives you matchers that slot into `toEqual()` and `toMatchObject()` — the same way `expect.any()`
does — but with actual validation:

```ts
import { describe, expect, test } from 'vitest';
import matchers from 'expect-asymmetric';
import ms from 'ms';

describe('POST /users', () => {
  test('should create a user', async () => {
    const res = await makeRequest('POST', '/users', {
      email: 'someone@example.com',
      name: 'Someone',
    });

    expect(res.status).toEqual(201);
    expect(res.data).toEqual({
      id: matchers.stringUUID(),
      email: 'someone@example.com',
      name: 'Someone',
      createdAt: matchers.stringDateISO8601(),
      updatedAt: matchers.stringDateISO8601(),
    });
  });
});
```

Now if `id` comes back as `"user_123"` instead of a UUID, the test fails. If `createdAt` comes back as `"2025-01-01"`
without the time component, the test fails. You're asserting what the value _looks like_, not just that it exists.

### Dates that are actually recent

For timestamps, you often want to check they're not just valid but _recent_ — a `createdAt` from three years ago
probably means something is broken:

```ts
expect(res.data).toEqual({
  id: matchers.stringUUID(),
  email: 'someone@example.com',
  name: 'Someone',
  createdAt: matchers.dateWithin(new Date(), ms('5s')),
  updatedAt: matchers.dateWithin(new Date(), ms('5s')),
});
```

`dateWithin` checks the value is within 5 seconds of now — tight enough to catch stale data, loose enough to handle test
execution time.

## Testing error responses

Error responses deserve the same shape-level scrutiny. A `404` that returns HTML instead of JSON will sail past a
status-code-only check:

```ts
describe('GET /users/:id', () => {
  test('should return 404 for a missing user', async () => {
    const res = await makeRequest('GET', '/users/00000000-0000-0000-0000-000000000000');

    expect(res.status).toEqual(404);
    expect(res.data).toEqual({
      error: matchers.stringIncludes('not found'),
    });
  });
});
```

And for validation errors, assert the structure of the error payload — not just that it's a `400`:

```ts
describe('POST /users', () => {
  test('should reject an invalid email', async () => {
    const res = await makeRequest('POST', '/users', {
      email: 'not-an-email',
      name: 'Someone',
    });

    expect(res.status).toEqual(400);
    expect(res.data).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({
          field: 'email',
          message: expect.any(String),
        }),
      ]),
    });
  });
});
```

You can mix `expect-asymmetric` matchers with Vitest's built-in asymmetric matchers freely — they're the same kind of
object under the hood.

## Composing matchers

The `and`, `or`, and `not` matchers let you combine checks. This is particularly useful for fields that could be one of
several valid shapes:

```ts
// A status field that should be one of a known set
expect(res.data).toEqual({
  id: matchers.stringUUID(),
  status: matchers.or([
    matchers.stringEquals('pending'),
    matchers.stringEquals('active'),
    matchers.stringEquals('suspended'),
  ]),
  role: matchers.and([matchers.stringStartsWith('org_'), matchers.not([matchers.stringEquals('org_superadmin')])]),
});
```

## Useful matchers for API testing

The full list is in the [README](https://npm.im/expect-asymmetric), but these come up most often when testing APIs:

| Matcher                    | What it checks                              |
| -------------------------- | ------------------------------------------- |
| `stringUUID()`             | Valid UUID format                           |
| `stringDateISO8601()`      | Valid ISO 8601 date string                  |
| `stringEmail()`            | Valid email format                          |
| `stringJWT()`              | Valid JWT structure (three base64 segments) |
| `dateWithin(target, ms)`   | Date within a tolerance window              |
| `numberGreaterThan(n)`     | Numeric comparisons without exact values    |
| `stringStartsWith(prefix)` | Prefix checks for structured IDs            |
| `and()` / `or()` / `not()` | Compose matchers for complex assertions     |

## Further reading

- [Vitest documentation](https://vitest.dev/)
- [`expect-asymmetric` on npm](https://npm.im/expect-asymmetric)
