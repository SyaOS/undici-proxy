const { after, before, describe, it } = require("mocha");
const should = require("should");
const { request, MockAgent, MockPool } = require("undici");
const { promisify } = require("util");

const proxy = require("..");

/**
 * @typedef {import('net').AddressInfo} AddressInfo
 * @typedef {import('net').Server} Server
 * @typedef {import('stream').Readable} Readable
 */

describe("undici-proxy", function () {
  /** @type {MockPool} */
  let pool;
  /** @type {Server} */
  let server;
  /** @type {number} */
  let port;

  before(async function () {
    pool = new MockPool(`http://undici-proxy/`, { agent: new MockAgent() });
    server = await promisify((callback) => {
      const server = proxy(pool).listen(() => callback(null, server));
    })();
    port = /** @type {AddressInfo} */ (server.address()).port;
  });

  after(async function () {
    if (pool && !pool.closed) pool.close();
    if (server && server.listening) {
      server.close();
    }
  });

  describe("proxy request", function () {
    it("should pass request method", async function () {
      pool.intercept({ method: "PUT", path: "/" }).reply(202, "");
      const { statusCode } = await request(`http://localhost:${port}/`, {
        method: "PUT",
      });
      should(statusCode).eql(202);
    });

    it("should pass request url", async function () {
      pool.intercept({ path: "/foobar" }).reply(202, "");
      const { statusCode } = await request(`http://localhost:${port}/foobar`);
      should(statusCode).eql(202);
    });

    it("should pass request header", async function () {
      pool.intercept({ path: "/", headers: { "x-foo": "bar" } }).reply(202, "");
      const { statusCode } = await request(`http://localhost:${port}/`, {
        headers: {
          "x-foo": "bar",
        },
      });
      should(statusCode).eql(202);
    });

    it("should pass request body");
  });

  describe("proxy response", function () {
    it("should pass response status", async function () {
      pool.intercept({ path: "/" }).reply(204, "");
      const { statusCode } = await request(`http://localhost:${port}/`);
      should(statusCode).eql(204);
    });

    it("should pass response header", async function () {
      pool.intercept({ path: "/" }).reply(204, "", {
        headers: { "x-foo": "bar" },
      });
      const { headers } = await request(`http://localhost:${port}/`);
      should(headers).match({ "x-foo": "bar" });
    });

    it("should pass response body", async function () {
      pool.intercept({ path: "/" }).reply(200, "foobar");
      const { body } = await request(`http://localhost:${port}/`);
      await should(body.text()).eventually.eql("foobar");
    });
  });

  describe("proxy error", function () {
    it("should return 502 when response closed", async function () {
      pool.intercept({ path: "/" }).replyWithError(Error("failed"));
      const { statusCode } = await request(`http://localhost:${port}/`);
      should(statusCode).match(502);
    });
  });
});
