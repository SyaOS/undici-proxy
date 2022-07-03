# undici-proxy

[![Node.js CI](https://github.com/SyaOS/undici-proxy/actions/workflows/ci.yaml/badge.svg)](https://github.com/SyaOS/undici-proxy/actions/workflows/ci.yaml)

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

The `proxy()` function also accepts an [undici Pool](https://undici.nodejs.org/#/docs/api/Pool), so you can use it like:

```JavaScript
const express = require('express');
const proxy = require('koa-undici-proxy');
const { Pool } = require('undici');

const app = express()
const pool = new Pool('https://httpbin.org', {
  // I want to proxy big blobs so disable the timeout of receiving body.
  bodyTimeout: 0,
})
app.use(proxy(pool))

app.listen(3000)
```

## License

MIT
