# Terminal One-Liners

A handy page to list useful command-line one-liners!

<svg height="50px" width="50px" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 5.359v13.282A5.36 5.36 0 0 1 18.641 24H5.359A5.36 5.36 0 0 1 0 18.641V5.359A5.36 5.36 0 0 1 5.359 0h13.282A5.36 5.36 0 0 1 24 5.359m-.932-.233A4.196 4.196 0 0 0 18.874.932H5.126A4.196 4.196 0 0 0 .932 5.126v13.748a4.196 4.196 0 0 0 4.194 4.194h13.748a4.196 4.196 0 0 0 4.194-4.194zm-.816.233v13.282a3.613 3.613 0 0 1-3.611 3.611H5.359a3.613 3.613 0 0 1-3.611-3.611V5.359a3.613 3.613 0 0 1 3.611-3.611h13.282a3.613 3.613 0 0 1 3.611 3.611M8.854 4.194v6.495h.962V4.194zM5.483 9.493v1.085h.597V9.48q.283-.037.508-.133.373-.165.575-.448.208-.284.208-.649a.9.9 0 0 0-.171-.568 1.4 1.4 0 0 0-.426-.388 3 3 0 0 0-.544-.261 32 32 0 0 0-.545-.209 1.8 1.8 0 0 1-.426-.216q-.164-.12-.164-.284 0-.223.179-.351.18-.126.485-.127.344 0 .575.105.239.105.5.298l.433-.5a2.3 2.3 0 0 0-.605-.433 1.6 1.6 0 0 0-.582-.159v-.968h-.597v.978a2 2 0 0 0-.477.127 1.2 1.2 0 0 0-.545.411q-.194.268-.194.634 0 .335.164.56.164.224.418.38a4 4 0 0 0 .552.262q.291.104.545.209.261.104.425.238a.39.39 0 0 1 .165.321q0 .225-.187.359-.18.134-.537.134-.381 0-.717-.134a4.4 4.4 0 0 1-.649-.351l-.388.589q.209.173.477.306.276.135.575.217.191.046.373.064"/><!-- https://simpleicons.org/?q=iterm2 --></svg>

## Create a MongoDB Object ID, fast!

Requires [node](https://nodejs.org) & either [mongodb](https://npm.im/mongodb) or [mongoose](https://npm.im/mongoose) to
be installed.

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
