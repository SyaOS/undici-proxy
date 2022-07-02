const { text } = require("body-parser");
const express = require("express");
const { constant } = require("lodash");

function echo() {
  const echo = express();
  echo.use(text({ type: constant(true) }));
  echo.use(function (req, res) {
    const body = new URLSearchParams(req.body);
    (function (destroy) {
      if (destroy === null) return;
      res.destroy();
    })(body.get("destroy"));
    (function (statusCode) {
      if (statusCode === null) return;
      res.statusCode = Number(statusCode);
    })(body.get("statusCode"));
    (function (header) {
      if (header === null) return;
      const [key, value] = header.split(":");
      if (value === undefined) return;
      res.setHeader(key, value);
    })(body.get("header"));
    res.json({
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    });
  });
  return echo;
}

module.exports = echo;
