// game.js — motor simples de plataforma 2D estilo "Mario"
// Implementado em Canvas 2D puro, sem dependências externas.

const GRAVITY = 0.55;
const MOVE_SPEED = 3.2;
const JUMP_FORCE = -11.5;

// Fases: cada uma define plataformas, moedas, inimigos e a bandeira final.
const LEVELS = [
  {
    width: 1600,
    platforms: [
      { x: 0, y: 400, w: 1600, h: 50 }, // chão
      { x: 260, y: 300, w: 120, h: 20 },
      { x: 460, y: 240, w: 120, h: 20 },
      { x: 700, y: 320, w: 160, h: 20 },
      { x: 950, y: 260, w: 120, h: 20 },
      { x: 1150, y: 340, w: 140, h: 20 },
    ],
    coins: [
      { x: 300, y: 260 },
      { x: 500, y: 200 },
      { x: 760, y: 280 },
      { x: 1000, y: 220 },
      { x: 1400, y: 360 },
    ],
    enemies: [
      { x: 500, y: 368, range: [420, 620] },
      { x: 1000, y: 368, range: [950, 1150] },
    ],
    flag: { x: 1520, y: 240 },
    spawn: { x: 40, y: 340 },
  },
  {
    width: 1800,
    platforms: [
      { x: 0, y: 400, w: 500, h: 50 },
      { x: 600, y: 400, w: 300, h: 50 },
      { x: 1000, y: 400, w: 800, h: 50 },
      { x: 200, y: 300, w: 100, h: 20 },
      { x: 650, y: 300, w: 100, h: 20 },
      { x: 850, y: 240, w: 100, h: 20 },
      { x: 1150, y: 300, w: 120, h: 20 },
      { x: 1400, y: 240, w: 120, h: 20 },
    ],
    coins: [
      { x: 230, y: 260 },
      { x: 680, y: 260 },
      { x: 880, y: 200 },
      { x: 1190, y: 260 },
      { x: 1430, y: 200 },
      { x: 1700, y: 360 },
    ],
    enemies: [
      { x: 700, y: 368, range: [610, 880] },
      { x: 1200, y: 368, range: [1010, 1780] },
    ],
    flag: { x: 1720, y: 240 },
    spawn: { x: 40, y: 340 },
  },
];

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ui = ui; // { livesEl, coinsEl, levelEl, overlay, overlayTitle, overlayText, overlayBtn }

    this.keys = new Set();
    this.running = false;
    this.levelIndex = 0;
    this.lives = 3;
    this.coins = 0;

    this.bindInput();
    this.loadLevel(this.levelIndex);
  }

  bindInput() {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.code);
      if (e.code === "KeyR") this.loadLevel(this.levelIndex, true);
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
  }

  loadLevel(index, keepStats = false) {
    const data = LEVELS[index];
    this.level = data;
    this.player = {
      x: data.spawn.x,
      y: data.spawn.y,
      w: 28,
      h: 36,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      alive: true,
    };
    this.enemies = data.enemies.map((e) => ({
      ...e,
      dir: 1,
      w: 26,
      h: 26,
      alive: true,
    }));
    this.coinsLeft = data.coins.map((c) => ({ ...c, taken: false }));
    this.camX = 0;
    this.finished = false;
    if (!keepStats) {
      // moedas/vidas persistem entre fases; só resetam num "reiniciar fase" completo se quiser
    }
    this.updateHUD();
  }

  start() {
    this.running = true;
    requestAnimationFrame(this.loop.bind(this));
  }

  updateHUD() {
    this.ui.livesEl.textContent = this.lives;
    this.ui.coinsEl.textContent = this.coins;
    this.ui.levelEl.textContent = this.levelIndex + 1;
  }

  loop(t) {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }

  update() {
    if (this.finished) return;
    const p = this.player;

    // movimento horizontal
    if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) {
      p.vx = -MOVE_SPEED;
      p.facing = -1;
    } else if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) {
      p.vx = MOVE_SPEED;
      p.facing = 1;
    } else {
      p.vx = 0;
    }

    // pulo
    if ((this.keys.has("Space") || this.keys.has("ArrowUp") || this.keys.has("KeyW")) && p.onGround) {
      p.vy = JUMP_FORCE;
      p.onGround = false;
    }

    // gravidade
    p.vy += GRAVITY;
    if (p.vy > 15) p.vy = 15;

    // eixo X
    p.x += p.vx;
    p.x = Math.max(0, Math.min(p.x, this.level.width - p.w));
    this.resolveCollisions(p, "x");

    // eixo Y
    p.y += p.vy;
    p.onGround = false;
    this.resolveCollisions(p, "y");

    // queda no vazio
    if (p.y > 500) {
      this.loseLife();
      return;
    }

    // câmera segue o jogador
    const half = this.canvas.width / 2;
    this.camX = Math.max(0, Math.min(p.x - half, this.level.width - this.canvas.width));

    // moedas
    for (const c of this.coinsLeft) {
      if (c.taken) continue;
      if (this.rectsOverlap(p, { x: c.x - 10, y: c.y - 10, w: 20, h: 20 })) {
        c.taken = true;
        this.coins++;
        this.updateHUD();
      }
    }

    // inimigos
    for (const en of this.enemies) {
      if (!en.alive) continue;
      en.x += en.dir * 1.4;
      if (en.x < en.range[0] || en.x + en.w > en.range[1]) en.dir *= -1;

      if (this.rectsOverlap(p, en)) {
        const stompedFromAbove = p.vy > 0 && p.y + p.h - en.y < 16;
        if (stompedFromAbove) {
          en.alive = false;
          p.vy = JUMP_FORCE * 0.6;
        } else {
          this.loseLife();
          return;
        }
      }
    }

    // bandeira / fim de fase
    const flag = this.level.flag;
    if (this.rectsOverlap(p, { x: flag.x, y: flag.y, w: 10, h: 160 })) {
      this.winLevel();
    }
  }

  resolveCollisions(entity, axis) {
    for (const plat of this.level.platforms) {
      if (!this.rectsOverlap(entity, plat)) continue;
      if (axis === "y") {
        if (entity.vy > 0) {
          entity.y = plat.y - entity.h;
          entity.vy = 0;
          entity.onGround = true;
        } else if (entity.vy < 0) {
          entity.y = plat.y + plat.h;
          entity.vy = 0;
        }
      } else {
        if (entity.vx > 0) entity.x = plat.x - entity.w;
        else if (entity.vx < 0) entity.x = plat.x + plat.w;
      }
    }
  }

  rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  loseLife() {
    this.lives--;
    this.updateHUD();
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.loadLevel(this.levelIndex, true);
    }
  }

  winLevel() {
    this.finished = true;
    if (this.levelIndex + 1 < LEVELS.length) {
      this.showOverlay("Fase concluída!", "Prepare-se para a próxima fase.", "Próxima fase", () => {
        this.levelIndex++;
        this.loadLevel(this.levelIndex, true);
        this.hideOverlay();
      });
    } else {
      this.showOverlay("Você venceu!", `Moedas coletadas: ${this.coins}`, "Jogar novamente", () => {
        this.levelIndex = 0;
        this.lives = 3;
        this.coins = 0;
        this.loadLevel(this.levelIndex);
        this.hideOverlay();
      });
    }
  }

  gameOver() {
    this.finished = true;
    this.showOverlay("Game Over", `Você coletou ${this.coins} moedas.`, "Tentar novamente", () => {
      this.levelIndex = 0;
      this.lives = 3;
      this.coins = 0;
      this.loadLevel(this.levelIndex);
      this.hideOverlay();
    });
  }

  showOverlay(title, text, btnLabel, onClick) {
    this.ui.overlayTitle.textContent = title;
    this.ui.overlayText.textContent = text;
    this.ui.overlayBtn.textContent = btnLabel;
    this.ui.overlay.classList.remove("hidden");
    this.ui.overlayBtn.onclick = onClick;
  }

  hideOverlay() {
    this.ui.overlay.classList.add("hidden");
  }

  draw() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(-this.camX, 0);

    // plataformas
    for (const plat of this.level.platforms) {
      ctx.fillStyle = plat.y === 400 ? "#4a7c2f" : "#c84c0c";
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(plat.x, plat.y, plat.w, 4);
    }

    // moedas
    for (const c of this.coinsLeft) {
      if (c.taken) continue;
      ctx.beginPath();
      ctx.fillStyle = "#ffd93d";
      ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#a9780a";
      ctx.stroke();
    }

    // inimigos
    for (const en of this.enemies) {
      if (!en.alive) continue;
      ctx.fillStyle = "#8b2be2";
      ctx.fillRect(en.x, en.y, en.w, en.h);
      ctx.fillStyle = "#fff";
      ctx.fillRect(en.x + 4, en.y + 6, 5, 5);
      ctx.fillRect(en.x + en.w - 9, en.y + 6, 5, 5);
    }

    // bandeira
    const flag = this.level.flag;
    ctx.fillStyle = "#c9c9c9";
    ctx.fillRect(flag.x, flag.y, 4, 160);
    ctx.fillStyle = "#22b14c";
    ctx.beginPath();
    ctx.moveTo(flag.x + 4, flag.y);
    ctx.lineTo(flag.x + 34, flag.y + 10);
    ctx.lineTo(flag.x + 4, flag.y + 20);
    ctx.closePath();
    ctx.fill();

    // jogador
    const p = this.player;
    ctx.fillStyle = "#e52521";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#fcd7b6";
    ctx.fillRect(p.x + (p.facing > 0 ? p.w - 10 : 2), p.y + 4, 8, 8);

    ctx.restore();
  }
}
