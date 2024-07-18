// bidding.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bidding',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatInputModule, FormsModule],
  template: `
    <div *ngIf="currentBidder">
      <h3>Current Bidder: {{ currentBidder.name }} (Seat: {{ currentBidder.seat }})</h3>
      <p>Current Highest Bid: {{ currentBid === null ? 'No bid yet' : currentBid }}</p>
      <mat-form-field>
        <input matInput type="number" [(ngModel)]="bidAmount" [min]="65" [max]="120" [step]="5">
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="placeBid()" [disabled]="!isValidBid()">Bid</button>
      <button mat-raised-button color="warn" (click)="pass()">Pass</button>
    </div>
  `,
  styles: [`
    div {
      margin: 20px;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    button {
      margin-right: 10px;
    }
  `]
})
export class BiddingComponent {
  @Input() currentBidder: any;
  @Input() currentBid: number | null = null;
  @Output() bid = new EventEmitter<number>();
  @Output() passed = new EventEmitter<void>();

  bidAmount: number = 65;

  isValidBid(): boolean {
    return this.bidAmount >= 65 && this.bidAmount <= 120 && (this.currentBid === null || this.bidAmount > this.currentBid);
  }

  placeBid() {
    if (this.isValidBid()) {
      this.bid.emit(this.bidAmount);
    }
  }

  pass() {
    this.passed.emit();
  }
}