import { CardType } from "../Interfaces/CardType";

export class Card implements CardType {
  cardSelected = false;
  matchCard = false;

  constructor(
    public cardObject: Phaser.GameObjects.Sprite,
    public cardValue: string,
    public cardBackSprite: string,
  ) {
    this.cardObject.setInteractive();
    this.cardObject.setTexture("symbols", this.cardBackSprite);
  }

  setSelected(selected: boolean): void {
    this.cardSelected = selected;
  }

  setMatched(matched: boolean): void {
    this.matchCard = matched;
  }

  flipCard(): void {
    this.cardObject.setTexture("symbols", this.cardValue);
  }

  resetCard(): void {
    this.cardSelected = false;
    this.matchCard = false;
    this.cardObject.setTexture("symbols", this.cardBackSprite);
  }
}
