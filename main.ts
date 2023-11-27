import { MemoryGameManager } from "./src/Scripts/MemoryGameManager";
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
  new MemoryGameManager(game.scene.scenes[0]);
});
