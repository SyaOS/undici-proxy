const express = require("express");
const { assign, omit } = require("lodash");
const { Pool } = require("undici");

const HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

/**
 * @param {string | URL | Pool} url
 */
function proxy(url) {
  const pool = url instanceof Pool ? url : new Pool(url);

  /** @type {express.RequestHandler} */
  function listener(req, res, next) {
    pool.stream(
      {
        method: /** @type {import("undici").Dispatcher.HttpMethod} */ (
          req.method
        ),
        path: req.url,
        headers: omit(req.headers, "host", ...HOP_BY_HOP_HEADERS),
        body: req,
        opaque: res,
      },
      function ({ statusCode, headers, opaque }) {
        const res = /** @type {import("express").Response} */ (opaque);
        return res.writeHead(statusCode, omit(headers, ...HOP_BY_HOP_HEADERS));
      },
      function (err, { opaque, trailers }) {
        if (err) return next(assign(err, { statusCode: 502 }));
        const res = /** @type {import("express").Response} */ (opaque);
        res.addTrailers(trailers);
      }
    );
  }

  /** @type {express.Application["listen"]} */
  function listen(
    /** @type {Parameters<express.Application["listen"]>} */ ...args
  ) {
    return express()
      .use(listener)
      .listen(...args);
  }

  return assign(listener, { listen });
}

module.exports = proxy;
