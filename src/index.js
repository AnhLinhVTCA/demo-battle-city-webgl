import "./index.css";
import resizeCanvas from "gdxjs/lib/resizeCanvas";
import createCamera from "gdxjs/lib/orthoCamera";
import createTextureWhite from "gl-white-texture";
import createBath from "gdxjs/lib/createBatch";
import loadTexture from "gdxjs/lib/loadTexture";
import loadAtlas from "gdxjs/lib/loadAtlas";
import Vector2 from "gdxjs/lib/vector2";
import createAnimation, { PlayMode } from "gdxjs/lib/createAnimation";
import inputHandle from "gdxjs/lib/InputHandler";

const init = async () => {
  const info = document.getElementById("info");
  const canvas = document.getElementById("main");
  const [width, height] = resizeCanvas(canvas);

  const worldWidth = 60;
  const worldHeight = 40;

  const gl = canvas.getContext("webgl");

  const cam = createCamera(worldWidth, worldHeight, width, height);
  const batch = createBath(gl);

  const inputHandler = new inputHandle(canvas);
  gl.clearColor(0, 0, 0, 1);
  const whiteTex = createTextureWhite(gl);
  const players = [
    {
      hp: 10,
      pos: new Vector2(10, 10),
      target: new Vector2(10, 10),
      cooldown: 0,
      delay: 1 / 2,
      radius: 2,
      speed: 10,
      angle: 0,
      angleGun: 0,
      tankTexture: await loadTexture(gl, "./Hull_01.png"),
      gunTexture: await loadTexture(gl, "./Gun_01.png"),
      shooting: false
    }
  ];
  const bots = [
    {
      hp: 10,
      pos: new Vector2(50, 30),
      target: new Vector2(50, 30),
      cooldown: 0,
      delay: 1 / 2,
      radius: 2,
      speed: 10,
      angle: 0,
      angleGun: 0,
      tankTexture: await loadTexture(gl, "./Hull_02.png"),
      gunTexture: await loadTexture(gl, "./Gun_02.png"),
      shooting: false
    },
    {
      hp: 10,
      pos: new Vector2(30, 30),
      target: new Vector2(30, 30),
      cooldown: 0,
      delay: 1 / 2,
      radius: 2,
      speed: 10,
      angle: 0,
      angleGun: 0,
      tankTexture: await loadTexture(gl, "./Hull_02.png"),
      gunTexture: await loadTexture(gl, "./Gun_02.png"),
      shooting: false
    },
    {
      hp: 10,
      pos: new Vector2(20, 30),
      target: new Vector2(20, 30),
      cooldown: 0,
      delay: 1 / 2,
      radius: 2,
      speed: 10,
      angle: 0,
      angleGun: 0,
      tankTexture: await loadTexture(gl, "./Hull_02.png"),
      gunTexture: await loadTexture(gl, "./Gun_02.png"),
      shooting: false
    }
  ];
  const worldPosition = [];
  const screenPosition = [];
  const mouse = { x: 0, y: 0 };
  document.addEventListener("keydown", e => {
    if (e.keyCode === 40 || e.keyCode === 83) {
      players[0].angle = Math.PI;
      players[0].target.set(players[0].pos.x, players[0].pos.y + 1);
    } else if (e.keyCode === 38 || e.keyCode === 87) {
      players[0].angle = 0;
      players[0].target.set(players[0].pos.x, players[0].pos.y - 1);
    } else if (e.keyCode === 37 || e.keyCode === 65) {
      players[0].angle = Math.PI / 2;
      players[0].target.set(players[0].pos.x - 1, players[0].pos.y);
    } else if (e.keyCode === 39 || e.keyCode === 68) {
      players[0].angle = -Math.PI / 2;
      players[0].target.set(players[0].pos.x + 1, players[0].pos.y);
    }
  });
  inputHandler.addEventListener("touchMove", (x, y) => {
    screenPosition[0] = x;
    screenPosition[1] = y;
    cam.unprojectVector2(worldPosition, screenPosition);
    mouse.x = worldPosition[0];
    mouse.y = worldPosition[1];
  });
  inputHandler.addEventListener(
    "touchStart",
    () => (players[0].shooting = true)
  );
  inputHandler.addEventListener(
    "touchEnd",
    () => (players[0].shooting = false)
  );

  const bullets = [];
  const Bullet_speed = 30;
  const createBullets = async (from, to, playerIndex) => {
    bullets.push({
      radius: 0.5,
      dame: 10,
      pos: new Vector2(from.x, from.y),
      velocity: new Vector2(to.x, to.y)
        .subVector(from)
        .nor()
        .scale(Bullet_speed),
      playerIndex,
      image: await loadTexture(gl, "./Flame_H.png")
    });
  };
  const tmp = new Vector2();
  const processPlayer = (player, playerIndex, delta) => {
    batch.setProjection(cam.combined);
    batch.setColor(1, 1, 1, 1);
    batch.begin();
    batch.draw(
      player.tankTexture,
      player.pos.x - 2.5,
      player.pos.y - 2.5,
      5,
      5,
      2.5,
      3,
      -player.angle
    );
    if (player.cooldown !== 0) {
      player.cooldown = Math.max(0, player.cooldown - delta);
    }
    if (!player.shooting) {
      tmp
        .setVector(player.target)
        .subVector(player.pos)
        .nor()
        .scale(player.speed * delta);
      if (
        player.target.x > 0 &&
        player.target.x < 60 &&
        player.target.y > 0 &&
        player.target.y < 40
      ) {
        if (tmp.len2() >= player.pos.distanceSqr(player.target)) {
          player.pos.setVector(player.target);
        } else {
          player.pos.addVector(tmp);
        }
      }
    } else {
      if (player.cooldown === 0) {
        createBullets(player.pos, mouse, playerIndex);
        player.cooldown = player.delay;
      }
    }
    player.angleGun = Math.atan2(
      player.pos.x - mouse.x,
      player.pos.y - mouse.y
    );
    batch.draw(
      player.gunTexture,
      player.pos.x - 1,
      player.pos.y - 1.8,
      2,
      3,
      1,
      2.2,
      -player.angleGun
    );
    batch.end();
    batch.begin();
    batch.setColor(1, 1, 1, 1);
    batch.draw(whiteTex, player.pos.x - 2.6, player.pos.y + 3.9, 5.2, 0.7);
    batch.end();
    batch.begin();
    batch.setColor(1, 0, 0, 1);
    batch.draw(
      whiteTex,
      player.pos.x - 2.5,
      player.pos.y + 4,
      player.hp * 0.05,
      0.5
    );
    batch.end();
  };
  const processBot = (bot, botIndex, delta) => {
    batch.setProjection(cam.combined);
    batch.setColor(1, 1, 1, 1);
    batch.begin();
    batch.draw(
      bot.tankTexture,
      bot.pos.x - 2.5,
      bot.pos.y - 2.5,
      5,
      5,
      2.5,
      3,
      -bot.angle
    );
    if (bot.cooldown !== 0) {
      bot.cooldown = Math.max(0, bot.cooldown - delta);
    }
    if (!bot.shooting) {
      tmp
        .setVector(bot.target)
        .subVector(bot.pos)
        .nor()
        .scale(bot.speed * delta);
      if (
        bot.target.x > 0 &&
        bot.target.x < 60 &&
        bot.target.y > 0 &&
        bot.target.y < 40
      ) {
        if (tmp.len2() >= bot.pos.distanceSqr(bot.target)) {
          bot.pos.setVector(bot.target);
        } else {
          bot.pos.addVector(tmp);
        }
      }
    } else {
      if (bot.cooldown === 0) {
        createBullets(bot.pos, players[0].pos, botIndex);
        bot.cooldown = bot.delay;
      }
    }
    bot.angleGun = Math.atan2(
      bot.pos.x - players[0].pos.x,
      bot.pos.y - players[0].pos.y
    );
    batch.draw(
      bot.gunTexture,
      bot.pos.x - 1,
      bot.pos.y - 1.8,
      2,
      3,
      1,
      2.2,
      -bot.angleGun
    );
    batch.end();
    batch.begin();
    batch.setColor(1, 1, 1, 1);
    batch.draw(whiteTex, bot.pos.x - 2.6, bot.pos.y + 3.9, 5.2, 0.7);
    batch.end();
    batch.begin();
    batch.setColor(1, 0, 0, 1);
    batch.draw(whiteTex, bot.pos.x - 2.5, bot.pos.y + 4, bot.hp * 0.05, 0.5);
    batch.end();
  };
  const processBullet = (bullet, delta) => {
    tmp.setVector(bullet.velocity).scale(delta);
    bullet.pos.addVector(tmp);
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      const x = bullet.pos.x;
      const y = bullet.pos.y;
      if (x < 0 || y < 0 || x > worldWidth || y > worldHeight) {
        bullets.splice(i, 1);
      }
      for (let j = 0; j < players.length; j++) {
        if (bullet.playerIndex !== j) {
          const player = players[j];
          const d1 = (player.pos.x - x) * (player.pos.x - x);
          const d2 = (player.pos.y - y) * (player.pos.y - y);
          if (Math.floor(Math.sqrt(d1 + d2)) <= bullet.radius + player.radius) {
            bullets.splice(i, 1);
            if (player.hp > 0) {
              player.hp -= 10;
            }
          }
        }
      }
      for (let j = 0; j < bots.length; j++) {
        if (bullet.playerIndex !== j) {
          const bot = bots[j];
          const d1 = (bot.pos.x - x) * (bot.pos.x - x);
          const d2 = (bot.pos.y - y) * (bot.pos.y - y);
          if (Math.floor(Math.sqrt(d1 + d2)) <= bullet.radius + bot.radius) {
            bullets.splice(i, 1);
            if (bot.hp > 0) {
              bot.hp -= 10;
            }
          }
        }
      }
    }
  };

  const drawBullet = (pos, velocity, image) => {
    let angle = Math.atan2(pos.x - velocity.x, pos.y - velocity.y);
    batch.begin();
    batch.setColor(1, 1, 1, 1);
    batch.draw(image, pos.x - 1.4, pos.y - 1, 3, 3, 1.5, 1.5, -angle);
    batch.end();
  };
  const handleDelete = (stateTime, i, obj, list) => {
    if (stateTime < 2.3) {
      batch.begin();
      batch.setColor(1, 1, 1, 1);
      explosion
        .getKeyFrame(stateTime, PlayMode.LOOP)
        .draw(batch, obj.pos.x - 5, obj.pos.y - 5, 10, 10);
      batch.end();
    } else {
      list.splice(i, 1);
    }
  };
  // const stopInterval = auto => {
  //   for (let i = 0; i < bots.length; i++) {
  //     const bot = bots[i];
  //     bot.shooting = false;
  //   }
  //   clearInterval(auto);
  // };
  const effects = await loadAtlas(gl, "./effect.atlas");
  const explosion = createAnimation(0.1, effects.findRegions("explosion"));
  let stateTime = 0;
  const update = delta => {
    stateTime += delta;
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (player.hp > 0) {
        processPlayer(player, i, delta);
      } else {
        // stopInterval(auto);
        handleDelete(stateTime, i, player, players);
      }
    }
    for (let i = 0; i < bots.length; i++) {
      const bot = bots[i];
      if (bot.hp > 0) {
        processBot(bot, i, delta);
      } else {
        handleDelete(stateTime, i, bot, bots);
      }
    }
    for (let bullet of bullets) {
      drawBullet(bullet.pos, bullet.velocity, bullet.image);
      processBullet(bullet, delta);
    }
  };

  let lastUpdate = Date.now();
  let fps = 0;
  (function loop() {
    const delta = Date.now() - lastUpdate;
    lastUpdate = Date.now();
    fps = Math.floor(1000 / delta);
    update(delta / 1000);
    requestAnimationFrame(loop);
  })();
  // const auto = setInterval(() => {
  //   for (let i = 0; i < bots.length; i++) {
  //     const bot = bots[i];
  //     bot.target.set(Math.random() * 60, Math.random() * 40);
  //     if (bot.shooting) {
  //       bot.shooting = false;
  //     } else {
  //       bot.shooting = true;
  //     }
  //   }
  // }, 1000);
  setInterval(
    () => (info.innerHTML = `FPS : ${fps} - BULLETS : ${bullets.length}`),
    1000
  );
};
init();
