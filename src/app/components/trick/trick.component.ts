import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardData } from '../card/card.component';

interface PlayedCard {
  playerId: number;
  playerName: string;
  card: CardData;
}

@Component({
  selector: 'app-trick',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="trick">
      <h3>Current Trick</h3>
      <div class="played-cards">
        <div *ngFor="let playedCard of playedCards" class="played-card">
          <app-card [card]="playedCard.card"></app-card>
          <p>{{ playedCard.playerName }}</p>
        </div>
      </div>
      <p *ngIf="leadSuit">Lead Suit: {{ leadSuit }}</p>
      <p *ngIf="trumpSuit">Trump Suit: {{ trumpSuit }}</p>
    </div>
  `,
  styles: [`
    .trick {
      border: 1px solid #ccc;
      padding: 10px;
      margin: 10px 0;
    }
    .played-cards {
      display: flex;
      justify-content: space-around;
    }
    .played-card {
      text-align: center;
    }
  `]
})
export class TrickComponent {
  @Input() playedCards: PlayedCard[] = [];
  @Input() leadSuit: string | null = null;
  @Input() trumpSuit: string | null = null;
}