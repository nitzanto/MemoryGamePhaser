export interface GameManager {
  initGame(): void;

  generateGameBoard(
    rows: number,
    columns: number,
    numCards: number,
  ): () => string[];
}
