const autocannon = require("autocannon");
const { PassThrough } = require("stream");

/**
 * @typedef {import('net').AddressInfo} AddressInfo
 */

/**
 * @param {AddressInfo} address
 */
async function bench({ port }) {
  const result = await autocannon({
    url: `http://localhost:${port}/`,
    body: "Hello World!",
  });

  process.stdout.write(
    autocannon.printResult(result, {
      outputStream: new PassThrough(),
    })
  );
}

module.exports = bench;
