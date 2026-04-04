# KYC Developer Experience

[Know your customer] enough to create a good experience for their developers.

| Practice                      | Key Takeaway                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| **Documentation**             | Request example + response example as a minimum - nothing beats a real example         |
| **Sandbox environment**       | Deploy a separate sandbox alongside production, keep it in sync, fix sandbox bugs fast |
| **Public API + optional SDK** | Always offer a raw API - an SDK alone limits how consumers integrate                   |
| **Self-serve tooling**        | Let developers reset keys, view logs, and fix issues without contacting support        |
| **Clear pricing**             | Show pricing publicly - "Contact Sales" drives developers away                         |

## Documentation

- At a minimum, include a **request example** and a **response example** for every endpoint. Listing parameters is
  useful, but examples covering common use-cases are what developers actually need.
- If your APIs are related (e.g. customers call 2–3 in succession), have separate pages or sections explaining the full
  journey with flow diagrams and links to individual endpoints - it definitely cannot be inferred from an OpenAPI spec!
- Make documentation easy to edit - the easier it is to update, the better maintained it will be. Tools like
  [Readme](https://readme.com) and [Gitbook](https://www.gitbook.com) are purpose-built for API docs and support OpenAPI
  imports, versioning, and interactive examples out of the box.
- Avoid tools like [Postman](https://www.postman.com/) - while the idea is appealing, the maintenance overhead of
  keeping collections in sync with your API is sadly more hassle than it's worth. Good written docs with copy-pasteable
  `curl` examples go further.
- Private/internal documentation doesn't need to be as polished, but it should still have clear examples and parameter
  definitions to remind your team (and future you) how the API works.

## Sandbox Environment

Deploy a dedicated sandbox environment alongside production:

- Give it a clear, separate URL - e.g. `api-sandbox.example.com` alongside `api.example.com` - so developers always know
  which environment they're hitting.
- Run the **same codebase** as production. Deploy sandbox and production together from the same pipeline so they stay in
  sync - sandbox should never run ahead or behind.
- Configure sandbox-specific behaviour at the environment level: skip real payment processing, suppress outbound emails,
  return deterministic test data where useful.
- Mirror feature flags in sandbox - if a feature is on in production, it should be on in sandbox too. Mismatched flags
  lead to developers building against behaviour that doesn't exist in production.
- **Fix sandbox bugs with the same tenacity as production bugs.** A broken sandbox erodes developer trust just as fast
  as a broken API - if developers can't test reliably, they'll move on.

## Public API, Optional SDK

- Not every product needs an SDK - sometimes a well-documented API is enough.
- If you **only** offer an SDK, you limit how consumers integrate. A simple HTTP call is often all they need.
- Offer both: a public API and an SDK. This makes customers happier and tends to improve the quality of the SDK too,
  since the SDK becomes a thin wrapper over a well-designed API rather than a monolith.
- More touch points doesn't necessarily mean more maintenance burden - that depends on your implementation.

## Self-Serve Tooling

- Go beyond sign-up. Let developers reset API keys, trigger actions, clean data, and view logs - all without contacting
  support.
- The best products couple an API for software with a frontend for developers, so they can solve their own issues at
  their own pace.
- Remember who the "customer" of your self-serve portal is - it might not be the stakeholder who signed the contract, it
  might be their developers.

## Clear Pricing

- Show pricing publicly. The number of products developers discard because every plan says "Contact Sales" is
  significant.
- Even if you're a startup still figuring out pricing, publishing some public options builds trust with prospective
  customers.
- Avoid pure per-request billing where the API itself forces lookup requests to check state. Instead, bill on the **user
  journey** (e.g. per item paid, per contract signed). If per-request billing is necessary, tier the endpoints and be
  generous with the lower tiers.
