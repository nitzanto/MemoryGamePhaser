import Phaser from "phaser";

export type CardType = {
  cardSelected: boolean;
  cardObject: Phaser.GameObjects.Sprite;
  cardValue: string;
  matchCard: boolean;
  cardBackSprite: "symbol_0.png" | string;
};
