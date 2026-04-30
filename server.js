const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const port = Number(process.env.PORT || 4173);
const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  const route = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path
    .normalize(decodeURIComponent(route))
    .replace(/^[/\\]+/, "")
    .replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(root, safePath);

  if (!requestedPath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(requestedPath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": types[path.extname(requestedPath)] || "application/octet-stream" });
    response.end(data);
  });
});

const peers = new Map();

function sendFrame(socket, payload) {
  if (socket.destroyed) return;
  const data = Buffer.from(JSON.stringify(payload));
  const header = data.length < 126
    ? Buffer.from([0x81, data.length])
    : Buffer.from([0x81, 126, data.length >> 8, data.length & 255]);
  socket.write(Buffer.concat([header, data]));
}

function broadcast(payload, exceptId = null) {
  peers.forEach((peer, id) => {
    if (id !== exceptId) sendFrame(peer.socket, payload);
  });
}

function decodeFrame(buffer) {
  if (buffer.length < 6) return null;
  const opcode = buffer[0] & 0x0f;
  if (opcode === 0x8) return { type: "close" };
  if (opcode !== 0x1) return null;
  let offset = 2;
  let length = buffer[1] & 0x7f;
  if (length === 126) {
    if (buffer.length < 8) return null;
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    return null;
  }
  const masked = (buffer[1] & 0x80) !== 0;
  if (!masked) return null;
  const mask = buffer.subarray(offset, offset + 4);
  offset += 4;
  if (buffer.length < offset + length) return null;
  const payload = Buffer.alloc(length);
  for (let i = 0; i < length; i += 1) {
    payload[i] = buffer[offset + i] ^ mask[i % 4];
  }
  return { type: "message", text: payload.toString("utf8") };
}

server.on("upgrade", (request, socket) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  if (url.pathname !== "/coop") {
    socket.destroy();
    return;
  }
  const key = request.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }
  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "",
    "",
  ].join("\r\n"));

  const id = crypto.randomBytes(4).toString("hex");
  peers.set(id, { socket, state: null });
  sendFrame(socket, {
    type: "welcome",
    id,
    peers: [...peers.entries()]
      .filter(([peerId, peer]) => peerId !== id && peer.state)
      .map(([peerId, peer]) => ({ id: peerId, state: peer.state })),
  });
  broadcast({ type: "peer-count", count: peers.size });

  socket.on("data", (buffer) => {
    const frame = decodeFrame(buffer);
    if (!frame) return;
    if (frame.type === "close") {
      socket.end();
      return;
    }
    try {
      const message = JSON.parse(frame.text);
      const peer = peers.get(id);
      if (!peer) return;
      if (message.type === "state" && message.state) {
        peer.state = { ...message.state, updatedAt: Date.now() };
        broadcast({ type: "peer-state", id, state: peer.state }, id);
      }
      if (message.type === "event" && message.event) {
        broadcast({ type: "peer-event", id, event: message.event }, id);
      }
    } catch {
      // Ignore malformed co-op packets so one browser cannot crash the server.
    }
  });

  socket.on("close", () => {
    peers.delete(id);
    broadcast({ type: "peer-left", id });
    broadcast({ type: "peer-count", count: peers.size });
  });
  socket.on("error", () => {
    peers.delete(id);
    broadcast({ type: "peer-left", id });
    broadcast({ type: "peer-count", count: peers.size });
  });
});

server.listen(port, () => {
  console.log(`Boss Fight running at http://localhost:${port}`);
  console.log(`Light co-op websocket ready at ws://localhost:${port}/coop`);
});
