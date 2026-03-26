# Terminal One-Liners

A handy page to list useful command-line one-liners!

## Create a MongoDB Object ID, fast!

Requires [node](https://nodejs.org) & either [mongodb](https://npm.im/mongodb) or [mongoose](https://npm.im/mongoose)
to be installed.

```sh
$ node -pe '(m => new m.ObjectId().toString())(require("mongodb"))'

$ node -pe 'new require("mongoose").Types.ObjectId().toString()'
```

This one is useful for tests - especially when you want to create fixtures that only exist for a specific test & don't
clash with others!

## UUID-v4 string

```sh
$ node -pe 'require("crypto").randomUUID()'
42cf5246-11c8-4887-8679-1ea7a4848ca4

$ curl -L uuid.dev
cedfa1db-161b-4413-b34e-93cc12a115e3
```

Take care using curl & always be wary about what information you may be (accidentally/implicitly) sharing with 3rd-party
sites/services (IP address, user agent, regional headers etc.)

## Need a random string?

Imagine a string of length X (where X % 2 === 0), divide the length by 2 & drop it into randomBytes:

```sh
$ node -pe 'require("crypto").randomBytes(8).toString("hex")'
5ee680f67127d14 # Length: 16

$ node -pe 'require("crypto").randomBytes(16).toString("hex")'
4d2a520d862f5eecb6334c5be747baf1 # Length: 32

$ node -pe 'require("crypto").randomBytes(3).toString("hex")'
c743a1 # Length: 6
```

## Need a quick MD5 hash?

Pipe either the randomUUID or randomBytes commands into md5:

```sh
$ node -pe 'require("crypto").randomUUID()' | md5
0e0cb2154b71faaa1f68cb9b3f0f5641

$ node -pe 'require("crypto").randomBytes(11).toString("hex")' | md5
b40f737d54a43cec08d3013f367fbdf2
```

## Fire an AWS Lambda function by hand

Requires the function to support non-standard AWS events, unless you want to build an entire API-Gateway payload by hand
each time!

```sh
$ aws lambda invoke \
  --function-name ${FUNCTION NAME} \
  --payload '{ ... }' /dev/stdout

$ aws lambda invoke --function-name send-outbound-webhook --payload '{"method": "POST","url": "https://outbound.someimportantcompany.com/path/to/endpoint","body": {"hello": "world"}}' /dev/stdout
```

Will require you to set raw-in-base64-out in
[your AWS CLI config](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-options.html).
