import { isContext } from "vm";
import MainScene from "../Scenes/MainScene";
import { cardType } from "../Types/cardType";
import { showPositiveFeedback } from "../Alerts/Feedback/positiveFeedback";
import { showNegativeFeedback } from "../Alerts/Feedback/negativeFeedback";

export class GameManager {
  sceneManager: MainScene;
  gameBoard!: string[];
  chosenCards: cardType[] = [];
  canMove: boolean = true;
  numOfMatched: number = 0;
  turns: number = 6;
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
    this.turns = 6;
    this.updateTurnsText();
    this.numOfMatched = 0;
    this.canMove = true;
    this.chosenCards.length = 0;

    this.gameBoard = this.getBoard(4, 3, 6);

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

  // Call this function whenever you need to update the card listeners, like after swapping
  updateCardListeners() {
    this.setCardListeners();
  }

  handleCardClick(index: number) {
    let currentCard = this.gameBoardCards[index];

    if (
      !this.canMove ||
      currentCard.matchCard ||
      this.chosenCards.includes(currentCard) ||
      this.isGameOver()
    ) {
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
        showPositiveFeedback();
        this.chosenCards[0].matchCard = true;
        this.chosenCards[1].matchCard = true;
        this.shuffleCards();
        this.chosenCards.length = 0;
        this.numOfMatched++;
        this.canMove = true;
      } else {
        // no match
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
            this.canMove = true;
          },
        });
        this.turns--;
        this.updateTurnsText();
      }
    }

    if (this.numOfMatched == this.cardNumber || this.turns === 0) {
      if (this.numOfMatched == this.cardNumber) {
        this.sceneManager.gameOver(true);
      }
      if (this.turns === 0) {
        this.sceneManager.gameOver(false);
      }
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

    this.updateCardListeners();
  }
}
