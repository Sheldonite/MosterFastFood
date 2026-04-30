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
const rooms = new Map();
const bossNames = {
  cola: "Big Cola",
  burger: "Big Burger",
  fries: "Curly Fries",
  trio: "Condiment Trio",
  sauce: "Special Sauce",
  shake: "Peanut Buster Shake",
  nacho: "Nacho Libre",
  pizza: "Pizza Phantom",
  taco: "Taco Titan",
  donut: "Donut Donald",
  sushi: "Sushi Serpent",
};

const lockedBosses = new Set(["taco", "sushi"]);

function sendFrame(socket, payload) {
  if (socket.destroyed) return;
  const data = Buffer.from(JSON.stringify(payload));
  let header;
  if (data.length < 126) {
    header = Buffer.from([0x81, data.length]);
  } else if (data.length < 65536) {
    header = Buffer.from([0x81, 126, data.length >> 8, data.length & 255]);
  } else {
    const length = Buffer.alloc(8);
    length.writeBigUInt64BE(BigInt(data.length));
    header = Buffer.concat([Buffer.from([0x81, 127]), length]);
  }
  socket.write(Buffer.concat([header, data]));
}

function send(peer, payload) {
  sendFrame(peer.socket, payload);
}

function decodeFrame(buffer) {
  if (buffer.length < 6) return { frame: null, consumed: 0 };
  const opcode = buffer[0] & 0x0f;
  if (opcode === 0x8) return { frame: { type: "close" }, consumed: 2 };
  if (opcode !== 0x1) return { frame: null, consumed: 0 };
  let offset = 2;
  let length = buffer[1] & 0x7f;
  if (length === 126) {
    if (buffer.length < 8) return { frame: null, consumed: 0 };
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    if (buffer.length < 14) return { frame: null, consumed: 0 };
    length = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }
  const masked = (buffer[1] & 0x80) !== 0;
  if (!masked) return { frame: null, consumed: 0 };
  const mask = buffer.subarray(offset, offset + 4);
  offset += 4;
  if (buffer.length < offset + length) return { frame: null, consumed: 0 };
  const payload = Buffer.alloc(length);
  for (let i = 0; i < length; i += 1) {
    payload[i] = buffer[offset + i] ^ mask[i % 4];
  }
  return { frame: { type: "message", text: payload.toString("utf8") }, consumed: offset + length };
}

function publicRooms() {
  return [...rooms.values()].map((room) => ({
    id: room.id,
    name: room.name,
    hostId: room.hostId,
    bossKind: room.bossKind,
    bossName: bossNames[room.bossKind] || room.bossKind,
    state: room.state,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
  }));
}

function publicPlayers(room) {
  return [...room.players].map((peerId) => {
    const peer = peers.get(peerId);
    return {
      id: peerId,
      name: peer?.name || "Player",
      ready: Boolean(peer?.ready),
      host: room.hostId === peerId,
      state: peer?.state || null,
    };
  });
}

function roomSnapshot(room) {
  return {
    id: room.id,
    name: room.name,
    hostId: room.hostId,
    bossKind: room.bossKind,
    bossName: bossNames[room.bossKind] || room.bossKind,
    state: room.state,
    maxPlayers: room.maxPlayers,
    players: publicPlayers(room),
    startAt: room.startAt,
  };
}

function broadcastRooms() {
  const payload = { type: "room-list", rooms: publicRooms() };
  peers.forEach((peer) => send(peer, payload));
}

function broadcastRoom(room, payload, exceptId = null) {
  room.players.forEach((peerId) => {
    if (peerId === exceptId) return;
    const peer = peers.get(peerId);
    if (peer) send(peer, payload);
  });
}

function broadcastRoomUpdate(room) {
  broadcastRoom(room, { type: "room-update", room: roomSnapshot(room) });
  broadcastRooms();
}

function createRoom(peer, message) {
  leaveRoom(peer);
  const id = crypto.randomBytes(3).toString("hex").toUpperCase();
  const room = {
    id,
    name: sanitizeText(message.name, 26) || `${peer.name}'s Room`,
    hostId: peer.id,
    bossKind: bossNames[message.bossKind] && !lockedBosses.has(message.bossKind) ? message.bossKind : "cola",
    state: "lobby",
    maxPlayers: 4,
    startAt: 0,
    players: new Set([peer.id]),
  };
  rooms.set(id, room);
  peer.roomId = id;
  peer.ready = false;
  send(peer, { type: "joined-room", room: roomSnapshot(room) });
  broadcastRoomUpdate(room);
}

function joinRoom(peer, message) {
  const room = rooms.get(String(message.roomId || "").toUpperCase());
  if (!room) {
    send(peer, { type: "error", message: "Room not found." });
    return;
  }
  if (room.players.size >= room.maxPlayers) {
    send(peer, { type: "error", message: "Room is full." });
    return;
  }
  leaveRoom(peer);
  room.players.add(peer.id);
  peer.roomId = room.id;
  peer.ready = false;
  send(peer, { type: "joined-room", room: roomSnapshot(room) });
  broadcastRoomUpdate(room);
}

