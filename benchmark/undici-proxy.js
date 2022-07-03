const express = require("express");
const { createServer } = require("http");
const proxy = require("..");

const bench = require("./lib/bench");
const echo = require("./lib/echo");
const run = require("./lib/run");

async function main() {
  await run(echo(), async ({ port }) => {
    console.log("# undici-proxy");
    const app = express().use(proxy(`http://localhost:${port}/`));
    await run(createServer(app), bench);
  });
}

module.exports = main;

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
