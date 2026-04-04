# Docker Cheatsheet

<LinkBlock
  title="Docker reference documentation"
  href="https://docs.docker.com/reference/"
  icon="docker" variant="blue" />

## Building Images

```dockerfile
# Dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "src/index.js"]
```

```bash
# Build an image tagged "myapp:latest"
docker build -t myapp:latest .

# Build with a specific Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build with build arguments
docker build --build-arg NODE_ENV=production -t myapp:latest .
```

Use a `.dockerignore` file to keep images small — at minimum exclude `node_modules`, `.git`, and any local config:

```
.git/
node_modules/

*.log
.env
.envrc
```

### Multi-Stage Builds

Use multi-stage builds to keep production images lean — install dev dependencies in one stage, copy only what you need
into the final image:

```dockerfile
# Build stage
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
```

## Running Containers

```bash
# Run a container in the foreground
docker run myapp:latest

# Run in the background (detached)
docker run -d --name myapp myapp:latest

# Run with port mapping (host:container)
docker run -p 3000:3000 myapp:latest

# Run interactively with a shell
docker run -it myapp:latest sh

# Run a one-off command
docker run --rm myapp:latest node -e "console.log(process.version)"
```

| Flag                     | Description                                         |
| ------------------------ | --------------------------------------------------- |
| **`-d`**                 | **Run in detached (background) mode**               |
| **`-p 3000:3000`**       | **Map host port to container port**                 |
| **`--rm`**               | **Remove the container when it exits**              |
| **`--name`**             | **Assign a name to the container**                  |
| `-it`                    | Interactive mode with a TTY (useful for shells)     |
| `-v /host:/container`    | Bind mount a host directory into the container      |
| `--platform linux/amd64` | Force a specific platform (useful on Apple Silicon) |

### Running Node.js Scripts

Run a standalone script without building a full image:

```bash
# Run a script from the current directory
docker run --rm -v $PWD:/workspace -w /workspace node:24 node script.js

# Run with npm
docker run --rm -v $PWD:/workspace -w /workspace node:24 npm run dev

# Run an interactive Node REPL
docker run --rm -it node:24 node
```

For repeated use, define a service in `docker-compose.yml` instead of typing long `docker run` commands.

## Environment Variables

### Inline

```bash
# Single variable
docker run -e NODE_ENV=production myapp:latest

# Multiple variables
docker run -e NODE_ENV=production -e LOG_LEVEL=info myapp:latest
```

### From a File

```bash
# Load variables from a file
docker run --env-file .env myapp:latest
```

The env file is a plain list of `KEY=VALUE` pairs, one per line — no `export`, no quotes needed:

```bash
# .env
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=postgres://localhost:5432/mydb
```

### In Compose

```yaml
# docker-compose.yml
services:
  app:
    image: myapp:latest
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    env_file:
      - .env
```

## Tagging & Pushing

```bash
# Tag an existing image with an additional tag
docker tag myapp:latest registry.example.com/myapp:latest
docker tag myapp:latest registry.example.com/myapp:1.2.3

# Push all tags individually
docker push registry.example.com/myapp:latest
docker push registry.example.com/myapp:1.2.3
```

### Pushing Multiple Tags at Build Time

Use `docker buildx` to build and push multiple tags in a single command:

```bash
docker buildx build \
  --platform linux/amd64 \
  -t registry.example.com/myapp:latest \
  -t registry.example.com/myapp:1.2.3 \
  --push .
```

### Tagging Strategy

A common approach is to tag every image with the Git SHA and conditionally tag with `latest` or a version number:

```bash
GIT_SHA=$(git rev-parse --short HEAD)
docker tag myapp:latest registry.example.com/myapp:$GIT_SHA
docker tag myapp:latest registry.example.com/myapp:latest
```

## Colima (macOS)

[Colima](https://github.com/abiosoft/colima) is a lightweight alternative to Docker Desktop on macOS. It runs a Linux VM
under the hood and exposes the Docker socket so that the standard `docker` CLI works as normal.

```bash
# Install via Homebrew
brew install colima docker

# Start Colima with default settings
colima start

# Start with custom resources
colima start --cpu 4 --memory 8 --disk 60

# Stop the VM
colima stop

# Check status
colima status
```

After `colima start`, the `docker` CLI works exactly as it would with Docker Desktop — no changes to your workflow or
scripts.

### Apple Silicon

If you need to build or run `linux/amd64` images on an Apple Silicon Mac, enable Rosetta emulation:

```bash
colima start --arch aarch64 --vm-type vz --vz-rosetta
```

Or specify the platform per-command:

```bash
docker run --platform linux/amd64 myapp:latest
```

## Useful Commands

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Follow container logs
docker logs -f <container>

# Execute a command in a running container
docker exec -it <container> sh

# Remove stopped containers, unused images, and build cache
docker system prune -a
```
