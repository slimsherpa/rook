import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

export interface CardData {
  suit: 'Red' | 'Yellow' | 'Black' | 'Green';
  number: number;
  count: number;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="card" [ngClass]="card.suit.toLowerCase()">
      <mat-card-content>
        <div class="card-suit">{{ card.suit }}</div>
        <div class="card-number">{{ card.number }}</div>
        <div class="card-count" *ngIf="card.count > 0">{{ card.count }}</div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .card {
      width: 60px;
      height: 80px;
      margin: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      
  
    }
    .card-suit { 
      font-size: 12px;
      color: white;
      position: absolute;
      top: 8px;
      left: 8px; 
    }
    .card-number { 
      font-size: 24px;
      color: white;
      font-weight: bold;
      display: flex;
    }
    
    .card-count {
      font-size: 12px;
      color: #FFF176;
      font-weight: bold;
      position: absolute;
      bottom: 5px;
      right: 5px;
    }
    .red { background-color: #B71C1C; }
    .yellow { background-color: #F9A825; }
    .black { background-color: #212121; }
    .green { background-color: #1B5E20; }
  `]
})
export class CardComponent {
  @Input() card!: CardData;

}