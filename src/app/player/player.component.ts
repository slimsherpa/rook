// player-hand.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent, CardData } from '../card/card.component';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, MatButtonModule, CardComponent],
  template: `
    <div class="player-hand">
    <h3>{{ player.name }}'s Hand {{ isCurrentPlayer ? '(Your Turn)' : '' }}</h3>
   <div class="cards">
     <div *ngFor="let card of player.hand" class="card-wrapper">
        <app-card [card]="card" 
        (click)="selectCard(card)" 
        [class.selected]="selectedCard === card"
        [class.unplayable]="!isPlayableCard(card)"
        ></app-card>
    </div>
  </div>
  <button mat-raised-button color="primary" (click)="playCard()" [disabled]="!canPlaySelectedCard()">Play Card</button>
</div>
  `,
  styles: [`
    .player-hand {
      margin: 20px;
    }
    .cards {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .card-wrapper {
      cursor: pointer;
    }
    .selected {
      border: 2px solid blue;
      box-shadow: 0 0 10px blue;
    }
    .unplayable {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})

export class PlayerComponent {
  @Input() player!: { name: string; hand: CardData[] };
  @Input() isCurrentPlayer: boolean = false;
  @Input() leadSuit: string | null = null;
  @Input() trumpSuit: string | null = null;
  @Input() isFirstPlayer: boolean = false;
  @Output() cardPlayed = new EventEmitter<CardData>();

  selectedCard: CardData | null = null;

  selectCard(card: CardData) {
    if (this.isCurrentPlayer && this.isPlayableCard(card)) {
      this.selectedCard = this.selectedCard === card ? null : card;
    }
  }

  isPlayableCard(card: CardData): boolean {
    if (!this.isCurrentPlayer) return false;
    if (this.isFirstPlayer) return true;
    if (!this.leadSuit) return true;
    return card.suit === this.leadSuit || !this.player.hand.some(c => c.suit === this.leadSuit);
  }

  canPlaySelectedCard(): boolean {
    return this.isCurrentPlayer && this.selectedCard !== null && this.isPlayableCard(this.selectedCard);
  }

  playCard() {
    if (this.canPlaySelectedCard()) {
      this.cardPlayed.emit(this.selectedCard!);
      this.selectedCard = null;
    }
  }
}