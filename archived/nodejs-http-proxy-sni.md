# NodeJS - HTTP Proxy (SNI)

NodeJS HTTPS server to handle SaaS levels of traffic, managing HTTPS certs & proxying to your application.

```js
const fs = require('fs');
const path = require('path');
const proxy = require('http-proxy');

const server = proxy.createProxyServer({
  target: 'https://backend-services-prod-772187446.eu-west-2.elb.amazonaws.com',
  secure: false,
  ssl: {
    // Certs need to cover the domains in question
    key: fs.readFileSync(path.resolve(__dirname, './server.key')),
    cert: fs.readFileSync(path.resolve(__dirname, './server.cert')),
    SNICallback(domain, callback) {
      console.log(domain);
      // localhost
      // jdrydn.com
      // api.dev.jdrydn.com
      // api.dev.jdrydn.someimportantcompany.com
      callback();
    },
  },
});

/* istanbul ignore next */
if (!module.parent) {
  if (process.env.NODE_ENV === 'production') {
    process.on('uncaughtException', (err) => {
      logger.fatal(err);
      process.kill(process.pid);
    });
  }

  // Start the HTTP server!
  server.listen(process.env.HTTP_PORT || 8088, process.env.HTTP_HOST || 'localhost');
  console.log(`Server listening on http://${process.env.HTTP_HOST || 'localhost'}:${process.env.HTTP_PORT || 8088}`);
}
```

When testing:

```bash
curl -k -I \
  --resolve wiki.jdrydn.com:80:127.0.0.1 \
  --resolve wiki.jdrydn.com:443:127.0.0.1 \
  https://wiki.jdrydn.com
```
