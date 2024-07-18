// trick.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CardComponent, CardData } from '../card/card.component';

interface PlayedCard {
  player: string;
  card: CardData;
}

@Component({
  selector: 'app-trick',
  standalone: true,
  imports: [CommonModule, MatCardModule, CardComponent],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Current Trick 5({{ playedCards.length }}/9)</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="trick-container">
          <div *ngFor="let playedCard of playedCards" class="played-card">
            <app-card [card]="playedCard.card"></app-card>
            <p>{{ playedCard.player }}</p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .trick-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    .played-card {
      text-align: center;
    }
  `]
})
export class TrickComponent {
  @Input() playedCards: PlayedCard[] = [];
  @Input() currentPlayer: string = '';
  @Output() cardPlayed = new EventEmitter<CardData>();
}