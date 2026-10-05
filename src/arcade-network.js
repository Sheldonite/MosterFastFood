/* Host-owned retry envelopes. Existing combat and party messages stay intact. */
(function () {
  "use strict";
  Arcade.network = {
    retryValid: function (event, sender, host, currentSequence, bossKind) {
      return Boolean(event && sender === host && event.kind === "party-retry" &&
        Number.isInteger(event.phaseSeq) && event.phaseSeq > currentSequence &&
        event.bossKind === bossKind && ["maze", "arena", "starter"].includes(event.room) &&
        Number.isInteger(event.mazeSequence) && event.mazeSequence >= 0);
    },
    retryEnvelope: function (sequence, bossKind, room, mazeSequence) {
      return { kind: "party-retry", phaseSeq: sequence, bossKind: bossKind, room: room, mazeSequence: mazeSequence };
    }
  };
})();
