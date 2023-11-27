import { cardType } from "./cardType";

export interface GameManager {
  initGame(): void;
  updateTurnsText(): void;
  isGameOver(): boolean;
  shuffleCards(): void;
  swapCards(card1: cardType, card2: cardType): void;
  // Add other necessary methods...
}
