// trump-selection.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-trump-selection',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Select Trump Suit</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="suit-buttons">
          <button mat-raised-button class="suit-button red" (click)="selectTrump('Red')">Red</button>
          <button mat-raised-button class="suit-button yellow" (click)="selectTrump('Yellow')">Yellow</button>
          <button mat-raised-button class="suit-button black" (click)="selectTrump('Black')">Black</button>
          <button mat-raised-button class="suit-button green" (click)="selectTrump('Green')">Green</button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .suit-buttons {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }
    .suit-button {
      width: 100px;
      height: 100px;
      font-size: 16px;
      font-weight: bold;
    }
    .red { background-color: #B71C1C; color: white; }
    .yellow { background-color: #F9A825; color: black; }
    .black { background-color: #212121; color: white; }
    .green { background-color: #1B5E20; color: white; }
  `]
})
export class TrumpSelectionComponent {
  @Output() trumpSelected = new EventEmitter<'Red' | 'Yellow' | 'Black' | 'Green'>();

  selectTrump(suit: 'Red' | 'Yellow' | 'Black' | 'Green') {
    this.trumpSelected.emit(suit);
  }
}