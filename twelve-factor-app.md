---
description: >-
  A methodology for building portable, resilient, cloud-native SaaS
  applications. Language- and platform-agnostic.
---

# Twelve-Factor App

> **The Twelve Factor App**\
> [https://www.12factor.net](https://www.12factor.net/)

### Quick Reference

<table><thead><tr><th width="65.109375">#</th><th width="213.703125">Factor</th><th>Tagline</th></tr></thead><tbody><tr><td>I</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#i-codebase">Codebase</a></td><td>One codebase, many deploys</td></tr><tr><td>II</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#ii-dependencies">Dependencies</a></td><td>Explicitly declare and isolate dependencies</td></tr><tr><td>III</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#iii-config">Config</a></td><td>Store config in the environment</td></tr><tr><td>IV</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#iv-backing-services">Backing Services</a></td><td>Treat backing services as attached resources</td></tr><tr><td>V</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#v-build-release-run">Build, Release, Run</a></td><td>Strictly separate build and run stages</td></tr><tr><td>VI</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#vi-processes">Processes</a></td><td>Execute the app as one or more stateless processes</td></tr><tr><td>VII</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#vii-port-binding">Port Binding</a></td><td>Export services via port binding</td></tr><tr><td>VIII</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#viii-concurrency">Concurrency</a></td><td>Scale out via the process model</td></tr><tr><td>IX</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#ix-disposability">Disposability</a></td><td>Fast startup and graceful shutdown</td></tr><tr><td>X</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#x-devprod-parity">Dev/Prod Parity</a></td><td>Keep environments as similar as possible</td></tr><tr><td>XI</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#xi-logs">Logs</a></td><td>Treat logs as event streams</td></tr><tr><td>XII</td><td><a href="https://claude.ai/chat/a8abcfd1-099f-4e18-84a4-e51224de15ed#xii-admin-processes">Admin Processes</a></td><td>Run admin tasks as one-off processes</td></tr></tbody></table>

***

### I. Codebase

One repo per app. One-to-many relationship: one codebase → many deploys (prod, staging, local).

* Multiple apps sharing code → extract a shared library, don't share a repo
* Multiple codebases in one repo → that's a distributed system, not one app
* One repo can have multiple deployables, if those deployables still build out the same app

```
repo/
└── myapp/          # single codebase
    ├── deploy/prod
    ├── deploy/staging
    └── deploy/dev
```

***

### II. Dependencies

Declare all dependencies explicitly in a manifest. Never rely on implicit system-wide packages.

| Language | Manifest                              | Isolation tool          |
| -------- | ------------------------------------- | ----------------------- |
| Python   | `requirements.txt` / `pyproject.toml` | `venv`, `poetry`        |
| Node.js  | `package.json`                        | `node_modules` (local)  |
| Ruby     | `Gemfile`                             | `bundler`               |
| Go       | `go.mod`                              | module cache            |
| Java     | `pom.xml` / `build.gradle`            | Maven/Gradle local repo |

* System tools your app shells out to (e.g. `curl`, `ImageMagick`) should also be declared — vendored or ensured via a build step
* A clean checkout + dependency install must be sufficient to run the app

***

### III. Config

Everything that varies between deploys (dev, staging, prod) belongs in environment variables — never in code or checked-in config files.

**Fails the test:**

```dotenv
# hardcoded — violates factor III
DB_URL = "postgres://user:pass@prod-db.internal/myapp"
```

**Passes the test:**

```python
import os
DB_URL = os.environ["DATABASE_URL"]
```

* `.env` files are fine locally; use your platform's secret management in production (AWS SSM, Vault, Doppler, etc.)
* Do **not** group config into named environments (`config/production.py`) — this doesn't scale as environments multiply
* Config that doesn't change between deploys (e.g. internal routing constants) can live in code

***

### IV. Backing Services

Treat databases, caches, queues, and external APIs as _attached resources_ — swappable via config with no code changes.

```dotenv
# Both are "databases" to the app — only the URL changes
DATABASE_URL="postgres://localhost/dev"
DATABASE_URL="postgres://user:pass@rds.amazonaws.com/prod"

# Same for third-party services
SMTP_URL="smtp://localhost:1025"          # local mailhog
SMTP_URL="smtp://user:pass@smtp.sendgrid.net:587"
```

Local and third-party services are treated identically. A production DB can be swapped for a replica with no code changes.

***

### V. Build, Release, Run

Strictly separate the three stages:

```
Source code
    │
    ▼
[BUILD]    Compile, fetch deps, build assets → immutable build artifact
    │
    ▼
[RELEASE]  Build artifact + config → versioned, immutable release
    │
    ▼
[RUN]      Execute release in environment (process manager, container runtime)
```

* Releases are **immutable** — never modify a running release; create a new one
* Every release should have a unique ID (timestamp or incrementing number)
* Rollback = activate a previous release

This maps directly to Docker: `docker build` → tag+push → `docker run`.

***

### VI. Processes

The app runs as one or more **stateless, share-nothing** processes.

* Any data that needs to persist must go to a backing service (DB, cache, object store)
* Never assume in-memory state or local disk is available on the next request
* Sticky sessions violate this factor — use a shared session store (Redis, etc.) instead

```python
# Bad: local disk as durable storage
open("/var/data/uploads/file.jpg", "wb").write(data)

# Good: upload to object store
s3.upload_fileobj(data, bucket, key)
```

***

### VII. Port Binding

The app is self-contained and exports HTTP (or other services) by binding to a port — no external web server required.

```bash
# The app binds its own port
uvicorn main:app --host 0.0.0.0 --port $PORT   # Python/FastAPI
node server.js                                  # Node (listens on process.env.PORT)
```

* In production, a routing layer (load balancer, reverse proxy) sits in front and forwards traffic
* This also means one app can become a backing service for another — just point to its URL

***

### VIII. Concurrency

Scale horizontally by adding more processes, not by making processes bigger.

```
web process:    handles HTTP requests     → scale out for traffic
worker process: handles background jobs   → scale out for queue depth
clock process:  handles scheduled tasks   → typically single instance
```

* Design your process types (web, worker, etc.) to be independently scalable
* Avoid writing daemons or PID files — let the process manager (systemd, Docker, ECS) handle lifecycle
* Pairs with Factor VI: stateless processes are trivially horizontally scalable

***

### IX. Disposability

Processes should start fast and shut down gracefully. Treat them as cattle, not pets.

**Startup:** aim for seconds, not minutes. Enables fast scaling and deploys.

**Shutdown (SIGTERM):**

```python
import signal, sys

def handle_sigterm(sig, frame):
    # finish current request, reject new ones
    server.shutdown()
    sys.exit(0)

signal.signal(signal.SIGTERM, handle_sigterm)
```

**For workers:** return in-progress jobs to the queue before exiting so another worker can pick them up.

* Crash-only design: a process that crashes should be safe to restart at any time
* Use idempotent job processing to handle unexpected restarts mid-task

***

### X. Dev/Prod Parity

Minimize the gap between development and production across three dimensions:

| Gap        | Anti-pattern                     | Fix                             |
| ---------- | -------------------------------- | ------------------------------- |
| **Time**   | Deploy once a week               | Deploy frequently (CI/CD)       |
| **People** | Devs write code, ops deploy it   | Devs own deployments            |
| **Tools**  | SQLite locally, Postgres in prod | Same backing service everywhere |

Use Docker Compose or similar to run prod-equivalent services locally:

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16     # same version as prod
  cache:
    image: redis:7
```

Subtle bugs caused by SQLite↔Postgres or memcache↔Redis differences are common and entirely avoidable.

***

### XI. Logs

Treat logs as a continuous stream of time-ordered events. The app itself has no concern for routing or storing them.

```python
# Good: write to stdout, let the environment handle it
import sys
print(json.dumps({"level": "info", "msg": "request received", "path": "/api/users"}), file=sys.stdout)

# Bad: app manages its own log files
logging.FileHandler("/var/log/myapp/app.log")
```

* In development: stream to terminal
* In production: captured by the execution environment (e.g. Docker, ECS) and routed to a log aggregator (CloudWatch, New Relic, etc.)
* Structured JSON logs make querying and alerting much easier

***

### XII. Admin Processes

Run one-off admin tasks (migrations, scripts, console sessions) as isolated processes using the same codebase and config as the app.

```bash
# Django migration — same container image, same env vars
docker run --env-file .env myapp:v42 python manage.py migrate

# Rails console
heroku run rails console --app my-production-app

# One-off data fix script
kubectl exec -it deploy/myapp -- python scripts/backfill_user_ids.py
```

* These should ship in the same release as the app code — not a separate repo or manual procedure
* Never run admin tasks against production via a local checkout with local config

***

### Common Violations Cheat Sheet

| Symptom                                                 | Violated factor                     |
| ------------------------------------------------------- | ----------------------------------- |
| `API_KEY=abc123` committed to git                       | III — Config                        |
| Works on my machine, broken in prod                     | X — Dev/Prod Parity                 |
| Uploaded files vanish after redeploy                    | VI — Processes                      |
| Can't add a second web server instance                  | VI / VIII — Processes / Concurrency |
| DB credentials differ in code vs env                    | III — Config                        |
| App writes logs to `/var/log/app.log`                   | XI — Logs                           |
| `db.sqlite3` used locally, Postgres in prod             | X — Dev/Prod Parity                 |
| Migration steps documented in Confluence, not automated | XII — Admin Processes               |
