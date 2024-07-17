import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Player } from '../../services/game.service';
import { CardComponent, CardData } from '../card/card.component';
import { TrumpSuit } from '../../services/game.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [NgFor, NgIf, CardComponent],
  template: `
    <div class="player" [class.active-player]="isCurrentPlayer">
      <h3>{{ player.name }} (Seat: {{ player.seat }}) {{ isCurrentPlayer ? '- Your Turn' : '' }}</h3>
      <div class="hand">
        <app-card 
          *ngFor="let card of player.hand" 
          [card]="card"
          [class.selected]="isCardSelected(card)"
          [class.playable]="isCardPlayable(card)"
          (click)="selectCard(card)"
        ></app-card>
      </div>
      <div *ngIf="isCurrentBidder && gamePhase === 'bidding'">
        <input type="number" [min]="minBid" step="5" #bidInput>
        <button (click)="placeBid(bidInput.value)">Place Bid</button>
        <button (click)="pass()">Pass</button>
      </div>
      <div *ngIf="player.bid !== null && !player.passed">
        Bid: {{ player.bid }}
      </div>
      <div *ngIf="player.passed">
        Passed
      </div>
      <div *ngIf="isSelectingGoDown">
        <p>Select 4 cards for your Go Down: (Selected: {{ selectedCards.length }} / 4)</p>
        <button (click)="setGoDown()" [disabled]="selectedCards.length !== 4">Set Go Down</button>
      </div>
      <div *ngIf="isSelectingTrump">
        <p>Select Trump Suit:</p>
        <button *ngFor="let suit of trumpSuits" (click)="selectTrump(suit)">{{ suit }}</button>
      </div>
      <div *ngIf="gamePhase === 'playingTricks' && isCurrentPlayer">
        <p>Select a card to play</p>
        <button (click)="playSelectedCard()" [disabled]="!selectedCard">Play Selected Card</button>
      </div>
    </div>
  `,
  styles: [`
    .player {
      border: 1px solid #ccc;
      padding: 10px;
      margin: 10px;
      transition: all 0.3s ease;
    }
    .active-player {
      border-color: #4CAF50;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    }
    .hand {
      display: flex;
      flex-wrap: wrap;
    }
    .playable {
      cursor: pointer;
    }
    .selected {
      border: 2px solid blue;
      box-shadow: 0 0 5px blue;
    }
  `]
})
export class PlayerComponent {
  @Input() player!: Player;
  @Input() isCurrentBidder: boolean = false;
  @Input() isCurrentPlayer: boolean = false;
  @Input() isSelectingGoDown: boolean = false;
  @Input() isSelectingTrump: boolean = false;
  @Input() minBid: number = 65;
  @Input() leadSuit: string | null = null;
  @Input() isFirstPlayerOfTrick: boolean = false;
  @Input() gamePhase: 'bidding' | 'selectingGoDown' | 'selectingTrump' | 'playingTricks' = 'bidding';
  @Output() bid = new EventEmitter<number | null>();
  @Output() goDown = new EventEmitter<CardData[]>();
  @Output() trumpSelected = new EventEmitter<TrumpSuit>();
  @Output() cardPlayed = new EventEmitter<CardData>();

  selectedCard: CardData | null = null;
  selectedCards: CardData[] = [];
  trumpSuits: TrumpSuit[] = ['Red', 'Yellow', 'Black', 'Green'];

  isCardPlayable(card: CardData): boolean {
    if (!this.isCurrentPlayer || this.gamePhase !== 'playingTricks') return false;
    if (this.isFirstPlayerOfTrick) return true;
    if (!this.leadSuit) return true;
    if (card.suit === this.leadSuit) return true;
    return !this.player.hand.some(c => c.suit === this.leadSuit);
  }

  isCardSelected(card: CardData): boolean {
    if (this.gamePhase === 'selectingGoDown') {
      return this.selectedCards.includes(card);
    } else if (this.gamePhase === 'playingTricks') {
      return this.selectedCard === card;
    }
    return false;
  }

  selectCard(card: CardData) {
    if (this.gamePhase === 'selectingGoDown') {
      const index = this.selectedCards.indexOf(card);
      if (index > -1) {
        this.selectedCards.splice(index, 1);
      } else if (this.selectedCards.length < 4) {
        this.selectedCards.push(card);
      }
    } else if (this.gamePhase === 'playingTricks' && this.isCurrentPlayer && this.isCardPlayable(card)) {
      this.selectedCard = this.selectedCard === card ? null : card;
    }
  }

  placeBid(bidAmount: string) {
    const amount = parseInt(bidAmount, 10);
    if (amount >= this.minBid && amount <= 120) {
      this.bid.emit(amount);
    } else {
      console.error('Invalid bid amount');
    }
  }

  pass() {
    this.bid.emit(null);
  }

  setGoDown() {
    if (this.selectedCards.length === 4) {
      this.goDown.emit(this.selectedCards);
      this.selectedCards = [];
    }
  }

  selectTrump(suit: TrumpSuit) {
    this.trumpSelected.emit(suit);
  }

  playSelectedCard() {
    if (this.selectedCard && this.isCurrentPlayer && this.isCardPlayable(this.selectedCard)) {
      this.cardPlayed.emit(this.selectedCard);
      this.selectedCard = null;
    }
  }
}