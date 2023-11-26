import { GameManager } from "./src/Scripts/GameManager";
import MainScene from "./src/Scenes/MainScene";

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: MainScene,
};

const game = new Phaser.Game(config);

game.events.on("GameCreated", () => {
  // @ts-ignore
  new GameManager(game.scene.scenes[0]);
});
