const { after, before, describe, it } = require("mocha");
const should = require("should");
const { request } = require("undici");
const { promisify } = require("util");

const echo = require("./lib/echo");
const proxy = require("..");

/**
 * @typedef {import('net').AddressInfo} AddressInfo
 * @typedef {import('net').Server} Server
 */

describe("undici-proxy", function () {
  this.timeout(10000);

  /** @type {Server} */
  let echoServer;
  /** @type {Server} */
  let proxyServer;
  /** @type {AddressInfo} */
  let proxyAddress;

  before(async function () {
    await promisify((callback) => (echoServer = echo().listen(callback)))();
    const echoAddress = /** @type {AddressInfo} */ (echoServer.address());

    await promisify(
      (callback) =>
        (proxyServer = proxy(`http://localhost:${echoAddress.port}`).listen(
          callback
        ))
    )();
    proxyAddress = /** @type {AddressInfo} */ (proxyServer.address());
  });

  after(async function () {
    if (echoServer !== undefined && echoServer.listening) {
      await promisify((/** @type {(err?: Error) => void} */ callback) =>
        echoServer.close(callback)
      )();
    }
    if (proxyServer !== undefined && proxyServer.listening) {
      await promisify((/** @type {(err?: Error) => void} */ callback) =>
        proxyServer.close(callback)
      )();
    }
  });

  describe("proxy request", function () {
    it("should pass request method", async function () {
      const { body } = await request(`http://localhost:${proxyAddress.port}/`, {
        method: "PUT",
      });
      await should(body.json()).eventually.match({ method: "PUT" });
    });

    it("should pass request url", async function () {
      const { body } = await request(
        `http://localhost:${proxyAddress.port}/foobar`
      );
      await should(body.json()).eventually.match({ url: "/foobar" });
    });

    it("should pass request header", async function () {
      const { body } = await request(`http://localhost:${proxyAddress.port}/`, {
        headers: {
          "x-foo": "bar",
        },
      });
      await should(body.json()).eventually.match({
        headers: { "x-foo": "bar" },
      });
    });

    it("should pass request body", async function () {
      const { body } = await request(`http://localhost:${proxyAddress.port}/`, {
        body: "foobar",
      });
      await should(body.json()).eventually.match({
        body: "foobar",
      });
    });
  });

  describe("proxy response", function () {
    it("should pass response status", async function () {
      const { statusCode } = await request(
        `http://localhost:${proxyAddress.port}`,
        {
          body: "statusCode=204",
        }
      );
      should(statusCode).eql(204);
    });

    it("should pass response header", async function () {
      const { headers } = await request(
        `http://localhost:${proxyAddress.port}`,
        {
          body: "header=x-foo:bar",
        }
      );
      should(headers).match({ "x-foo": "bar" });
    });
  });

  describe("proxy error", function () {
    it("should return 502 when response closed", async function () {
      const { statusCode } = await request(
        `http://localhost:${proxyAddress.port}`,
        {
          body: "destroy=1",
        }
      );
      should(statusCode).match(502);
    });
  });
});
