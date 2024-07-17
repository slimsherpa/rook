import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

export interface CardData {
  suit: 'Red' | 'Yellow' | 'Black' | 'Green';
  number: number;
  count: number;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div class="card" [ngClass]="card.suit.toLowerCase()">
      <div class="card-number">{{ card.number }}</div>
      <div class="card-suit">{{ card.suit }}</div>
      <div class="card-count" *ngIf="card.count > 0">{{ card.count }}</div>
    </div>
  `,
  styles: [`
    .card {
      width: 60px;
      height: 90px;
      border: 1px solid black;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 5px;
      font-weight: bold;
    }
    .red { background-color: #ffcccb; }
    .yellow { background-color: #ffffcc; }
    .black { background-color: #d3d3d3; }
    .green { background-color: #90ee90; }
    .card-number { font-size: 20px; }
    .card-suit { font-size: 14px; }
    .card-count { font-size: 12px; align-self: flex-end; }
  `]
})
export class CardComponent {
  @Input() card!: CardData;
}