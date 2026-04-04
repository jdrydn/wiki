# Ephemeral Environments

Short-lived, isolated deployments of your application - one per developer, one per PR - running side-by-side in the same
cloud account. Build against the real cloud instead of mocking it.

<LinkBlock
  title="Ephemeral Developer Deployments"
  description="For the past year, various teams across BPP Product & Technology have been using ephemeral developer deployments for some applications & services, so now it’s time to pull back the curtain a little & share how we’ve used AWS to build a high-performing team dynamic in the cloud."
  href="https://medium.com/bpp-technology/ephemeral-developer-deployments-98657e48e36f"
  icon="medium" />

## Why bother

The pitch is simple: every developer gets their own deployed instance of the application, named distinctly, running
independently. No "it works on my machine", no environment congestion, no waiting for a shared Dev/QA environment to
free up.

Once you have ephemeral support wired in, you also get it for CI/CD - spin up a deployment per PR, run integration tests
against it, tear it down when the PR closes.

## Two approaches to isolation

| Approach              | How it works                                                                                | Trade-offs                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Account-level**     | Each developer gets their own cloud provider account                                        | Full isolation, but heavy to manage - onboarding, billing alerts, permissions, dependency deployments, offboarding |
| **Application-level** | One shared account (e.g. "Dev"), each deployment uses a unique identifier in resource names | Lighter to manage, shared dependencies "just work", but requires naming discipline in your IaC                     |

Account-level isolation sounds clean on paper, but the operational overhead scales badly. Every developer has to deploy
and maintain their own copies of every dependency. Pair programming and shared debugging become awkward. Offboarding
means sunsetting an entire account and hoping nothing critical was buried in it.

**Application-level isolation is almost always the better choice.** The same naming convention that isolates developer
deployments can be reused for CI/CD parallelism, design reviews, QA, and stakeholder demos.

## The ephemeral ID

The core mechanism is a short string identifier (7–8 characters works well) that gets threaded through your entire stack
to enforce uniqueness.

```
corp-app-{ephemeral-id}-api
corp-app-{ephemeral-id}-worker
corp-app-{ephemeral-id}-storage
```

Key rules:

- **Make it optional.** Stable deployments (prod, staging) don't set it. Ephemeral deployments must.
- **Pass it everywhere.** Top-level IaC parameter/variable, all the way down to individual resource names - functions,
  databases, buckets, queues, etc.
- **Keep it short.** Some cloud resources have name length limits. A long identifier will cause unexpected failures like
  `Resource name must be less than 20 characters`.
- **Track ownership.** Maintain a simple map of people to ephemeral IDs (a shared doc or wiki page is enough) to avoid
  collisions.

Typically:

- PRs are easy, `pr-{num}` works nicely, even PRs with in the thousands sits nicely in the 7-8 characters (e.g. `pr-23`,
  `pr-1024`, `pr-23958`)
- For developers, a list in a shared wiki (e.g. Confluence) to documents everyone's unique ephemeral IDs - **there can
  be no clashes here!**

## Where to thread the ID

**tl;dr:** Everywhere.

### Resource names

Every named resource should include the ephemeral ID so you can identify ownership at a glance. For resources that don't
support names (e.g. AWS CloudFront distributions), use tags instead.

### Routing

Get the ephemeral ID into the URL. Hostnames work well with wildcard DNS and SSL certificates:

```
https://app-{ephemeral-id}.dev.example.com/api/v1/users
```

Path-based routing is also an option depending on your gateway setup.

### Event buses

If you're sharing an event bus across deployments, include the ephemeral ID in the event source. Each deployment then
filters to only consume events intended for it, ignoring events from stable or other ephemeral instances.

### Stack / state management

Filter your IaC stacks (CloudFormation stacks, Terraform workspaces, Pulumi stacks) by ephemeral ID to manage entire
deployments as a unit rather than picking through individual resources.

## Shared dependencies

This is where application-level isolation really shines. Your CI/CD pipeline deploys a "stable" version of each service
to the Dev account. Individual ephemeral deployments then consume those shared dependencies directly.

**Example:** your application depends on an auth service, a file storage service, and a messaging service - each managed
by a different team. With application-level isolation, you deploy only your application. The three dependencies are
already running as stable deployments in the Dev account. When those teams push updates, your ephemeral deployment
builds against their latest changes automatically.

With account-level isolation, you'd deploy copies of all three dependencies into your own account, probably forget to
update them, and potentially hit bugs from version drift.

## Using ephemeral IDs in CI/CD

The same isolation mechanism works for pipeline parallelism. Use a consistent ephemeral ID per pipeline run - a PR
number is ideal:

```
corp-app-pr-142-api
```

This gives you:

- **Integration tests against real infrastructure** - deploy the PR, run tests, tear down
- **Shareable preview URLs** - hand the link to designers, QA, or stakeholders for review before merge
- **No pipeline congestion** - multiple PRs can deploy and test in parallel without stepping on each other

## Downsides to plan for

- **Developer experience** - If your team isn't used to this workflow, invest time in documentation and tooling. The
  upfront cost pays off as the team and service count grows.
- **Costs** - Truly serverless stacks (Lambda, API Gateway, DynamoDB on-demand) cost almost nothing when idle. For
  long-lived resources (EC2, RDS, etc.), use smaller instance sizes for ephemeral deployments.
- **Cleanup** - When someone leaves or finishes a feature, their resources need tearing down. Removing named resources
  from a shared account is faster than sunsetting an entire account. Consider automating cleanup with TTLs or scheduled
  sweeps.

## Considerations

- **Split your stacks into "base" and "service".** The base stack holds long-lived, slow-changing, expensive resources
  (e.g. RDS instances, Lambda security groups, VPCs) that are shared across ephemeral deployments. The service stack
  holds the short-lived, ever-changing resources that get created and destroyed with each ephemeral ID. You can freely
  move resources between the two stacks as your understanding of what belongs where evolves.

## Benefits

- **Cloud-native workflow** - build and test against real cloud services, not mocks or emulators
- **Cross-service debugging** - deploy two services with the same ephemeral ID to reproduce and fix integration bugs
- **Faster integration testing** - run Playwright, Selenium, or API tests against a real deployment
- **No mocking layer required** - tools like LocalStack become unnecessary when you can deploy to the real thing
- **Fewer production surprises** - bugs related to cloud resource behaviour get caught early
