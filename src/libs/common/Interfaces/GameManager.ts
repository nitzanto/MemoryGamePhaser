export interface GameManager {
  initGame(): void;

  generateGameBoard(): () => string[];
}
