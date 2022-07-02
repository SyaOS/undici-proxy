// @ts-nocheck
const autocannon = require("autocannon");
const express = require("express");
const proxy = require("express-http-proxy");
const { createServer } = require("http");
const { promisify } = require("util");
const echo = require("./lib/echo");

/**
 * @typedef {import('net').AddressInfo} AddressInfo
 * @typedef {import('net').Server} Server
 */

module.exports = async function () {
  /** @type {Server} */
  let echoServer;
  /** @type {Server} */
  let proxyServer;
  try {
    echoServer = echo();
    await promisify((callback) => echoServer.listen(callback))();
    const { port: echoPort } = /** @type {import('net').AddressInfo} */ (
      echoServer.address()
    );

    const app = express().use(proxy(`http://localhost:${echoPort}`));
    proxyServer = createServer(app);
    await promisify((callback) => proxyServer.listen(callback))();
    const { port: proxyPort } = /** @type {import('net').AddressInfo} */ (
      proxyServer.address()
    );

    const result = await autocannon({
      url: `http://localhost:${proxyPort}`,
      body: "Hello World!",
    });

    process.stdout.write(
      autocannon.printResult(result, {
        outputStream: process.stdout,
      })
    );
  } finally {
    if (echoServer !== undefined && echoServer.listening) {
      await promisify((callback) => echoServer.close(callback))();
    }
    if (proxyServer !== undefined && proxyServer.listening) {
      await promisify((callback) => proxyServer.close(callback))();
    }
  }
};
