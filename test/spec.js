const { text } = require("body-parser");
const express = require("express");
const should = require("should");
const { Pool } = require("undici");
const proxy = require("..");
const { useApp, useClient } = require("./helpers");

describe("basic functionality", function () {
  describe("proxy request", function () {
    it("should pass request method", async function () {
      const app = express().use(function (req, res) {
        should(req.method).equal("PATCH");
        res.end();
      });
      await useApp(app, async function (url) {
        const app = express().use(proxy(new Pool(url, { pipelining: 0 })));
        await useApp(app, async function (url) {
          await useClient(url, async function (client) {
            await client.request({
              method: "PATCH",
              path: "/",
              throwOnError: true,
            });
          });
        });
      });
    });

    it("should pass request url", async function () {
      const app = express().use(function (req, res) {
        should(req.url).equal("/foobar");
        res.end();
      });
      await useApp(app, async function (url) {
        const app = express().use(proxy(new Pool(url, { pipelining: 0 })));
        await useApp(app, async function (url) {
          await useClient(url, async function (client) {
            await client.request({
              method: "GET",
              path: "/foobar",
              throwOnError: true,
            });
          });
        });
      });
    });

    it("should pass request header", async function () {
      const app = express().use(function (req, res) {
        should(req.get("x-foo")).equal("bar");
        res.end();
      });
      await useApp(app, async function (url) {
        const app = express().use(proxy(new Pool(url, { pipelining: 0 })));
        await useApp(app, async function (url) {
          await useClient(url, async function (client) {
            await client.request({
              method: "GET",
              path: "/",
              headers: {
                "x-foo": "bar",
              },
              throwOnError: true,
            });
          });
        });
      });
    });

    it("should pass request body", async function () {
      const app = express().use(text(), function (req, res) {
        should(req.body).equal("foobar");
        res.end();
      });
      await useApp(app, async function (url) {
        const app = express().use(proxy(new Pool(url, { pipelining: 0 })));
        await useApp(app, async function (url) {
          await useClient(url, async function (client) {
            await client.request({
              method: "GET",
              path: "/",
              headers: {
                "content-type": "text/plain",
              },
              body: "foobar",
              throwOnError: true,
            });
          });
        });
      });
    });
  });

  describe("proxy response", function () {
    it("should pass response status", async function () {
      const app = express().use(function (req, res) {
        res.status(204).end();
      });
      await useApp(app, async function (url) {
        const app = express().use(proxy(new Pool(url, { pipelining: 0 })));
        await useApp(app, async function (url) {
          await useClient(url, async function (client) {
            const { statusCode } = await client.request({
              method: "GET",
              path: "/",
              throwOnError: true,
            });
            should(statusCode).equal(204);
          });
        });
      });
    });

    it("should pass response header", async function () {
      const app = express().use(function (req, res) {
        res.set("x-foo", "bar").end();
      });
      await useApp(app, async function (url) {
        const app = express().use(proxy(new Pool(url, { pipelining: 0 })));
        await useApp(app, async function (url) {
          await useClient(url, async function (client) {
            const { headers } = await client.request({
              method: "GET",
              path: "/",
              throwOnError: true,
            });
            should(headers).match({ "x-foo": "bar" });
          });
        });
      });
    });

    it("should pass response body", async function () {
      const app = express().use(function (req, res) {
        res.end("foobar");
      });
      await useApp(app, async function (url) {
        const app = express().use(proxy(new Pool(url, { pipelining: 0 })));
        await useApp(app, async function (url) {
          await useClient(url, async function (client) {
            const { body } = await client.request({
              method: "GET",
              path: "/",
              throwOnError: true,
            });
            await should(body.text()).eventually.equal("foobar");
          });
        });
      });
    });
  });

  describe("proxy error", function () {
    it("should return 502 when request destroyed", async function () {
      const app = express().use(function (req, res) {
        req.destroy();
      });
      await useApp(app, async function (url) {
        const app = express().use(proxy(new Pool(url, { pipelining: 0 })));
        await useApp(app, async function (url) {
          await useClient(url, async function (client) {
            const { statusCode } = await client.request({
              method: "GET",
              path: "/",
            });
            should(statusCode).equal(502);
          });
        });
      });
    });

    it("should return 502 when response destroyed", async function () {
      const app = express().use(function (req, res) {
        res.destroy();
      });
      await useApp(app, async function (url) {
        const app = express().use(proxy(new Pool(url, { pipelining: 0 })));
        await useApp(app, async function (url) {
          await useClient(url, async function (client) {
            const { statusCode } = await client.request({
              method: "GET",
              path: "/",
            });
            should(statusCode).equal(502);
          });
        });
      });
    });
  });
});