function leaveRoom(peer) {
  if (!peer.roomId) return;
  const room = rooms.get(peer.roomId);
  if (!room) {
    peer.roomId = null;
    return;
  }
  room.players.delete(peer.id);
  peer.roomId = null;
  peer.ready = false;
  if (room.players.size === 0) {
    rooms.delete(room.id);
    broadcastRooms();
    return;
  }
  if (room.hostId === peer.id) {
    room.hostId = [...room.players][0];
    const host = peers.get(room.hostId);
    if (host) host.ready = false;
  }
  broadcastRoomUpdate(room);
}

function setReady(peer, message) {
  const room = rooms.get(peer.roomId);
  if (!room || room.state !== "lobby") return;
  peer.ready = Boolean(message.ready);
  broadcastRoomUpdate(room);
}

function selectBoss(peer, message) {
  const room = rooms.get(peer.roomId);
  if (!room || room.hostId !== peer.id || room.state !== "lobby") return;
  if (!bossNames[message.bossKind] || lockedBosses.has(message.bossKind)) return;
  room.bossKind = message.bossKind;
  broadcastRoomUpdate(room);
}

function startGame(peer) {
  const room = rooms.get(peer.roomId);
  if (!room || room.hostId !== peer.id || room.state !== "lobby") return;
  const players = [...room.players].map((peerId) => peers.get(peerId)).filter(Boolean);
  if (players.some((player) => player.id !== peer.id && !player.ready)) {
    send(peer, { type: "error", message: "Everyone else needs to be ready." });
    return;
  }
  room.state = "inGame";
  room.startAt = Date.now() + 1200;
  broadcastRoom(room, {
    type: "game-start",
    room: roomSnapshot(room),
    bossKind: room.bossKind,
    startAt: room.startAt,
    spawns: players.map((player, index) => ({ id: player.id, ...spawnForIndex(index) })),
  });
  broadcastRoomUpdate(room);
}

function spawnForIndex(index) {
  const points = [
    { x: 890, y: 450 },
    { x: 880, y: 555 },
    { x: 880, y: 345 },
    { x: 990, y: 450 },
  ];
  return points[index % points.length];
}

function sanitizeText(value, maxLength) {
  return String(value || "")
    .replace(/[^\w .'-]/g, "")
    .trim()
    .slice(0, maxLength);
}

function handlePeerMessage(peer, message) {
  if (message.type === "set-name") {
    peer.name = sanitizeText(message.name, 18) || "Player";
    const room = rooms.get(peer.roomId);
    if (room) broadcastRoomUpdate(room);
    return;
  }
  if (message.type === "list-rooms") {
    send(peer, { type: "room-list", rooms: publicRooms() });
    return;
  }
  if (message.type === "create-room") {
    createRoom(peer, message);
    return;
  }
  if (message.type === "join-room") {
    joinRoom(peer, message);
    return;
  }
  if (message.type === "leave-room") {
    leaveRoom(peer);
    return;
  }
  if (message.type === "set-ready") {
    setReady(peer, message);
    return;
  }
  if (message.type === "select-boss") {
    selectBoss(peer, message);
    return;
  }
  if (message.type === "start-game") {
    startGame(peer);
    return;
  }
  if (message.type === "state" && message.state) {
    peer.state = { ...message.state, updatedAt: Date.now(), serverTime: Date.now() };
    const room = rooms.get(peer.roomId);
    if (room && room.state === "inGame") {
      broadcastRoom(room, { type: "peer-state", id: peer.id, state: peer.state, serverTime: Date.now() }, peer.id);
    }
    return;
  }
  if (message.type === "event" && message.event) {
    const room = rooms.get(peer.roomId);
    if (room && room.state === "inGame") {
      broadcastRoom(room, { type: "peer-event", id: peer.id, event: { ...message.event, serverTime: Date.now() } }, peer.id);
    }
  }
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
  const peer = { id, socket, name: `Player ${id.slice(0, 3)}`, roomId: null, ready: false, state: null, buffer: Buffer.alloc(0) };
  peers.set(id, peer);
  send(peer, { type: "welcome", id, rooms: publicRooms(), serverTime: Date.now() });
  broadcastRooms();

  socket.on("data", (buffer) => {
    peer.buffer = Buffer.concat([peer.buffer, buffer]);
    while (peer.buffer.length > 0) {
      const { frame, consumed } = decodeFrame(peer.buffer);
      if (!frame || consumed <= 0) break;
      peer.buffer = peer.buffer.subarray(consumed);
      if (frame.type === "close") {
        socket.end();
        return;
      }
      try {
        handlePeerMessage(peer, JSON.parse(frame.text));
      } catch {
        // Ignore malformed co-op packets so one browser cannot crash the server.
      }
    }
  });

  socket.on("close", () => {
    leaveRoom(peer);
    peers.delete(id);
    broadcastRooms();
  });
  socket.on("error", () => {
    leaveRoom(peer);
    peers.delete(id);
    broadcastRooms();
  });
});

setInterval(() => {
  const now = Date.now();
  rooms.forEach((room) => {
    room.players.forEach((peerId) => {
      if (!peers.has(peerId)) room.players.delete(peerId);
    });
    if (room.players.size === 0) rooms.delete(room.id);
    if (room.state === "inGame" && now - room.startAt > 1000 * 60 * 60 * 3) rooms.delete(room.id);
  });
}, 30000);

server.listen(port, () => {
  console.log(`Boss Fight running at http://localhost:${port}`);
  console.log(`Co-op lobby websocket ready at ws://localhost:${port}/coop`);
});
