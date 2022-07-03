const { createServer } = require("http");
const { Client } = require("undici");
const { promisify } = require("util");

const listen = promisify(
  /**
   * @param {import('net').Server} server
   * @param {(err: null, address: import('net').AddressInfo) => void} callback
   */
  function (server, callback) {
    server.listen(function () {
      const address = /** @type {import('net').AddressInfo} */ (
        server.address()
      );
      callback(null, address);
    });
  }
);

const close = promisify(
  /**
   * @param {import('net').Server} server
   * @param {(err?: Error) => void} callback
   */
  function (server, callback) {
    server.close(callback);
  }
);

/**
 * @param {import('http').RequestListener} app
 * @param {(url: string) => Promise<void>} runner
 */
async function useApp(app, runner) {
  const server = createServer(app);
  try {
    const { port } = await listen(server);
    await runner(`http://localhost:${port}`);
  } finally {
    if (server.listening) {
      await close(server);
    }
  }
}

/**
 * @param {string} url
 * @param {(client: Client) => Promise<void>} runner
 */
async function useClient(url, runner) {
  const client = new Client(url);
  try {
    await runner(client);
  } finally {
    if (!client.closed) {
      await client.close();
    }
  }
}

exports.useApp = useApp;
exports.useClient = useClient;
