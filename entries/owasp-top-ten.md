# OWASP Top 10

<LinkBlock
  title="OWASP Top Ten Web Application Security Risks"
  description="The ten most critical web application security risks, updated periodically by the Open Web Application Security Project."
  href="https://owasp.org/www-project-top-ten/"/>

The current list is the **2021 edition**. Each item below includes what it is, a vulnerable example, and a fix.

| #   | Risk                                     | One-liner                                                                 |
| --- | ---------------------------------------- | ------------------------------------------------------------------------- |
| A01 | Broken Access Control                    | Users can act outside their intended permissions                          |
| A02 | Cryptographic Failures                   | Sensitive data exposed through weak or missing encryption                 |
| A03 | Injection                                | Untrusted data sent to an interpreter as part of a command or query       |
| A04 | Insecure Design                          | Missing or ineffective security controls at the architecture level        |
| A05 | Security Misconfiguration                | Default configs, open cloud storage, verbose errors in production         |
| A06 | Vulnerable & Outdated Components         | Running libraries or frameworks with known CVEs                           |
| A07 | Identification & Authentication Failures | Broken login, session management, or credential handling                  |
| A08 | Software & Data Integrity Failures       | Trusting unverified code, updates, or CI/CD pipelines                     |
| A09 | Security Logging & Monitoring Failures   | Attacks go undetected because nothing is logged or alerted on             |
| A10 | Server-Side Request Forgery (SSRF)       | App fetches a remote resource using user-supplied URLs without validation |

## A01 - Broken Access Control

Users access resources or actions they shouldn't. This is the #1 risk for a reason - it's everywhere.

```js
import assert from 'http-assert-plus';

// ❌ Vulnerable: no ownership check
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await db.invoices.findById(req.params.id);
  res.status(200).json(invoice);
});

// ✅ Fixed: verify the resource belongs to the authenticated user
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await db.invoices.findById(req.params.id);
  assert(invoice && invoice.userId === req.user.id, 404, 'Invoice not found');
  res.status(200).json(invoice);
});
```

Other common examples include missing role checks on admin endpoints, CORS misconfiguration allowing any origin, and
directory traversal via user-supplied file paths.

## A02 - Cryptographic Failures

Sensitive data is stored or transmitted without adequate encryption.

```bash
# ❌ Vulnerable: transmitting credentials over plain HTTP
curl http://api.example.com/login -d '{"password":"hunter2"}'

# ✅ Fixed: enforce TLS
curl https://api.example.com/login -d '{"password":"hunter2"}'
```

```js
// ❌ Vulnerable: hashing passwords with MD5
const hash = crypto.createHash('md5').update(password).digest('hex');

// ✅ Fixed: use bcrypt or argon2 with a salt
const hash = await bcrypt.hash(password, 12);
```

Checklist: enforce HTTPS everywhere, use strong hashing algorithms for passwords (bcrypt, scrypt, argon2), encrypt
sensitive data at rest, and never commit secrets to version control.

## A03 - Injection

Untrusted input is interpreted as code. SQL injection is the classic example, but this applies to NoSQL, OS commands,
LDAP, and more.

```js
// ❌ Vulnerable: string concatenation in SQL
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;
await db.raw(query);

// ✅ Fixed: parameterised queries
const user = await db('users').where({ email: req.body.email }).first();
// Or with raw SQL:
await db.raw('SELECT * FROM users WHERE email = ?', [req.body.email]);
```

```bash
# ❌ Vulnerable: injecting user input into a shell command
exec(`ping -c 1 ${userInput}`);
# If userInput is "8.8.8.8; rm -rf /" you have a very bad day

# ✅ Fixed: use library APIs instead of shell commands, or sanitise strictly
execFile('ping', ['-c', '1', userInput]);
```

## A04 - Insecure Design

Security problems baked into the architecture, not just the implementation. No amount of code review fixes a
fundamentally insecure design.

Examples include:

- A password reset flow that answers security questions with publicly available information
- A booking system with no rate limiting that lets bots reserve every slot
- An e-commerce checkout that trusts client-side price calculations

```js
// ❌ Insecure design: trusting the client-submitted price
app.post('/api/checkout', async (req, res) => {
  const order = await createOrder({ price: req.body.price, item: req.body.itemId });
  await chargeCard(req.user, order.price);
});

// ✅ Secure design: derive the price server-side
app.post('/api/checkout', async (req, res) => {
  const item = await db.items.findById(req.body.itemId);
  const order = await createOrder({ price: item.price, item: item.id });
  await chargeCard(req.user, order.price);
});
```

