# AWS CLI One-Liners

<LinkBlock
  href="https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html"
  icon="aws"
  title="AWS CLI v2 Docs"/>

<LinkBlock
  href="https://awscli.amazonaws.com/v2/documentation/api/latest/index.html"
  icon="aws"
  title="AWS CLI Command Reference"/>

## Setup

```bash
# Configure a named profile
aws configure --profile myprofile

# Use a named profile for any command
aws s3 ls --profile myprofile

# Override region for a single command
aws ec2 describe-instances --region eu-west-1

# Check which identity you're authenticated as
aws sts get-caller-identity
```

### Useful environment variables

| Variable                | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `AWS_PROFILE`           | Default named profile to use                         |
| `AWS_REGION`            | Override region without `--region` flag              |
| `AWS_ACCESS_KEY_ID`     | Static credentials (prefer IAM roles where possible) |
| `AWS_SECRET_ACCESS_KEY` | Static credentials (prefer IAM roles where possible) |

## S3

```bash
# List all buckets
aws s3 ls

# List objects in a bucket
aws s3 ls s3://my-bucket --recursive --human-readable

# Copy a file up
aws s3 cp ./file.txt s3://my-bucket/file.txt

# Copy a file down
aws s3 cp s3://my-bucket/file.txt ./file.txt

# Sync a local folder to S3 (--delete removes files no longer in source)
aws s3 sync ./dist s3://my-bucket/dist --delete

# Copy all objects between buckets
aws s3 cp s3://source-bucket s3://dest-bucket --recursive

# Presign a URL for temporary access (expires in 1 hour)
aws s3 presign s3://my-bucket/file.txt --expires-in 3600

# Remove an object
aws s3 rm s3://my-bucket/file.txt

# Remove all objects with a prefix
aws s3 rm s3://my-bucket/prefix/ --recursive
```

## SSM (Session Manager)

> Skip SSH entirely — no open ports, no key management required.

```bash
# Start an interactive shell session on an instance
aws ssm start-session --target i-0abc123def456

# Run a remote command without opening a shell
aws ssm send-command \
  --instance-ids i-0abc123def456 \
  --document-name AWS-RunShellScript \
  --parameters '{"commands":["whoami"]}' \
  --query 'Command.CommandId' \
  --output text

# Get the output of a send-command run
aws ssm get-command-invocation \
  --command-id <command-id> \
  --instance-id i-0abc123def456 \
  --query 'StandardOutputContent' \
  --output text
```

## CloudWatch Logs

```bash
# Tail a log group in real time
aws logs tail /aws/lambda/my-function --follow

# Tail with timestamps
aws logs tail /aws/lambda/my-function --follow --format short

# Filter logs by pattern
aws logs tail /aws/lambda/my-function --filter-pattern "ERROR"

# List all log groups
aws logs describe-log-groups --query 'logGroups[].[logGroupName]' --output text

# Delete a log group
aws logs delete-log-group --log-group-name /aws/lambda/old-function
```

## Lambda

```bash
# List all functions
aws lambda list-functions --query 'Functions[].[FunctionName,Runtime,LastModified]' --output table

# Invoke a function synchronously and print the response
aws lambda invoke \
  --function-name my-function \
  --payload '{"key":"value"}' \
  --cli-binary-format raw-in-base64-out \
  response.json && cat response.json

# Update function code from a zip
aws lambda update-function-code \
  --function-name my-function \
  --zip-file fileb://function.zip

# Get the current environment variables
aws lambda get-function-configuration \
  --function-name my-function \
  --query 'Environment.Variables'
```

## Secrets Manager

```bash
# List all secrets
aws secretsmanager list-secrets --query 'SecretList[].[Name,LastChangedDate]' --output table

# Fetch a secret value (plain string)
aws secretsmanager get-secret-value \
  --secret-id my/secret \
  --query SecretString \
  --output text

# Fetch a JSON secret and extract a single key (requires jq)
aws secretsmanager get-secret-value \
  --secret-id my/secret \
  --query SecretString \
  --output text | jq -r '.password'

# Create a new secret
aws secretsmanager create-secret \
  --name my/secret \
  --secret-string '{"username":"admin","password":"hunter2"}'

# Update an existing secret
aws secretsmanager put-secret-value \
  --secret-id my/secret \
  --secret-string '{"username":"admin","password":"correct-horse-battery-staple"}'
```

## ECR (Elastic Container Registry)

```bash
# Authenticate Docker to your ECR registry
aws ecr get-login-password \
  | docker login --username AWS --password-stdin \
    $(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com

# List repositories
aws ecr describe-repositories --query 'repositories[].[repositoryName,repositoryUri]' --output table

# List images in a repository
aws ecr list-images --repository-name my-repo --query 'imageIds[].[imageTag]' --output text

# Delete an image by tag
aws ecr batch-delete-image \
  --repository-name my-repo \
  --image-ids imageTag=old-tag
```

## IAM

```bash
# List all IAM users
aws iam list-users --query 'Users[].[UserName,CreateDate]' --output table

# Show policies attached to a user
aws iam list-attached-user-policies --user-name jsmith

# List all roles
aws iam list-roles --query 'Roles[].[RoleName,Arn]' --output table

# Get the trust policy for a role
aws iam get-role --role-name my-role --query 'Role.AssumeRolePolicyDocument'

# Assume a role and export credentials to your shell
eval $(aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/my-role \
  --role-session-name my-session \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text \
  | awk '{print "export AWS_ACCESS_KEY_ID="$1"\nexport AWS_SECRET_ACCESS_KEY="$2"\nexport AWS_SESSION_TOKEN="$3}')
```

## `--query` cheatsheet

AWS CLI uses [JMESPath](https://jmespath.org/) for `--query`. These patterns cover most use cases:

| Pattern                 | Example                                         |
| ----------------------- | ----------------------------------------------- |
| **Get a field**         | `--query 'Instances[0].InstanceId'`             |
| **Get multiple fields** | `--query 'Instances[].[InstanceId,State.Name]'` |
| **Filter by value**     | `--query 'Instances[?State.Name==\`running\`]'` |
| **Get a tag by key**    | `--query 'Tags[?Key==\`Name\`].Value\|[0]'`     |
| **Flatten nested list** | `--query 'Reservations[].Instances[]'`          |

Pair with `--output text` for shell scripting, `--output table` for readability, `--output json` for piping into `jq`.
