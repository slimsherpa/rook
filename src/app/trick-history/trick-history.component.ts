// trick-history.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CardComponent, CardData } from '../card/card.component';

interface Trick {
  cards: {player: string, card: CardData}[];
  winner: string;
}

@Component({
  selector: 'app-trick-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, CardComponent],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Trick History</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngFor="let trick of tricks; let i = index" class="trick-summary">
          <h4>Trick {{ i + 1 }} - Winner: {{ trick.winner }}</h4>
          <div class="trick-cards">
            <div *ngFor="let card of trick.cards" class="played-card">
              <app-card [card]="card.card"></app-card>
              <p>{{ card.player }}</p>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .trick-summary {
      margin-bottom: 20px;
    }
    .trick-cards {
      display: flex;
      justify-content: space-around;
    }
    .played-card {
      text-align: center;
    }
  `]
})
export class TrickHistoryComponent {
  @Input() tricks: Trick[] = [];
}