## A05 - Security Misconfiguration

Default credentials, unnecessary features enabled, overly verbose error messages, or permissive cloud configs.

```yaml
# ❌ Vulnerable: debug mode in production (e.g. a Docker Compose override)
environment:
  - DEBUG=true
  - SHOW_STACK_TRACES=true

# ✅ Fixed: strip debug settings in production
environment:
  - NODE_ENV=production
```

```bash
# ❌ Vulnerable: S3 bucket with public access
aws s3api get-bucket-acl --bucket my-bucket
# Returns "AllUsers: READ"

# ✅ Fixed: block public access at the account level
aws s3control put-public-access-block \
  --account-id 123456789012 \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

## A06 - Vulnerable & Outdated Components

Running dependencies with known security vulnerabilities.

```bash
# Audit your dependencies
npm audit
pip audit
bundle audit

# Keep dependencies up to date
npm update
pip install --upgrade <package>
```

Use automated tools like Dependabot or Renovate to open PRs when new versions are available. Pin major versions in
production and review changelogs before upgrading.

## A07 - Identification & Authentication Failures

Weak passwords allowed, credential stuffing not mitigated, sessions that never expire, tokens stored insecurely.

```js
import assert from 'http-assert-plus';

// ❌ Vulnerable: no rate limiting on login
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  assert(user, 401, 'Invalid credentials');
  res.json({ token: generateToken(user) });
});

// ✅ Fixed: add rate limiting
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

app.post('/api/login', loginLimiter, async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  assert(user, 401, 'Invalid credentials');
  res.json({ token: generateToken(user) });
});
```

Other mitigations: enforce minimum password complexity, support multi-factor authentication, set session expiry and
rotation policies, and never expose session tokens in URLs.

## A08 - Software & Data Integrity Failures

Trusting code or data without verifying its integrity - auto-updates without signature checks, insecure CI/CD pipelines,
or deserialising untrusted data.

```json
// ❌ Vulnerable: pulling a dependency without a lockfile or integrity check
// package.json
{
  "dependencies": {
    "some-lib": "^2.0.0"
  }
}
```

```bash
# ✅ Fixed: use a lockfile and verify integrity
npm ci  # Installs from package-lock.json with integrity checks
```

```yaml
# ✅ Pin CI/CD actions to a specific SHA, not a mutable tag
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

## A09 - Security Logging & Monitoring Failures

If you can't see an attack, you can't respond to it. Log authentication events, access control failures, and input
validation failures.

```js
import assert from 'http-assert-plus';

// ❌ Vulnerable: silent failure
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  assert(user, 401, 'Invalid credentials');
  res.json({ token: generateToken(user) });
});

// ✅ Fixed: log the failure with context
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  if (!user) {
    logger.warn('Failed login attempt', { email: req.body.email, ip: req.ip });
    assert.fail(401, 'Invalid credentials');
  }

  logger.info('Successful login', { userId: user.id, ip: req.ip });
  res.json({ token: generateToken(user) });
});
```

At a minimum: log all login attempts (pass and fail), log access-denied events, feed logs into a centralised system with
alerting, and ensure logs themselves don't contain sensitive data like passwords or tokens.

## A10 - Server-Side Request Forgery (SSRF)

The application fetches a URL supplied by the user without validating the destination, allowing attackers to reach
internal services.

```js
// ❌ Vulnerable: fetching any URL the user provides
app.get('/api/preview', async (req, res) => {
  const response = await fetch(req.query.url);
  const body = await response.text();
  res.send(body);
});
// Attacker sends: /api/preview?url=http://169.254.169.254/latest/meta-data/
// Now they have your EC2 instance metadata (and possibly IAM credentials)

// ✅ Fixed: validate and restrict the target URL
app.get('/api/preview', async (req, res) => {
  const parsed = new URL(req.query.url);

  // Block private/internal ranges
  const blocked = ['localhost', '127.0.0.1', '169.254.169.254', '10.', '172.16.', '192.168.'];
  if (blocked.some((b) => parsed.hostname.startsWith(b))) {
    return res.status(400).json({ error: 'URL not allowed' });
  }

  // Enforce HTTPS
  if (parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only HTTPS URLs are allowed' });
  }

  const response = await fetch(parsed.toString());
  const body = await response.text();
  res.send(body);
});
```

On AWS, use the
[Instance Metadata Service v2 (IMDSv2)](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html)
which requires a session token and makes SSRF exploitation significantly harder.
