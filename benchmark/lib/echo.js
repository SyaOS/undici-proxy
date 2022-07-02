const { createServer } = require("http");

function echo() {
  return createServer(function (req, res) {
    res.writeHead(200);
    req.pipe(res);
  });
}

module.exports = echo;
