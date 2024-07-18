import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardData } from '../card/card.component';
import { Trick, PlayedCard } from '../../services/game.service';

@Component({
  selector: 'app-trick-history',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="trick-history">
      <h3>Trick History</h3>
      <div *ngFor="let trick of tricks; let i = index" class="trick">
        <h4>Trick {{ i + 1 }}</h4>
        <div class="cards">
          <div *ngFor="let playedCard of trick.cards" class="played-card">
            <app-card [card]="playedCard.card"></app-card>
            <p>{{ playedCard.playerName }}</p>
          </div>
        </div>
        <p>Winner: {{ trick.winner.name }}</p>
        <p>Points: {{ getTrickPoints(trick) }}</p>
      </div>
      <div *ngIf="goDown.length > 0" class="go-down">
        <h4>Go Down</h4>
        <div class="cards">
          <app-card *ngFor="let card of goDown" [card]="card"></app-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .trick-history {
      margin-top: 20px;
    }
    .trick {
      border: 1px solid #ccc;
      margin-bottom: 10px;
      padding: 10px;
    }
    .cards {
      display: flex;
      justify-content: space-around;
    }
    .played-card {
      text-align: center;
    }
    .go-down {
      margin-top: 20px;
      border: 1px solid #ccc;
      padding: 10px;
    }
  `]
})
export class TrickHistoryComponent {
  @Input() tricks: Trick[] = [];
  @Input() goDown: CardData[] = [];

  getTrickPoints(trick: Trick): number {
    return trick.cards.reduce((sum, playedCard) => sum + this.getCardPoints(playedCard.card), 0);
  }

  private getCardPoints(card: CardData): number {
    if (card.number === 5) return 5;
    if (card.number === 10 || card.number === 13) return 10;
    return 0;
  }
}