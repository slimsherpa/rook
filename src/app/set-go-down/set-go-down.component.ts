// set-go-down.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent, CardData } from '../card/card.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-set-go-down',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, CardComponent, DragDropModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Set Go Down - {{ player.name }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="container">
          <div class="hand-container">
            <h3>Your Hand ({{ player.hand.length }} cards)</h3>
            <div cdkDropList #handList="cdkDropList" [cdkDropListData]="player.hand"
                 [cdkDropListConnectedTo]="[goDownList]" class="card-list"
                 (cdkDropListDropped)="drop($event)">
              <div *ngFor="let card of player.hand; let i = index" class="card-wrapper" cdkDrag [cdkDragData]="card">
                <app-card [card]="card"></app-card>
                <div class="drag-placeholder" *cdkDragPlaceholder></div>
              </div>
            </div>
          </div>
          <div class="go-down-container">
            <h3>Go Down ({{ goDown.length }} / 4)</h3>
            <div cdkDropList #goDownList="cdkDropList" [cdkDropListData]="goDown"
                 [cdkDropListConnectedTo]="[handList]" class="card-list"
                 (cdkDropListDropped)="drop($event)">
              <div *ngFor="let card of goDown; let i = index" class="card-wrapper" cdkDrag [cdkDragData]="card">
                <app-card [card]="card"></app-card>
                <div class="drag-placeholder" *cdkDragPlaceholder></div>
              </div>
            </div>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="onReady()" [disabled]="goDown.length !== 4">Ready</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: space-between;
    }
    .hand-container, .go-down-container {
      width: 48%;
    }
    .card-list {
      min-height: 200px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      padding: 10px;
    }
    .card-wrapper {
      margin: 5px;
      cursor: move;
    }
    .drag-placeholder {
      width: 60px;
      height: 90px;
      background: #ccc;
      border: dotted 3px #999;
      margin: 5px;
    }
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .card-list.cdk-drop-list-dragging .card-wrapper:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class SetGoDownComponent {
  @Input() player!: { name: string; hand: CardData[] };
  @Output() goDownSet = new EventEmitter<CardData[]>();

  goDown: CardData[] = [];

  drop(event: CdkDragDrop<CardData[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  onReady() {
    if (this.goDown.length === 4) {
      this.goDownSet.emit(this.goDown);
    }
  }
}