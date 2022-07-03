/**
 * @typedef {import('net').AddressInfo} AddressInfo
 * @typedef {import('net').Server} Server
 */

const { promisify } = require("util");

/**
 * @param {Server} server
 * @param {(address: AddressInfo) => Promise<void>} runner
 */
async function run(server, runner) {
  try {
    server.listen();
    await runner(/** @type {AddressInfo} */ (server.address()));
  } finally {
    if (server.listening) {
      await promisify((callback) =>
        server.close(/** @type {(err?: Error) => void} */ (callback))
      )().catch((e) => {
        console.error(e);
      });
    }
  }
}

module.exports = run;
