# Remocal Software Development

Remocal (**rem**ote + l**ocal**) is a developer workflow where your code lives on your machine, but your app runs where
it's meant to — in the cloud, in containers, on edge networks, or wherever your users actually hit. Build locally,
deploy remotely, get fast feedback without waiting for CI pipelines or switching between environments.

## TL;DR

| Local-first                  | Remote-first                   | Remocal                                       |
| ---------------------------- | ------------------------------ | --------------------------------------------- |
| Fast editing & great tooling | Production-grade environments  | **Both**                                      |
| Instant iteration            | Real APIs, real infrastructure | **Instant iteration, real infra**             |
| Drifts from production       | Slow, painful feedback loop    | **Matches prod, tight loop**                  |
| Cheap                        | Expensive per developer        | **Cheap shared infra, small ephemeral slice** |

## What is remocal?

Traditional workflows force a choice:

- **Local-first** — fast to iterate, but mocked dependencies drift from production. Bugs that only show up on one laptop
  are nobody's idea of fun.
- **Remote-first** — accurate, but every change costs you a build, push, deploy & wait. Feedback stretches from seconds
  to minutes.

Remocal bridges the gap. You keep your editor, your debugger & your hot-reload. Your dependencies — databases, queues,
APIs, auth providers — run in a real, deployed environment. A local change hits real infrastructure in seconds, not
minutes.

The word itself is a portmanteau: **rem**ote + l**ocal**. It overlaps with "inner dev loop" tooling but is broader —
remocal is the pattern, not any single tool. It also overlaps heavily with ephemeral environments: remocal is _how_
developers consume ephemeral environments day-to-day.

## Why do remocal?

### For developers

- **Tight feedback loop** — skip the build-push-deploy cycle for small changes.
- **Real integration points** — test against the actual database, queue, or third-party API, not a mock that lies to
  you.
- **Keep your tools** — your IDE, debugger, profiler & shell stay on your machine.
- **Catch environment bugs earlier** — IAM permissions, network ACLs, cold starts & region-specific quirks all surface
  before merge, not after.

### For teams & product managers

- **Fewer "works on my machine" bugs** — shared remote dependencies mean consistent behaviour across the team.
- **Less staging contention** — developers stop fighting over a single shared staging environment.
- **Faster cycle time** — shorter feedback loops mean more iterations per day, which means features ship sooner.
- **Cheaper than per-developer full clusters** — only the code under test runs per-developer; shared dependencies stay
  shared.

### Trade-offs to be aware of

- Requires a working network connection. Planes, trains & patchy coffee-shop wifi get harder.
- Someone has to own the remote infrastructure & keep it healthy — this is platform work.
- Not every piece of a stack makes sense to run remotely. Unit tests & pure functions belong local.
- Debugging across the local/remote boundary is harder than fully-local. Logging & tracing discipline matters more.
- Secrets management gets more complex — your local process now needs credentials for real cloud resources.

## How to remocal

The pattern is tool-agnostic. Whatever your stack — serverless, Kubernetes, containers on VMs — the same primitives
apply.

### Parameterise your infrastructure

Your IaC almost certainly already takes an `environment` parameter (`dev`, `staging`, `prod`). Add an `ephemeralId` so
each developer — or each branch, or each PR — can spin up their own isolated slice.

```
stack-name: myapp-{environment}-{ephemeralId}
```

Naming matters. Prefix every resource with the same identifier so it's obvious at a glance what's ephemeral & safe to
tear down.

### Isolate at the application layer, not the account layer

Running a full cloud account per developer is expensive, slow to provision & a nightmare to keep in sync with
production. Isolate at the application level instead — unique stack names, unique resource prefixes, unique database
schemas — all inside a shared dev account.

This is the single most important decision when designing a remocal setup. Get it right & onboarding a new developer is
a one-command operation. Get it wrong & you've built a second production environment to maintain.

### Share the expensive dependencies

Not every resource needs to be per-developer. The cost saving comes from being deliberate about what's shared vs what's
ephemeral.

| Per-ephemeral                              | Shared                                |
| ------------------------------------------ | ------------------------------------- |
| **Application code (Lambdas, containers)** | **VPC & subnets**                     |
| **API Gateway / load balancer routes**     | **NAT gateway**                       |
| App-specific queues & topics               | Observability (logs, metrics, traces) |
| App-specific database schemas              | Shared seed data & reference data     |
| Feature-branch config                      | Identity provider / auth              |

### Make teardown automatic

Ephemeral means ephemeral. Tie the lifetime of a remocal environment to the lifetime of a branch, PR, or working
session. Tag every resource with `ephemeralId` so a single command — or a scheduled cleanup job — can destroy everything
belonging to a dead branch.

Nothing kills a remocal setup faster than orphaned stacks racking up a cloud bill.

### Route traffic to your local process

For services running in a cluster, tools like [mirrord](https://mirrord.dev) or
[Telepresence](https://www.telepresence.io) intercept traffic bound for a deployed pod & forward it to your local
process. The pod keeps its identity, its env vars & its network neighbours — but the code running is the one on your
laptop with breakpoints set.

For serverless stacks, the equivalent is deploying the single function under test per-developer & letting the rest of
the stack stay shared. [SST](https://sst.dev),
[AWS SAM Accelerate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-sync.html)
& [Serverless framework](https://www.serverless.com/framework/docs/providers/aws/cli-reference/dev) workflows all
support this.

### Suggested adoption order

1. Get `environment` into every IaC parameter.
2. Add `ephemeralId` & make sure it flows through to every resource name.
3. Split your stack into "shared" & "ephemeral" layers.
4. Wire up a `deploy-my-branch` command that any developer can run.
5. Add automatic teardown on branch delete or PR merge.
6. Layer on traffic-interception tooling if your stack needs it.

## Who is doing remocal?

The tooling landscape is growing. Notable entries:

| Tool                                                                                                                         | Stack focus    | What it does                                          |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------- |
| **[mirrord](https://mirrord.dev)**                                                                                           | Kubernetes     | Run a local process in the context of a remote pod    |
| **[Telepresence](https://www.telepresence.io)**                                                                              | Kubernetes     | Two-way proxy between local & remote clusters         |
| **[Garden](https://garden.io)**                                                                                              | Kubernetes     | Build, test & deploy from local to remote             |
| [Tilt](https://tilt.dev)                                                                                                     | Kubernetes     | Continuous sync of local source to remote cluster     |
| [Skaffold](https://skaffold.dev)                                                                                             | Kubernetes     | Similar — continuous deploy loop                      |
| [DevSpace](https://www.devspace.sh)                                                                                          | Kubernetes     | Similar, with stronger dev-container focus            |
| **[SST](https://sst.dev)**                                                                                                   | AWS serverless | Per-developer stacks as first-class workflow          |
| [AWS SAM Accelerate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-sync.html) | AWS serverless | `sam sync` for fast per-developer iteration           |
| [Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/cli-reference/dev)                            | AWS serverless | `serverless dev` for fast per-developer iteration     |
| [Docker](https://www.docker.com/blog/remocal-minimum-viable-models-ai/)                                                      | Local-first AI | Promotes "Remocal + Minimum Viable Models" for AI dev |

Remocal is also how most mature serverless teams have worked for years, often without calling it that — per-developer
stacks against a shared dev account is the default for teams using CDK, SST, Serverless Framework or SAM at any scale.
