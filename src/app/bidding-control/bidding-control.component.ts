// bidding-control.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bidding-control',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="bidding-control">
      <h3>Seat {{ seat }}: {{ playerName }}</h3>
      <button mat-raised-button 
              [disabled]="!isCurrentBidder" 
              (click)="onPass()">Pass</button>
      <ng-container *ngFor="let bid of possibleBids">
        <button mat-raised-button 
                [disabled]="!canBid(bid)" 
                (click)="onBid(bid)">{{ bid }}</button>
      </ng-container>
    </div>
  `,
  styles: [`
    .bidding-control {
      margin-bottom: 10px;
    }
    button {
      margin-right: 5px;
    }
  `]
})
export class BiddingControlComponent {
  @Input() seat!: string;
  @Input() playerName!: string;
  @Input() isCurrentBidder!: boolean;
  @Input() currentBid!: number | null;
  @Output() pass = new EventEmitter<void>();
  @Output() bid = new EventEmitter<number>();

  possibleBids = [65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];

  canBid(bidAmount: number): boolean {
    return this.isCurrentBidder && (this.currentBid === null || bidAmount > this.currentBid);
  }

  onPass(): void {
    this.pass.emit();
  }

  onBid(amount: number): void {
    this.bid.emit(amount);
  }
}