(async function main() {
  console.log("# undici-proxy");
  await require("./undici-proxy")();
  console.log("# http-proxy-middleware");
  await require("./http-proxy-middleware")();
  console.log("# express-http-proxy");
  await require("./express-http-proxy")();
})();
