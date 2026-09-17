import { Game } from "./game.js";

const canvas = document.getElementById("game");

const ui = {
  livesEl: document.getElementById("lives"),
  coinsEl: document.getElementById("coins"),
  levelEl: document.getElementById("level"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayText: document.getElementById("overlay-text"),
  overlayBtn: document.getElementById("overlay-btn"),
};

const game = new Game(canvas, ui);

ui.overlayBtn.addEventListener("click", () => {
  ui.overlay.classList.add("hidden");
  game.start();
});

// overlay inicial já vem visível via classe "hidden" ausente no HTML? garantimos aqui:
ui.overlay.classList.remove("hidden");
