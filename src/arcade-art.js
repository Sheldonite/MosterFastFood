(function () {
  "use strict";
  const images = new Map(), patterns = new Map(), warnings = new WeakMap();
  function image(src) {
    if (!images.has(src)) { const value = new Image(); value.src = src; images.set(src, value); }
    return images.get(src);
  }
  Arcade.art = {
    source: function (id, original) {
      const parts = id.split(".");
      if (parts[0] === "classes") return "./assets/pixel/classes/" + parts[1] + ".png";
      if (parts[0] === "bosses") {
        const special = { burgerDeluxe:"burger", colaDeluxe:"cola", sushiDeluxe:"sushi", sushiTail:"sushi", sushiSegment:"sushi", sushiWeakSegment:"sushi" };
        const segment = {sushiSegment:"segment",sushiWeakSegment:"weak-segment",sushiTail:"tail"}[parts[1]];
        if(segment)return "./assets/pixel/bosses/sushi-"+segment+".png";
        const kind = special[parts[1]] || parts[1];
        return "./assets/pixel/bosses/" + kind + (parts[1].includes("Segment") || parts[1].includes("Tail") ? "" : "-sheet") + ".png";
      }
      if (parts[0] === "hazards") return "./assets/pixel/hazards/" + (parts[1].startsWith("soySakeWave") ? "soy-sake-wave" : parts[1]) + ".png";
      if (parts[0] === "bossAbilities") return "./assets/pixel/icons/" + parts[1] + "-" + parts[2] + ".png";
      if (parts[0] === "projectiles") return "./assets/pixel/projectiles/" + parts[1] + ".png";
      if (parts[0] === "abilities") return "./assets/pixel/icons/" + (parts[1] === "melee" ? "warrior" : parts[1]) + "-" + parts[2] + ".png";
      if (id === "ui.potion") return "./assets/pixel/icons/potion.png";
      if (parts[0] === "icons" && parts[1] === "classes") return "./assets/pixel/portraits/" + parts[2] + ".png";
      return original;
    },
    dummy: function(context,target) {
      const sprite=image("./assets/pixel/props/training-dummy.png");
      if(sprite.complete&&sprite.naturalWidth)context.drawImage(sprite,Math.round(target.x/2)*2-32,Math.round(target.y/2)*2-64,64,96);
    },
    hero: function (context, actor, kind) {
      kind = kind === "melee" ? "warrior" : kind;
      const sheet = image("./assets/pixel/classes/" + kind + ".png");
      if (!sheet.complete || !sheet.naturalWidth) return false;
      const row = { down:0, left:1, right:2, up:3 }[actor.facing] || 0;
      const attacking = actor.meleeAttackTimer > 0 || actor.rangerAttackTimer > 0 || actor.rogueAttackTimer > 0 || actor.castTimer > 0;
      const frame = attacking ? 3 : actor.moving && !Arcade.settings.reducedMotion ? Math.floor((actor.animationTime || 0) * 8) % 4 : 0;
      context.drawImage(sheet, frame * 32, row * 48, 32, 48, Math.round(actor.x / 2) * 2 - 32, Math.round(actor.y / 2) * 2 - 88, 64, 96);
      if (actor.lastDamageAt && performance.now() - actor.lastDamageAt < 130) {
        context.fillStyle = "#fff1cd99"; context.fillRect(Math.round(actor.x)-20,Math.round(actor.y)-70,40,64);
      }
      return true;
    },
    floor: function (context, rect, kind) {
      const tile = image("./assets/pixel/tiles/" + kind + ".png");
      if (!tile.complete || !tile.naturalWidth) return;
      let pattern = patterns.get(kind);
      if (!pattern) {
        const sheet = document.createElement("canvas"); sheet.width=32; sheet.height=32;
        const paint=sheet.getContext("2d");paint.imageSmoothingEnabled=false;paint.drawImage(tile,0,0,32,32);
        pattern=context.createPattern(sheet,"repeat"); patterns.set(kind,pattern);
      }
      context.fillStyle=pattern;
      context.fillRect(rect.x+10,rect.y+10,rect.w-20,rect.h-20);
    },
    boss: function (context, target, kind) {
      const sheet=image("./assets/pixel/bosses/"+kind+"-sheet.png");
      if (!sheet.complete || !sheet.naturalWidth) return false;
      const row=target.hitFlashUntil>performance.now()?2:target.enraged?3:target.stateTimer>0||(target.animation&&target.animation!=="idle")?1:0;
      const frame=Arcade.settings.reducedMotion?0:Math.floor((target.animationTime || performance.now()/1000)*6)%4;
      const size=Math.round((target.radius||52)*2.55/2)*2;
      context.drawImage(sheet,frame*64,row*64,64,64,Math.round(target.x/2)*2-size/2,Math.round(target.y/2)*2-size/2,size,size);
      if (row===2) {context.strokeStyle="#fff1cd";context.lineWidth=4;context.strokeRect(target.x-size/2,target.y-size/2,size,size);}
      return true;
    },
    telegraph: function (context, hazard) {
      const circles = ["slam","mazeCircle","fizzBurst","sodaDrop","sodaPuddle","burgerSauceDrop","burgerSauceBurst","picklePuddle","nachoCheeseMortar","scoopDrop","frozenPuddle","cherryBomb","ingredientDrop","pizzaBoxSlam","ketchupMortar","ketchupPuddle","tacoSlam"];
      const circle = circles.includes(hazard.type) && Number.isFinite(hazard.r);
      const lane = ["strawSnipe","burgerChargeLane","mazeWall"].includes(hazard.type);
      if ((!circle && !lane) || !Number.isFinite(hazard.x) || !Number.isFinite(hazard.y)) return false;
      const warning = hazard.warn > 0;
      let state = warnings.get(hazard);
      if (!state) {
        state = { duration: Math.max(hazard.warnDuration || hazard.warningDuration || 0, hazard.warn || 0, .01) };
        warnings.set(hazard, state);
        if (warning) Arcade.emit("warning");
      }
      const progress = warning ? Math.max(0, 1 - hazard.warn / state.duration) : 1;
      context.save(); context.lineWidth = 4;
      context.strokeStyle = warning ? "#efbe55" : "#ff7469";
      context.fillStyle = warning ? "#efbe5526" : "#ff74694d";
      context.setLineDash(warning ? [8,6] : []);
      if (circle) {
        context.beginPath(); context.arc(hazard.x,hazard.y,hazard.r,0,Math.PI*2); context.stroke();
        context.setLineDash([]);
        context.beginPath(); context.arc(hazard.x,hazard.y,hazard.r*progress,0,Math.PI*2); context.fill();
        // Cross marks distinguish hostile areas from friendly wards and healing rings.
        context.fillStyle = warning ? "#efbe55" : "#ff7469";
        context.fillRect(hazard.x-7,hazard.y-2,14,4);context.fillRect(hazard.x-2,hazard.y-7,4,14);
      } else {
        const wall = hazard.type === "mazeWall";
        const length = hazard.type === "strawSnipe" ? 780 : hazard.length;
        const width = hazard.type === "strawSnipe" ? 22 : hazard.width;
        const x = wall ? hazard.x : hazard.startX ?? hazard.x;
        const y = wall ? hazard.y : hazard.startY ?? hazard.y;
        context.translate(x,y);context.rotate(wall ? (hazard.vertical ? Math.PI/2 : 0) : hazard.angle);
        const start = wall ? -length/2 : 0;
        context.strokeRect(start,-width/2,length,width);
        context.setLineDash([]);context.fillRect(start,-width/2,length*progress,width);
        context.fillStyle = warning ? "#efbe55" : "#ff7469";
        for(let at=start+12;at<start+length;at+=32){context.fillRect(at,-3,8,6);}
      }
      context.restore(); return true;
    }
  };
})();
