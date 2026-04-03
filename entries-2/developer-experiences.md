# Developer Experience

Creating good experiences for your customers' developers.

## TL;DR

| Practice                      | Key Takeaway                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| **Documentation**             | Request example + response example as a minimum — nothing beats a real example         |
| **Sandbox environment**       | Use the same production codebase with a tenant-level config, not a separate deployment |
| **Public API + optional SDK** | Always offer a raw API — an SDK alone limits how consumers integrate                   |
| **Self-serve tooling**        | Let developers reset keys, view logs, and fix issues without contacting support        |
| **Clear pricing**             | Show pricing publicly — "Contact Sales" drives developers away                         |

## Documentation

- At a minimum, include a **request example** and a **response example** for every endpoint. Listing parameters is
  useful, but examples covering common use-cases are what developers actually need.
- If your APIs are related (e.g. customers call 2–3 in succession), have separate pages or sections explaining the full
  journey with flow diagrams and links to individual endpoints - it definitely cannot be inferred from an OpenAPI spec!
- Make documentation easy to edit — the easier it is to update, the better maintained it will be. Version-controlled
  OpenAPI files, code-comment scanning, or tools like Gitbook all work.
- Private/internal documentation doesn't need to be as polished, but it should still have clear examples and parameter
  definitions to remind your team (and future you) how the API works.

## Sandbox Environment

Most SaaS software is multi-tenanted, so use that to your advantage:

- **Don't** deploy a separate sandbox environment — it will fall out of sync with production, often running ahead rather
  than behind.
- **Do** run sandbox as another tenant in your production codebase and database, with tenant-level config to nullify
  real actions (e.g. skip payment processing, suppress outbound emails).
- This way you build as many internal stages as you need (dev, staging, prod) but your customers are always hitting prod
  — and their sandbox is just another tenant.

## Public API, Optional SDK

- Not every product needs an SDK — sometimes a well-documented API is enough.
- If you **only** offer an SDK, you limit how consumers integrate. A simple HTTP call is often all they need.
- Offer both: a public API and an SDK. This makes customers happier and tends to improve the quality of the SDK too,
  since the SDK becomes a thin wrapper over a well-designed API rather than a monolith.
- More touch points doesn't necessarily mean more maintenance burden — that depends on your implementation.

## Self-Serve Tooling

- Go beyond sign-up. Let developers reset API keys, trigger actions, clean data, and view logs — all without contacting
  support.
- The best products couple an API for software with a frontend for developers, so they can solve their own issues at
  their own pace.
- Remember who the "customer" of your self-serve portal is — it might not be the stakeholder who signed the contract, it
  might be their developers.

## Clear Pricing

- Show pricing publicly. The number of products developers discard because every plan says "Contact Sales" is
  significant.
- Even if you're a startup still figuring out pricing, publishing some public options builds trust with prospective
  customers.
- Avoid pure per-request billing where the API itself forces lookup requests to check state. Instead, bill on the **user
  journey** (e.g. per item paid, per contract signed). If per-request billing is necessary, tier the endpoints and be
  generous with the lower tiers.
