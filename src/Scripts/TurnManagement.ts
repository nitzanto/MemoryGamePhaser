import { TURNS_PER_ROUND } from "../libs/common/Constants/MemoryGame";
import { textConfig } from "../libs/common/Constants/TextConfigMemoryGame";

export class TurnManagement {
  private turnsText: Phaser.GameObjects.Text | undefined;
  private turns: number;

  constructor() {
    this.turns = TURNS_PER_ROUND;
  }

  public initializeText(scene: Phaser.Scene) {
    this.turnsText = scene.add.text(
      textConfig.x,
      textConfig.y,
      textConfig.text,
      textConfig.style,
    );
  }

  public decrementTurns() {
    this.turns--;
    this.updateTurnsText();
  }

  public getTurns() {
    return this.turns;
  }

  public updateTurnsText() {
    if (this.turnsText) {
      this.turnsText.setText("Turns left: " + this.turns);
    }
  }
}
