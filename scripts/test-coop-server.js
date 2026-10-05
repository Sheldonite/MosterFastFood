const assert = require("node:assert/strict");
const port = 4187;
process.env.PORT = String(port);
const { server } = require("../server");
const sockets = [];
function client() {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://localhost:${port}/coop`), messages = [], waiters = [];
    sockets.push(socket);
    socket.addEventListener("error", reject, { once: true });
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data), waiting = waiters.find((item) => item.predicate(message));
      if (waiting) { waiters.splice(waiters.indexOf(waiting), 1); clearTimeout(waiting.timer); waiting.resolve(message); }
      else messages.push(message);
    });
    socket.addEventListener("open", () => resolve({
      socket, send: (message) => socket.send(JSON.stringify(message)),
      next(predicate) {
        const index = messages.findIndex(predicate);
        if (index >= 0) return Promise.resolve(messages.splice(index, 1)[0]);
        return new Promise((resolve, reject) => {
          const waiting = { predicate, resolve, timer: setTimeout(() => reject(new Error("Timed out waiting for server message")), 2500) };
          waiters.push(waiting);
        });
      }
    }), { once: true });
  });
}
const type = (value) => (message) => message.type === value;
(async function () {
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  const host = await client(), a = await client(), b = await client(), c = await client(), fifth = await client();
  const peers = [host, a, b, c];
  for (const peer of [...peers, fifth]) peer.id = (await peer.next(type("welcome"))).id;
  host.send({ type: "create-room", name: "Regression room" });
  const room = (await host.next(type("joined-room"))).room;
  for (const peer of [a,b,c]) { peer.send({ type: "join-room", roomId: room.id }); await peer.next(type("joined-room")); }
  fifth.send({ type: "join-room", roomId: room.id });
  assert.match((await fifth.next(type("error"))).message, /full/i);
  host.send({ type: "start-game" }); assert.match((await host.next(type("error"))).message, /ready/i);
  for (const peer of [a,b,c]) peer.send({ type: "set-ready", ready: true });
  await host.next((message) => message.type === "room-update" && message.room.players.filter((peer) => peer.ready).length === 3);
  host.send({ type: "start-game", practice:true });
  for (const peer of peers) { const started=await peer.next(type("game-start")); assert.equal(started.room.players.length, 4); assert.equal(started.room.practice,true); }
  console.log("PASS four-player limit and readiness");
  const hit = { type:"projectile-hit", projectileId:"bolt-1", amount:12, source:"Test", phaseSeq:3, room:"arena", bossKind:"cola" };
  host.send(hit); await host.next(type("projectile-damage"));
  host.send(hit); assert.equal((await host.next(type("projectile-damage-ignored"))).reason,"player-already-hit");
  a.send(hit); assert.equal((await a.next(type("projectile-damage-ignored"))).reason,"projectile-consumed");
  host.send({...hit,projectileId:"beam-1",piercing:true}); await host.next((message)=>message.type==="projectile-damage"&&message.projectileId==="beam-1");
  a.send({...hit,projectileId:"beam-1",piercing:true}); await a.next((message)=>message.type==="projectile-damage"&&message.projectileId==="beam-1"&&message.playerId===a.id);
  console.log("PASS actual server projectile deduplication and piercing");
  for (const peer of peers) peer.send({type:"state",state:{dead:peer!==c,bossKind:"cola",room:"arena",phaseSeq:3}});
  const retry={type:"event",event:{kind:"party-retry",phaseSeq:4,bossKind:"cola",room:"arena",mazeSequence:1}};
  host.send(retry); await host.next(type("error"));
  c.send({type:"state",state:{dead:true,bossKind:"cola",room:"arena",phaseSeq:3}});
  await host.next((message)=>message.type==="peer-state"&&message.id===c.id&&message.state.dead);
  a.send(retry); await a.next(type("error"));
  host.send(retry);
  for (const peer of peers) assert.equal((await peer.next((message)=>message.type==="peer-event"&&message.event.kind==="party-retry")).event.phaseSeq,4);
  host.send(retry); await host.next(type("error"));
  host.send({...hit,projectileId:"late-bolt"}); assert.equal((await host.next(type("projectile-damage-ignored"))).reason,"stale-encounter");
  console.log("PASS synchronized host-only party wipe retry and sequence deduplication");
  host.send({type:"return-lobby"});
  for(const peer of peers) assert.equal((await peer.next(type("run-ended"))).room.state,"lobby");
  for(const peer of [a,b,c]) peer.send({type:"set-ready",ready:true});
  await host.next((message)=>message.type==="room-update"&&message.room.players.filter(peer=>peer.ready).length===3);
  host.send({type:"start-game",practice:true}); for(const peer of peers)await peer.next(type("game-start"));
  for(const peer of peers)peer.send({type:"state",state:{dead:true,bossKind:"cola",room:"maze",phaseSeq:0}});
  await host.next((message)=>message.type==="peer-state"&&message.id===c.id&&message.state.phaseSeq===0);
  host.send({type:"event",event:{kind:"party-retry",phaseSeq:1,bossKind:"cola",room:"maze",mazeSequence:1}});
  await host.next((message)=>message.type==="peer-event"&&message.event.phaseSeq===1);
  host.socket.close();
  for(const peer of [a,b,c])assert.match((await peer.next(type("run-ended"))).message,/host/i);
  console.log("PASS new-run sequence reset and host departure");
  // A two-player room uses the same ready and start protocol.
  fifth.send({type:"create-room",name:"Two heroes"}); const duo=(await fifth.next(type("joined-room"))).room;
  a.send({type:"leave-room"}); a.send({type:"join-room",roomId:duo.id}); await a.next(type("joined-room"));
  a.send({type:"set-ready",ready:true}); await fifth.next((message)=>message.type==="room-update"&&message.room.players.some(peer=>peer.id===a.id&&peer.ready));
  fifth.send({type:"start-game"}); assert.equal((await fifth.next(type("game-start"))).room.players.length,2);
  console.log("PASS two-player readiness");
  await a.next(type("game-start"));
  for(const peer of [fifth,a])peer.send({type:"state",state:{dead:true,bossKind:"cola",room:"arena",phaseSeq:5,runMode:"practice"}});
  await fifth.next(message=>message.type==="peer-state"&&message.id===a.id&&message.state.phaseSeq===5);
  fifth.send({type:"event",event:{kind:"party-retry",phaseSeq:6,bossKind:"cola",room:"arena",mazeSequence:1}});
  assert.match((await fifth.next(type("error"))).message,/Practice/i);
  console.log("PASS normal runs reject retries even when a client claims Practice mode");
  for(const kind of ["party-phase","run-end","route-choice","contract-state","rogue-hit-result","rogue-dot-result","support-result"]){
    a.send({type:"event",event:{kind,phaseSeq:5,bossKind:"cola",seq:1}});
    assert.match((await a.next(type("error"))).message,/host/i);
  }
  const end={type:"event",event:{kind:"run-end",phaseSeq:5,bossKind:"cola",seq:1,reason:"party wipe"}};
  fifth.send(end);assert.equal((await a.next(message=>message.type==="peer-event"&&message.event.kind==="run-end")).event.seq,1);
  fifth.send(end);fifth.send({...end,event:{...end.event,seq:2,phaseSeq:4}});
  // A later valid packet is the fence: duplicate and stale packets must not precede it.
  fifth.send({...end,event:{...end.event,seq:3}});
  assert.equal((await a.next(message=>message.type==="peer-event"&&message.event.kind==="run-end")).event.seq,3);
  console.log("PASS host-only progression events and sequenced run settlement");
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => {
  sockets.forEach((socket) => socket.close()); server.close();
});
