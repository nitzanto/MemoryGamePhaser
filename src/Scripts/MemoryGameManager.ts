import MainScene from "../Scenes/MainScene";
import {
  BACK_OF_CARD,
  TURNS_PER_ROUND,
} from "../libs/common/Constants/MemoryGame";
import { GameManager } from "../libs/common/Interfaces/GameManager";
import { Card } from "../libs/common/Classes/Card";
import { textConfig } from "../libs/common/Constants/TextConfigMemoryGame";
import { CardManager } from "./CardsManager";
import { TurnManagement } from "./TurnManagement";

export class MemoryGameManager implements GameManager {
  sceneManager: MainScene;
  gameBoard!: string[];
  turnManager!: TurnManagement;
  cardsManager!: CardManager;

  constructor(scene: MainScene) {
    this.sceneManager = scene;
    this.turnManager = new TurnManagement();
    this.cardsManager = new CardManager(this.sceneManager);

    this.initGame();
  }

  generateGameBoard(rows: number, columns: number, numCards: number): string[] {
    // Ensure the total number of cards is even, as pairs are needed for matching.
    if ((rows * columns) % 2 !== 0) return [];

    const totalCards = rows * columns;

    const board: string[] = new Array(totalCards).fill(BACK_OF_CARD);

    // Initialize the symbol number for assigning unique symbols to cards.
    let currentSymbolNumber = 2;

    // Loop to randomly assign symbols to the cards on the board.
    for (let orderCount = 0; orderCount < totalCards; ) {
      // Generate a random index to place the symbol.
      let randomIndex = Math.floor(Math.random() * totalCards);

      // Ensure the selected index is within the valid range and the card at that index has the default back.
      while (board[randomIndex] !== BACK_OF_CARD || randomIndex >= totalCards) {
        // If the index is out of range, reset to the beginning; otherwise, move to the next index.
        randomIndex = randomIndex >= totalCards ? 0 : randomIndex + 1;
      }

      // Assign a symbol to the randomly selected card.
      board[randomIndex] = `symbol_${Math.floor(currentSymbolNumber / 2)}.png`;

      // Increment the symbol number for the next iteration.
      currentSymbolNumber++;

      // Increment the order count to keep track of the number of cards processed.
      orderCount++;

      // If the maximum number of cards for a given symbol is reached, reset the symbol number.
      if (numCards + 1 === Math.floor(currentSymbolNumber / 2))
        currentSymbolNumber = 2;
    }

    return board;
  }

  initGame() {
    this.turnManager.initializeText(this.sceneManager);
    this.cardsManager.initializeCardsManager(this.turnManager);

    this.gameBoard = this.generateGameBoard(4, 3, 6);

    // @ts-ignore
    let symbolsArr: Phaser.GameObjects.Sprite[] =
      this.sceneManager.symbolsArr();

    symbolsArr.forEach((card, index) => {
      const cardFileName = this.gameBoard[index];
      const cardObject = new Card(card, cardFileName, BACK_OF_CARD);
      this.cardsManager.addCard(cardObject);
    });

    this.cardsManager.setCardListeners();
  }
}
