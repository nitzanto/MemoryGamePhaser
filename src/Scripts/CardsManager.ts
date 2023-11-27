import MainScene from "../Scenes/MainScene";
import {
  MAX_SELECTED_CARDS,
  NUMBER_OF_CARDS,
} from "../libs/common/Constants/MemoryGame";
import { Card } from "../libs/common/Classes/Card";
import { showPositiveFeedback } from "../libs/common/Alerts/Feedback/positiveFeedback";
import { showNegativeFeedback } from "../libs/common/Alerts/Feedback/negativeFeedback";
import { TurnManagement } from "./TurnManagement";

export class CardManager {
  private cards: Card[] = [];
  private chosenCards: Card[] = [];
  private numOfMatched: number = 0;
  private turnsManager!: TurnManagement;

  constructor(private readonly sceneManager: MainScene) {}

  initializeCardsManager(turnsManagement: TurnManagement) {
    this.turnsManager = turnsManagement;
    this.numOfMatched = 0;
    this.chosenCards.length = 0;
    this.cards = [];

    this.setCardListeners();
  }

  addCard(card: Card): void {
    this.cards.push(card);
  }

  public setCardListeners() {
    this.cards.forEach((card, index) => {
      card.cardObject.off("pointerdown");
      card.cardObject.on("pointerdown", (pointer: any) =>
        this.handleCardClick(index),
      );
    });
  }

  private handleCardClick(index: number) {
    let selectedCard = this.cards[index];

    if (
      this.chosenCards.length === MAX_SELECTED_CARDS ||
      selectedCard.matchCard ||
      this.chosenCards.includes(selectedCard) ||
      this.isGameOver()
    ) {
      return;
    }

    selectedCard.flipCard();
    selectedCard.setSelected(true);

    this.chosenCards.push(selectedCard);

    if (this.chosenCards.length === MAX_SELECTED_CARDS) {
      this.compareSelectedCards();
    }

    if (
      this.numOfMatched === NUMBER_OF_CARDS ||
      this.turnsManager.getTurns() === 0
    ) {
      this.handleGameEnd();
    }
  }

  private compareSelectedCards(): void {
    let card1 = this.chosenCards[0].cardValue;
    let card2 = this.chosenCards[1].cardValue;

    card1 === card2 ? this.handleMatchedCards() : this.handleMismatchedCards();
  }

  private handleMatchedCards() {
    showPositiveFeedback();
    this.chosenCards.forEach((card) => card.setMatched(true));
    this.shuffleCards();
    this.chosenCards.length = 0;
    this.numOfMatched++;
  }

  private handleMismatchedCards() {
    showNegativeFeedback();
    this.handleMismatchedCardsTimeout();
    this.turnsManager.decrementTurns();
  }

  private handleMismatchedCardsTimeout() {
    this.sceneManager.time.addEvent({
      delay: 1500,
      callbackScope: this,
      callback: () => {
        this.resetChosenCards();
      },
    });
  }

  private resetChosenCards() {
    this.chosenCards.forEach((card) => {
      card.setSelected(false);
      card.resetCard();
    });
    this.chosenCards.length = 0;
  }

  private handleGameEnd() {
    this.sceneManager.stopTimer();
    this.numOfMatched === NUMBER_OF_CARDS
      ? this.sceneManager.gameOver(true)
      : this.sceneManager.gameOver(false);
  }

  private isGameOver() {
    return (
      this.numOfMatched === NUMBER_OF_CARDS ||
      this.turnsManager.getTurns() === 0
    );
  }

  private shuffleCards() {
    const unchosenCards = this.cards.filter(
      (card) => !this.chosenCards.includes(card) && !card.matchCard,
    );

    if (unchosenCards.length >= 2) {
      const [card1, card2] = Phaser.Math.RND.shuffle(unchosenCards).slice(0, 2);
      // Swap the cards visually and logically
      this.swapCards(card1, card2);
    }
  }

  private swapCards(card1: Card, card2: Card) {
    // Swap logical positions
    const index1 = this.cards.indexOf(card1);
    const index2 = this.cards.indexOf(card2);
    [this.cards[index1], this.cards[index2]] = [
      this.cards[index2],
      this.cards[index1],
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
