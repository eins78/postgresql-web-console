const http = require("http");
const url = require("url");
const crypto = require("crypto");

const DELAY = 3000;
// for testing in browser console:
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Expose-Headers": "X-Execution-ID"
};
const CLIENT_CODE = `
function log(msg, obj) {
  document.getElementById('txt').textContent += (msg + ': ' + JSON.stringify(obj) + '\\n')
}
fetch('/api').then(function(response) {
    log('Execution ID', response.headers.get('X-Execution-ID'));
    return response.text();
}).then(function(body) {
  log('Body', body);
});
`;
const HTML_PAGE = `
<!DOCTYPE html>
<html><meta charset="utf-8">
<pre id='txt'></pre>
<script>${CLIENT_CODE}</script>
</html>
`;

const STATE = {
  operations: {}
};

function fakeSlowApiResponse(request, response) {
  const id = crypto.randomBytes(16).toString("hex");
  printf(`${id} RESPONSE...`);

  response.writeHead(200, {
    "Content-Type": "text/plain",
    "X-Execution-ID": id,
    ...CORS_HEADERS
  });
  printf("HEAD...");

  // enables chunked-encoding, sends headers and (empty) start of body to client
  response.write("\n");
  printf("CHUNK...");

  // fake slow-running, abortable database query
  const timeout = setTimeout(() => {
    response.end(`FAKE API RESPONSE for request with ID "'${id}'"`);
    printf("END\n");
    STATE.operations[id] = null;
  }, DELAY);

  // to abort the request, fake aborting the db query and also close the connection
  const abort = () => {
    clearTimeout(timeout);
    try {
      response.connection.end();
    } catch (err) {
      console.error(err);
    }
  };

  // do the abort if the client has aborted the connection
  request.on("aborted", () => {
    console.log(`REQUEST ABORT via connection abort: ${id}`);
    abort();
  });

  // do the abort if the client has closed the connection
  request.on("close", () => {
    console.log(`REQUEST ABORT via connection close: ${id}`);
    abort();
  });

  // do abort if was requested by
  STATE.operations[id] = {
    abort: () => {
      console.log(`REQUEST ABORT via API: ${id}`);
      abort();
    }
  };
}

var server = http.createServer(function(request, response) {
  const reqUrl = url.parse(request.url, true);
  const path = reqUrl.pathname;

  if (path === "/api") {
    fakeSlowApiResponse(request, response);
  } else if (path === "/abort") {
    const id = reqUrl.query.id;
    const operation = STATE.operations[id];
    if (!operation || !operation.abort) {
      response.writeHead(404, {
        "Content-Type": "text/plain",
        ...CORS_HEADERS
      });
      response.end(`not found! id: ${id}`);
    } else {
      operation.abort();
      response.writeHead(200, {
        "Content-Type": "text/plain",
        ...CORS_HEADERS
      });
      response.end(`aborted! id: ${id}`);
      STATE.operations[id] = null;
    }
  } else {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(HTML_PAGE);
  }
});

server.listen(8000);
console.log(`
  Server running. Test with \`curl -v 'http://127.0.0.1:8000/api'\`.
  Check: the 'X-Execution-ID' header can be seen in the log before "Hello World" in body.
  OR \`open 'http://127.0.0.1:8000/'\` in a browser.
`);

function printf(...args) {
  process.stdout.write(...args);
}
