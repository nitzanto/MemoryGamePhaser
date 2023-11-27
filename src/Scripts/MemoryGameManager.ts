import { isContext } from "vm";
import MainScene from "../Scenes/MainScene";
import { cardType } from "../libs/common/Types/cardType";
import { showPositiveFeedback } from "../libs/common/Alerts/Feedback/positiveFeedback";
import { showNegativeFeedback } from "../libs/common/Alerts/Feedback/negativeFeedback";
import {
  MAX_SELECTED_CARDS,
  TURNS_PER_ROUND,
} from "../libs/common/Constants/MemoryGame";
import { GameManager } from "../libs/common/Interfaces/GameManager";

export class MemoryGameManager implements GameManager {
  sceneManager: MainScene;
  gameBoard!: string[];
  chosenCards: cardType[] = [];
  numOfMatched: number = 0;
  turns: number = TURNS_PER_ROUND;
  cardNumber = 6;
  gameBoardCards!: cardType[];
  cardBackDefault = "symbol_0.png";
  turnsText: Phaser.GameObjects.Text | undefined;

  constructor(scene: MainScene) {
    this.sceneManager = scene;
    this.turnsText = this.sceneManager.add.text(
      200,
      16,
      "Turns left:" + this.turns,
      {
        fontSize: "18px",
        color: "white",
      },
    );
    this.gameBoardCards = [];
    // Initialize game state
    this.initGame();
  }

  generateGameBoard(rows: number, columns: number, numCards: number): string[] {
    if ((rows * columns) % 2 !== 0) return [];

    const totalCards = rows * columns;
    const board: string[] = new Array(totalCards).fill("symbol_0.png");
    let currentSymbolNumber = 2;

    for (let orderCount = 0; orderCount < totalCards; ) {
      let randomIndex = Math.floor(Math.random() * totalCards);

      while (
        board[randomIndex] !== "symbol_0.png" ||
        randomIndex >= totalCards
      ) {
        randomIndex = randomIndex >= totalCards ? 0 : randomIndex + 1;
      }

      board[randomIndex] = `symbol_${Math.floor(currentSymbolNumber / 2)}.png`;
      currentSymbolNumber++;
      orderCount++;

      if (numCards + 1 === Math.floor(currentSymbolNumber / 2))
        currentSymbolNumber = 2;
    }

    return board;
  }

  initGame() {
    this.turns = TURNS_PER_ROUND;
    this.updateTurnsText();
    this.numOfMatched = 0;
    this.chosenCards.length = 0;

    this.gameBoard = this.generateGameBoard(4, 3, 6);

    // @ts-ignore
    let symbolsArr: Phaser.GameObjects.Sprite[] =
      this.sceneManager.symbolsArr();

    symbolsArr.forEach((card, index) => {
      const cardFileName = this.gameBoard[index];
      this.gameBoardCards.push({
        cardSelected: false,
        cardObject: card,
        cardValue: cardFileName,
        matchCard: false,
        cardBackSprite: "symbol_0.png",
      });

      this.gameBoardCards[index].cardObject.setInteractive();
      this.gameBoardCards[index].cardObject.setTexture(
        "symbols",
        this.cardBackDefault,
      );
    });

    this.setCardListeners();
  }

  setCardListeners() {
    for (let i = 0; i < this.gameBoardCards.length; i++) {
      this.gameBoardCards[i].cardObject.off("pointerdown"); // Remove existing listeners
      this.gameBoardCards[i].cardObject.on("pointerdown", (pointer: any) =>
        this.handleCardClick(i),
      );
    }
  }

  handleCardClick(index: number) {
    let currentCard = this.gameBoardCards[index];

    if (
      this.chosenCards.length == MAX_SELECTED_CARDS ||
      currentCard.matchCard ||
      this.chosenCards.includes(currentCard) ||
      this.isGameOver()
    ) {
      return;
    }

    currentCard.cardObject.setTexture("symbols", currentCard.cardValue);

    let selectedCard: cardType = this.gameBoardCards[index];

    selectedCard.cardSelected = true;

    this.chosenCards.push(selectedCard);

    if (this.chosenCards.length == MAX_SELECTED_CARDS) {
      this.compareSelectedCards();
    }

    if (this.numOfMatched == this.cardNumber || this.turns === 0) {
      this.handleGameEnd();
    }
  }

  compareSelectedCards(): void {
    let value1 = this.chosenCards[0].cardValue;
    let value2 = this.chosenCards[1].cardValue;

    if (value1 === value2) {
      this.handleMatchedCards();
    } else {
      this.handleMismatchedCards();
    }
  }

  handleMatchedCards() {
    showPositiveFeedback();
    this.chosenCards[0].matchCard = true;
    this.chosenCards[1].matchCard = true;
    this.shuffleCards();
    this.chosenCards.length = 0;
    this.numOfMatched++;
  }

  handleMismatchedCards() {
    showNegativeFeedback();
    this.sceneManager.time.addEvent({
      delay: 1500,
      callbackScope: this,
      callback: () => {
        for (let n = 0; n < this.chosenCards.length; n++) {
          this.chosenCards[n].cardSelected = false;
          this.chosenCards[n].cardObject.setTexture(
            "symbols",
            this.cardBackDefault,
          );
        }
        this.chosenCards.length = 0;
      },
    });
    this.turns--;
    this.updateTurnsText();
  }

  handleGameEnd() {
    this.sceneManager.stopTimer();
    if (this.numOfMatched === this.cardNumber) {
      this.sceneManager.gameOver(true);
    }
    if (this.turns === 0) {
      this.sceneManager.gameOver(false);
    }
  }

  updateTurnsText() {
    if (this.turnsText) {
      this.turnsText.setText(`Turns left: ${this.turns}`);
    }
  }

  isGameOver() {
    return this.numOfMatched === this.cardNumber || this.turns === 0;
  }

  shuffleCards() {
    const unchosenCards = this.gameBoardCards.filter(
      (card) => !this.chosenCards.includes(card) && !card.matchCard,
    );

    if (unchosenCards.length >= 2) {
      const [card1, card2] = Phaser.Math.RND.shuffle(unchosenCards).slice(0, 2);

      // Swap the cards visually and logically
      this.swapCards(card1, card2);
    }
  }

  swapCards(card1: cardType, card2: cardType) {
    // Swap logical positions
    const index1 = this.gameBoardCards.indexOf(card1);
    const index2 = this.gameBoardCards.indexOf(card2);
    [this.gameBoardCards[index1], this.gameBoardCards[index2]] = [
      this.gameBoardCards[index2],
      this.gameBoardCards[index1],
    ];

    // Swap visual positions
    const tempX = card1.cardObject.x;
    const tempY = card1.cardObject.y;

    this.sceneManager.tweens.add({
      targets: card1.cardObject,
      x: card2.cardObject.x,
      y: card2.cardObject.y,
      duration: 500,
      ease: "Linear",
    });

    this.sceneManager.tweens.add({
      targets: card2.cardObject,
      x: tempX,
      y: tempY,
      duration: 500,
      ease: "Linear",
    });

    this.setCardListeners();
  }
}
