# NodeJS - Cluster

```js
if (require('cluster').isMaster) {
  const cluster = require('cluster');
  const CPU = require('os').cpus();

  const LIMIT = process.env.LIMIT || CPU.length;
  const start = Date.now();

  // Generate a list of MAX numbers to loop through
  const LIST = new Array(parseInt(process.env.MAX || 10, 10)).fill(null).map((v, k) => k + 1);

  // Fork a new worker
  function createWorker() {
    const nextItem = LIST.shift();
    if (nextItem) {
      const worker = cluster.fork();
      // worker.on('message', message => console.log(`Worker ${worker.process.pid}: ${message}`));
      worker.send(`${nextItem}`);
    }
  }

  // Initialise LIMIT workers
  for (let i = 0; i < LIMIT; i++) {
    createWorker();
  }

  // After each worker, spawn a new one if required
  cluster.on('exit', (worker) => {
    // console.log(`Worker ${worker.process.pid} died`);
    createWorker();

    if (!LIST.length) {
      console.log(`Took: ${Math.ceil((Date.now() - start) / 1000)}s`);
    }
  });
} else {
  // console.log(`Worker ${process.pid} started`);

  process.on('message', (nextItem) => {
    console.log(`Worker ${process.pid}: ${nextItem}`);
    process.send(`${nextItem}`);
    process.exit();
  });
}
```
