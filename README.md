# undici-proxy

Yet another express proxy middleware based on [undici](https://undici.nodejs.org/).

## Install

    npm install undici-proxy
    # or
    yarn add undici-proxy

## Usage

```JavaScript
import express from 'express'
import proxy from 'undici-proxy'

const app = express()
app.use(proxy('https://httpbin.org'))

app.listen(3000)
// Now you can access https://httpbin.org/ using http://localhost:3000/
```

## Config

The `proxy()` function also accepts an [undici Client](https://undici.nodejs.org/#/docs/api/Client), so you can use it like:

```JavaScript
const express = require('express');
const proxy = require('koa-undici-proxy');
const { Client } = require('undici');

const app = express()
const client = new Client('https://httpbin.org', {
  // I want to proxy big blobs so disable the timeout of receiving body.
  bodyTimeout: 0,
})
app.use(proxy(client))

app.listen(3000)
```

## License

MIT
