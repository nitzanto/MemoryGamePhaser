import { isContext } from "vm";
import MainScene from "../Scenes/MainScene";
import { cardType } from "../Types/cardType";

export class GameManager {
  sceneManager: MainScene;
  gameBoard!: string[];
  chosenCards: cardType[] = [];
  canMove: boolean = true;
  numOfMatched: number = 0;
  turns: number = 6;
  gameBoardCards!: cardType[];
  cardBackDefault = "symbol_0.png";

  constructor(scene: MainScene) {
    this.sceneManager = scene;
    this.gameBoardCards = [];
    // Initialize game state
    this.initGame();
  }

  getBoard(n: number, m: number, numCards: number): string[] {
    if (Math.floor((n * m) % 2) != 0) return [];
    let board: string[] = [];

    const mn = n * m; // Length board
    let numOfOrder = 0;
    let i = 2; // Symbol number in floor(i/2)
    for (let i = 0; i < mn; i++) {
      board[i] = "symbol_0.png";
    }
    while (numOfOrder < m * n) {
      // While not all the cards are selected
      let rand = Math.floor(Math.random() * mn);
      while (board[rand] != "symbol_0.png" || rand >= mn) {
        // While the card not select rand++ [mod len]
        if (rand >= mn) rand = 0;
        else rand++;
      }
      board[rand] = "symbol_" + Math.floor(i / 2) + ".png";
      i++;
      numOfOrder++;
      if (numCards + 1 == Math.floor(i / 2)) i = 2;
    }

    return board;
  }

  initGame() {
    this.gameBoard = this.getBoard(4, 3, 6);
    console.log("Generated Board:", this.gameBoard);
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
      this.gameBoardCards[i].cardObject.on("pointerdown", (pointer: any) =>
        this.handleCardClick(i),
      );
    }
  }

  handleCardClick(index: number) {
    let currentCard = this.gameBoardCards[index];

    if (!this.canMove || currentCard.matchCard) {
      return;
    }

    currentCard.cardObject.setTexture("symbols", currentCard.cardValue);

    let obj: cardType = this.gameBoardCards[index];

    // make the cardBackSprite of the selected object transparent
    obj.cardSelected = true;

    // save the selected object
    this.chosenCards.push(obj);

    if (this.chosenCards.length > 1) {
      this.canMove = false;

      // compare the card values
      let g1 = this.chosenCards[0].cardValue;
      let g2 = this.chosenCards[1].cardValue;

      if (g1 == g2) {
        // match
        alert("match!");
        this.chosenCards[0].matchCard = true;
        this.chosenCards[1].matchCard = true;
        this.chosenCards.length = 0;
        this.numOfMatched++;
        this.canMove = true;
      } else {
        // no match
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
            this.canMove = true;
          },
        });
        this.turns--;
      }
    }
  }
}
