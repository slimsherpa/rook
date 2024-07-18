import { Injectable } from '@angular/core';
import { CardData } from '../components/card/card.component';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private deck: CardData[] = [];

  constructor() {
    this.initializeDeck();
  }

  private initializeDeck() {
    this.deck = []; // Clear the existing deck
    const suits: ('Red' | 'Yellow' | 'Black' | 'Green')[] = ['Red', 'Yellow', 'Black', 'Green'];
    const numbers = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

    for (const suit of suits) {
      for (const number of numbers) {
        this.deck.push({
          suit,
          number,
          count: this.getCardCount(number)
        });
      }
    }
  }

  private getCardCount(number: number): number {
    if (number === 5) return 5;
    if (number === 10 || number === 13) return 10;
    return 0;
  }

  shuffleDeck() {
    this.initializeDeck(); // Reinitialize the deck before shuffling
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    console.log('Deck shuffled:', this.deck);
  }

  dealCards(numPlayers: number, cardsPerPlayer: number): CardData[][] {
    const hands: CardData[][] = Array(numPlayers).fill(null).map(() => []);
    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let j = 0; j < numPlayers; j++) {
        if (this.deck.length > 0) {
          hands[j].push(this.deck.pop()!);
        }
      }
    }
    console.log('Dealt hands:', hands);
    return hands;
  }

  dealWidow(): CardData[] {
    const widow = this.deck.splice(0, 4);
    console.log('Dealt widow:', widow);
    return widow;
  }
}